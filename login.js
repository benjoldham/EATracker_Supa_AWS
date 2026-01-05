import * as aws from "./awsClient.js";

// We will use Amplify Auth directly for confirm/resend if your awsClient doesn't expose them.
import {
  confirmSignUp,
  resendSignUpCode,
} from "https://esm.sh/aws-amplify@6/auth";

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");

const confirmBlock = document.getElementById("confirm-block");
const confirmCodeEl = document.getElementById("confirm-code");

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

function showConfirmUI(show) {
  confirmBlock.classList.toggle("hidden", !show);
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

// Ensure Amplify is configured before calling confirm/resend directly
async function ensureConfigured() {
  if (aws.initAws) {
    await aws.initAws();
  } else if (aws.getSession) {
    // This will internally init in your awsClient if you wrote it that way
    await aws.getSession();
  }
}

document.getElementById("btn-signup").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Creating account...");

    const { email, password } = getCreds();

    if (!aws.awsSignUp) throw new Error("Missing awsClient function: awsSignUp(email, password)");
    const res = await aws.awsSignUp(email, password);

    setStatus("");

    // If Cognito requires confirmation, show code UI
    const step = res?.nextStep?.signUpStep || res?.nextStep?.step || "";
    if (String(step).includes("CONFIRM") || String(step).includes("confirm")) {
      setOk("Account created. Please confirm with the code sent to your email.");
      showConfirmUI(true);
    } else {
      // Some pools auto-confirm
      setOk("Account created. You can now sign in.");
      showConfirmUI(false);
    }

    console.log("signUp result:", res);
  } catch (e) {
    setStatus("");
    setError(e?.message || String(e));
    console.error(e);
  }
});

document.getElementById("btn-confirm").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Confirming...");

    const email = (emailEl.value || "").trim();
    const code = (confirmCodeEl.value || "").trim();
    if (!email) throw new Error("Enter your email above first.");
    if (!code) throw new Error("Enter the verification code from your email.");

    await ensureConfigured();
    await confirmSignUp({ username: email, confirmationCode: code });

    setStatus("");
    setOk("Confirmed. You can now sign in.");
    showConfirmUI(false);
  } catch (e) {
    setStatus("");
    setError(e?.message || String(e));
    console.error(e);
  }
});

document.getElementById("btn-resend").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Resending code...");

    const email = (emailEl.value || "").trim();
    if (!email) throw new Error("Enter your email above first.");

    await ensureConfigured();
    await resendSignUpCode({ username: email });

    setStatus("");
    setOk("Code resent. Check your inbox (and spam).");
  } catch (e) {
    setStatus("");
    setError(e?.message || String(e));
    console.error(e);
  }
});

document.getElementById("btn-signin").addEventListener("click", async () => {
  try {
    setError("");
    setOk("");
    setStatus("Signing in...");

    const { email, password } = getCreds();

    if (!aws.awsSignIn) throw new Error("Missing awsClient function: awsSignIn(email, password)");
    await aws.awsSignIn(email, password);

    // Verify session immediately (prevents “signed in but actually not”)
    if (!aws.getSession) throw new Error("Missing awsClient function: getSession()");
    const s = await aws.getSession();
    if (!s?.signedIn) throw new Error("Sign-in did not establish a session. If you just signed up, confirm your account first.");

    setStatus("");
    setOk("Signed in.");
    await goHome();
  } catch (e) {
    setStatus("");
    const msg = e?.message || String(e);
    setError(msg);

    // If user isn't confirmed, show confirm UI proactively
    if (msg.includes("UserNotConfirmed") || msg.includes("not confirmed")) {
      showConfirmUI(true);
    }

    console.error(e);
  }
});

// If already signed in, skip login
(async function boot() {
  try {
    if (aws.getSession) {
      const s = await aws.getSession();
      if (s?.signedIn) await goHome();
    }
  } catch {
    // ignore
  }
})();
