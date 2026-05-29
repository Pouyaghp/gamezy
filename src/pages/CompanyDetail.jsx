import { useParams, Link } from "react-router-dom";
import { PageHero } from "../components/blocks.jsx";
import GameCard from "../components/GameCard.jsx";
import { COMPANIES, companyByKey } from "../data/companies.js";
import { GAMES } from "../data/games.js";
import NotFound from "./NotFound.jsx";

export default function CompanyDetail() {
  const { slug } = useParams();
  const comp = companyByKey(slug);
  if (!comp) return <NotFound />;
  const games = GAMES.filter((g) => g.company === comp.key || g.dev === comp.name);
  const [c1, c2] = comp.c || ["#5e2a8c", "#e7a72b"];

  return (
    <>
      <header style={{ paddingTop: 130, paddingBottom: 30, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg," + c1 + "44, transparent 60%)" }} />
        <div className="wrap" style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(180px,220px) 1fr", gap: 30, alignItems: "center" }}>
          <div style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 18, background: "linear-gradient(135deg," + c1 + "," + c2 + ")", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid rgba(255,255,255,.1)" }}>
            {comp.logo ? <img src={comp.logo} alt={comp.name} style={{ width: "85%", height: "85%", objectFit: "contain" }} /> : <b style={{ fontSize: 38, color: "rgba(255,255,255,.85)" }}>{comp.name[0]}</b>}
          </div>
          <div>
            <div className="crumb"><Link to="/">Home</Link> / <Link to="/companies">Studios</Link> / <span style={{ color: "var(--text)" }}>{comp.name}</span></div>
            <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, margin: "10px 0" }}>{comp.name}</h1>
            <p className="muted" style={{ fontSize: 18, marginBottom: 12 }}>{comp.blurb}</p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 14 }}>
              {comp.country && <span><b className="gold-text">Country</b> · {comp.country}</span>}
              {comp.founded && <span><b className="gold-text">Founded</b> · {comp.founded}</span>}
              {comp.website && <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: "#f6c558" }}>{comp.website.replace(/^https?:\/\//, "")}</a>}
            </div>
          </div>
        </div>
      </header>

      <section className="section" style={{ paddingTop: 10 }}><div className="wrap">
        {comp.about && (
          <div className="detail-section">
            <h2>About {comp.name}</h2>
            <p style={{ fontSize: 17, maxWidth: 820 }}>{comp.about}</p>
          </div>
        )}
        <div className="detail-section">
          <h2>Games by {comp.name} ({games.length})</h2>
          {games.length === 0 ? (
            <p className="muted">No games linked to this studio yet.</p>
          ) : (
            <div className="grid grid-games">{games.map((g) => <GameCard key={g.id} game={g} />)}</div>
          )}
        </div>
      </div></section>
    </>
  );
}
