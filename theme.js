(() => {
  const key = "fc26-theme";
  let theme = "dark";
  try {
    if (localStorage.getItem(key) === "light") theme = "light";
  } catch {
    // The toggle still works when browser storage is unavailable.
  }

  function apply(next) {
    theme = next === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-pressed", String(theme === "light"));
    });
  }

  apply(theme);
  document.addEventListener("DOMContentLoaded", () => {
    apply(theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        apply(theme === "dark" ? "light" : "dark");
        try { localStorage.setItem(key, theme); } catch { /* Storage is optional. */ }
      });
    });
  });
  window.addEventListener("storage", event => {
    if (event.key === key) apply(event.newValue);
  });
})();
