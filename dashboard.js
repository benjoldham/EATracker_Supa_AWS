// FC26 Transfer Tracker — Dashboard (Supabase-backed)
//
// This replaces localStorage multi-save with Supabase tables:
// - saves
// - players

import { supabase, requireSession } from "./supabaseClient.js";

document.getElementById("btn-signout")?.addEventListener("click", async () => {
  const ok = confirm("Sign out?");
  if (!ok) return;

  await supabase.auth.signOut();
  location.href = "./login.html";
});


function uid(){ return crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(16).slice(2) + Date.now().toString(16)); }
function asInt(v,fallback=0){ const n=Number(v); return Number.isFinite(n) ? Math.trunc(n) : fallback; }

function fmtDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return ""; }
}

function fmtMoneyAbbrevGBP(amountGBP){
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


async function requireLoginOrRedirect(){
  const session = await requireSession();
  if(!session){
    location.href = "./login.html";
    throw new Error("Not signed in");
  }
  return session;
}

function setEmpty(isEmpty){
  if (!emptyEl) return;
  emptyEl.style.display = isEmpty ? "" : "none";
}

function render(saves, statsBySaveId){
  rowsEl.innerHTML = "";
  setEmpty(!saves.length);

  for (const s of saves){
    const stat = statsBySaveId.get(s.id) || { count: 0, profit: 0 };
    const tr = document.createElement("tr");
    tr.dataset.id = s.id;
    tr.innerHTML = `
      <td>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <strong>${escapeHtml(s.name || "Untitled save")}</strong>
          <span class="subtle">${escapeHtml(s.id)}</span>
        </div>
      </td>
      <td>${fmtDate(s.created_at)}</td>
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

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

async function fetchSaves(){
  const { data, error } = await supabase
    .from("saves")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchPlayerStats(){
  // Pull minimal columns and aggregate client-side for speed + simplicity.
  const { data, error } = await supabase
    .from("players")
    .select("save_id,cost_gbp,sale_gbp");

  if (error) throw error;

  const map = new Map();
  for (const r of (data || [])){
    const id = r.save_id;
    if (!map.has(id)) map.set(id, { count: 0, profit: 0 });
    const s = map.get(id);
    s.count += 1;
    s.profit += asInt(r.sale_gbp,0) - asInt(r.cost_gbp,0);
  }
  return map;
}

async function refresh(){
  const saves = await fetchSaves();
  const stats = await fetchPlayerStats();
  render(saves, stats);
}

btnAdd?.addEventListener("click", async ()=>{
  try{
    await requireLoginOrRedirect();
    const name = prompt("Career save name:", "New Career Save");
    if (!name) return;

    const { data, error } = await supabase
      .from("saves")
      .insert({ id: uid(), name: name.trim() })
      .select("*")
      .single();

    if (error) throw error;
    location.href = `./tracker.html?save=${encodeURIComponent(data.id)}`;
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
});

rowsEl?.addEventListener("click", async (e)=>{
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = tr.dataset.id;

  const openBtn = e.target.closest("button[data-open]");
  const editBtn = e.target.closest("button[data-edit]");
  const delBtn  = e.target.closest("button[data-del]");

  try{
    await requireLoginOrRedirect();

    if (openBtn){
      location.href = `./tracker.html?save=${encodeURIComponent(id)}`;
      return;
    }

    if (editBtn){
      const currentName = tr.querySelector("strong")?.textContent || "";
      const next = prompt("Rename career save:", currentName);
      if (!next) return;

      const { error } = await supabase
        .from("saves")
        .update({ name: next.trim() })
        .eq("id", id);

      if (error) throw error;
      await refresh();
      return;
    }

    if (delBtn){
      if (!confirm("Delete this career save and all its players? This cannot be undone.")) return;

      // Delete players first (FK safety if you add constraints later)
      let r = await supabase.from("players").delete().eq("save_id", id);
      if (r.error) throw r.error;

      r = await supabase.from("saves").delete().eq("id", id);
      if (r.error) throw r.error;

      await refresh();
      return;
    }
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
});

(async function boot(){
  try{
    await requireLoginOrRedirect();
    await refresh();
  }catch(err){
    alert(err?.message || String(err));
    console.error(err);
  }
})();
