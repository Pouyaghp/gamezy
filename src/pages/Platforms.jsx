import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import GameCard from "../components/GameCard.jsx";
import { IArrow } from "../components/Icons.jsx";
import { PageHero, PlatCard } from "../components/blocks.jsx";
import { GAMES } from "../data/games.js";
import { PLATFORMS } from "../data/platforms.js";

export default function Platforms() {
  return (
    <>
      <PageHero eyebrow="Platforms" title="Discover games across all platforms" sub="Explore reviews tailored to your device — PC, console, and mobile." />

      <section className="section" style={{ paddingTop: 30 }}><div className="wrap">
        <div className="plat-grid">{PLATFORMS.map((p) => <Reveal key={p.key}><PlatCard plat={p} /></Reveal>)}</div>
      </div></section>

      {PLATFORMS.map((p, idx) => {
        const list = GAMES.filter((g) => g.plat.includes(p.key)).sort((a, b) => b.rating - a.rating).slice(0, 5);
        return (
          <section key={p.key} className={"section" + (idx % 2 === 0 ? " section-alt" : "")} style={{ paddingTop: 40 }}><div className="wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: 30 }}>Top on {p.short}</h2>
              <Link className="btn btn-ghost btn-sm" to={"/games?plat=" + p.key}>See all <IArrow /></Link>
            </div>
            <div className="grid grid-games">{list.map((g) => <GameCard key={g.id} game={g} />)}</div>
          </div></section>
        );
      })}
    </>
  );
}
