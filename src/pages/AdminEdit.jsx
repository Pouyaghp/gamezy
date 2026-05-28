import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BASE_GAMES } from "../data/games.js";
import { BASE_CATEGORIES } from "../data/categories.js";
import { PLATFORMS } from "../data/platforms.js";
import { useAuth } from "../lib/auth.jsx";
import { supabaseEnabled } from "../lib/supabase.js";
import {
  fetchLiveGames, fetchLiveCategories,
  upsertGames, deleteGameById,
  uploadGameImage, deleteGameImage,
} from "../lib/db.js";

const LS_GAMES = "gamezy_games_v1";
const LS_CATS  = "gamezy_categories_v1";
const SS_AUTH  = "gamezy_admin_auth";

const VIDEO_LABELS = ["Gameplay", "Reaction", "Review", "Walkthrough", "Speedrun", "Cinematic", "Other"];

function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function detectVideo(url) {
  if (!url) return null;
  const u = url.trim();
  let m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  if (m) return { kind: "youtube", id: m[1], url: u };
  m = u.match(/twitch\.tv\/videos\/(\d+)/);
  if (m) return { kind: "twitch-vod", id: m[1], url: u };
  m = u.match(/twitch\.tv\/(?!videos)([A-Za-z0-9_]+)(?:\/|$)/);
  if (m) return { kind: "twitch-live", id: m[1], url: u };
  return null;
}

function videoBadgeColor(kind) {
  if (kind === "youtube") return "#cc0000";
  if (kind === "twitch-live") return "#9146FF";
  return "#5c2c8c";
}
function videoBadgeLabel(kind) {
  if (kind === "youtube") return "YouTube";
  if (kind === "twitch-live") return "Twitch Live";
  return "Twitch VOD";
}

/* Normalise a game object so the editor handles both legacy + new shape */
function normalise(g) {
  const out = JSON.parse(JSON.stringify(g));
  if (!out.poster) out.poster = out.image || (Array.isArray(out.images) && out.images[0]) || "";
  if (!Array.isArray(out.media)) {
    if (Array.isArray(out.images) && out.images.length) {
      out.media = out.poster ? out.images.filter((u) => u !== out.poster) : out.images.slice();
    } else out.media = [];
  }
  if (!out.trailer || typeof out.trailer !== "object") out.trailer = null;
  if (!Array.isArray(out.videos)) out.videos = [];
  // Ensure each video has a label
  out.videos = out.videos.map((v) => ({ label: "Gameplay", ...v })).filter((v) => v.kind && v.id);
  if (!Array.isArray(out.features)) out.features = [];
  if (!Array.isArray(out.tags)) out.tags = [];
  if (!Array.isArray(out.plat) || !out.plat.length) out.plat = ["pc"];
  if (!Array.isArray(out.c) || out.c.length !== 2) out.c = ["#5e2a8c", "#e7a72b"];
  return out;
}

function emptyGame() {
  const id = Date.now();
  return normalise({
    id, slug: "new-game-" + id, title: "New Game",
    cat: "action", plat: ["pc"], year: new Date().getFullYear(),
    dev: "Studio", rating: 4.0, c: ["#5e2a8c", "#e7a72b"],
    tagline: "", summary: "", about: "", features: [], tags: [], reviews: [],
    poster: "", media: [], trailer: null, videos: [],
  });
}

function loadLocalGames() {
  try { const v = localStorage.getItem(LS_GAMES); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {}
  return JSON.parse(JSON.stringify(BASE_GAMES));
}
function loadLocalCats() {
  try { const v = localStorage.getItem(LS_CATS); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) return p; } } catch (e) {}
  return JSON.parse(JSON.stringify(BASE_CATEGORIES));
}

/* Shared UI bits */
const inp = { width: "100%", padding: "11px 13px", borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 14 };
const lab = { color: "#cbb8e4", fontSize: 13, marginBottom: 6, display: "block" };
const sectionBox = { background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 22, marginBottom: 18 };

function Field({ label, children, span = 1 }) {
  return (
    <div style={{ gridColumn: "span " + span }}>
      <label style={lab}>{label}</label>
      {children}
    </div>
  );
}

/* ============ POSTER PICKER ============ */
function PosterPicker({ poster, onChange, slug, canUpload }) {
  const [uploading, setUploading] = useState(false);
  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const url = await uploadGameImage(file, slug || "poster"); onChange(url); }
    catch (err) { alert("Upload failed: " + err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
      <div style={{ width: 200, aspectRatio: "3 / 4", borderRadius: 10, overflow: "hidden", border: "2px solid rgba(231,167,43,.5)", background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbb8e4", fontSize: 13, textAlign: "center", padding: 12 }}>
        {poster ? <img src={poster} alt="Poster" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>No poster yet</span>}
      </div>
      <div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>The poster is the main cover image used on cards and the game page header.</p>
        {canUpload && (
          <label className="btn btn-purple btn-sm" style={{ marginRight: 8, cursor: "pointer", display: "inline-block" }}>
            <input type="file" accept="image/*" onChange={onPick} disabled={uploading} style={{ display: "none" }} />
            {uploading ? "Uploading…" : "Upload poster"}
          </label>
        )}
        {poster && (
          <button className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff" }} onClick={() => onChange("")}>Remove poster</button>
        )}
        <div style={{ marginTop: 12 }}>
          <label style={lab}>Or paste image URL</label>
          <input style={inp} placeholder="https://… or /images/games/your-slug.jpg" value={poster || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ============ MEDIA GALLERY EDITOR ============ */
function MediaPicker({ media, onChange, slug, canUpload }) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const u = await uploadGameImage(file, slug || "media"); onChange([...(media || []), u]); }
    catch (err) { alert("Upload failed: " + err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };
  const addUrl = () => { if (url.trim()) { onChange([...(media || []), url.trim()]); setUrl(""); } };
  const remove = async (u) => { onChange((media || []).filter((x) => x !== u)); if (canUpload) { try { await deleteGameImage(u); } catch (e) {} } };
  const reorder = (i, dir) => {
    const j = i + dir;
    if (i < 0 || j < 0 || j >= media.length) return;
    const next = media.slice(); [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  return (
    <div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Additional posters &amp; screenshots shown in the Media gallery on the game page.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
        {(media || []).map((u, i) => (
          <div key={u} style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
            <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: 5, display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <button onClick={() => reorder(i, -1)} title="Move left" style={{ background: "rgba(0,0,0,.7)", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "1px 6px" }}>‹</button>
              <button onClick={() => reorder(i, 1)} title="Move right" style={{ background: "rgba(0,0,0,.7)", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "1px 6px" }}>›</button>
              <button onClick={() => remove(u)} title="Remove" style={{ background: "rgba(180,30,30,.85)", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "1px 6px" }}>×</button>
            </div>
          </div>
        ))}
        {canUpload && (
          <label style={{ aspectRatio: "16 / 9", borderRadius: 8, border: "2px dashed rgba(231,167,43,.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#cbb8e4", fontSize: 12, textAlign: "center", padding: 6 }}>
            <input type="file" accept="image/*" onChange={onPick} disabled={uploading} style={{ display: "none" }} />
            {uploading ? "Uploading…" : <><span style={{ fontSize: 22 }}>+</span><br />Upload</>}
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Or paste image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn btn-purple btn-sm" onClick={addUrl}>+ Add URL</button>
      </div>
    </div>
  );
}

/* ============ TRAILER PICKER ============ */
function TrailerPicker({ trailer, onChange }) {
  const [url, setUrl] = useState(trailer?.url || "");
  const [err, setErr] = useState("");
  const set = () => {
    setErr("");
    if (!url.trim()) { onChange(null); return; }
    const det = detectVideo(url);
    if (!det) { setErr("Couldn't recognise that URL. Paste a YouTube or Twitch URL."); return; }
    onChange(det);
  };
  const clear = () => { setUrl(""); onChange(null); };
  return (
    <div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>The official trailer is featured at the top of the game's media section.</p>
      {trailer && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, background: "rgba(0,0,0,.25)", padding: "8px 12px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: videoBadgeColor(trailer.kind), color: "#fff", fontWeight: 600 }}>{videoBadgeLabel(trailer.kind)}</span>
          <span style={{ flex: 1, fontSize: 12, color: "#cbb8e4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trailer.url}</span>
          <button onClick={clear} className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff", padding: "2px 10px" }}>Remove</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Official trailer URL (YouTube or Twitch)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn btn-purple btn-sm" onClick={set}>Save trailer</button>
      </div>
      {err && <div style={{ color: "#ff7373", fontSize: 12, marginTop: 8 }}>{err}</div>}
    </div>
  );
}

/* ============ OTHER VIDEOS PICKER ============ */
function VideosPicker({ videos, onChange }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("Gameplay");
  const [err, setErr] = useState("");
  const add = () => {
    setErr("");
    const det = detectVideo(url);
    if (!det) { setErr("Couldn't recognise that URL."); return; }
    onChange([...(videos || []), { ...det, label }]);
    setUrl("");
  };
  const remove = (i) => onChange(videos.filter((_, idx) => idx !== i));
  const changeLabel = (i, l) => onChange(videos.map((v, idx) => (idx === i ? { ...v, label: l } : v)));
  return (
    <div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Gameplay, reactions, reviews, walkthroughs — each video gets a label that appears on the game page.</p>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {(videos || []).map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(0,0,0,.25)", padding: "8px 12px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: videoBadgeColor(v.kind), color: "#fff", fontWeight: 600, minWidth: 80, textAlign: "center" }}>{videoBadgeLabel(v.kind)}</span>
            <select value={v.label || "Gameplay"} onChange={(e) => changeLabel(i, e.target.value)} style={{ ...inp, width: 130, padding: "6px 8px" }}>
              {VIDEO_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span style={{ flex: 1, fontSize: 12, color: "#cbb8e4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.url}</span>
            <button onClick={() => remove(i)} className="btn btn-sm" style={{ background: "#5a1a1a", color: "#fff", padding: "2px 10px" }}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <select value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inp, width: 130 }}>
          {VIDEO_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <input style={{ ...inp, flex: 1 }} placeholder="Video URL (YouTube / Twitch)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn btn-purple btn-sm" onClick={add}>+ Add</button>
      </div>
      {err && <div style={{ color: "#ff7373", fontSize: 12, marginTop: 8 }}>{err}</div>}
    </div>
  );
}

/* ============ MAIN ADMIN EDIT PAGE ============ */
export default function AdminEdit() {
  const { slug } = useParams(); // undefined when on /admin/new
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const liveMode = supabaseEnabled && user && isAdmin;
  const localAuthed = (typeof sessionStorage !== "undefined") && sessionStorage.getItem(SS_AUTH) === "1";
  const authed = liveMode || localAuthed;

  const [games, setGames] = useState([]);
  const [cats, setCats] = useState([]);
  const [g, setG] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let gms, cs;
      if (liveMode) {
        const lg = await fetchLiveGames();
        const lc = await fetchLiveCategories();
        gms = lg && lg.length ? lg : loadLocalGames();
        cs = lc && lc.length ? lc : loadLocalCats();
      } else {
        gms = loadLocalGames(); cs = loadLocalCats();
      }
      if (cancelled) return;
      setGames(gms); setCats(cs);
      if (slug) {
        const found = gms.find((x) => x.slug === slug);
        if (!found) { showToast("Game not found."); navigate("/admin"); return; }
        setG(normalise(found));
      } else {
        setG(emptyGame());
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, liveMode, navigate]);

  const set = (k, v) => setG((x) => ({ ...x, [k]: v }));

  const onSave = async () => {
    if (!g) return;
    setSaving(true);
    try {
      const clean = { ...g };
      clean.slug = slugify(g.slug || g.title);
      clean.rating = Math.max(0, Math.min(5, parseFloat(g.rating) || 0));
      clean.year = parseInt(g.year) || new Date().getFullYear();
      clean.features = (g.features || []).filter((x) => x && x.trim());
      clean.tags = (g.tags || []).filter((x) => x && x.trim());
      clean.plat = g.plat && g.plat.length ? g.plat : ["pc"];
      if (!clean.poster && clean.media && clean.media.length) clean.poster = clean.media[0];
      clean.image = clean.poster; // keep legacy field in sync for card fallback
      // Build new games array
      const exists = games.find((x) => x.id === clean.id);
      const next = exists ? games.map((x) => (x.id === clean.id ? clean : x)) : [...games, clean];
      localStorage.setItem(LS_GAMES, JSON.stringify(next));
      if (liveMode) {
        await upsertGames(next);
        showToast("Saved live ✓");
      } else {
        showToast("Saved locally.");
      }
      setTimeout(() => navigate("/admin"), 600);
    } catch (e) { showToast("Error: " + e.message); }
    finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!g || !confirm("Delete \"" + g.title + "\"? This cannot be undone.")) return;
    const next = games.filter((x) => x.id !== g.id);
    localStorage.setItem(LS_GAMES, JSON.stringify(next));
    if (liveMode) {
      try { await deleteGameById(g.id); } catch (e) {}
      // Best-effort clean uploaded media
      if (g.poster) { try { await deleteGameImage(g.poster); } catch (e) {} }
      (g.media || []).forEach((u) => { try { deleteGameImage(u); } catch (e) {} });
    }
    showToast("Deleted.");
    setTimeout(() => navigate("/admin"), 500);
  };

  if (!authed) {
    return (
      <div style={{ paddingTop: 130, paddingBottom: 80, textAlign: "center" }}>
        <p className="muted">You need to sign in. <Link to="/admin" style={{ color: "#f6c558" }}>Go to admin login →</Link></p>
      </div>
    );
  }
  if (loading || !g) {
    return <div style={{ paddingTop: 130, textAlign: "center" }} className="muted">Loading…</div>;
  }

  const setPlat = (key) => set("plat", g.plat.includes(key) ? g.plat.filter((p) => p !== key) : [...g.plat, key]);

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80 }}>
      <div className="wrap" style={{ maxWidth: 1080 }}>
        {/* sticky header */}
        <div style={{ position: "sticky", top: 80, zIndex: 5, background: "rgba(12,11,16,.92)", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link to="/admin" className="muted" style={{ fontSize: 14 }}>&larr; Back to games</Link>
          <h1 className="gold-text" style={{ fontSize: 24, fontWeight: 800, flex: 1, margin: 0 }}>{slug ? "Edit · " + (g.title || "Untitled") : "New game"}</h1>
          {liveMode ? (
            <span style={{ background: "rgba(122,205,122,.15)", color: "#7ee787", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>Live mode</span>
          ) : (
            <span style={{ background: "rgba(231,167,43,.15)", color: "#f6c558", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>Local mode</span>
          )}
          {slug && <button className="btn btn-sm" style={{ background: "#7a1c1c", color: "#fff" }} onClick={onDelete}>Delete</button>}
          <button className="btn btn-sm btn-purple" onClick={() => navigate("/admin")}>Cancel</button>
          <button className="btn btn-sm btn-gold" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>

        {/* ============== BASICS ============== */}
        <div style={sectionBox}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Basics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            <Field label="Title" span={2}><input style={inp} value={g.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Slug (URL)"><input style={inp} value={g.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Category">
              <select style={inp} value={g.cat} onChange={(e) => set("cat", e.target.value)}>
                {cats.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Developer"><input style={inp} value={g.dev} onChange={(e) => set("dev", e.target.value)} /></Field>
            <Field label="Year"><input style={inp} type="number" value={g.year} onChange={(e) => set("year", e.target.value)} /></Field>
            <Field label="Rating (0-5)"><input style={inp} type="number" step="0.1" min="0" max="5" value={g.rating} onChange={(e) => set("rating", e.target.value)} /></Field>
            <Field label="Platforms">
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "10px 0" }}>
                {PLATFORMS.map((p) => (
                  <label key={p.key} style={{ display: "flex", alignItems: "center", gap: 6, color: "#cbb8e4", fontSize: 14 }}>
                    <input type="checkbox" checked={g.plat.includes(p.key)} onChange={() => setPlat(p.key)} />{p.name}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Colour 1"><input style={{ ...inp, height: 44, padding: 4 }} type="color" value={g.c[0]} onChange={(e) => set("c", [e.target.value, g.c[1]])} /></Field>
            <Field label="Colour 2"><input style={{ ...inp, height: 44, padding: 4 }} type="color" value={g.c[1]} onChange={(e) => set("c", [g.c[0], e.target.value])} /></Field>
            <Field label="Tagline" span={2}><input style={inp} value={g.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <Field label="Short summary" span={2}><textarea style={{ ...inp, minHeight: 70 }} value={g.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
            <Field label="About (long description)" span={2}><textarea style={{ ...inp, minHeight: 120 }} value={g.about} onChange={(e) => set("about", e.target.value)} /></Field>
            <Field label="Key features (one per line)" span={2}><textarea style={{ ...inp, minHeight: 90 }} value={(g.features || []).join("\n")} onChange={(e) => set("features", e.target.value.split("\n"))} /></Field>
            <Field label="Tags (comma separated)" span={2}><input style={inp} value={(g.tags || []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((x) => x.trim()))} /></Field>
          </div>
        </div>

        {/* ============== POSTER ============== */}
        <div style={sectionBox}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Poster</h2>
          <PosterPicker poster={g.poster} onChange={(u) => set("poster", u)} slug={g.slug} canUpload={liveMode} />
        </div>

        {/* ============== MEDIA ============== */}
        <div style={sectionBox}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Media gallery</h2>
          <MediaPicker media={g.media} onChange={(arr) => set("media", arr)} slug={g.slug} canUpload={liveMode} />
        </div>

        {/* ============== TRAILER ============== */}
        <div style={sectionBox}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Official trailer</h2>
          <TrailerPicker trailer={g.trailer} onChange={(t) => set("trailer", t)} />
        </div>

        {/* ============== OTHER VIDEOS ============== */}
        <div style={sectionBox}>
          <h2 className="gold-text" style={{ fontSize: 18, marginBottom: 14 }}>Other videos &amp; live streams</h2>
          <VideosPicker videos={g.videos} onChange={(arr) => set("videos", arr)} />
        </div>

        {/* footer save bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button className="btn btn-purple" onClick={() => navigate("/admin")}>Cancel</button>
          <button className="btn btn-gold" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>

        {toast && <div style={{ position: "fixed", bottom: 30, right: 30, background: "rgba(231,167,43,.95)", color: "#1a0e2e", padding: "12px 18px", borderRadius: 10, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,.4)", zIndex: 9999 }}>{toast}</div>}
      </div>
    </div>
  );
}
