import { Link } from "react-router-dom";
import ScrollHero from "../components/ScrollHero.jsx";
import GameCard from "../components/GameCard.jsx";
import Reveal from "../components/Reveal.jsx";
import { IArrow } from "../components/Icons.jsx";
import { SectionHead, SeenOn, StatsStrip, CatCard, PlatCard, Advantage, Testimonial, CTABanner } from "../components/blocks.jsx";
import { GAMES } from "../data/games.js";
import { CATEGORIES } from "../data/categories.js";
import { PLATFORMS } from "../data/platforms.js";

export default function Home() {
  const featured = [...GAMES].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const latest = [...GAMES].filter((g) => g.year >= 2025).sort((a, b) => (b.year - a.year) || (b.rating - a.rating)).slice(0, 5);
  return (
    <>
      <ScrollHero />

      <section className="section"><div className="wrap">
        <SectionHead eyebrow="Trending now" title="Top-rated games" sub="The highest-scoring titles loved by the GameZy community right now." />
        <div className="grid grid-games">{featured.map((g) => <Reveal key={g.id}><GameCard game={g} /></Reveal>)}</div>
        <div style={{ textAlign: "center", marginTop: 38 }}><Link className="btn btn-ghost" to="/games">Browse all games <IArrow /></Link></div>
      </div></section>

      <SeenOn />

      <section className="section section-alt"><div className="wrap"><StatsStrip /></div></section>

      <section className="section"><div className="wrap">
        <SectionHead eyebrow="Fresh drops" title="Latest releases" sub="New and upcoming titles worth keeping on your radar." />
        <div className="grid grid-games">{latest.map((g) => <Reveal key={g.id}><GameCard game={g} /></Reveal>)}</div>
      </div></section>

      <section className="section section-alt"><div className="wrap">
        <SectionHead eyebrow="Quick start guide" title="Game Categories" sub="Discover games by the genres you love. Explore, review, and find your next favourite title." />
        <div className="cat-grid">{CATEGORIES.map((c) => <Reveal key={c.key}><CatCard cat={c} /></Reveal>)}</div>
      </div></section>

      <section className="section"><div className="wrap">
        <SectionHead eyebrow="Platforms" title="Play your way" sub="Discover games across all major platforms and explore reviews tailored to your device." />
        <div className="plat-grid">{PLATFORMS.map((p) => <Reveal key={p.key}><PlatCard plat={p} /></Reveal>)}</div>
      </div></section>

      <section className="section section-alt"><div className="wrap">
        <SectionHead eyebrow="About us" title="Why choose GameZy?" sub="GameZy is built for gamers who want honest opinions, real experiences, and reliable reviews." />
        <Advantage />
      </div></section>

      <section className="section"><Testimonial /></section>

      <section className="section section-alt"><CTABanner /></section>
    </>
  );
}
