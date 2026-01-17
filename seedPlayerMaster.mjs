import fs from "fs";
import fetch from "node-fetch";
import credPkg from "@aws-sdk/credential-provider-node";
const { defaultProvider } = credPkg;
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

// ---- CONFIG ----
const CSV_PATH = process.argv[2] || "player_master_fc26.csv";
const VERSION = process.argv[3] || "FC26";
const BATCH_SIZE = 10;            // keep low to avoid throttling
const RETRY_MAX = 6;              // retries for throttling
const RETRY_BASE_MS = 300;        // backoff base

// ---- Read amplify_outputs.json ----
const outputs = JSON.parse(fs.readFileSync("amplify_outputs.json", "utf8"));

function findEndpoint(obj){
  // Try common Amplify Gen2/Gen1 output shapes
  return (
    obj?.data?.aws_appsync_graphqlEndpoint ||
    obj?.data?.graphqlEndpoint ||
    obj?.data?.url ||
    obj?.api?.url ||
    obj?.api?.aws_appsync_graphqlEndpoint ||
    obj?.api?.graphqlEndpoint ||
    obj?.aws_appsync_graphqlEndpoint ||
    obj?.graphqlEndpoint ||
    obj?.url ||
    null
  );
}

const graphqlEndpoint = findEndpoint(outputs);

if (!graphqlEndpoint) {
  console.log("amplify_outputs.json keys:", Object.keys(outputs || {}));
  console.log("amplify_outputs.json snippet:", JSON.stringify(outputs, null, 2).slice(0, 1200));
  throw new Error("Could not find AppSync endpoint in amplify_outputs.json");
}


// Region is in the endpoint URL: https://xxxx.appsync-api.us-east-1.amazonaws.com/graphql
const regionMatch = graphqlEndpoint.match(/appsync-api\.([a-z0-9-]+)\.amazonaws\.com/);
const region = regionMatch?.[1];
if (!region) throw new Error("Could not parse AWS region from AppSync endpoint");

// ---- CSV parser (simple, supports quoted commas) ----
function parseCsv(text, delim = ","){
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++){
    const ch = text[i];
    const next = text[i+1];

    if (ch === '"'){
      if (inQuotes && next === '"'){ cur += '"'; i++; }
      else inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === delim){
      row.push(cur);
      cur = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")){
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }

    cur += ch;
  }

  if (cur.length || row.length){
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function normFoot(v){
  const s = String(v || "").trim().toUpperCase();
  if (s === "L" || s === "LEFT") return "L";
  return "R";
}

function toInt(x){
  const n = Number(x);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function makeSurnameLower(shortName){
  const s = String(shortName || "").trim();
  if (!s) return "";
  if (s.includes(".")) return s.split(".").slice(1).join(".").trim().toLowerCase();
  return s.toLowerCase();
}

// ---- GraphQL operations ----
const CREATE = /* GraphQL */ `
mutation CreatePlayerMaster($input: CreatePlayerMasterInput!) {
  createPlayerMaster(input: $input) { id }
}
`;

const UPDATE = /* GraphQL */ `
mutation UpdatePlayerMaster($input: UpdatePlayerMasterInput!) {
  updatePlayerMaster(input: $input) { id }
}
`;

// ---- Signed AppSync request (IAM auth) ----
const credentialsProvider = defaultProvider();

async function signedGraphQL({ query, variables }) {
  const body = JSON.stringify({ query, variables });

  const signer = new SignatureV4({
    credentials: credentialsProvider,
    region,
    service: "appsync",
    sha256: Sha256,
  });

  const url = new URL(graphqlEndpoint);

  const req = await signer.sign({
    method: "POST",
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      "content-type": "application/json",
      host: url.hostname,
    },
    body,
  });

  const res = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: req.headers,
    body,
  });

  const json = await res.json();
  return json;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function gqlWithRetry(payload){
  let lastErr = null;

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++){
    try{
      const json = await signedGraphQL(payload);

      if (json?.errors?.length){
        // Some throttling errors come back as GraphQL errors
        const msg = json.errors.map(e => e.message).join(" | ");
        if (/throttl|rate|limit|timeout|TooMany/i.test(msg)){
          throw new Error("RETRYABLE: " + msg);
        }
        throw new Error(msg);
      }
      return json;
    }catch(e){
      lastErr = e;
      const msg = String(e?.message || e);

      const retryable = msg.startsWith("RETRYABLE:") || /throttl|rate|limit|timeout|TooMany/i.test(msg);
      if (!retryable || attempt === RETRY_MAX) break;

      const wait = RETRY_BASE_MS * Math.pow(2, attempt);
      console.log(`  throttled/retryable error → wait ${wait}ms → retry (${attempt+1}/${RETRY_MAX})`);
      await sleep(wait);
    }
  }

  throw lastErr;
}

async function upsertPlayerMaster(input){
  // Deterministic ID prevents duplicates across reruns:
  // If create fails because it exists, we update instead.
  try{
    await gqlWithRetry({ query: CREATE, variables: { input } });
    return "created";
  }catch(e){
    // Try update as fallback
    const msg = String(e?.message || e);
    if (/exists|conflict|conditional|already|duplicate/i.test(msg)){
      await gqlWithRetry({ query: UPDATE, variables: { input } });
      return "updated";
    }
    // Some resolvers return generic error on existing id; try update anyway once
    await gqlWithRetry({ query: UPDATE, variables: { input } });
    return "updated";
  }
}

// ---- MAIN ----
async function main(){
  console.log("CSV:", CSV_PATH);
  console.log("Version:", VERSION);
  console.log("Endpoint:", graphqlEndpoint);
  console.log("Region:", region);

  const csvText = fs.readFileSync(CSV_PATH, "utf8");

// Detect delimiter: tab-separated exports are very common from Excel/Sheets
const firstLine = csvText.split(/\r?\n/).find(l => l.trim().length) || "";
let delim = ",";
if (firstLine.includes("\t") && !firstLine.includes(",")) delim = "\t";
else if (firstLine.includes(";") && !firstLine.includes(",")) delim = ";";


const rows = parseCsv(csvText, delim).filter(r => r.some(x => String(x || "").trim() !== ""));
console.log("Detected delimiter:", delim === "\t" ? "\\t (TAB)" : delim);
console.log("Raw header cells:", rows[0]);


  if (rows.length < 2) throw new Error("CSV looks empty");

  const headers = rows[0].map(h =>
  String(h || "")
    .replace(/^\uFEFF/, "") // strip BOM if present
    .trim()
);

  console.log("Normalized headers:", headers);

  const idx = (name) => headers.indexOf(name);

  const iShort = idx("short_name");
  const iPos   = idx("player_positions");
  const iOvr   = idx("overall");
  const iPot   = idx("potential");
  const iAge   = idx("age");
  const iClubP = idx("club_position");
  const iNat   = idx("nationality_name");
  const iFoot  = idx("preferred_foot");

  if (iShort < 0 || iPos < 0) {
    throw new Error("CSV must include headers: short_name and player_positions");
  }

  const items = [];
  for (let r = 1; r < rows.length; r++){
    const line = rows[r];
    const shortName = String(line[iShort] || "").trim();
    if (!shortName) continue;

    const nameLower = shortName.toLowerCase();
    const surnameLower = makeSurnameLower(shortName);

    // Deterministic primary key: prevents duplicates if you rerun the script
    const id = `PM|${VERSION}|${nameLower}`;

    items.push({
      id,
      shortName,
      nameLower,
      surnameLower,
      playerPositions: String(line[iPos] || "").trim(),
      overall: toInt(line[iOvr]),
      potential: toInt(line[iPot]),
      age: toInt(line[iAge]),
      clubPosition: String(line[iClubP] || "").trim() || null,
      nationalityName: String(line[iNat] || "").trim() || null,
      preferredFoot: normFoot(line[iFoot]),
      version: VERSION,
    });
  }

  console.log("Rows to upsert:", items.length);

  let done = 0, created = 0, updated = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE){
    const batch = items.slice(i, i + BATCH_SIZE);

    // run in parallel per batch
    const results = await Promise.all(batch.map(async (input) => {
      const r = await upsertPlayerMaster(input);
      return r;
    }));

    for (const r of results){
      done++;
      if (r === "created") created++;
      else updated++;
    }

    if (done % 100 === 0 || done === items.length){
      console.log(`Progress: ${done}/${items.length} (created ${created}, updated ${updated})`);
    }
  }

  console.log("DONE ✅");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
}

main().catch(err => {
  console.error("FAILED ❌", err);
  process.exit(1);
});
