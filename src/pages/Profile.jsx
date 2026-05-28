import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameCard from "../components/GameCard.jsx";
import { PageHero } from "../components/blocks.jsx";
import { useAuth } from "../lib/auth.jsx";
import { supabaseEnabled } from "../lib/supabase.js";
import { fetchFavouriteSlugs, updateProfile } from "../lib/db.js";
import { GAMES } from "../data/games.js";

export default function Profile() {
  const { user, profile, isAdmin, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user && supabaseEnabled) { navigate("/"); return; }
    if (profile) setUsername(profile.username || "");
    (async () => {
      if (user) setFavs(await fetchFavouriteSlugs(user.id));
    })();
  }, [user, profile, navigate]);

  if (!supabaseEnabled) {
    return (
      <>
        <PageHero eyebrow="Profile" title="Backend not configured" sub="Set up Supabase to enable user accounts." />
        <div className="wrap" style={{ paddingBottom: 80 }}>
          <p className="muted">See <code>SETUP-SUPABASE.md</code> in the project for the 5-minute setup.</p>
        </div>
      </>
    );
  }
  if (!user) return null;

  const favGames = GAMES.filter((g) => favs.includes(g.slug));

  const saveName = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await updateProfile(user.id, { username: username.trim() });
      await refreshProfile();
      setMsg("Saved.");
    } catch (e2) { setMsg("Error: " + e2.message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 2500); }
  };

  return (
    <>
      <PageHero
        eyebrow={isAdmin ? "Admin profile" : "Your profile"}
        title={profile?.username || user.email}
        sub={isAdmin ? "You're a GameZy admin." : "Manage your account and favourites."}
      />
      <section className="section"><div className="wrap" style={{ display: "grid", gridTemplateColumns: "minmax(260px,340px) 1fr", gap: 28, alignItems: "start" }}>
        <div style={{ background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 22 }}>
          <h3 className="gold-text" style={{ fontSize: 18, marginBottom: 12 }}>Account</h3>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{user.email}</div>
          <form onSubmit={saveName}>
            <label className="muted" style={{ fontSize: 13 }}>Display name
              <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={32}
                style={{ width: "100%", padding: "10px 12px", marginTop: 6, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.3)", color: "#fff" }} /></label>
            <button className="btn btn-gold btn-sm" type="submit" disabled={saving} style={{ marginTop: 12, width: "100%" }}>
              {saving ? "Saving…" : "Save"}
            </button>
            {msg && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>{msg}</div>}
          </form>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "18px 0" }} />
          {isAdmin && (
            <Link className="btn btn-purple btn-sm" to="/admin" style={{ width: "100%", textAlign: "center", marginBottom: 8 }}>Open admin panel</Link>
          )}
          <button className="btn btn-sm" onClick={() => signOut()} style={{ width: "100%", background: "rgba(255,255,255,.08)", color: "#fff" }}>Sign out</button>
        </div>

        <div>
          <h3 className="gold-text" style={{ fontSize: 22, marginBottom: 14 }}>Your favourites ({favGames.length})</h3>
          {favGames.length === 0 ? (
            <p className="muted">No favourites yet. Browse <Link to="/games" style={{ color: "#f6c558" }}>the library</Link> and tap the heart on any game.</p>
          ) : (
            <div className="grid grid-games">{favGames.map((g) => <GameCard key={g.id} game={g} />)}</div>
          )}
        </div>
      </div></section>
    </>
  );
}
