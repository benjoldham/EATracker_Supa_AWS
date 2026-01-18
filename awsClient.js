import { Amplify } from "https://esm.sh/aws-amplify@6";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "https://esm.sh/aws-amplify@6/auth";
import { generateClient } from "https://esm.sh/aws-amplify@6/data";

let configured = false;
let client = null;

async function loadOutputs() {
  const res = await fetch("./amplify_outputs.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load amplify_outputs.json");
  return await res.json();
}

export async function initAws() {
  if (configured) return;
  const outputs = await loadOutputs();
  Amplify.configure(outputs);
  client = generateClient({ authMode: "userPool" }); // default for the app
  configured = true;
}

function joinErrors(errors) {
  return (errors || []).map(e => e.message).join("; ");
}

/* =====================
   AUTH
===================== */

export async function getSession() {
  await initAws();
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    return { signedIn: true, user, hasTokens: !!session.tokens };
  } catch {
    return { signedIn: false };
  }
}

export async function awsSignUp(email, password) {
  await initAws();
  return signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function awsSignIn(email, password) {
  await initAws();
  return signIn({ username: email, password });
}

export async function awsSignOut() {
  await initAws();
  return signOut();
}

/* =====================
   CAREER SAVES
===================== */

export async function listSaves() {
  await initAws();
  const { data, errors } = await client.models.CareerSave.list();
  if (errors?.length) throw new Error(joinErrors(errors));
  return data ?? [];
}

export async function createSave(title) {
  await initAws();
  const name = String(title || "").trim() || "Untitled save";

  const { data, errors } = await client.models.CareerSave.create({
    title: name,
  });

  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

export async function deleteSave(id) {
  await initAws();
  const { errors } = await client.models.CareerSave.delete({ id });
  if (errors?.length) throw new Error(joinErrors(errors));
}

/* =====================
   PLAYERS
===================== */

export async function listPlayers(careerSaveId) {
  await initAws();
  const { data, errors } = await client.models.Player.list({
    filter: { careerSaveId: { eq: careerSaveId } },
  });
  if (errors?.length) throw new Error(joinErrors(errors));
  return data ?? [];
}

export async function addPlayer(careerSaveId, player) {
  await initAws();

  const payload = {
    careerSaveId,
    ...player,
  };

  const { data, errors } = await client.models.Player.create(payload);
  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

export async function updatePlayer(id, updates) {
  await initAws();
  const { data, errors } = await client.models.Player.update({
    id,
    ...updates,
  });
  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

export async function deletePlayer(id) {
  await initAws();
  const { errors } = await client.models.Player.delete({ id });
  if (errors?.length) throw new Error(joinErrors(errors));
}

/* =====================
   PLAYER MASTER (Autocomplete)
===================== */

export async function searchPlayerMaster(query, want = 8) {
  await initAws();

  const raw = String(query || "").trim().toLowerCase();
  if (raw.length < 2) return [];

  const MAX_RESULTS = Math.max(1, Math.min(25, Number(want) || 8));

  // Normalize input:
  // - "J. " -> "j."
  // - "J. B" -> surnameQuery = "b"
  // - "Bell" -> surnameQuery = "bell"
  const q = raw.replace(/\s+/g, " ").trim();
  const surnameQuery = q.replace(/^([a-z])\.\s*/, "").trim(); // drop "j. " if present

  // Build filter:
  // - beginsWith surnameLower for proper last-name search (bellingham)
  // - beginsWith nameLower for "j." style search
  // - contains on nameLower for cases where surnameLower was seeded as full name (e.g. "bruno fernandes")
  const or = [
    { surnameLower: { beginsWith: q } },
    { nameLower: { beginsWith: q } },
    { nameLower: { contains: " " + q } },
  ];

  if (surnameQuery && surnameQuery.length >= 2 && surnameQuery !== q) {
    or.push({ surnameLower: { beginsWith: surnameQuery } });
    or.push({ nameLower: { contains: " " + surnameQuery } });
  }

  // IMPORTANT: list+filter is paginated. We must keep paging until we gather enough matches.
  let nextToken = null;
  const collected = [];

  for (let page = 0; page < 15 && collected.length < MAX_RESULTS * 6; page++) {
    const resp = await client.models.PlayerMaster.list({
      filter: { or },
      limit: 200,
      nextToken,
    });

    const { data, errors } = resp || {};
    if (errors?.length) throw new Error(joinErrors(errors));

    if (Array.isArray(data) && data.length) collected.push(...data);

    nextToken = resp?.nextToken || null;
    if (!nextToken) break;
  }

  // Rank results
  const rank = (m) => {
    const nl = String(m?.nameLower || "").toLowerCase();
    const sl = String(m?.surnameLower || "").toLowerCase();

    // Best: surname starts with surnameQuery (typing "bell" should find "j. bellingham")
    if (surnameQuery && sl.startsWith(surnameQuery)) return 0;

    // Next: name starts with query (typing "j." / "j. b" etc)
    if (nl.startsWith(q)) return 1;

    // Next: s




export async function playerMasterHasVersion(version) {
  await initAws();

  const v = String(version || "").trim();
  if (!v) return false;

  const { data, errors } = await client.models.PlayerMaster.list({
    filter: { version: { eq: v } },
    limit: 1
  });

  if (errors?.length) throw new Error(joinErrors(errors));
  return Array.isArray(data) && data.length > 0;
}

export async function createPlayerMaster(item) {
  await initAws();

  const { data, errors } = await client.models.PlayerMaster.create(item);
  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}



/* =====================
   Career Save Title 
===================== */

// NEW: generic save updater (supports preferredFormation, title, etc.)
export async function updateSave(id, patch) {
  await initAws();
  if (!id) throw new Error("Missing CareerSave id.");

  const updates = patch && typeof patch === "object" ? patch : {};

  const payload = { id };

  // Allow updating title (optional)
  if ("title" in updates) {
    const t = String(updates.title || "").trim();
    if (!t) throw new Error("Title cannot be empty.");
    payload.title = t;
  }

  // Allow updating preferredFormation (optional)
  if ("preferredFormation" in updates) {
    const f = String(updates.preferredFormation || "").trim();
    // allow clearing by sending "" if you ever want; otherwise keep trimmed string
    payload.preferredFormation = f || null;
  }

  const { data, errors } = await client.models.CareerSave.update(payload);
  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

export async function updateSaveTitle(id, title) {
  await initAws();
  const t = String(title || "").trim();
  if (!t) throw new Error("Title cannot be empty.");

  const { data, errors } = await client.models.CareerSave.update({
    id,
    title: t,
  });

  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

