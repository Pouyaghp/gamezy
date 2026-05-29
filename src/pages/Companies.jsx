import { Link } from "react-router-dom";
import { PageHero } from "../components/blocks.jsx";
import { COMPANIES } from "../data/companies.js";
import { GAMES } from "../data/games.js";
import Reveal from "../components/Reveal.jsx";
import { IArrow } from "../components/Icons.jsx";

function CompanyCard({ comp }) {
  const count = GAMES.filter((g) => g.company === comp.key || g.dev === comp.name).length;
  const [c1, c2] = comp.c || ["#5e2a8c", "#e7a72b"];
  return (
    <Link to={"/company/" + comp.key} className="catcard">
      <div className="ctop poster-ph" style={{ background: "linear-gradient(150deg," + c1 + "," + c2 + ")" }}>
        {comp.logo ? <img className="ctop-img" src={comp.logo} alt={comp.name} loading="lazy" /> : null}
        <div className="ctop-shade" />
        <div className="ph-title" style={{ fontSize: 13, opacity: 0.9, zIndex: 3 }}>{count} game{count !== 1 ? "s" : ""}</div>
      </div>
      <div className="cbody">
        <h3>{comp.name}</h3>
        <p>{comp.blurb}</p>
        <span className="clearn">{comp.country}{comp.founded ? " · est. " + comp.founded : ""} <IArrow /></span>
      </div>
    </Link>
  );
}

export default function Companies() {
  return (
    <>
      <PageHero eyebrow="Studios" title="Game development companies" sub="From indie pioneers to global juggernauts — explore the studios behind the games." />
      <section className="section"><div className="wrap">
        <Reveal>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {COMPANIES.map((c) => <CompanyCard key={c.key} comp={c} />)}
          </div>
        </Reveal>
      </div></section>
    </>
  );
}
