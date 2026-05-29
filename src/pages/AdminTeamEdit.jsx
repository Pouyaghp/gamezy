import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BASE_TEAMS } from "../data/teams.js";
import { useAuth } from "../lib/auth.jsx";
import { supabaseEnabled } from "../lib/supabase.js";
import { fetchLiveTeams, upsertTeams, deleteTeamByKey, fetchLiveGames } from "../lib/db.js";
import { GAMES as BASE_GAMES_RT } from "../data/games.js";
import { PLATFORMS } from "../data/platforms.js";

const LS = "gamezy_teams_v1";
const SS_AUTH = "gamezy_admin_auth";
const inp = { width: "100%", padding: "11px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 14 };
const lab = { color: "#cbb8e4", fontSize: 13, marginBottom: 6, display: "block" };
const box = { background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 22, marginBottom: 18 };

function slugify(s) { return String(s || "").toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function loadLocal() { try { const v = localStorage.getItem(LS); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {} return JSON.parse(JSON.stringify(BASE_TEAMS)); }
function emptyTeam() { return { key: "", name: "", country: "", city: "", founded: new Date().getFullYear(), website: "", logo: "", blurb: "", about: "", league: "", platforms: ["pc"], rank: "", games: [], c: ["#5e2a8c", "#e7a72b"] }; }

export default function AdminTeamEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const liveMode = supabaseEnabled && user && isAdmin;
  const localAuthed = (typeof sessionStorage !== "undefined") && sessionStorage.getItem(SS_AUTH) === "1";
  const authed = liveMode || localAuthed;

  const [list, setList] = useState([]);
  const [t, setT] = useState(null);
  const [origKey, setOrigKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [allGames, setAllGames] = useState(BASE_GAMES_RT);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    (async () => {
      let items;
      if (liveMode) { const live = await fetchLiveTeams(); items = live && live.length ? live : loadLocal(); const lg = await fetchLiveGames(); if (lg && lg.length) setAllGames(lg); }
      else items = loadLocal();
      setList(items);
      if (slug) {
        const found = items.find((x) => x.key === slug);
        if (!found) { showToast("Not found"); navigate("/admin"); return; }
        setT({ ...found, games: found.games || [], platforms: found.platforms || ["pc"] });
        setOrigKey(found.key);
      } else setT(emptyTeam());
      setLoading(false);
    })();
  }, [slug, liveMode, navigate]);

  const set = (k, v) => setT((x) => ({ ...x, [k]: v }));
  const togglePlatform = (k) => set("platforms", t.platforms.includes(k) ? t.platforms.filter((p) => p !== k) : [...t.platforms, k]);
  const toggleGame = (s) => set("games", t.games.includes(s) ? t.games.filter((g) => g !== s) : [...t.games, s]);

  const onSave = async () => {
    if (!t) return;
    setSaving(true);
    try {
      const clean = { ...t, key: slugify(t.key || t.name), founded: parseInt(t.founded) || null };
      if (!clean.c || clean.c.length !== 2) clean.c = ["#5e2a8c", "#e7a72b"];
      const next = origKey ? list.map((x) => (x.key === origKey ? clean : x)) : [...list, clean];
      localStorage.setItem(LS, JSON.stringify(next));
      if (liveMode) {
        await upsertTeams(next);
        if (origKey && origKey !== clean.key) await deleteTeamByKey(origKey);
        showToast("Saved live ✓");
      } else showToast("Saved locally.");
      setTimeout(() => navigate("/admin"), 500);
    } catch (e) { showToast("Error: " + e.message); }
    finally { setSaving(false); }
  };
  const onDelete = async () => {
    if (!t || !confirm("Delete \"" + t.name + "\"?")) return;
    const next = list.filter((x) => x.key !== origKey);
    localStorage.setItem(LS, JSON.stringify(next));
    if (liveMode) { try { await deleteTeamByKey(origKey); } catch (e) {} }
    showToast("Deleted."); setTimeout(() => navigate("/admin"), 400);
  };

  if (!authed) return <div style={{ paddingTop: 130, textAlign: "center" }} className="muted"><Link to="/admin" style={{ color: "#f6c558" }}>Sign in to admin →</Link></div>;
  if (loading || !t) return <div style={{ paddingTop: 130, textAlign: "center" }} className="muted">Loading…</div>;

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80 }}>
      <div className="wrap" style={{ maxWidth: 980 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <Link to="/admin" className="muted" style={{ fontSize: 14 }}>&larr; Back</Link>
          <h1 className="gold-text" style={{ fontSize: 24, fontWeight: 800, flex: 1, margin: 0 }}>{origKey ? "Edit · " + (t.name || "Untitled") : "New team"}</h1>
          {origKey && <button className="btn btn-sm" style={{ background: "#7a1c1c", color: "#fff" }} onClick={onDelete}>Delete</button>}
          <button className="btn btn-sm btn-purple" onClick={() => navigate("/admin")}>Cancel</button>
          <button className="btn btn-sm btn-gold" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>

        <div style={box}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Team details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lab}>Name</label><input style={inp} value={t.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label style={lab}>Key (URL slug)</label><input style={inp} value={t.key} onChange={(e) => set("key", e.target.value)} /></div>
            <div><label style={lab}>City</label><input style={inp} value={t.city || ""} onChange={(e) => set("city", e.target.value)} /></div>
            <div><label style={lab}>Country</label><input style={inp} value={t.country || ""} onChange={(e) => set("country", e.target.value)} /></div>
            <div><label style={lab}>Founded</label><input style={inp} type="number" value={t.founded || ""} onChange={(e) => set("founded", e.target.value)} /></div>
            <div><label style={lab}>Website</label><input style={inp} value={t.website || ""} onChange={(e) => set("website", e.target.value)} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={lab}>Logo URL</label><input style={inp} value={t.logo || ""} onChange={(e) => set("logo", e.target.value)} /></div>
            <div><label style={lab}>Colour 1</label><input style={{ ...inp, height: 44, padding: 4 }} type="color" value={t.c[0]} onChange={(e) => set("c", [e.target.value, t.c[1]])} /></div>
            <div><label style={lab}>Colour 2</label><input style={{ ...inp, height: 44, padding: 4 }} type="color" value={t.c[1]} onChange={(e) => set("c", [t.c[0], e.target.value])} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={lab}>Short blurb</label><input style={inp} value={t.blurb || ""} onChange={(e) => set("blurb", e.target.value)} /></div>
            <div style={{ gridColumn: "span 2" }}><label style={lab}>About (longer)</label><textarea style={{ ...inp, minHeight: 110 }} value={t.about || ""} onChange={(e) => set("about", e.target.value)} /></div>
          </div>
        </div>

        <div style={box}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Competition</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lab}>League</label><input style={inp} value={t.league || ""} onChange={(e) => set("league", e.target.value)} placeholder="e.g. LCS, LEC, BLAST…" /></div>
            <div><label style={lab}>Current rank / standing</label><input style={inp} value={t.rank || ""} onChange={(e) => set("rank", e.target.value)} placeholder="e.g. #1 NA · LEC champion" /></div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={lab}>Platforms</label>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "6px 0" }}>
                {PLATFORMS.map((p) => (
                  <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbb8e4", fontSize: 14 }}>
                    <input type="checkbox" checked={t.platforms.includes(p.key)} onChange={() => togglePlatform(p.key)} />{p.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={box}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Games they compete in</h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Tick every game in your library that this team competes in.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 6 }}>
            {allGames.map((g) => (
              <label key={g.slug} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: t.games.includes(g.slug) ? "rgba(231,167,43,.12)" : "rgba(0,0,0,.2)", borderRadius: 6, fontSize: 13, cursor: "pointer", border: "1px solid " + (t.games.includes(g.slug) ? "rgba(231,167,43,.4)" : "rgba(255,255,255,.05)") }}>
                <input type="checkbox" checked={t.games.includes(g.slug)} onChange={() => toggleGame(g.slug)} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 30, right: 30, background: "rgba(231,167,43,.95)", color: "#1a0e2e", padding: "12px 18px", borderRadius: 10, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,.4)", zIndex: 9999 }}>{toast}</div>}
    </div>
  );
}
