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

// Lowercase + strip accents/diacritics for search (so "ruben" matches "rúben")
function foldForSearch(s){
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// -------- IndexedDB cache (PlayerMaster) --------
const PM_IDB_DB = "eafc_tracker_cache_v1";
const PM_IDB_STORE = "kv";
const PM_IDB_KEY = (version) => `PlayerMasterCache:${String(version || "FC26")}`;

function openPmIdb(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PM_IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PM_IDB_STORE)){
        db.createObjectStore(PM_IDB_STORE, { keyPath: "k" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
  });
}

async function idbGet(k){
  const db = await openPmIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PM_IDB_STORE, "readonly");
    const store = tx.objectStore(PM_IDB_STORE);
    const req = store.get(k);
    req.onsuccess = () => resolve(req.result?.v ?? null);
    req.onerror = () => reject(req.error || new Error("IndexedDB get failed"));
  });
}

async function idbSet(k, v){
  const db = await openPmIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PM_IDB_STORE, "readwrite");
    const store = tx.objectStore(PM_IDB_STORE);
    store.put({ k, v, t: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("IndexedDB set failed"));
  });
}

// Load PlayerMaster cache from IndexedDB into memory (returns true if loaded)
async function pmLoadFromIdb(version){
  try{
    const payload = await idbGet(PM_IDB_KEY(version));
    if (!payload || payload.cacheSchema !== 1) return false;

    // hydrate in-memory cache
    _pmCache.version = payload.version || version;
    _pmCache.names = Array.isArray(payload.names) ? payload.names : [];
    _pmCache.meta = Array.isArray(payload.meta) ? payload.meta : [];

    // rebuild bucket index (fast)
    _pmCache.byFirstChar = {};
    for (let idx = 0; idx < _pmCache.names.length; idx++){
      const nl = foldForSearch(_pmCache.names[idx]);
      _pmCache.names[idx] = nl; // normalize in-place (handles older caches)
      const c = (nl && nl[0]) ? nl[0] : "?";
      (_pmCache.byFirstChar[c] ||= []).push(idx);
    }


    _pmCache.loadedCount = _pmCache.names.length;
    _pmCache.lastError = null;
    _pmCache.loading = null;

    return _pmCache.names.length > 0;
  }catch(e){
    // if IDB blocked/unavailable, silently ignore and fall back to network
    return false;
  }
}

async function pmSaveToIdb(version){
  try{
    const payload = {
      cacheSchema: 1,
      version,
      savedAt: Date.now(),
      names: _pmCache.names,
      meta: _pmCache.meta,
    };
    await idbSet(PM_IDB_KEY(version), payload);
  }catch{
    // ignore (private mode / quota / blocked)
  }
}

// Load PlayerMaster cache from a static JSON file (returns true if loaded)
async function pmLoadFromJson(version = "FC26"){
  // If you later add FC27 etc, change this to:
  // const url = `./player_master_${String(version).toLowerCase()}.json`;
  const url = "./player_master_fc26.json";

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`PlayerMaster JSON fetch failed: ${res.status}`);

  const payload = await res.json();
  const players = Array.isArray(payload?.players)
    ? payload.players
    : (Array.isArray(payload) ? payload : null);

  if (!players) throw new Error("PlayerMaster JSON missing 'players' array");

  // hydrate in-memory cache
  _pmCache.version = payload?.version || version;
  _pmCache.names = [];
  _pmCache.meta = [];
  _pmCache.byFirstChar = {};
  _pmCache.loadedCount = 0;
  _pmCache.lastError = null;
  _pmCache.loading = null;

  for (const m of players){
    const nl = foldForSearch(m?.nameLower);
    if (!nl) continue;

    const idx = _pmCache.names.length;
    _pmCache.names.push(nl);

    _pmCache.meta.push({
      id: m?.id,
      shortName: m?.shortName,
      nameLower: m?.nameLower,
      longName: m?.longName || "",

      playerPositions: m?.playerPositions,
      overall: m?.overall,
      potential: m?.potential,
      age: m?.age,
      nationalityName: m?.nationalityName,
      preferredFoot: m?.preferredFoot,
    });

    const c = nl[0] || "?";
    (_pmCache.byFirstChar[c] ||= []).push(idx);
  }

  _pmCache.loadedCount = _pmCache.names.length;
  return _pmCache.names.length > 0;
}


// -------- PlayerMaster cache (in-memory) --------
const _pmCache = {
  version: null,

  // lightweight search index
  names: [],          // array of nameLower strings
  byFirstChar: {},    // { "a": [idx, idx...], "j": [...], ".": [...] }
  meta: [],           // parallel array: minimal object for dropdown (id, shortName, etc.)

  // loading/progress
  loading: null,
  loadedCount: 0,
  expectedTotal: 0,
  lastError: null,
};

async function loadPlayerMasterAll(version = "FC26") {
  // already in-memory
  if (_pmCache.version === version && _pmCache.names.length) return _pmCache;
  if (_pmCache.loading) return _pmCache.loading;

    // try IndexedDB first (instant on refresh)
  if (await pmLoadFromIdb(version)){
    return _pmCache;
  }

  // try static JSON next (fast, no AWS). If it fails, fall back to AWS.
  try{
    if (await pmLoadFromJson(version)){
  console.log("[PlayerMaster] Loaded from JSON");
  pmSaveToIdb(version);
  return _pmCache;
}

  }catch(e){
    console.warn("[PlayerMaster] JSON load failed, falling back to AWS:", e);
  }

  // reset progress
  _pmCache.loadedCount = 0;
  _pmCache.expectedTotal = 0;
  _pmCache.lastError = null;

  _pmCache.loading = (async () => {
    try {
      let nextToken = null;

      // reset index
      _pmCache.version = version;
      _pmCache.names = [];
      _pmCache.meta = [];
      _pmCache.byFirstChar = {};

      // Pull the entire version set once.
      for (let i = 0; i < 200; i++) {
        const resp = await client.models.PlayerMaster.list({
          filter: { version: { eq: version } },
          limit: 1000,
          nextToken,
        });

        const { data, errors } = resp || {};
        if (errors?.length) throw new Error(joinErrors(errors));

        if (Array.isArray(data) && data.length) {
          for (const m of data) {
            const nl = foldForSearch(m?.nameLower);

            if (!nl) continue;

            const idx = _pmCache.names.length;
            _pmCache.names.push(nl);

            // minimal metadata for dropdown + selection
              _pmCache.meta.push({
              id: m?.id,
              shortName: m?.shortName,
              nameLower: m?.nameLower,
              longName: m?.longName || m?.long_name || "",

              playerPositions: m?.playerPositions,
              overall: m?.overall,
              potential: m?.potential,
              age: m?.age,
              nationalityName: m?.nationalityName,
              preferredFoot: m?.preferredFoot,
            });


            const c = nl[0] || "?";
            (_pmCache.byFirstChar[c] ||= []).push(idx);
          }

          _pmCache.loadedCount = _pmCache.names.length;
        }

        nextToken = resp?.nextToken || null;
        if (!nextToken) break;
      }

      _pmCache.loading = null;

      // Persist for future refreshes (avoids re-downloading 18K rows)
      pmSaveToIdb(version);

      return _pmCache;


    } catch (e) {
      _pmCache.lastError = e;
      _pmCache.loading = null;
      throw e;
    }
  })();

  return _pmCache.loading;
}


export async function warmPlayerMasterCache(version = "FC26") {
  await initAws();
  return await loadPlayerMasterAll(version);
}


export function getPlayerMasterCacheStatus() {
  return {
    version: _pmCache.version,
    loaded: !_pmCache.loading && _pmCache.names.length > 0,
    loading: !!_pmCache.loading,
    loadedCount: _pmCache.loadedCount,
    expectedTotal: _pmCache.expectedTotal,
    lastError: _pmCache.lastError ? String(_pmCache.lastError?.message || _pmCache.lastError) : null,
  };
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

  let allPlayers = [];
  let nextToken = null;

  do {
    const response = await client.models.Player.list({
      filter: { careerSaveId: { eq: careerSaveId } },
      limit: 1000,
      nextToken,
    });

    const { data, errors } = response;

    if (errors?.length) {
      throw new Error(joinErrors(errors));
    }

    if (Array.isArray(data)) {
      allPlayers = allPlayers.concat(data);
    }

    nextToken = response?.nextToken || null;
  } while (nextToken);

  return allPlayers;
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

  const raw = foldForSearch(query);
  const q0 = raw.replace(/\s+/g, " ").trim();

  // Require 3+ chars, but allow "j." initial searches (2 chars incl dot)
  const isInitialSearch = /^[a-z]\.$/.test(q0);
  if (!isInitialSearch && q0.length < 3) return [];

  const MAX_RESULTS = Math.max(1, Math.min(80, Number(want) || 8));

  // Ensure cache loaded (one-time)
  const cache = await loadPlayerMasterAll(version);

  const q = q0;

  const hits = [];

  // Fast path: initial searches like "j." or "j. b" should use the bucket by initial letter
  const isInitialStyle = /^[a-z]\./.test(q);
  if (isInitialStyle) {
    const firstChar = q[0];
    const bucket = cache.byFirstChar[firstChar] || [];
    for (let i = 0; i < bucket.length; i++) {
      const idx = bucket[i];
      const nl = cache.names[idx];
      if (nl.startsWith(q)) {
        hits.push(cache.meta[idx]);
        if (hits.length >= 300) break;
      }
    }
  } else {
    // Surname / fragment search ("bell") must scan ALL names because nameLower is "j. bellingham"
    // (i.e. surname does not control the first character).
    for (let idx = 0; idx < cache.names.length; idx++) {
      const nl = cache.names[idx];
      if (!nl) continue;

      // match anywhere, but bias to word-boundary (space) so "bell" matches "j. bellingham"
      if (nl.includes(" " + q) || nl.startsWith(q) || nl.includes(q)) {
        hits.push(cache.meta[idx]);
        if (hits.length >= 300) break;
      }
    }
  }

  // Simple ranking: startsWith beats contains
  hits.sort((a, b) => {
    const na = String(a?.shortName || "");
    const nb = String(b?.shortName || "");
    return na.localeCompare(nb);
  });

  return hits.slice(0, MAX_RESULTS);
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

