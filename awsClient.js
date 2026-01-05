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

// -------- Helpers --------
function joinErrors(errors) {
  return (errors || []).map((e) => e?.message || String(e)).join("; ");
}

function looksLikeNullNonNullableTitleError(msg) {
  return String(msg || "").includes("Cannot return null for non-nullable type") &&
         String(msg || "").includes("/listCareerSaves/items") &&
         String(msg || "").includes("/title");
}

function normaliseSave(save) {
  if (!save) return save;
  // Your UI expects .name. Your backend may now be .title.
  return {
    ...save,
    name: save.name ?? save.title ?? "Untitled save",
    title: save.title ?? save.name ?? null,
  };
}

// -------- Data: Career Saves --------
export async function listSaves() {
  await initAws();

  const { data, errors } = await client.models.CareerSave.list();

  if (errors?.length) {
    const msg = joinErrors(errors);

    // This is your exact new failure mode.
    if (looksLikeNullNonNullableTitleError(msg)) {
      throw new Error(
        [
          "Your backend schema now requires CareerSave.title, but an older CareerSave record exists with title = null.",
          "",
          "Fix: delete (or update) the old CareerSave items created before the schema change.",
          "Fastest: open DynamoDB in us-east-1, find the CareerSave table for this Amplify app, and delete the items with missing title.",
          "",
          "After deleting the old items, refresh the dashboard.",
        ].join("\n")
      );
    }

    throw new Error(msg);
  }

  return Array.isArray(data) ? data.map(normaliseSave) : [];
}

export async function createSave(name) {
  await initAws();
  const now = new Date().toISOString();

  // Try the new schema first: title
  {
    const { data, errors } = await client.models.CareerSave.create({
      title: name,
      createdAt: now,
      // updatedAt is optional; include only if your schema defines it.
      // If your schema does not have updatedAt, Amplify will error and we will fall back.
      updatedAt: now,
    });

    if (!errors?.length) return normaliseSave(data);

    const msg = joinErrors(errors);

    // If schema doesn't have updatedAt/title, fall back
    if (!String(msg).includes("field") && !String(msg).includes("not defined")) {
      // Some other error (auth etc.)
      throw new Error(msg);
    }
  }

  // Fallback: older schema using name (+ maybe no updatedAt)
  {
    const { data, errors } = await client.models.CareerSave.create({
      name,
      createdAt: now,
      updatedAt: now,
    });

    if (errors?.length) throw new Error(joinErrors(errors));
    return normaliseSave(data);
  }
}

export async function deleteSave(id) {
  await initAws();
  const { errors } = await client.models.CareerSave.delete({ id });
  if (errors?.length) throw new Error(joinErrors(errors));
}

// -------- Data: Players --------
export async function listPlayers(saveId) {
  await initAws();
  const { data, errors } = await client.models.Player.list({
    filter: { saveId: { eq: saveId } },
  });
  if (errors?.length) throw new Error(joinErrors(errors));
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
  if (errors?.length) throw new Error(joinErrors(errors));
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
  if (errors?.length) throw new Error(joinErrors(errors));
  return data;
}

export async function deletePlayer(id) {
  await initAws();
  const { errors } = await client.models.Player.delete({ id });
  if (errors?.length) throw new Error(joinErrors(errors));
}
