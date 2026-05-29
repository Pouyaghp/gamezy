import { Link } from "react-router-dom";
import { PageHero } from "../components/blocks.jsx";
import { TEAMS } from "../data/teams.js";
import Reveal from "../components/Reveal.jsx";
import { IArrow } from "../components/Icons.jsx";

function TeamCard({ team }) {
  const [c1, c2] = team.c || ["#5e2a8c", "#e7a72b"];
  return (
    <Link to={"/team/" + team.key} className="catcard">
      <div className="ctop poster-ph" style={{ background: "linear-gradient(150deg," + c1 + "," + c2 + ")" }}>
        {team.logo ? <img className="ctop-img" src={team.logo} alt={team.name} loading="lazy" /> : null}
        <div className="ctop-shade" />
        <div className="ph-title" style={{ fontSize: 13, opacity: 0.9, zIndex: 3 }}>{(team.games || []).length} game{(team.games || []).length !== 1 ? "s" : ""}</div>
      </div>
      <div className="cbody">
        <h3>{team.name}</h3>
        <p>{team.blurb}</p>
        <span className="clearn">{team.city ? team.city + ", " : ""}{team.country} <IArrow /></span>
      </div>
    </Link>
  );
}

export default function Teams() {
  return (
    <>
      <PageHero eyebrow="Esports" title="Pro gaming teams" sub="The squads competing at the highest level — by location, league, platform and rank." />
      <section className="section"><div className="wrap">
        <Reveal>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {TEAMS.map((t) => <TeamCard key={t.key} team={t} />)}
          </div>
        </Reveal>
      </div></section>
    </>
  );
}
