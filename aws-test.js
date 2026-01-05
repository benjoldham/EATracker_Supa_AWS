import outputs from "./amplify_outputs.json" assert { type: "json" };

import { Amplify } from "https://esm.sh/aws-amplify@6";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "https://esm.sh/aws-amplify@6/auth";
import { generateClient } from "https://esm.sh/aws-amplify@6/data";

Amplify.configure(outputs);

const out = document.getElementById("out");
const msg = document.getElementById("msg");
const client = generateClient();

function show(x) {
  out.textContent = typeof x === "string" ? x : JSON.stringify(x, null, 2);
}

async function whoAmI() {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    return { signedIn: true, user, hasTokens: !!session.tokens };
  } catch {
    return { signedIn: false };
  }
}

document.getElementById("btn-signin").addEventListener("click", async () => {
  await signInWithRedirect();
});

document.getElementById("btn-signout").addEventListener("click", async () => {
  await signOut();
  show("Signed out.");
});

document.getElementById("btn-whoami").addEventListener("click", async () => {
  show(await whoAmI());
});

document.getElementById("btn-create").addEventListener("click", async () => {
  const status = await whoAmI();
  if (!status.signedIn) return show("Not signed in. Click Sign in first.");

  const text = (msg.value || "").trim();
  if (!text) return show("Enter a message first.");

  const { data, errors } = await client.models.Ping.create({
    message: text,
    createdAt: new Date().toISOString(),
  });

  if (errors?.length) return show({ errors });
  msg.value = "";
  show({ created: data });
});

document.getElementById("btn-list").addEventListener("click", async () => {
  const status = await whoAmI();
  if (!status.signedIn) return show("Not signed in. Click Sign in first.");

  const { data, errors } = await client.models.Ping.list();
  if (errors?.length) return show({ errors });

  show({ count: data.length, data });
});

show(await whoAmI());
