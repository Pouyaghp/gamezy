import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_GAMES } from "../data/games.js";
import { BASE_CATEGORIES } from "../data/categories.js";
import { BASE_COMPANIES } from "../data/companies.js";
import { BASE_TEAMS } from "../data/teams.js";
import { useAuth } from "../lib/auth.jsx";
import { supabaseEnabled } from "../lib/supabase.js";
import AuthModal from "../components/AuthModal.jsx";
import {
  fetchLiveGames, fetchLiveCategories, fetchLiveCompanies, fetchLiveTeams,
  upsertGames, deleteGameById, upsertCategories, deleteCategoryByKey,
  upsertCompanies, deleteCompanyByKey, upsertTeams, deleteTeamByKey,
} from "../lib/db.js";

const ADMIN_PASSWORD = "gamezy2026";
const LS_GAMES = "gamezy_games_v1";
const LS_CATS  = "gamezy_categories_v1";
const SS_AUTH  = "gamezy_admin_auth";

function loadLocalGames() {
  try { const v = localStorage.getItem(LS_GAMES); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {}
  return JSON.parse(JSON.stringify(BASE_GAMES));
}
function loadLocalCats() {
  try { const v = localStorage.getItem(LS_CATS); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {}
  return JSON.parse(JSON.stringify(BASE_CATEGORIES));
}
function saveLocalGames(g) { localStorage.setItem(LS_GAMES, JSON.stringify(g)); }
function saveLocalCats(c)  { localStorage.setItem(LS_CATS,  JSON.stringify(c)); }
function loadLocalCompanies() { try { const v = localStorage.getItem("gamezy_companies_v1"); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {} return JSON.parse(JSON.stringify(BASE_COMPANIES)); }
function loadLocalTeams() { try { const v = localStorage.getItem("gamezy_teams_v1"); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {} return JSON.parse(JSON.stringify(BASE_TEAMS)); }
function saveLocalCompanies(x) { localStorage.setItem("gamezy_companies_v1", JSON.stringify(x)); }
function saveLocalTeams(x) { localStorage.setItem("gamezy_teams_v1", JSON.stringify(x)); }
function slugify(s) { return String(s || "").toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function exportGamesJs(games) {
  const body = games.map((g) => "  " + JSON.stringify(g)).join(",\n");
  return `export const BASE_GAMES = [
${body}
];
let _runtime = BASE_GAMES;
try { if (typeof localStorage !== "undefined") { const v = localStorage.getItem("gamezy_games_v1"); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) _runtime = p; } } } catch (e) {}
export const GAMES = _runtime;
export const gameBySlug = (s) => GAMES.find((g) => g.slug === s);
`;
}
function exportCatsJs(cats) {
  const body = cats.map((c) => "  " + JSON.stringify(c)).join(",\n");
  return `export const BASE_CATEGORIES = [
${body}
];
let _rt = BASE_CATEGORIES;
try { if (typeof localStorage !== "undefined") { const v = localStorage.getItem("gamezy_categories_v1"); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) _rt = p; } } } catch (e) {}
export const CATEGORIES = _rt;
export const catName = (k) => (CATEGORIES.find((c) => c.key === k) || {}).name || k;
export const catShort = (k) => { const c = CATEGORIES.find((x) => x.key === k); return (c && c.short) || ({ action: "Action", shooter: "Shooter", rpg: "RPG", sports: "Sports", horror: "Horror", indie: "Indie" }[k]) || k; };
`;
}
function downloadText(name, text) {
  const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function LoginGate({ onAuth, openSupabaseAuth }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = (e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) { sessionStorage.setItem(SS_AUTH, "1"); onAuth(); } else { setErr("Wrong password."); setPw(""); } };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={submit} style={{ background: "rgba(28,22,40,.85)", border: "1px solid rgba(231,167,43,.3)", borderRadius: 14, padding: 28, maxWidth: 400, width: "100%" }}>
        <h1 className="gold-text" style={{ fontSize: 26, marginBottom: 6 }}>GameZy Admin</h1>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>{supabaseEnabled ? <>Sign in with your GameZy admin account for live edits.</> : <>Enter the admin password to continue.</>}</p>
        {supabaseEnabled && (<>
          <button type="button" className="btn btn-purple" onClick={openSupabaseAuth} style={{ width: "100%", marginBottom: 10 }}>Sign in with my GameZy account</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            <span className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>or local password</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          </div>
        </>)}
        <input type="password" placeholder="Local admin password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.35)", color: "#fff", fontSize: 16 }} />
        {err && <div style={{ color: "#ff6b6b", marginTop: 10, fontSize: 13 }}>{err}</div>}
        <button className="btn btn-gold" type="submit" style={{ marginTop: 14, width: "100%" }}>Use local password</button>
        <div style={{ marginTop: 16, textAlign: "center" }}><Link to="/" className="muted" style={{ fontSize: 13 }}>&larr; Back to site</Link></div>
      </form>
    </div>
  );
}

function CategoryEditor({ cats, onSet, games }) {
  const [editing, setEditing] = useState(null);
  const isNew = editing && !cats.find((c) => c.key === editing.__origKey);
  const startNew = () => setEditing({ key: "", name: "", blurb: "", c: ["#5e2a8c", "#e7a72b"] });
  const save = () => {
    const key = slugify(editing.key || editing.name);
    const e = { ...editing, key }; delete e.__origKey;
    const next = isNew ? [...cats, e] : cats.map((c) => (c.key === editing.__origKey ? e : c));
    onSet(next); setEditing(null);
  };
  const remove = (key) => {
    const inUse = games.filter((g) => g.cat === key).length;
    if (inUse > 0) { alert(inUse + " game(s) still use this category. Reassign them first."); return; }
    if (!confirm("Delete category \"" + key + "\"?")) return;
    onSet(cats.filter((c) => c.key !== key), key);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h3 className="gold-text" style={{ fontSize: 20 }}>Categories</h3>
        <button className="btn btn-sm btn-gold" onClick={startNew} style={{ marginLeft: "auto" }}>+ New category</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {cats.map((c) => {
          const count = games.filter((g) => g.cat === c.key).length;
          return (
            <div key={c.key} style={{ background: "rgba(20,15,30,.8)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg," + c.c[0] + "," + c.c[1] + ")" }} />
                <b style={{ flex: 1 }}>{c.name}</b>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>key: {c.key} · {count} game(s)</div>
              <p className="muted" style={{ fontSize: 12, marginTop: 6, marginBottom: 8 }}>{c.blurb}</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-sm btn-purple" onClick={() => setEditing({ ...c, __origKey: c.key })}>Edit</button>
                <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff" }} onClick={() => remove(c.key)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <div style={{ background: "rgba(20,15,30,.9)", border: "1px solid rgba(231,167,43,.25)", borderRadius: 14, padding: 20, marginTop: 16 }}>
          <h4 className="gold-text" style={{ fontSize: 18, marginBottom: 12 }}>{isNew ? "New category" : "Edit category"}</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <label className="muted" style={{ fontSize: 13 }}>Name<input style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
            <label className="muted" style={{ fontSize: 13 }}>Key (URL slug)<input style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }} value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} /></label>
            <label className="muted" style={{ fontSize: 13 }}>Short label<input style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }} value={editing.short || ""} onChange={(e) => setEditing({ ...editing, short: e.target.value })} /></label>
            <label className="muted" style={{ fontSize: 13 }}>Blurb<textarea style={{ width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff", minHeight: 70 }} value={editing.blurb} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} /></label>
            <div style={{ display: "flex", gap: 12 }}>
              <label className="muted" style={{ fontSize: 13, flex: 1 }}>Colour 1<input type="color" style={{ width: "100%", height: 40, marginTop: 4, padding: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)" }} value={editing.c[0]} onChange={(e) => setEditing({ ...editing, c: [e.target.value, editing.c[1]] })} /></label>
              <label className="muted" style={{ fontSize: 13, flex: 1 }}>Colour 2<input type="color" style={{ width: "100%", height: 40, marginTop: 4, padding: 4, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)" }} value={editing.c[1]} onChange={(e) => setEditing({ ...editing, c: [editing.c[0], e.target.value] })} /></label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn btn-gold" onClick={save}>Save</button>
              <button className="btn btn-purple" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [localAuthed, setLocalAuthed] = useState(() => sessionStorage.getItem(SS_AUTH) === "1");
  const [authOpen, setAuthOpen] = useState(false);
  const liveMode = supabaseEnabled && user && isAdmin;
  const authed = liveMode || localAuthed;
  const navigate = useNavigate();

  const [tab, setTab] = useState("games");
  const [games, setGames] = useState([]);
  const [cats, setCats] = useState([]);
  const [comps, setComps] = useState([]);
  const [teams, setTeams] = useState([]);
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [toast, setToast] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState(false);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  useEffect(() => {
    if (!authed) return;
    (async () => {
      if (liveMode) {
        setSyncing(true);
        const liveG = await fetchLiveGames(); const liveC = await fetchLiveCategories();
        const liveCo = await fetchLiveCompanies(); const liveT = await fetchLiveTeams();
        setGames(liveG && liveG.length ? liveG : loadLocalGames());
        setCats(liveC && liveC.length ? liveC : loadLocalCats());
        setComps(liveCo && liveCo.length ? liveCo : loadLocalCompanies());
        setTeams(liveT && liveT.length ? liveT : loadLocalTeams());
        setSyncing(false);
      } else { setGames(loadLocalGames()); setCats(loadLocalCats()); setComps(loadLocalCompanies()); setTeams(loadLocalTeams()); }
    })();
  }, [authed, liveMode]);

  const pushGames = async (next) => {
    saveLocalGames(next); setGames(next);
    if (liveMode) { try { await upsertGames(next); showToast("Saved live ✓"); } catch (e) { showToast("DB error: " + e.message); } }
    else showToast("Saved locally.");
  };
  const pushCats = async (next, removedKey) => {
    saveLocalCats(next); setCats(next);
    if (liveMode) {
      try { await upsertCategories(next); if (removedKey) await deleteCategoryByKey(removedKey); showToast("Saved live ✓"); }
      catch (e) { showToast("DB error: " + e.message); }
    } else showToast("Saved locally.");
  };
  const pushComps = async (next, removedKey) => {
    saveLocalCompanies(next); setComps(next);
    if (liveMode) { try { await upsertCompanies(next); if (removedKey) await deleteCompanyByKey(removedKey); showToast("Saved live ✓"); } catch (e) { showToast("DB error: " + e.message); } }
    else showToast("Saved locally.");
  };
  const pushTeams = async (next, removedKey) => {
    saveLocalTeams(next); setTeams(next);
    if (liveMode) { try { await upsertTeams(next); if (removedKey) await deleteTeamByKey(removedKey); showToast("Saved live ✓"); } catch (e) { showToast("DB error: " + e.message); } }
    else showToast("Saved locally.");
  };
  const onDeleteCompany = async (key) => {
    if (!confirm("Delete this studio?")) return;
    await pushComps(comps.filter((c) => c.key !== key), key);
  };
  const onDeleteTeam = async (key) => {
    if (!confirm("Delete this team?")) return;
    await pushTeams(teams.filter((t) => t.key !== key), key);
  };
  const onDeleteGame = async (id) => {
    if (!confirm("Delete this game?")) return;
    const next = games.filter((g) => g.id !== id);
    saveLocalGames(next); setGames(next);
    if (liveMode) { try { await deleteGameById(id); showToast("Deleted ✓"); } catch (e) { showToast("DB error: " + e.message); } }
    else showToast("Deleted locally.");
  };
  const move = async (id, dir) => {
    const i = games.findIndex((g) => g.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= games.length) return;
    const next = games.slice(); [next[i], next[j]] = [next[j], next[i]]; await pushGames(next);
  };
  const importDefaults = async () => {
    if (!confirm("Import all " + BASE_GAMES.length + " default games and " + BASE_CATEGORIES.length + " categories?")) return;
    setBusy(true);
    try {
      const baseG = JSON.parse(JSON.stringify(BASE_GAMES));
      const baseC = JSON.parse(JSON.stringify(BASE_CATEGORIES));
      baseG.forEach((g) => { if (!g.poster) g.poster = g.image || ""; if (!g.media) g.media = []; if (!g.videos) g.videos = []; if (!g.trailer) g.trailer = null; });
      const baseCo = JSON.parse(JSON.stringify(BASE_COMPANIES));
      const baseT = JSON.parse(JSON.stringify(BASE_TEAMS));
      if (liveMode) { await upsertCategories(baseC); await upsertGames(baseG); await upsertCompanies(baseCo); await upsertTeams(baseT); }
      saveLocalGames(baseG); saveLocalCats(baseC); saveLocalCompanies(baseCo); saveLocalTeams(baseT);
      setGames(baseG); setCats(baseC); setComps(baseCo); setTeams(baseT);
      showToast("Imported defaults ✓");
    } catch (e) { showToast("Import failed: " + e.message); }
    finally { setBusy(false); }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return games.filter((g) => {
      if (filterCat && g.cat !== filterCat) return false;
      if (!s) return true;
      return g.title.toLowerCase().includes(s) || g.slug.toLowerCase().includes(s) || g.dev.toLowerCase().includes(s) || (g.tags || []).join(" ").toLowerCase().includes(s);
    });
  }, [games, q, filterCat]);

  const exportGames = () => downloadText("games.js", exportGamesJs(games));
  const exportCats = () => downloadText("categories.js", exportCatsJs(cats));
  const resetAll = () => {
    if (!confirm("Reset local edits to defaults?")) return;
    localStorage.removeItem(LS_GAMES); localStorage.removeItem(LS_CATS);
    setGames(JSON.parse(JSON.stringify(BASE_GAMES))); setCats(JSON.parse(JSON.stringify(BASE_CATEGORIES)));
    showToast("Reset.");
  };
  const localLogout = () => { sessionStorage.removeItem(SS_AUTH); setLocalAuthed(false); };

  if (!authed) {
    return (<>
      <LoginGate onAuth={() => setLocalAuthed(true)} openSupabaseAuth={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>);
  }
  if (supabaseEnabled && user && !isAdmin && !localAuthed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "rgba(28,22,40,.85)", border: "1px solid rgba(231,167,43,.3)", borderRadius: 14, padding: 28, maxWidth: 460, textAlign: "center" }}>
          <h2 className="gold-text" style={{ fontSize: 22, marginBottom: 8 }}>Not an admin</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>Your account ({user.email}) isn't flagged as a GameZy admin.</p>
          <code style={{ display: "block", padding: 10, background: "rgba(0,0,0,.4)", borderRadius: 6, fontSize: 12, marginBottom: 16, wordBreak: "break-all" }}>{user.id}</code>
          <Link to="/" className="btn btn-purple btn-sm">Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80 }}>
      <div className="wrap">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <h1 className="gold-text" style={{ fontSize: 30, fontWeight: 800 }}>Admin</h1>
          <span className="muted" style={{ fontSize: 14 }}>
            {liveMode ? "Live mode — changes go to everyone" : "Local mode — changes stay in your browser"}
            {" · "}{games.length} games · {cats.length} categories{syncing ? " · syncing…" : ""}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-sm btn-gold" onClick={importDefaults} disabled={busy}>Import default library</button>
            <button className="btn btn-sm btn-purple" onClick={exportGames}>Export games.js</button>
            <button className="btn btn-sm btn-purple" onClick={exportCats}>Export categories.js</button>
            <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff" }} onClick={resetAll}>Reset local</button>
            {localAuthed && !liveMode && <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.08)", color: "#fff" }} onClick={localLogout}>Sign out</button>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          {["games", "categories", "companies", "teams", "help"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "10px 16px", background: "transparent", color: tab === t ? "#f6c558" : "#cbb8e4", border: "none", borderBottom: tab === t ? "2px solid #f6c558" : "2px solid transparent", fontSize: 15, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {tab === "games" && (<>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <input placeholder="Search games…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: "1 1 240px", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }} />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }}>
              <option value="">All categories</option>
              {cats.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
            </select>
            <button className="btn btn-gold" onClick={() => navigate("/admin/new")}>+ Add game</button>
          </div>

          <div style={{ background: "rgba(20,15,30,.6)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 130px 90px 200px", padding: "10px 14px", background: "rgba(0,0,0,.3)", fontSize: 12, color: "#cbb8e4", textTransform: "uppercase", letterSpacing: 0.5 }}>
              <div></div><div>Title</div><div>Category</div><div>Platforms</div><div>Rating</div><div style={{ textAlign: "right" }}>Actions</div>
            </div>
            {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center" }} className="muted">No games match.</div>}
            {filtered.map((g) => {
              const cat = cats.find((c) => c.key === g.cat);
              const poster = g.poster || g.image || (Array.isArray(g.images) && g.images[0]) || "";
              return (
                <div key={g.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 130px 90px 200px", padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,.05)", alignItems: "center", fontSize: 14, gap: 10 }}>
                  <div style={{ width: 44, height: 60, borderRadius: 4, overflow: "hidden", background: "linear-gradient(135deg," + g.c[0] + "," + g.c[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,.5)" }}>
                    {poster ? <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "—"}
                  </div>
                  <div><b>{g.title}</b><div className="muted" style={{ fontSize: 12 }}>{g.slug} · {g.dev} · {g.year}</div></div>
                  <div className="muted" style={{ fontSize: 13 }}>{cat ? cat.name : g.cat}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{(g.plat || []).join(", ")}</div>
                  <div>★ {parseFloat(g.rating).toFixed(1)}</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.08)", color: "#fff", padding: "4px 8px" }} onClick={() => move(g.id, -1)}>↑</button>
                    <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.08)", color: "#fff", padding: "4px 8px" }} onClick={() => move(g.id, 1)}>↓</button>
                    <button className="btn btn-sm btn-purple" onClick={() => navigate("/admin/edit/" + g.slug)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff", padding: "4px 8px" }} onClick={() => onDeleteGame(g.id)}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {tab === "categories" && <CategoryEditor cats={cats} onSet={pushCats} games={games} />}

        {tab === "companies" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 className="gold-text" style={{ fontSize: 20 }}>Studios ({comps.length})</h3>
              <button className="btn btn-gold" onClick={() => navigate("/admin/companies/new")}>+ Add studio</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {comps.map((c) => (
                <div key={c.key} style={{ background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg," + (c.c?.[0]||"#5e2a8c") + "," + (c.c?.[1]||"#e7a72b") + ")" }} />
                    <b style={{ flex: 1 }}>{c.name}</b>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{c.country}{c.founded ? " · " + c.founded : ""}</div>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{c.blurb}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-sm btn-purple" onClick={() => navigate("/admin/companies/edit/" + c.key)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff" }} onClick={() => onDeleteCompany(c.key)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 className="gold-text" style={{ fontSize: 20 }}>Esports teams ({teams.length})</h3>
              <button className="btn btn-gold" onClick={() => navigate("/admin/teams/new")}>+ Add team</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {teams.map((t) => (
                <div key={t.key} style={{ background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg," + (t.c?.[0]||"#5e2a8c") + "," + (t.c?.[1]||"#e7a72b") + ")" }} />
                    <b style={{ flex: 1 }}>{t.name}</b>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{[t.city, t.country].filter(Boolean).join(", ")}{t.league ? " · " + t.league : ""}</div>
                  <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{t.blurb}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-sm btn-purple" onClick={() => navigate("/admin/teams/edit/" + t.key)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff" }} onClick={() => onDeleteTeam(t.key)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "help" && (
          <div style={{ background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 22, lineHeight: 1.7 }}>
            <h3 className="gold-text" style={{ fontSize: 20, marginBottom: 10 }}>How edits go live</h3>
            <p className="muted" style={{ fontSize: 14 }}>{liveMode ? <>You're signed in as an <b>admin</b>. Saves push to the database — visitors see them immediately.</> : <>You're in <b>local mode</b>. Sign in with an admin GameZy account for live edits.</>}</p>
            <h3 className="gold-text" style={{ fontSize: 20, marginTop: 22, marginBottom: 10 }}>Editing a game</h3>
            <p className="muted" style={{ fontSize: 14 }}>Click <b>Edit</b> on any game (or <b>+ Add game</b>) to open the editor on a separate page with sections for <b>Poster</b>, <b>Media gallery</b>, <b>Official trailer</b>, and <b>Other videos</b>.</p>
            <h3 className="gold-text" style={{ fontSize: 20, marginTop: 22, marginBottom: 10 }}>Video URLs supported</h3>
            <p className="muted" style={{ fontSize: 14 }}>YouTube, Twitch VODs (twitch.tv/videos/123), and Twitch channels (twitch.tv/yourchannel — embeds the live stream when they're broadcasting).</p>
          </div>
        )}

        {toast && <div style={{ position: "fixed", bottom: 30, right: 30, background: "rgba(231,167,43,.95)", color: "#1a0e2e", padding: "12px 18px", borderRadius: 10, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,.4)", zIndex: 9999 }}>{toast}</div>}
      </div>
    </div>
  );
}
