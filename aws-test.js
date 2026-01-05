import { Amplify } from "https://esm.sh/aws-amplify@6";
import {
  signIn,
  confirmSignIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "https://esm.sh/aws-amplify@6/auth";
import { generateClient } from "https://esm.sh/aws-amplify@6/data";

const out = document.getElementById("out");
const msg = document.getElementById("msg");

const emailEl = document.getElementById("email");
const codeEl = document.getElementById("code");

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

    document.getElementById("btn-send").addEventListener("click", async () => {
      const email = (emailEl.value || "").trim();
      if (!email) return show("Enter your email first.");

      // Force the passwordless Email OTP flow.
      // This requires Email OTP enabled in the Cognito user pool/app client.
      const res = await signIn({
        username: email,
        options: {
          authFlowType: "USER_AUTH",
          preferredChallenge: "EMAIL_OTP",
        },
      });

      // Expected next step when Email OTP is enabled:
      // CONFIRM_SIGN_IN_WITH_EMAIL_CODE
      show({ signIn: "started", nextStep: res.nextStep });
    });

    document.getElementById("btn-confirm").addEventListener("click", async () => {
      const code = (codeEl.value || "").trim();
      if (!code) return show("Enter the code from your email.");

      const res = await confirmSignIn({ challengeResponse: code });
      show({ confirm: "done", nextStep: res.nextStep, who: await whoAmI() });
    });

    document.getElementById("btn-signout").addEventListener("click", async () => {
      await signOut();
      show("Signed out.");
    });

    document.getElementById("btn-create").addEventListener("click", async () => {
      const status = await whoAmI();
      if (!status.signedIn) return show("Not signed in. Sign in first.");

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
      if (!status.signedIn) return show("Not signed in. Sign in first.");

      const { data, errors } = await client.models.Ping.list();
      if (errors?.length) return show({ errors });

      show({ count: data.length, data });
    });

    show(await whoAmI());
  } catch (err) {
    show({ error: String(err) });
    console.error(err);
  }
})();
