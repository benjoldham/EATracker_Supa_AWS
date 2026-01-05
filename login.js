import * as aws from "./awsClient.js";

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const errEl = document.getElementById("error");
const okEl = document.getElementById("ok");
const statusEl = document.getElementById("status");

function setError(msg) {
  errEl.textContent = msg || "";
  okEl.textContent = "";
}
function setOk(msg) {
  okEl.textContent = msg || "";
  errEl.textContent = "";
}
function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function getCreds() {
  const email = (emailEl.value || "").trim();
  const password = (passEl.value || "").trim();
  if (!email) throw new Error("Please enter your email.");
  if (!password || password.length < 8) throw new Error("Please enter a password (8+ characters).");
  return { email, password };
}

async function goHome() {
  location.href = "./index.html";
}

document.getElementById("btn-signin").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Signing in...");

    const { email, password } = getCreds();

    if (!aws.awsSignIn) throw new Error("Missing awsClient function: awsSignIn(email, password)");
    await aws.awsSignIn(email, password);

    setStatus("");
    setOk("Signed in.");
    await goHome();
  } catch (e) {
    setStatus("");
    setError(e?.message || String(e));
    console.error(e);
  }
});

document.getElementById("btn-signup").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Creating account...");

    const { email, password } = getCreds();

    if (!aws.awsSignUp) throw new Error("Missing awsClient function: awsSignUp(email, password)");
    const res = await aws.awsSignUp(email, password);

    // Some Cognito setups require email verification; some auto-confirm.
    // If confirmation is required, your awsClient may need to expose confirmSignUp.
    setStatus("");
    setOk("Account created. You can now sign in (or check email if verification is required).");
    console.log("signUp result:", res);
  } catch (e) {
    setStatus("");
    setError(e?.message || String(e));
    console.error(e);
  }
});

// If already signed in, skip login
(async function boot() {
  try {
    if (aws.getSession) {
      const s = await aws.getSession();
      if (s?.signedIn) {
        await goHome();
      }
    }
  } catch (e) {
    // Ignore
  }
})();
