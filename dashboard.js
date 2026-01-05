import * as aws from "./awsClient.js";

document.getElementById("btn-signout")?.addEventListener("click", async () => {
  const ok = confirm("Sign out?");
  if (!ok) return;
  await aws.awsSignOut?.();
  location.href = "./login.html";
});

function asInt(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

function fmtMoneyAbbrevGBP(amountGBP) {
  const sym = "£";
  const n = Number(amountGBP) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const format = (val, suffix) => {
    const absVal = Math.abs(val);
    let str;
    if (absVal >= 10) str = String(Math.round(val));
    else str = String(Math.round(val * 10) / 10).replace(/\.0$/, "");
    return sign + sym + str + suffix;
  };
  if (abs >= 1_000_000_000) return format(abs / 1_000_000_000, "B");
  if (abs >= 1_000_000) return format(abs / 1_000_000, "M");
  if (abs >= 1_000) return format(abs / 1_000, "K");
  return sign + sym + String(Math.round(abs));
}

const btnAdd = document.getElementById("btn-add-save");
const rowsEl = document.getElementById("save-rows");
const emptyEl = document.getElementById("empty-state");

function setEmpty(isEmpty) {
  if (!emptyEl) return;
  emptyEl.style.display = isEmpty ? "" : "none";
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[m]));
}

function getSaveCreatedIso(s) {
  return s.createdAt || s.created_at || s.created || "";
}

function getProfitGBP(p) {
  const cost = asInt(p.cost_gbp ?? p.costGBP ?? p.cost ?? 0, 0);
  const sale = asInt(p.sale_gbp ?? p.saleGBP ?? p.sale ?? 0, 0);
  return sale - cost;
}

function render(saves, statsBySaveId) {
  rowsEl.innerHTML = "";
  setEmpty(!saves.length);

  for (const s of saves) {
    const stat = statsBySaveId.get(s.id) || { count: 0, profit: 0 };
    const tr = document.createElement("tr");
    tr.dataset.id = s.id;

    tr.innerHTML = `
      <td>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <strong>${escapeHtml(s.name || s.title || "Untitled save")}</strong>
          <span class="subtle">${escapeHtml(s.id)}</span>
        </div>
      </td>
      <td>${fmtDate(getSaveCreatedIso(s))}</td>
      <td class="num">${stat.count}</td>
      <td class="num">${fmtMoneyAbbrevGBP(stat.profit)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-secondary" data-open>Open</button>
        <button class="btn btn-danger" data-del>Delete</button>
      </td>
    `;
    rowsEl.appendChild(tr);
  }
}

async function requireLoginOrRedirect() {
  const s = await aws.getSession?.();
  if (!s?.signedIn) {
    location.href = "./login.html";
    throw new Error("Not signed in");
  }
  return s;
}

async function fetchSaves() {
  return await aws.listSaves?.();
}

async function fetchPlayerStats(saves) {
  const map = new Map();

  for (const s of saves) {
    const list = await aws.listPlayers?.(s.id);
    const players = Array.isArray(list) ? list : [];
    let count = 0;
    let profit = 0;
    for (const p of players) {
      count += 1;
      profit += getProfitGBP(p);
    }
    map.set(s.id, { count, profit });
  }

  return map;
}

async function refresh() {
  const saves = await fetchSaves();
  const stats = await fetchPlayerStats(saves);
  saves.sort((a, b) => String(getSaveCreatedIso(b)).localeCompare(String(getSaveCreatedIso(a))));
  render(saves, stats);
}

btnAdd?.addEventListener("click", async () => {
  try {
    await requireLoginOrRedirect();
    const name = prompt("Career save name:", "New Career Save");
    if (!name) return;

    const created = await aws.createSave?.(name.trim());
    location.href = `./tracker.html?save=${encodeURIComponent(created.id)}`;
  } catch (err) {
    alert(err?.message || String(err));
    console.error(err);
  }
});

rowsEl?.addEventListener("click", async (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  const openBtn = e.target.closest("button[data-open]");
  const delBtn = e.target.closest("button[data-del]");

  try {
    await requireLoginOrRedirect();

    if (openBtn) {
      location.href = `./tracker.html?save=${encodeURIComponent(id)}`;
      return;
    }

    if (delBtn) {
      if (!confirm("Delete this career save and all its players? This cannot be undone.")) return;

      const list = await aws.listPlayers?.(id);
      const players = Array.isArray(list) ? list : [];
      for (const p of players) {
        await aws.deletePlayer?.(p.id);
      }

      await aws.deleteSave?.(id);
      await refresh();
      return;
    }
  } catch (err) {
    alert(err?.message || String(err));
    console.error(err);
  }
});

(async function boot() {
  try {
    await requireLoginOrRedirect();
    await refresh();
  } catch (err) {
    alert(err?.message || String(err));
    console.error(err);
  }
})();
