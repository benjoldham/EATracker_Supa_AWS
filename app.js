import * as aws from "./awsClient.js";
import { FORMATIONS, DEFAULT_FORMATION } from "./formations.js";
import Tesseract from "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js";

// FC26 Transfer Tracker (v7) — v6 UI + correct sorting + ex-player toggle
// Exchange rates source: exchangerate-api.com (open.er-api.com) base GBP.
// Rates last updated: Tue, 23 Dec 2025 00:02:31 +0000.

document.getElementById("btn-signout")?.addEventListener("click", async () => {
  const ok = confirm("Sign out?");
  if (!ok) return;

  await aws.awsSignOut?.();
  location.href = "./login.html";
});

// Multi-save storage (legacy) — left in place for now; AWS uses URL save param + backend.
const SAVES_KEY = "fc26_transfer_tracker_saves_v1";
const SAVE_PREFIX = "fc26_transfer_tracker_save_v1_";

// Legacy single-save keys (pre-dashboard)
const LEGACY_KEY_V7 = "fc26_transfer_tracker_v7";
const LEGACY_KEY_V6 = "fc26_transfer_tracker_v6";

function playersKey(saveId){ return `${SAVE_PREFIX}${saveId}_players`; }

// 1 GBP = X currency units
const FX = { GBP: 1, EUR: 1.144446, USD: 1.34518 };
const CURRENCY_META = { GBP: { symbol: "£" }, EUR: { symbol: "€" }, USD: { symbol: "$" } };

// ---------- helpers ----------
function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }
function clamp(n,min,max){ const x=Number(n); if(!Number.isFinite(x)) return min; return Math.min(max, Math.max(min,x)); }
function parseMoneyInput(str){
  const s = String(str ?? "").replaceAll(",", "").trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}
function asInt(v,fallback=0){ const n=Number(v); return Number.isFinite(n) ? Math.trunc(n) : fallback; }
function fmtNumberForInput(n){
  const x = Number(n);
  if (!Number.isFinite(x) || x === 0) return "";
  return Math.trunc(x).toLocaleString("en-GB");
}
function fullName(firstName,surname){
  const f=(firstName||"").trim();
  const s=(surname||"").trim();
  return (f+" "+s).trim();
}
function displayName(p){
  const sur = (p.surname || p.lastName || "").trim();
  return sur;
}

function potAvg(p){
  const min=asInt(p.potMin,0);
  const max=asInt(p.potMax,0);
  if(!min && !max) return null;
  return (min+max)/2;
}
function statusFromAvg(avg){
  if(!Number.isFinite(avg)) return "N/A";
  if(avg>=90) return "Special";
  if(avg>=85) return "Exciting";
  if(avg>=80) return "Great";
  return "Sell";
}
function profitGBP(p){ return asInt(p.sale_gbp,0) - asInt(p.cost_gbp,0); }
function roi(p){
  const cost = asInt(p.cost_gbp, 0);
  const sale = asInt(p.sale_gbp, 0);
  // ROI is based on Cost and Sale; Sale can be 0 (unsold) => negative ROI.
  if (cost <= 0) return null;
  return (sale - cost) / cost;
}

function badgeClass(status){
  switch(status){
    case "Special": return "special";
    case "Exciting": return "exciting";
    case "Great": return "great";
    case "Sell": return "sell";
    default: return "";
  }
}
function valClassFromNumber(n){
  if(!Number.isFinite(n)) return "";
  return n>=0 ? "val-pos" : "val-neg";
}
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"quot;")
    .replaceAll("'","&#039;");
}

// ---------- AWS <-> UI field mapping ----------
// Your UI historically uses camelCase fields; your backend model may use either.
// We normalise here so the rest of the UI stays unchanged.

function fromAwsPlayer(row){
  if(!row) return row;

  // Backend schema (Amplify):
  // careerSaveId, firstName, surname, seniority, position, ovrInitial, potentialMin, potentialMax, active, cost, sale, currency, createdAt, updatedAt
  return {
    ...row,

    // UI fields
    firstName: row.firstName ?? "",
    surname: row.surname ?? "",
    seniority: ["Senior", "Youth", "Watchlist"].includes(row.seniority)
  ? row.seniority
  : "Senior",
    active: (row.active === "N") ? "N" : "Y",
    homegrown: !!row.homegrown,
    pos: (row.position ?? "").toString().toUpperCase(),
    foot: (row.foot === "L") ? "L" : "R",
    intl: row.ovrInitial ?? "",
    potMin: row.potentialMin ?? "",
    potMax: row.potentialMax ?? "",

    // UI keeps money internally in GBP for consistent totals; currency selector is display-only.
    cost_gbp: asInt(row.cost ?? 0, 0),
    sale_gbp: asInt(row.sale ?? 0, 0),

    // For UI flash/sort tie-breaks, keep a ms timestamp derived from createdAt if present
    created_at_ms: (() => {
      const iso = row.createdAt;
      const t = iso ? Date.parse(iso) : NaN;
      return Number.isFinite(t) ? t : Date.now();
    })(),

    // Keep the last-known currency from backend if present
    currency: (row.currency === "EUR" || row.currency === "USD") ? row.currency : "GBP",
  };
}

function toAwsPlayer(p){
  if(!p) return p;

  const nowIso = new Date().toISOString();

  // Only send fields that exist in the Amplify schema.
  return {
    id: p.id,

    firstName: String(p.firstName ?? "").trim(),
    surname: String(p.surname ?? "").trim(),
    seniority: ["Senior", "Youth", "Watchlist"].includes(p.seniority)
  ? p.seniority
  : "Senior",
    position: (p.pos ?? "").toString().toUpperCase(),
    foot: (p.foot === "L") ? "L" : "R",
    ovrInitial: Number.isFinite(Number(p.intl)) ? Number(p.intl) : null,
    potentialMin: Number.isFinite(Number(p.potMin)) ? Number(p.potMin) : null,
    potentialMax: Number.isFinite(Number(p.potMax)) ? Number(p.potMax) : null,

    active: (p.active === "N") ? "N" : "Y",
    homegrown: !!p.homegrown,

    // Store GBP values in the backend. (Your UI already converts between currencies.)
    cost: Number(asInt(p.cost_gbp, 0)),
    sale: Number(asInt(p.sale_gbp, 0)),

    currency: (p.currency === "EUR" || p.currency === "USD") ? p.currency : "GBP",

    createdAt: (() => {
      const ms = Number(p.created_at_ms);
      return Number.isFinite(ms) ? new Date(ms).toISOString() : nowIso;
    })(),
    updatedAt: nowIso,
  };
}


function convertFromGBP(amountGBP, currency){
  const c = (currency in FX) ? currency : "GBP";
  return Number(amountGBP) * FX[c];
}
function convertToGBP(amountInCurrency, currency){
  const c = (currency in FX) ? currency : "GBP";
  return Number(amountInCurrency) / FX[c];
}

function abbrevNumber(n){
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const format = (val, suffix) => {
    const absVal = Math.abs(val);
    let str;
    if (absVal >= 10) str = String(Math.round(val));
    else str = String(Math.round(val * 10) / 10).replace(/\.0$/, "");
    return sign + str + suffix;
  };
  if (abs >= 1_000_000_000) return format(abs / 1_000_000_000, "B");
  if (abs >= 1_000_000) return format(abs / 1_000_000, "M");
  if (abs >= 1_000) return format(abs / 1_000, "K");
  return sign + Math.round(abs).toLocaleString("en-GB");
}
function fmtMoneyAbbrevFromGBP(amountGBP, currency){
  const cur = (currency in CURRENCY_META) ? currency : "GBP";
  const sym = CURRENCY_META[cur].symbol;
  const converted = convertFromGBP(amountGBP, cur);
  const str = abbrevNumber(converted);
  if (str.startsWith("-")) return "-" + sym + str.slice(1);
  return sym + str;
}
function fmtPct(p){
  if(!Number.isFinite(p)) return "—";
  return Math.trunc(p*100) + "%";
}

// ---------- boot: save selection ----------
function getCurrentSave(){
  const url = new URL(location.href);
  const saveId = url.searchParams.get("save");
  return { saveId, save: null };
}

const { saveId: CURRENT_SAVE_ID } = getCurrentSave();

// If someone opens the tracker without selecting a save, send them to the dashboard.
if (!CURRENT_SAVE_ID){
  location.replace("./index.html");
}

// Title will be loaded from backend in boot().
const saveTitleEl = document.getElementById("save-title");
let CURRENT_SAVE = null;

// ---------- state ----------
let players = []; // loaded from backend in boot()
let editingId = null;

let seniorityFilter = "Senior";   // ✅ ADD THIS BACK

function setSeniorityFilter(next){
  const allowed = ["Senior", "Youth", "Watchlist", "All"];
  seniorityFilter = allowed.includes(next) ? next : "Senior";

  for(const seg of allSenioritySegs){
    for(const b of Array.from(seg.querySelectorAll(".seg-btn"))){
      b.classList.toggle("active", b.dataset.seniority === seniorityFilter);
    }
  }
  render();
}

function setPitchSeniorityFilter(next){
  const allowed = ["Senior","Youth","All","Homegrown"];
  pitchSeniorityFilter = allowed.includes(next) ? next : "Senior";
  if (!pitchSenioritySeg) return;

  for (const b of Array.from(pitchSenioritySeg.querySelectorAll(".seg-btn"))){
    b.classList.toggle("active", b.dataset.pitchSeniority === pitchSeniorityFilter);
  }
}

let currency = "GBP";           // shared
let showExPlayers = true;       // players list only

let lastFlashId = null;

// Sorting (default: OVR high -> low)
let sortKey = "ovr";
let sortDir = "desc"; // "asc" | "desc"

const POS_ORDER = ["GK","RB","CB","LB","CDM","CM","CAM","RM","LM","ST"];
const STATUS_ORDER = ["Special","Exciting","Great","Sell"];

// ---------- DOM ----------
const $ = (id)=>document.getElementById(id);

const editCard = $("edit-card");
const editNameEl = $("edit-player-name");

const form = $("player-form");
const fFirst = $("f-first");
const fSurname = $("f-surname");
const fSeniority = $("f-seniority");
const fPos = $("f-pos");
const fFoot = $("f-foot");
const fIntl = $("f-intl");
const fPotMin = $("f-potmin");
const fPotMax = $("f-potmax");
const autoFirst = $("auto-first");
const autoSurname = $("auto-surname");
const autoPos = $("auto-pos");
const autoFoot = $("auto-foot");
const autoIntl = $("auto-intl");
const autoPotMin = $("auto-potmin");
const autoPotMax = $("auto-potmax");

const fActive = $("f-active");
const fCost = $("f-cost");
const fSale = $("f-sale");
const fHomegrown = $("f-homegrown");

const btnAdd = $("btn-add");
const btnUpdate = $("btn-update");
const btnClear = $("btn-clear");
const btnScan = $("btn-scan");
const btnRescan = $("btn-rescan");

const scanModal = $("scan-modal");
const scanVideo = $("scan-video");
const scanCanvas = $("scan-canvas");
const btnScanCapture = $("btn-scan-capture");
const btnScanApply = $("btn-scan-apply");
const scanStatus = $("scan-status");
const scanDebug = $("scan-debug");
const btnCancel = $("btn-cancel");
const btnReset = $("btn-reset");
const btnExport = $("btn-export");
const importFile = $("import-file");

const rowsEl = $("rows");
const tCost = $("t-cost");
const tSale = $("t-sale");
const tProfit = $("t-profit");
const tRoi = $("t-roi");

const searchEl = $("search");
const filterActiveEl = $("filter-active");
const toggleExEl = $("toggle-ex");

const allSenioritySegs = Array.from(document.querySelectorAll('.segmented[aria-label="Seniority filter"]'));
const currencySeg = document.querySelector('.segmented[aria-label="Currency"]');
const sortableHeaders = Array.from(document.querySelectorAll("th.sortable"));

const btnEditSaveTitle = document.getElementById("edit-save-title");

// ---------- pitch ----------
const pitchEl = document.getElementById("pitch");
const pitchSortSeg = document.querySelector('.segmented[aria-label="Pitch sort"]');
const formationSelect = document.getElementById("formation-select");

let pitchSortKey = "ovr"; // "ovr" | "potential"

const pitchSenioritySeg = document.querySelector('.segmented[aria-label="Pitch seniority"]');
const pitchWatchlistEl = document.getElementById("pitch-watchlist");

let pitchSeniorityFilter = "Senior";   // "Senior" | "Youth" | "All" | "Homegrown"
let includePitchWatchlist = false;

// ---------- scan (camera + OCR) ----------
let scanStream = null;
let lastScanResult = null; // { firstName, surname, pos, intl, foot, rawText }
let scanVideoTrack = null; // for camera zoom control
const scanZoom = $("scan-zoom"); // slider in tracker.html


function openScanModal(){
  if (!scanModal) return;
  scanModal.classList.remove("hidden");
  btnScanApply?.classList.add("hidden");
  setScanStatus("Requesting camera…");
  startScanCamera().catch(err=>{
    console.error(err);
    setScanStatus("Camera error: " + (err?.message || String(err)));
    alert("Could not open camera. Make sure you're on HTTPS and have granted camera permission.");
  });
}

function closeScanModal(){
  if (!scanModal) return;
  scanModal.classList.add("hidden");
  stopScanCamera();
  lastScanResult = null;
  btnScanApply?.classList.add("hidden");
  setScanStatus("Camera idle");
}

function setScanStatus(msg){
  if (scanStatus) scanStatus.textContent = msg;
}

async function startScanCamera(){
  if (!scanVideo) return;
  stopScanCamera();

  // Prefer rear camera on phones
  const constraints = {
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };


  scanStream = await navigator.mediaDevices.getUserMedia(constraints);
  scanVideo.srcObject = scanStream;
  await scanVideo.play();
  setScanStatus("Camera ready");

    // --- camera zoom (if supported) ---
  scanVideoTrack = scanStream?.getVideoTracks?.()[0] || null;

  // Stop Safari pinch zoom on the video itself (best-effort)
  try { scanVideo.style.touchAction = "none"; } catch {}

  const caps = scanVideoTrack?.getCapabilities?.() || {};
  if (scanZoom && caps.zoom){
    scanZoom.disabled = false;
    scanZoom.min = caps.zoom.min;
    scanZoom.max = caps.zoom.max;
    scanZoom.step = caps.zoom.step || 0.1;

    // start at current zoom if available
    const settings = scanVideoTrack.getSettings?.() || {};
    scanZoom.value = settings.zoom ?? caps.zoom.min;

    scanZoom.oninput = async () => {
      try{
        await scanVideoTrack.applyConstraints({ advanced: [{ zoom: Number(scanZoom.value) }] });
      }catch(e){
        console.warn("Zoom apply failed", e);
      }
    };
  } else if (scanZoom){
    scanZoom.disabled = true; // device/browser doesn't support camera zoom constraints
  }


}

function stopScanCamera(){
  if (scanVideo) scanVideo.srcObject = null;
  if (scanStream){
    for (const t of scanStream.getTracks()) t.stop();
  }
  scanStream = null;
  scanVideoTrack = null;
}

function captureScanFrame(){
  if (!scanVideo || !scanCanvas) return false;

  // iPhone Safari can struggle with huge frames — cap capture size for OCR
  const vw = scanVideo.videoWidth || 1280;
  const vh = scanVideo.videoHeight || 720;

  const targetW = Math.min(1280, vw);
  const targetH = Math.round(targetW * (vh / vw));

  scanCanvas.width = targetW;
  scanCanvas.height = targetH;

  const ctx = scanCanvas.getContext("2d");
  ctx.drawImage(scanVideo, 0, 0, targetW, targetH);

  // Crop to the overlay guide area (matches .scan-box: left 6%, top 6%, width 88%, height 30%)
  const cropX = Math.round(targetW * 0.06);
  const cropY = Math.round(targetH * 0.06);
  const cropW = Math.round(targetW * 0.88);
  const cropH = Math.round(targetH * 0.30);

  const cropped = ctx.getImageData(cropX, cropY, cropW, cropH);

  // Replace canvas with the cropped region so OCR uses only the header box
  scanCanvas.width = cropW;
  scanCanvas.height = cropH;
  const ctx2 = scanCanvas.getContext("2d");
  ctx2.putImageData(cropped, 0, 0);


  return true;
}


// Very light preprocessing: increase contrast a bit by converting to grayscale.
// (Keeps it fast; you can improve later with cropping / thresholding.)
function toGrayscaleImageData(img){
  const d = img.data;
  for (let i=0; i<d.length; i+=4){
    const r=d[i], g=d[i+1], b=d[i+2];
    const y = (0.299*r + 0.587*g + 0.114*b);
    d[i]=d[i+1]=d[i+2]=y;
  }
  return img;
}

async function runOcr(image){
  // Use a PNG dataURL from the canvas (more reliable on iPhone Safari)
  const res = await Tesseract.recognize(image, "eng", {
    logger: m => {
      if (m?.status === "recognizing text" && Number.isFinite(m?.progress)){
        setScanStatus(`OCR ${(m.progress*100).toFixed(0)}%`);
      }
    }
  });
  return res;
}

// Parse OCR text for your specific mapping rules.
// We keep this conservative and only fill fields we’re confident about.
function parseEaCardText(raw){
  const text = String(raw || "");
  const lines = text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const joined = lines.join(" ");
  const out = { rawText: text };

  // 1) Overall: first standalone 2-digit number near the start
  // (EA OVR is 1–99; we bias to 10–99.)
  {
    const m = joined.match(/\b([1-9][0-9])\b/);
    if (m) out.intl = m[1];
  }

 // 1b) Potential range: robust parse (OCR often misspells "Potential")
{
  const lower = joined.toLowerCase();

  // First try: look near a fuzzy "poten" anchor
  const idx = lower.search(/poten/); // matches potential/potentlal/etc.
  if (idx !== -1){
    const window = joined.slice(Math.max(0, idx - 20), idx + 120);
    const m1 = window.match(/([1-9][0-9])\s*[-–]\s*([1-9][0-9])/);
    if (m1){
      out.potMin = m1[1];
      out.potMax = m1[2];
    }
  }

  // Fallback: any "NN - NN" range, but avoid accidental matches
  // (e.g. skip height/weight "56/127" because that's a slash, not a hyphen)
  if (!out.potMin || !out.potMax){
    const ranges = joined.match(/([1-9][0-9])\s*[-–]\s*([1-9][0-9])/g) || [];
    for (const r of ranges){
      const m2 = r.match(/([1-9][0-9])\s*[-–]\s*([1-9][0-9])/);
      if (!m2) continue;
      const a = Number(m2[1]), b = Number(m2[2]);
      // Potential should be within normal EA ranges and not wildly far apart
      if (a >= 40 && b <= 99 && a <= b && (b - a) <= 30){
        out.potMin = m2[1];
        out.potMax = m2[2];
        break;
      }
    }
  }

   // Edge case: if the UI shows "Peak" instead of a range, use Overall for both
  if ((!out.potMin || !out.potMax) && /peak/i.test(joined) && out.intl){
    out.potMin = out.intl;
    out.potMax = out.intl;
  }
}


// 2) Preferred foot: ONLY trust an L/R that appears right next to "Pref" + "Foot"
{
  const lower = joined.toLowerCase();

  // Prefer the exact label region
  const idx = lower.search(/pref\s*\.?\s*foot/);
  if (idx !== -1){
    const window = joined.slice(idx, idx + 50); // tighter window than before
    // In the game UI it's typically: "Pref. Foot  R"
    const m = window.match(/pref\s*\.?\s*foot[^LR]*\b([LR])\b/i);
    if (m) out.foot = m[1].toUpperCase();
  }

  // Fallback: look for "pref" then a nearby isolated L/R, but still within a tight window
  if (!out.foot){
    const idx2 = lower.indexOf("pref");
    if (idx2 !== -1){
      const window2 = joined.slice(idx2, idx2 + 60);
      const m2 = window2.match(/\b([LR])\b/);
      if (m2) out.foot = m2[1].toUpperCase();
    }
  }

  // IMPORTANT: do NOT global-fallback to any lone L/R in the whole text
  // (that causes wrong foot when OCR finds random 'L' elsewhere)
}


  // 3) Position: in the EA header it appears like "75 | LW · LM · CAM"
  // We accept ONLY your app's allowed positions.
  // If OCR returns LW/LM/CAM etc, we’ll map to the nearest supported:
  // LW/LM/RW/RM -> LM/RM, CAM stays CAM, ST stays ST, etc.
  {
    const allowed = new Set(["GK","RB","CB","LB","CDM","CM","CAM","LM","RM","ST"]);
    const mapPos = (p) => {
      const u = String(p||"").toUpperCase();
      if (allowed.has(u)) return u;
      // common EA positions seen on card:
      if (u === "LW") return "LM";
      if (u === "RW") return "RM";
      if (u === "CF") return "ST";
      return null;
    };

    // Try pattern: number then position token
    // e.g. "75 LW" or "75 | LW"
    const m = joined.match(/\b[1-9][0-9]\b\s*(?:\||I|l)?\s*([A-Z]{2,3})\b/);
    if (m){
      const pos = mapPos(m[1]);
      if (pos) out.pos = pos;
    }

    // Fallback: first position-like token in the text
    if (!out.pos){
      const tokens = joined.match(/\b[A-Z]{2,3}\b/g) || [];
      for (const t of tokens){
        const pos = mapPos(t);
        if (pos){ out.pos = pos; break; }
      }
    }
  }

  // 4) Name: ignore short tokens like LW/LM/CAM etc; pick two longer ALLCAPS tokens
  {
    const POS_TOKENS = new Set([
      "GK","RB","CB","LB","CDM","CM","CAM","LM","RM","ST",
      "LW","RW","CF","LWB","RWB"
    ]);

    // collect ALLCAPS tokens from the OCR text
    const tokens = joined.match(/\b[A-Z]{2,}\b/g) || [];

    // remove position-like tokens and very short tokens (2–3 chars)
    const nameLike = tokens.filter(t => {
      const u = t.toUpperCase();
      if (POS_TOKENS.has(u)) return false;
      if (u.length <= 3) return false;
      return true;
    });

    // We expect something like ["JAEDYN","SHAW", ...]
    if (nameLike.length >= 2){
      const first = nameLike[0];
      const sur = nameLike[1];

      out.firstName = first.charAt(0) + first.slice(1).toLowerCase();
      out.surname = sur.charAt(0) + sur.slice(1).toLowerCase();
    }
  }


  return out;
}

function setAutoBadge(el, on){
  if (!el) return;
  el.classList.toggle("hidden", !on);
}
function clearAllAutoBadges(){
  setAutoBadge(autoFirst,false);
  setAutoBadge(autoSurname,false);
  setAutoBadge(autoPos,false);
  setAutoBadge(autoFoot,false);
  setAutoBadge(autoIntl,false);
  setAutoBadge(autoPotMin,false);
  setAutoBadge(autoPotMax,false);
}

function applyScanToForm(scan){
  if (!scan) return;

  // Only set fields if we actually found them (don’t clobber user edits)
  if (scan.firstName && fFirst){ fFirst.value = scan.firstName; setAutoBadge(autoFirst,true); }
if (scan.surname && fSurname){ fSurname.value = scan.surname; setAutoBadge(autoSurname,true); }
if (scan.pos && fPos){ fPos.value = scan.pos; setAutoBadge(autoPos,true); }
if (scan.intl && fIntl){ fIntl.value = scan.intl; setAutoBadge(autoIntl,true); }

if (scan.potMin && fPotMin){ fPotMin.value = scan.potMin; setAutoBadge(autoPotMin,true); }
if (scan.potMax && fPotMax){ fPotMax.value = scan.potMax; setAutoBadge(autoPotMax,true); }

if (scan.foot && fFoot){ fFoot.value = (scan.foot === "L") ? "L" : "R"; setAutoBadge(autoFoot,true); }


if (btnRescan) btnRescan.classList.remove("hidden");

  updateEditName();
}
// ---------- scan end ----------


// ---------- formation state ----------
let currentFormationKey = DEFAULT_FORMATION;
let currentPitchLayout = (FORMATIONS[currentFormationKey]?.layout) || [];

function applyFormation(key){
  const f = FORMATIONS[key];
  if (!f || !pitchEl) return;

  currentFormationKey = key;
  currentPitchLayout = Array.isArray(f.layout) ? f.layout : [];

  // Dynamically apply the CSS grid layout (areas) from JS
  if (typeof f.areas === "string"){
    pitchEl.style.gridTemplateAreas = f.areas.trim();
  }

  renderPitch();
}

// ---------- formation selector ----------
if (formationSelect){
  formationSelect.innerHTML = Object.keys(FORMATIONS)
    .map(k => `<option value="${k}">${FORMATIONS[k].label || k}</option>`)
    .join("");

  formationSelect.value = currentFormationKey;

  formationSelect.addEventListener("change", async () => {
  const next = formationSelect.value;
  applyFormation(next);

  if (!CURRENT_SAVE) return;
  try {
    const updated = await aws.updateSave(CURRENT_SAVE_ID, { preferredFormation: next });
    if (updated) CURRENT_SAVE = updated;
  } catch (err) {
    alert(err?.message || String(err));
    console.error(err);
  }
  });

}



// ---------- pitch end ----------

// ---------- scan events ----------
if (btnScan){
  btnScan.addEventListener("click", ()=>{
    if (!navigator.mediaDevices?.getUserMedia){
      alert("Camera not supported on this browser.");
      return;
    }
    openScanModal();
  });
}

if (btnRescan){
  btnRescan.addEventListener("click", ()=>{
    if (!navigator.mediaDevices?.getUserMedia){
      alert("Camera not supported on this browser.");
      return;
    }
    openScanModal();
  });
}

if (scanModal){
  // Close when clicking backdrop or Close button
  scanModal.addEventListener("click", (e)=>{
    const closeEl = e.target.closest("[data-scan-close]");
    if (closeEl) closeScanModal();
  });
}

if (btnScanCapture){
  btnScanCapture.addEventListener("click", async ()=>{
    try{
      setScanStatus("Capturing…");
const ok = captureScanFrame();
if (!ok) return;


if (!scanCanvas) return;

setScanStatus("Preparing image…");
const dataUrl = scanCanvas.toDataURL("image/png");

setScanStatus("Starting OCR…");
const ocr = await runOcr(dataUrl);


      const rawText = ocr?.data?.text || "";
      const parsed = parseEaCardText(rawText);

      lastScanResult = parsed;

      // Optional debug (keep hidden unless you want it visible)
      if (scanDebug){
        scanDebug.textContent = rawText;
      }

// If we found enough fields, apply immediately and close the modal
const confidence = ["intl","pos","surname","firstName","foot","potMin","potMax"].filter(k => !!parsed[k]).length;

if (confidence >= 2){
  applyScanToForm(parsed);
  closeScanModal();
} else {
  setScanStatus("Scan complete — couldn’t confidently detect fields (try closer / steadier)");
  // keep modal open so user can try again
}

    }catch(err){
      console.error(err);
      setScanStatus("OCR error: " + (err?.message || String(err)));
      alert("OCR failed: " + (err?.message || String(err)));
      console.error(err?.stack || err);
    }
  });
}

// ---------- scan events end ----------


btnEditSaveTitle?.addEventListener("click", async () => {

  if (!CURRENT_SAVE) return;

  const current = (saveTitleEl?.textContent || "").trim() || "Untitled";
  const next = prompt("Edit title", current);
  if (next == null) return; // user cancelled

  const trimmed = next.trim();
  if (!trimmed) return alert("Title cannot be empty.");

  // update UI immediately
  saveTitleEl.textContent = trimmed;
  document.title = `${trimmed} — FC26 Transfer Tracker`;

  // persist to AWS (you need to implement one of these in awsClient.js)
  try {
    await aws.updateSave(CURRENT_SAVE_ID, { title: trimmed });
    // OR: await aws.updateSaveTitle?.(CURRENT_SAVE_ID, trimmed);
  } catch (err) {
    alert(err?.message || String(err));
    console.error(err);
  }
});

// ---------- auth/session ----------
async function requireLoginOrRedirect(){
  const session = await aws.getSession?.();
  if(!session?.signedIn){
    location.href = "./login.html";
    throw new Error("Not signed in");
  }
  return session;
}

// ------- persistence (AWS) -------
async function fetchSaveOrRedirect(){
  await requireLoginOrRedirect();

  // Expect: listSaves() returns saves user owns; we find the requested one.
  const saves = await aws.listSaves?.();
  const save = Array.isArray(saves) ? saves.find(s => s.id === CURRENT_SAVE_ID) : null;

  if (!save){
    location.replace("./index.html");
    return null;
  }
  return save;
}

async function fetchPlayers(){
  await requireLoginOrRedirect();

  // Expect: listPlayers(saveId) returns players belonging to this save
  const data = await aws.listPlayers?.(CURRENT_SAVE_ID);
  const list = Array.isArray(data) ? data : [];

  return list.map(fromAwsPlayer);
}

// Legacy no-op (kept because the UI calls it in a few places; we now persist per-action)
function savePlayers(){ /* handled by AWS per-action */ }

// ---------- edit name display ----------
function updateEditName(){
  const name = fullName(fFirst.value, fSurname.value);
  editNameEl.textContent = name || "New Player";
}
fFirst.addEventListener("input", updateEditName);
fSurname.addEventListener("input", updateEditName);
fFirst.addEventListener("input", ()=>setAutoBadge(autoFirst,false));
fSurname.addEventListener("input", ()=>setAutoBadge(autoSurname,false));
fPos.addEventListener("change", ()=>setAutoBadge(autoPos,false));
fFoot.addEventListener("change", ()=>setAutoBadge(autoFoot,false));
fIntl.addEventListener("input", ()=>setAutoBadge(autoIntl,false));
fPotMin.addEventListener("input", ()=>setAutoBadge(autoPotMin,false));
fPotMax.addEventListener("input", ()=>setAutoBadge(autoPotMax,false));


// ---------- seniority (form) ----------
function applySeniorityToForm(){
  const s = fSeniority.value;

  if (s === "Youth"){
    fCost.value = "0";
    fCost.disabled = true;
  } else {
    fCost.disabled = false;
  }
}
fSeniority.addEventListener("change", applySeniorityToForm);

// ---------- currency ----------
function setCurrency(next){
  currency = (next === "EUR" || next === "USD") ? next : "GBP";
  for (const b of Array.from(currencySeg.querySelectorAll(".seg-btn"))){
    b.classList.toggle("active", b.dataset.currency === currency);
  }
  syncMoneyInputsToCurrency();
  render();
}
currencySeg.addEventListener("click", (e)=>{
  const btn = e.target.closest("button.seg-btn");
  if(!btn) return;
  setCurrency(btn.dataset.currency);
});

function syncMoneyInputsToCurrency(){
  if(!editingId) return;
  const p = players.find(x=>x.id===editingId);
  if(!p) return;
  fCost.value = fmtNumberForInput(Math.round(convertFromGBP(p.cost_gbp||0, currency)));
  fSale.value = fmtNumberForInput(Math.round(convertFromGBP(p.sale_gbp||0, currency)));
  applySeniorityToForm();
}


for(const seg of allSenioritySegs){
  seg.addEventListener("click", (e)=>{
    const btn = e.target.closest("button.seg-btn");
    if(!btn) return;
    setSeniorityFilter(btn.dataset.seniority);
  });
}
function matchesSeniority(p){
  const s = p.seniority || "Senior";

  // Only show Watchlist players when Watchlist filter is selected
  if (seniorityFilter === "Watchlist") return s === "Watchlist";

  // "All" means Senior + Youth ONLY (explicitly exclude Watchlist)
  if (seniorityFilter === "All") return s !== "Watchlist";

  // Normal filters
  return s === seniorityFilter;
}

function matchesPitchSeniority(p){
  const s = p.seniority || "Senior";

  if (pitchSeniorityFilter === "Homegrown") return !!p.homegrown;
  if (s === "Watchlist") return includePitchWatchlist;

  if (pitchSeniorityFilter === "All") return s !== "Watchlist"; // Senior+Youth
  return s === pitchSeniorityFilter;
}


// ---------- Pitch seg ----------

if (pitchSortSeg){
  pitchSortSeg.addEventListener("click", (e)=>{
    const btn = e.target.closest("button.seg-btn");
    if(!btn) return;
    pitchSortKey = (btn.dataset.pitchSort === "potential") ? "potential" : "ovr";
    for (const b of Array.from(pitchSortSeg.querySelectorAll(".seg-btn"))){
      b.classList.toggle("active", b.dataset.pitchSort === pitchSortKey);
    }
    renderPitch(); // only re-render pitch
  });
}

// ---------- Pitch seniority seg ----------
if (pitchSenioritySeg){
  pitchSenioritySeg.addEventListener("click", (e)=>{
    const btn = e.target.closest("button.seg-btn");
    if(!btn) return;

    const next = btn.dataset.pitchSeniority;
    if(!next) return;

    setPitchSeniorityFilter(next);
    renderPitch();
  });
}


if (pitchWatchlistEl){
  pitchWatchlistEl.addEventListener("change", ()=>{
    includePitchWatchlist = !!pitchWatchlistEl.checked;
    renderPitch();
  });
}



// ---------- show ex-players toggle (players list only) ----------
if (toggleExEl){
  toggleExEl.addEventListener("change", ()=>{
    showExPlayers = !!toggleExEl.checked;
    render();
  });
}

// ---------- sorting ----------
function tieBreakName(a,b){
  const sur = String(a.surname||"").localeCompare(String(b.surname||""), undefined, { sensitivity:"base" });
  if (sur !== 0) return sur;
  return String(a.firstName||"").localeCompare(String(b.firstName||""), undefined, { sensitivity:"base" });
}

function sortIndex(arr, val){
  const i = arr.indexOf(String(val||""));
  return i === -1 ? 999 : i;
}

function sortValue(p, key){
  switch(key){
    case "player": return String(p.surname || "");
    case "seniority": return (p.seniority === "Youth") ? 1 : 0; // Senior then Youth (asc)
    case "position": return sortIndex(POS_ORDER, p.pos);
    case "foot": return (p.foot === "L") ? 0 : 1; // L then R (asc)
    case "ovr": return asInt(p.intl, 0);
    case "potential": {
      const a = potAvg(p);
      return a == null ? -1 : Math.trunc(a);
    }
    case "status": return sortIndex(STATUS_ORDER, statusFromAvg(potAvg(p)));
    case "cost": return asInt(p.cost_gbp, 0);
    case "sale": return asInt(p.sale_gbp, 0);
    case "profit": return profitGBP(p);
    case "homegrown": return p.homegrown ? 1 : 0;
    case "roi": {
      const r = roi(p);
      return Number.isFinite(r) ? r : -Infinity;
    }
    default: return 0;
  }
}

function sortPlayers(list){
  const dir = (sortDir === "asc") ? 1 : -1;
  return [...list].sort((a,b)=>{
    const A = sortValue(a, sortKey);
    const B = sortValue(b, sortKey);

    if (A === B) return tieBreakName(a,b);

    if (sortKey === "player"){
      return dir * String(A).localeCompare(String(B), undefined, { sensitivity:"base" });
    }
    // numeric / index sorts
    return dir * ((A > B) ? 1 : -1);
  });
}

function updateSortIndicators(){
  for (const th of sortableHeaders){
    th.classList.remove("active-sort");
    const a = th.querySelector(".arrow");
    if (a) a.remove();
  }
  const active = sortableHeaders.find(th => th.dataset.sort === sortKey);
  if (!active) return;
  active.classList.add("active-sort");
  const sp = document.createElement("span");
  sp.className = "arrow";
  sp.textContent = sortDir === "asc" ? "▲" : "▼";
  active.appendChild(sp);
}

for (const th of sortableHeaders){
  th.addEventListener("click", ()=>{
    const key = th.dataset.sort;
    if (!key) return;
    if (sortKey === key){
      sortDir = (sortDir === "asc") ? "desc" : "asc";
    } else {
      sortKey = key;
      // default direction by column
      if (["player","seniority","position","status"].includes(key)) sortDir = "asc";
      else sortDir = "desc";
      if (key === "ovr") sortDir = "desc";
    }
    updateSortIndicators();
    render();
  });
}

// ---------- formatting inputs (commas) ----------
function formatNumericWithCommas(el){
  if(el.disabled) return;
  const raw = String(el.value ?? "");
  const digits = raw.replace(/[^0-9]/g,"");
  if(!digits){ el.value=""; return; }
  if(digits.length>15){ el.value=digits; return; }
  el.value = Number(digits).toLocaleString("en-GB");
}
fCost.addEventListener("input", ()=>formatNumericWithCommas(fCost));
fSale.addEventListener("input", ()=>formatNumericWithCommas(fSale));

// ---------- rendering ----------
function render(){
  const q = (searchEl.value||"").trim().toLowerCase();
  const activeFilter = filterActiveEl.value;

  let filtered = players
    .filter(matchesSeniority)
    .filter(p=>{
      if(!showExPlayers && p.active !== "Y") return false;
      if(showExPlayers && activeFilter !== "ALL" && p.active !== activeFilter) return false;
      if(!q) return true;
      return (displayName(p)||"").toLowerCase().includes(q) || (p.pos||"").toLowerCase().includes(q);
    });

  filtered = sortPlayers(filtered);

  rowsEl.innerHTML = "";
  for(const p of filtered){
    const avg = potAvg(p);
    const avgDisplay = avg==null ? "—" : String(Math.trunc(avg));
    const status = statusFromAvg(avg);
    const profGBP = profitGBP(p);
    const r = roi(p);

    const saleCell = asInt(p.sale_gbp,0) > 0
      ? `<span class="val-pos">${fmtMoneyAbbrevFromGBP(p.sale_gbp, currency)}</span>`
      : `<span class="val-muted">N/A</span>`;

    const tr = document.createElement("tr");
    if (p.active === "N") tr.classList.add("inactive");
    if (lastFlashId && p.id === lastFlashId) tr.classList.add("flash");

    tr.innerHTML = `
      <td><div class="cell-contain wide">${escapeHtml(displayName(p))}</div></td>
      <td><div class="cell-contain">${escapeHtml(p.pos || "")}</div></td>
      <td><div class="cell-contain">${escapeHtml((p.foot === "L") ? "L" : "R")}</div></td>
      <td><div class="cell-contain">${escapeHtml(String(p.intl ?? ""))}</div></td>
      <td><div class="cell-contain">${avgDisplay}</div></td>
      <td><div class="cell-contain wide"><span class="badge ${badgeClass(status)}">${status}</span></div></td>
      <td><div class="cell-contain wide">${escapeHtml(p.seniority || "Senior")}</div></td>
      <td><div class="cell-contain">${p.homegrown ? "Y" : "N"}</div></td>
      <td class="num"><div class="cell-contain"><span class="val-neg">${fmtMoneyAbbrevFromGBP(p.cost_gbp || 0, currency)}</span></div></td>
      <td class="num"><div class="cell-contain">${saleCell}</div></td>
      <td class="num"><div class="cell-contain"><span class="${valClassFromNumber(profGBP)}">${fmtMoneyAbbrevFromGBP(profGBP, currency)}</span></div></td>
      <td class="num"><div class="cell-contain"><span class="${valClassFromNumber(Number.isFinite(r)?r:NaN)}">${fmtPct(r)}</span></div></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="icon-btn danger" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </td>`;
    rowsEl.appendChild(tr);
  }

  if (lastFlashId){
    const id = lastFlashId;
    setTimeout(()=>{
      if (lastFlashId === id){
        lastFlashId = null;
        render();
      }
    }, 1400);
  }

  renderTotals();
  renderPitch();
}

function renderTotals(){
  const list = players.filter(matchesSeniority);

  const totalCostGBP = list.reduce((s,p)=>s+asInt(p.cost_gbp,0),0);
  const totalSaleGBP = list.reduce((s,p)=>s+asInt(p.sale_gbp,0),0);
  const totalProfitGBP = list.reduce((s,p)=>s+profitGBP(p),0);

  const rois = list.map(roi).filter(v=>Number.isFinite(v));
  const avgRoi = rois.length ? rois.reduce((a,b)=>a+b,0)/rois.length : null;

  tCost.textContent = fmtMoneyAbbrevFromGBP(totalCostGBP, currency);
  tSale.textContent = fmtMoneyAbbrevFromGBP(totalSaleGBP, currency);
  tProfit.textContent = fmtMoneyAbbrevFromGBP(totalProfitGBP, currency);
  tRoi.textContent = avgRoi==null ? "—" : fmtPct(avgRoi);

  tProfit.classList.remove("val-pos","val-neg");
  tProfit.classList.add(totalProfitGBP>=0 ? "val-pos":"val-neg");

  tRoi.classList.remove("val-pos","val-neg");
  if(avgRoi!=null) tRoi.classList.add(avgRoi>=0 ? "val-pos":"val-neg");
}


function pitchSortValue(p){
  if (pitchSortKey === "potential"){
    const a = potAvg(p);
    return a == null ? -1 : a; // higher is better
  }
  return asInt(p.intl, 0); // overall
}

function pitchPlayerLine(p){
  const name = displayName(p) || fullName(p.firstName, p.surname) || "Unnamed";
  const ovr = asInt(p.intl, 0);
  const pot = potAvg(p);
  const potNum = (pot == null) ? null : Math.trunc(pot);

  // Show "OVR/POT" (e.g., 87/89). If pot missing, show just "87".
  const meta = (potNum == null) ? `${ovr}` : `${ovr}/${potNum}`;

  return { name, meta };
}

function splitAlternating(list, slots){
  const buckets = Array.from({ length: slots }, ()=>[]);
  for(let i=0; i<list.length; i++){
    buckets[i % slots].push(list[i]);
  }
  return buckets;
}

function normFoot(p){
  return (p?.foot === "L") ? "L" : "R";
}

function hasAny(slotSet, arr){
  for (const x of arr) if (slotSet.has(x)) return true;
  return false;
}

function resolvePitchPos(basePos, foot, slotSet){
  const pos = String(basePos || "").toUpperCase();
  const f = (foot === "L") ? "L" : "R";

  // Only remap if the formation actually has these side-specific slots.
  if (pos === "ST" && hasAny(slotSet, ["STL","STR"])){
    return (f === "L") ? "STL" : "STR";
  }
  if (pos === "CAM" && hasAny(slotSet, ["CAML","CAMR"])){
    return (f === "L") ? "CAML" : "CAMR";
  }
  if (pos === "CM" && hasAny(slotSet, ["CML","CMR"])){
    return (f === "L") ? "CML" : "CMR";
  }
  if (pos === "CB" && hasAny(slotSet, ["CBL","CBR"])){
    return (f === "L") ? "CBL" : "CBR";
  }

  return pos;
}

function renderPitch(){
  if (!pitchEl) return;
  if (!currentPitchLayout.length) return;

  // Mirror the same filters as render() uses
  const q = (searchEl?.value || "").trim().toLowerCase();

  let filtered = players
    .filter(p => p.active === "Y")      // ✅ always exclude sold players on pitch
    .filter(matchesPitchSeniority)      // ✅ pitch’s own Senior/Youth/All + watchlist checkbox
    .filter(p=>{
      if(!q) return true;
      return (displayName(p)||"").toLowerCase().includes(q) || (p.pos||"").toLowerCase().includes(q);
    });


// Build a set of slot position codes present in this formation
const slotSet = new Set(currentPitchLayout.map(s => String(s.pos || "").toUpperCase()));

// Group by (resolved) pitch position
const byPos = new Map();
for (const p of filtered){
  const key = resolvePitchPos(p.pos, normFoot(p), slotSet);
  if (!byPos.has(key)) byPos.set(key, []);
  byPos.get(key).push(p);
}

  // Sort each position list by chosen key, then tie-break on name
  for (const [pos, list] of byPos){
    list.sort((a,b)=>{
      const A = pitchSortValue(a);
      const B = pitchSortValue(b);
      if (A === B) return tieBreakName(a,b);
      return (B > A) ? 1 : -1; // desc
    });
  }

    // Count how many times each position appears on the pitch (e.g., CB=2, CM=2)
  const slotCounts = new Map();
  for (const slot of currentPitchLayout){
  slotCounts.set(slot.pos, (slotCounts.get(slot.pos) || 0) + 1);
}


  // Pre-split lists for positions that have multiple slots
  const perSlotLists = new Map(); // pos -> [bucket0, bucket1, ...]
  for (const [pos, count] of slotCounts){
    const full = byPos.get(pos) || [];
    if (count <= 1){
      perSlotLists.set(pos, [full]);
    } else {
      perSlotLists.set(pos, splitAlternating(full, count));
    }
  }

  // Keep track of which bucket we’ve used as we render each slot
  const nextBucketIdx = new Map();


  // Render panels on the pitch
  pitchEl.innerHTML = "";
  for (const slot of currentPitchLayout){
  const buckets = perSlotLists.get(slot.pos) || [[]];
  const i = nextBucketIdx.get(slot.pos) || 0;
  nextBucketIdx.set(slot.pos, i + 1);
  const list = buckets[i] || [];

    const panel = document.createElement("div");
    panel.className = "pitch-pos" + (list.length ? "" : " empty");
    panel.style.gridArea = slot.area;

    const head = document.createElement("div");
    head.className = "head";
    head.innerHTML = `
      <div class="pos-code">${escapeHtml(slot.pos)}</div>
      <div class="count">${list.length}</div>
    `;
    panel.appendChild(head);

    const ul = document.createElement("ul");

    if (!list.length){
      const li = document.createElement("li");
      li.textContent = "No players";
      ul.appendChild(li);
    } else {
      // Show up to N; you can increase if you want.
      const shown = list;

      for (const p of shown){
        const line = pitchPlayerLine(p);
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="name">${escapeHtml(line.name)}</span>
          <span class="meta">${escapeHtml(line.meta)}</span>
        `;
        ul.appendChild(li);
      }
    }

    panel.appendChild(ul);
    pitchEl.appendChild(panel);
  }
}


// ---------- events ----------
btnAdd.addEventListener("click", async ()=>{
  const data = readForm();
  if(!data) return;

  try{
    await requireLoginOrRedirect();

    // create via awsClient
    const created = await aws.addPlayer?.(CURRENT_SAVE_ID, toAwsPlayer({ ...data, id: uid() }));
    const inserted = created ? fromAwsPlayer(created) : fromAwsPlayer({ ...data, id: uid() });

    players.push(inserted);

    if (seniorityFilter !== "All"){
      setSeniorityFilter(inserted.seniority);
    }
    lastFlashId = inserted.id;

    clearForm();
    render();
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
});

btnUpdate.addEventListener("click", async ()=>{
  if(!editingId) return;
  const data = readForm();
  if(!data) return;

  const idx = players.findIndex(p=>p.id===editingId);
  if(idx === -1) return;

  try{
    await requireLoginOrRedirect();

    const updated = await aws.updatePlayer?.(editingId, toAwsPlayer({ ...players[idx], ...data, id: editingId }));
    players[idx] = fromAwsPlayer(updated || { ...players[idx], ...data, id: editingId });

    if (seniorityFilter !== "All"){
      setSeniorityFilter(players[idx].seniority);
    }
    lastFlashId = editingId;

    clearForm();
    render();
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
});

btnClear.addEventListener("click", ()=>{
  form.reset();
  fActive.value = "Y";
  fCost.value = "";
  fSale.value = "";
  fPos.value = "";
  fSeniority.value = "Senior";
  applySeniorityToForm();
  updateEditName();
  clearAllAutoBadges();
});

btnCancel.addEventListener("click", ()=>clearForm());

btnReset.addEventListener("click", async ()=>{
  const ok = confirm("Reset everything? This deletes all players from this career save.");
  if(!ok) return;

  try{
    await requireLoginOrRedirect();

    // delete all players for this save
    const list = await aws.listPlayers?.(CURRENT_SAVE_ID);
    const items = Array.isArray(list) ? list : [];
    for (const p of items){
      if (aws.deletePlayer) await aws.deletePlayer(p.id);
    }

    players = [];
    clearForm();
    render();
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
});

rowsEl.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const p = players.find(x=>x.id===id);
  if(!p) return;

  if(action==="edit") loadIntoForm(p);
  if(action==="delete"){
    const ok = confirm(`Delete ${displayName(p)}?`);
    if(!ok) return;
    (async ()=>{
      try{
        await requireLoginOrRedirect();
        await aws.deletePlayer?.(id);
        players = players.filter(x=>x.id!==id);
        if(editingId===id) clearForm();
        render();
      }catch(err){
        alert(err?.message || String(err));
        console.error(err);
      }
    })();
  }
});

searchEl.addEventListener("input", render);
filterActiveEl.addEventListener("change", render);

btnExport.addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(players,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fc26-transfer-tracker.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Import: keep as-is but use AWS create/delete instead of Supabase bulk ops
importFile.addEventListener("change", async ()=>{
  const file = importFile.files && importFile.files[0];
  if(!file) return;

  try{
    await requireLoginOrRedirect();
    const text = await file.text();
    const parsed = JSON.parse(text);
    if(!Array.isArray(parsed)) throw new Error("Invalid file format (expected an array).");

    // Delete existing players for this save
    const existing = await aws.listPlayers?.(CURRENT_SAVE_ID);
    const items = Array.isArray(existing) ? existing : [];
    for (const p of items){
      if (aws.deletePlayer) await aws.deletePlayer(p.id);
    }

    // Insert imported players one-by-one (simple + robust)
    const cleaned = parsed.map((x)=>({
      id: x.id || (crypto.randomUUID ? crypto.randomUUID() : uid()),
      firstName: String(x.forename ?? x.firstName ?? x.first ?? "").trim(),
      surname: String(x.surname ?? x.last ?? "").trim(),
      seniority: (x.seniority === "Youth") ? "Youth" : "Senior",
      pos: String(x.position ?? x.pos ?? "CM"),
      intl: asInt(x.ovr ?? x.intl ?? 50, 50),
      potMin: asInt(x.pot_min ?? x.potMin ?? 50, 50),
      potMax: asInt(x.pot_max ?? x.potMax ?? 50, 50),
      active: (x.active === "N") ? "N" : "Y",
      cost_gbp: asInt(x.cost_gbp ?? x.cost ?? 0, 0),
      sale_gbp: asInt(x.sale_gbp ?? x.sale ?? 0, 0),
      created_at_ms: Number.isFinite(Number(x.created_at_ms ?? x.createdAt)) ? Number(x.created_at_ms ?? x.createdAt) : Date.now(),
    }));

    for (const p of cleaned){
      await aws.addPlayer?.(CURRENT_SAVE_ID, toAwsPlayer(p));
    }

    players = await fetchPlayers();
    clearForm();
    render();
  }catch(err){
    alert("Could not import file: " + (err?.message || String(err)));
    console.error(err);
  }finally{
    importFile.value="";
  }
});

form.addEventListener("keydown", (e)=>{
  if(e.key!=="Enter") return;
  e.preventDefault();
  if(editingId) btnUpdate.click(); else btnAdd.click();
});

// ---------- form ----------
function readForm(){
  const firstName = (fFirst.value||"").trim();
  const surname = (fSurname.value||"").trim();
  const seniority = ["Senior", "Youth", "Watchlist"].includes(fSeniority.value)
  ? fSeniority.value
  : "Senior";
  const pos = (fPos.value||"").trim().toUpperCase();
  const foot = (fFoot?.value === "L") ? "L" : "R";
  if(!firstName) return alert("Forename is required."), null;
  if(!surname) return alert("Surname is required."), null;
  if(!pos) return alert("Position is required."), null;
  const intl = clamp(fIntl.value,1,99);
  const potMin = clamp(fPotMin.value,1,99);
  const potMax = clamp(fPotMax.value,1,99);
  const active = (fActive.value==="N"?"N":"Y");
  const costInCur = (seniority==="Youth") ? 0 : Math.max(0, parseMoneyInput(fCost.value));
  const saleInCur = Math.max(0, parseMoneyInput(fSale.value));
  const cost_gbp = Math.round(convertToGBP(costInCur, currency));
  const sale_gbp = Math.round(convertToGBP(saleInCur, currency));
  const homegrown = !!fHomegrown?.checked;

  return { id: uid(), firstName, surname, seniority, pos, foot, intl, potMin, potMax, active, homegrown, cost_gbp, sale_gbp, currency };
}

function loadIntoForm(p){
  p = fromAwsPlayer(p);
  editingId = p.id;
  fFirst.value = p.firstName || "";
  fSurname.value = p.surname || "";
  fSeniority.value = ["Senior","Youth","Watchlist"].includes(p.seniority)
  ? p.seniority
  : "Senior";
  fPos.value = p.pos || "";
  if (fFoot) fFoot.value = (p.foot === "L") ? "L" : "R";
  fIntl.value = p.intl ?? "";
  fPotMin.value = p.potMin ?? "";
  fPotMax.value = p.potMax ?? "";
  fActive.value = (p.active==="N"?"N":"Y");
  if (fHomegrown) fHomegrown.checked = !!p.homegrown;

  fCost.value = fmtNumberForInput(Math.round(convertFromGBP(p.cost_gbp ?? 0, currency)));
  fSale.value = fmtNumberForInput(Math.round(convertFromGBP(p.sale_gbp ?? 0, currency)));

  applySeniorityToForm();
  updateEditName();

  editCard.classList.add("editing");
  btnCancel.classList.remove("hidden");
  btnAdd.classList.add("hidden");
  btnUpdate.classList.remove("hidden");

  editCard.scrollIntoView({behavior:"smooth", block:"start"});
}

function clearForm(){
  editingId = null;
  form.reset();
  if (fHomegrown) fHomegrown.checked = false;
  fActive.value = "Y";
  fCost.value = "";
  fSale.value = "";
  fPos.value = "";
  if (fFoot) fFoot.value = "R";
  fSeniority.value = "Senior";
  applySeniorityToForm();
  updateEditName();

  editCard.classList.remove("editing");
  btnCancel.classList.add("hidden");
  btnUpdate.classList.add("hidden");
    btnAdd.classList.remove("hidden");

  // Reset scan UI state
  clearAllAutoBadges();
  if (btnRescan) btnRescan.classList.add("hidden");
}



// ---------- init ----------
(async function boot(){
  try{
    const save = await fetchSaveOrRedirect();
    if (!save) return;
    CURRENT_SAVE = save;
    console.log("Loaded save:", save);
    if (saveTitleEl){
      saveTitleEl.textContent = save.title || save.name || "Untitled";
      document.title = `${saveTitleEl.textContent} — FC26 Transfer Tracker`;
    }

    players = await fetchPlayers();

    updateEditName();
    applySeniorityToForm();

    if (toggleExEl) toggleExEl.checked = true;
    showExPlayers = true;

    if (pitchWatchlistEl) pitchWatchlistEl.checked = false;
    includePitchWatchlist = false;
    setPitchSeniorityFilter("Senior");


    setCurrency("GBP");
    setSeniorityFilter("Senior");
    updateSortIndicators();

    // Apply preferred formation saved on this CareerSave (cross-device), else default.
const savedKey = (CURRENT_SAVE?.preferredFormation || "").trim();
const keyToUse = (savedKey && FORMATIONS[savedKey]) ? savedKey : DEFAULT_FORMATION;

if (formationSelect) formationSelect.value = keyToUse;
applyFormation(keyToUse);

    render();
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
    location.replace("./index.html");
  }
})();
