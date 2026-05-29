import { useParams, Link } from "react-router-dom";
import GameCard from "../components/GameCard.jsx";
import { TEAMS, teamByKey } from "../data/teams.js";
import { GAMES } from "../data/games.js";
import { PLATFORMS, platName } from "../data/platforms.js";
import NotFound from "./NotFound.jsx";

export default function TeamDetail() {
  const { slug } = useParams();
  const team = teamByKey(slug);
  if (!team) return <NotFound />;
  const games = GAMES.filter((g) => (team.games || []).includes(g.slug));
  const [c1, c2] = team.c || ["#5e2a8c", "#e7a72b"];

  const stat = (label, value) => (
    <div style={{ background: "rgba(20,15,30,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 16px", minWidth: 160 }}>
      <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f6c558" }}>{value}</div>
    </div>
  );

  return (
    <>
      <header style={{ paddingTop: 130, paddingBottom: 30, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg," + c1 + "55, transparent 60%)" }} />
        <div className="wrap" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(180px,220px) 1fr", gap: 30, alignItems: "center" }}>
          <div style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 18, background: "linear-gradient(135deg," + c1 + "," + c2 + ")", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
            {team.logo ? <img src={team.logo} alt={team.name} style={{ width: "85%", height: "85%", objectFit: "contain" }} /> : <b style={{ fontSize: 38, color: "rgba(255,255,255,.85)" }}>{team.name[0]}</b>}
          </div>
          <div>
            <div className="crumb"><Link to="/">Home</Link> / <Link to="/teams">Teams</Link> / <span style={{ color: "var(--text)" }}>{team.name}</span></div>
            <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, margin: "10px 0" }}>{team.name}</h1>
            <p className="muted" style={{ fontSize: 18, marginBottom: 14 }}>{team.blurb}</p>
            {team.website && <a href={team.website} target="_blank" rel="noreferrer" style={{ color: "#f6c558", fontSize: 14 }}>{team.website.replace(/^https?:\/\//, "")}</a>}
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 10 }}><div className="wrap">
        <div className="detail-section">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(team.city || team.country) && stat("Location", [team.city, team.country].filter(Boolean).join(", "))}
            {team.founded && stat("Founded", team.founded)}
            {team.league && stat("League", team.league)}
            {team.platforms && team.platforms.length > 0 && stat("Platforms", team.platforms.map(platName).join(" • "))}
            {team.rank && stat("Current rank", team.rank)}
          </div>
        </div>
        {team.about && (
          <div className="detail-section">
            <h2>About {team.name}</h2>
            <p style={{ fontSize: 17, maxWidth: 820 }}>{team.about}</p>
          </div>
        )}
        <div className="detail-section">
          <h2>Games they compete in ({games.length})</h2>
          {games.length === 0 ? (
            <p className="muted">No games linked yet. (Admin: add game slugs to the team in <code>/admin → Teams</code>.)</p>
          ) : (
            <div className="grid grid-games">{games.map((g) => <GameCard key={g.id} game={g} />)}</div>
          )}
        </div>
      </div></section>
    </>
  );
}
