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
  if (!res.ok) throw new Error(`Failed to load amplify_outputs.json (${res.status})`);
  return await res.json();
}

export async function initAws() {
  if (configured) return;
  const outputs = await loadOutputs();
  Amplify.configure(outputs);
  client = generateClient();
  configured = true;
}

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

// -------- Auth (email + password) --------
export async function awsSignUp(email, password) {
  await initAws();
  return await signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function awsSignIn(email, password) {
  await initAws();
  return await signIn({ username: email, password });
}

export async function awsSignOut() {
  await initAws();
  return await signOut();
}

// -------- helpers --------
function joinErrors(errors) {
  return (errors || []).map((e) => e?.message || String(e)).join("; ");
}

function normaliseSave(s) {
  if (!s) return s;
  return {
    ...s,
    // dashboard expects .name
    name: s.name ?? s.title ?? "Untitled save",
    title: s.title ?? s.name ?? null,
  };
}

// -------- Data: Career Saves --------
export async function listSaves() {
  await initAws();
  const { data, errors } = await client.models.CareerSave.list();
  if (errors?.length) throw new Error(joinErrors(errors));
  return Array.isArray(data) ? data.map(normaliseSave) : [];
}

export async function createSave(displayName) {
  await initAws();
  const name = String(displayName || "").trim() || "Untitled save";

  // 1) Try schema with `title`
  {
    const { data, errors } = await client.models.CareerSave.create({ title: name });
    if (!errors?.length) return normaliseSave(data);
  }

  // 2) Fallback: schema with `name`
  {
    const { data, errors } = await client.models.CareerSave.create({ name });
    if (errors?.length) throw new Error(joinErrors(errors));
    return normaliseSave(data);
  }
}

export async function listPlayers(saveId) {
  await initAws();

  const tryList = async (fieldName) => {
    const { data, errors } = await client.models.Player.list({
      filter: { [fieldName]: { eq: saveId } },
    });
    if (errors?.length) {
      const msg = joinErrors(errors);
      // This is the exact error you’re getting
      if (msg.includes("ModelPlayerFilterInput") && msg.includes("field that is not defined")) {
        return { retryable: true, msg };
      }
      throw new Error(msg);
    }
    return { data: Array.isArray(data) ? data : [] };
  };

  // 1) Try saveId first
  const a = await tryList("saveId");
  if (a.data) return a.data;

  // 2) Retry careerSaveId if saveId is not part of schema
  const b = await tryList("careerSaveId");
  if (b.data) return b.data;

  // If we somehow got here, throw the last message
  throw new Error(a.msg || b.msg || "Unable to list players.");
}


export async function addPlayer(saveId, player) {
  await initAws();

  const tryCreate = async (fieldName) => {
    const payload = { [fieldName]: saveId, ...player };
    const { data, errors } = await client.models.Player.create(payload);
    if (errors?.length) {
      const msg = joinErrors(errors);
      // If schema doesn’t have that linking field, GraphQL rejects it
      if (msg.includes("CreatePlayerInput") && msg.includes("field that is not defined")) {
        return { retryable: true, msg };
      }
      throw new Error(msg);
    }
    return { data };
  };

  // 1) Try saveId
  const a = await tryCreate("saveId");
  if (a.data) return a.data;

  // 2) Retry careerSaveId
  const b = await tryCreate("careerSaveId");
  if (b.data) return b.data;

  throw new Error(a.msg || b.msg || "Unable to add player.");
}


export async function updatePlayer(id, updates) {
  await initAws();

  // IMPORTANT: do not inject updatedAt unless your schema explicitly has it.
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
