// Runs independently of the AWS and tracker module imports, before the page header.
(() => {
  // Presentation hint only: account data still requires the existing AWS session check.
  const sessionKey = "fc26-session-ui";
  const navigation = document.querySelector(".app-nav");
  function confirmSession() {
    try {
      sessionStorage.setItem(sessionKey, "signed-in");
    } catch {
      /* Storage is optional. */
    }
    if (navigation) navigation.hidden = false;
  }
  function clearSession() {
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      /* Storage is optional. */
    }
    if (navigation) navigation.hidden = true;
  }
  function showLoadingError() {
    if (!navigation?.hidden) return;
    const status = document.querySelector(".app-loading-status");
    status.setAttribute("role", "alert");
    status.textContent =
      "Unable to load your session. Please refresh to try again.";
  }
  window.FCTrackerNavigation = {
    confirmSession,
    clearSession,
    showLoadingError,
  };
  // Login shares the hint lifecycle, without rendering signed-in navigation.
  if (!navigation) return;
  navigation.innerHTML = `
    <div class="container">
      <span class="app-nav-brand">FC Tracker</span>
      <div class="actions app-nav-actions">
        <a id="back-to-dashboard" class="btn btn-secondary" href="./index.html"
           aria-label="Dashboard" title="Dashboard"${navigation.dataset.currentPage === "dashboard" ? ' aria-current="page"' : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </a>
        <button id="btn-signout" class="btn btn-secondary" type="button">Sign out</button>
      </div>
    </div>
  `;
  try {
    if (sessionStorage.getItem(sessionKey) === "signed-in")
      navigation.hidden = false;
  } catch {
    /* A fresh session check still reveals the page if storage is unavailable. */
  }

  document.getElementById("btn-signout").addEventListener("click", async () => {
    if (!confirm("Sign out?")) return;
    const aws = await import("./awsClient.js");
    await aws.awsSignOut?.();
    clearSession();
    location.href = "./login.html";
  });
})();
