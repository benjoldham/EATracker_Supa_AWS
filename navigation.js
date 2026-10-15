// Render before page listeners attach; the existing session check reveals the nav.
export function renderAppNavigation({ currentPage } = {}) {
  const navigation = document.querySelector(".app-nav");
  navigation.innerHTML = `
    <div class="container">
      <span class="app-nav-brand">FC Tracker</span>
      <div class="actions app-nav-actions">
        <a id="back-to-dashboard" class="btn btn-secondary" href="./index.html"
           aria-label="Dashboard" title="Dashboard"${currentPage === "dashboard" ? ' aria-current="page"' : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </a>
        <button id="btn-signout" class="btn btn-secondary" type="button">Sign out</button>
      </div>
    </div>
  `;
  return navigation;
}

export function showAppLoadingError() {
  if (!document.querySelector(".app-nav")?.hidden) return;
  const status = document.querySelector(".app-loading-status");
  status.setAttribute("role", "alert");
  status.textContent =
    "Unable to load your session. Please refresh to try again.";
}
