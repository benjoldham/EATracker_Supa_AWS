// FC26 Transfer Tracker — Dashboard (AWS Amplify Gen 2-backed)
//
// This replaces Supabase tables with Amplify Data models:
// - CareerSave
// - Player

import * as aws from "./awsClient.js";

document.getElementById("btn-signout")?.addEventListener("click", async () => {
  const ok = confirm("Sign out?");
  if (!ok) return;

  await aws.awsSignOut?.();
  location.href = "./login.html";
});

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2) + Date.now().toString(16);
}
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

async function requireLoginOrRedirect() {
  const session = await aws.getSession?.();
  if (!session?.signedIn) {
    location.href = "./login.html";
    throw new Error("Not signed in");
  }
  return session;
}

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
  // Support multiple possible field names depending on your schema.
  return s.createdAt || s.created_at || s.created || s.createdOn || "";
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
          <strong>${escapeHtml((s.name || s.title) || "Untitled save")}</strong>
          <span class="subtle">${escapeHtml(s.id)}</span>
        </div>
      </td>
      <td>${fmtDate(getSaveCreatedIso(s))}</td>
      <td class="num">${stat.count}</td>
      <td class="num">${fmtMoneyAbbrevGBP(stat.profit)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-secondary" data-open>Open</button>
        <button class="btn btn-secondary" data-edit>Edit</button>
        <button class="btn btn-danger" data-del>Delete</button>
      </td>
    `;
    rowsEl.appendChild(tr);
  }
}

async function fetchSaves() {
  // Expect: aws.listSaves() -> array of CareerSave records with at least {id,name,createdAt?}
  const saves = await aws.listSaves?.();
  return Array.isArray(saves) ? saves : [];
}

function getPlayerSaveId(p) {
  // Support multiple possible field names depending on your schema.
  return p.saveId || p.save_id || p.save || "";
}

function getProfitGBP(p) {
  // Your existing app uses cost_gbp / sale_gbp. Support alternates too.
  const cost = asInt(p.cost_gbp ?? p.costGBP ?? p.cost ?? 0, 0);
  const sale = asInt(p.sale_gbp ?? p.saleGBP ?? p.sale ?? 0, 0);
  return sale - cost;
}

async function fetchPlayerStats() {
  // Pull minimal fields and aggregate client-side.
  // We will list players per save by listing ALL players, if your awsClient supports it.
  // Best is: listPlayers(saveId) per save; but for dashboard stats we just fetch all players once.
  // If your awsClient does not expose listAllPlayers, we compute stats by fetching per-save below.
  const map = new Map();

  // Strategy:
  // 1) load saves
  // 2) for each save, list players and compute stats
  const saves = await fetchSaves();
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
  const stats = await fetchPlayerStats();
  // Sort newest first if your awsClient does not already do it
  saves.sort((a, b) => String(getSaveCreatedIso(b)).localeCompare(String(getSaveCreatedIso(a))));
  render(saves, stats);
}

btnAdd?.addEventListener("click", async () => {
  try {
    await requireLoginOrRedirect();
    const name = prompt("Career save name:", "New Career Save");
    if (!name) return;

    // Expect: aws.createSave(name) returns created save with id
    const created = await aws.createSave?.(name.trim());
    const id = created?.id || uid();

    location.href = `./tracker.html?save=${encodeURIComponent(id)}`;
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
  const editBtn = e.target.closest("button[data-edit]");
  const delBtn = e.target.closest("button[data-del]");

  try {
    await requireLoginOrRedirect();

    if (openBtn) {
      location.href = `./tracker.html?save=${encodeURIComponent(id)}`;
      return;
    }

    if (editBtn) {
      const currentName = tr.querySelector("strong")?.textContent || "";
      const next = prompt("Rename career save:", currentName);
      if (!next) return;

      // Prefer a dedicated helper if you created it in awsClient.js.
      if (aws.updateSaveName) {
        await aws.updateSaveName(id, next.trim());
      } else if (aws.updateSave) {
        await aws.updateSave({ id, name: next.trim() });
      } else {
        throw new Error("Missing awsClient function: updateSaveName(saveId, name) or updateSave({id,name})");
      }

      await refresh();
      return;
    }

    if (delBtn) {
      if (!confirm("Delete this career save and all its players? This cannot be undone.")) return;

      // Delete players first, then save (mirrors your existing behaviour)
      const list = await aws.listPlayers?.(id);
      const players = Array.isArray(list) ? list : [];
      for (const p of players) {
        if (aws.deletePlayer) await aws.deletePlayer(p.id);
      }

      if (aws.deleteSave) await aws.deleteSave(id);
      else throw new Error("Missing awsClient function: deleteSave(saveId)");

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
