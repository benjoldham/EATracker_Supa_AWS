import { Amplify } from "https://esm.sh/aws-amplify@6";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "https://esm.sh/aws-amplify@6/auth";
import { generateClient } from "https://esm.sh/aws-amplify@6/data";

const out = document.getElementById("out");
const msg = document.getElementById("msg");

function show(x) {
  out.textContent = typeof x === "string" ? x : JSON.stringify(x, null, 2);
}

async function loadOutputs() {
  const res = await fetch("./amplify_outputs.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load amplify_outputs.json (${res.status})`);
  return await res.json();
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

(async function main() {
  try {
    const outputs = await loadOutputs();
    Amplify.configure(outputs);

    const client = generateClient();

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
  } catch (err) {
    show({ error: String(err), hint: "Check that amplify_outputs.json is committed and deployed." });
    console.error(err);
  }
})();
