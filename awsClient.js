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

// -------- PlayerMaster cache (in-memory) --------
const _pmCache = {
  version: null,
  items: [],
  loading: null,
};

async function loadPlayerMasterAll(version = "FC26") {
  if (_pmCache.version === version && _pmCache.items.length) return _pmCache.items;
  if (_pmCache.loading) return _pmCache.loading;

  _pmCache.loading = (async () => {
    const out = [];
    let nextToken = null;

    // Pull the entire version set once (18K rows). After that, search is local + instant.
    for (let i = 0; i < 200; i++) {
      const resp = await client.models.PlayerMaster.list({
        filter: { version: { eq: version } },
        limit: 1000,
        nextToken,
      });

      const { data, errors } = resp || {};
      if (errors?.length) throw new Error(joinErrors(errors));
      if (Array.isArray(data) && data.length) out.push(...data);

      nextToken = resp?.nextToken || null;
      if (!nextToken) break;
    }

    _pmCache.version = version;
    _pmCache.items = out;
    _pmCache.loading = null;
    return out;
  })();

  return _pmCache.loading;
}

// Optional: allow app.js to pre-warm the cache on focus
export async function warmPlayerMasterCache(version = "FC26") {
  await initAws();
  await loadPlayerMasterAll(version);
}


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

export async function searchPlayerMaster(query, want = 8, version = "FC26") {
  await initAws();

  const raw = String(query || "").trim().toLowerCase();

  // Require 3+ chars, but allow "j." initial searches (2 chars incl dot)
  const q0 = raw.replace(/\s+/g, " ").trim();
  const isInitialSearch = /^[a-z]\.$/.test(q0);
  if (!isInitialSearch && q0.length < 3) return [];


  const MAX_RESULTS = Math.max(1, Math.min(25, Number(want) || 8));

  // Load once, then search locally.
  const items = await loadPlayerMasterAll(version);

  // Normalize input:
  // - "J. " -> "j."
  // - allow searching by surname without requiring initial
  const q = q0;
  const surnameQuery = q.replace(/^([a-z])\.\s*/, "").trim(); // drop "j. " if present

  const rank = (m) => {
    const nl = String(m?.nameLower || "").toLowerCase();
    const sl = String(m?.surnameLower || "").toLowerCase();
    const sn = String(m?.shortName || "").toLowerCase();

    // Best: surname beginsWith typed surname ("bell" => bellingham)
    if (surnameQuery && sl && sl.startsWith(surnameQuery)) return 0;

    // Next: nameLower beginsWith "j." or "j. b"
    if (nl && nl.startsWith(q)) return 1;

    // Next: shortName beginsWith q (covers some weird rows)
    if (sn && sn.startsWith(q)) return 2;

    // Next: name contains " bell"
    if (surnameQuery && nl.includes(" " + surnameQuery)) return 3;
    if (nl.includes(" " + q)) return 4;

    return 99;
  };

  const filtered = [];
  for (const m of items) {
    const nl = String(m?.nameLower || "").toLowerCase();
    const sl = String(m?.surnameLower || "").toLowerCase();
    const sn = String(m?.shortName || "").toLowerCase();

    if (
      (sl && sl.startsWith(surnameQuery || q)) ||
      (nl && (nl.startsWith(q) || nl.includes(" " + (surnameQuery || q)))) ||
      (sn && sn.includes(q))
    ) {
      filtered.push(m);
      // stop early to keep it snappy even on slow devices
      if (filtered.length > 400) break;
    }
  }

  filtered.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return String(a?.shortName || "").localeCompare(String(b?.shortName || ""));
  });

  return filtered.slice(0, MAX_RESULTS);
}


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

