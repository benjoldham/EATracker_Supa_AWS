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

// -------- Data: Career Saves --------
export async function listSaves() {
  await initAws();
  const { data, errors } = await client.models.CareerSave.list();
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}

export async function createSave(name) {
  await initAws();
  const now = new Date().toISOString();
  const { data, errors } = await client.models.CareerSave.create({
    name,
    createdAt: now,
    updatedAt: now,
  });
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}

export async function deleteSave(id) {
  await initAws();
  const { errors } = await client.models.CareerSave.delete({ id });
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
}

// -------- Data: Players --------
export async function listPlayers(saveId) {
  await initAws();
  const { data, errors } = await client.models.Player.list({
    filter: { saveId: { eq: saveId } },
  });
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}

export async function addPlayer(saveId, player) {
  await initAws();
  const now = new Date().toISOString();
  const payload = {
    saveId,
    createdAt: now,
    updatedAt: now,
    ...player,
  };
  const { data, errors } = await client.models.Player.create(payload);
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}

export async function updatePlayer(id, updates) {
  await initAws();
  const now = new Date().toISOString();
  const { data, errors } = await client.models.Player.update({
    id,
    updatedAt: now,
    ...updates,
  });
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
  return data;
}

export async function deletePlayer(id) {
  await initAws();
  const { errors } = await client.models.Player.delete({ id });
  if (errors?.length) throw new Error(errors.map(e => e.message).join("; "));
}
