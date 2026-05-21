import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import Logo from "./Logo.jsx";
import { IArrow, platIcon } from "./Icons.jsx";
import { GAMES } from "../data/games.js";

export const STATS = [
  ["30+", "Titles reviewed"],
  ["6", "Categories"],
  ["3", "Platforms"],
  ["12K+", "Community gamers"],
];

export function SectionHead({ eyebrow, title, sub }) {
  return (
    <Reveal className="section-head">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, sub }) {
  return (
    <header style={{ paddingTop: 130, paddingBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 80% at 50% -10%,rgba(94,42,140,.45),transparent 60%)" }} />
      <div className="wrap" style={{ position: "relative" }}>
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,60px)", fontWeight: 800, margin: "12px auto 0", maxWidth: 840 }}>{title}</h1>
        {sub && <p className="muted" style={{ fontSize: 18, maxWidth: 640, margin: "16px auto 0" }}>{sub}</p>}
      </div>
    </header>
  );
}

export function StatsStrip() {
  return (
    <div className="stats">
      {STATS.map((s, i) => (
        <Reveal key={i} delay={i * 70}>
          <div className="num">{s[0]}</div>
          <div className="lab">{s[1]}</div>
        </Reveal>
      ))}
    </div>
  );
}

export function SeenOn() {
  const brands = ["CAPCOM", "SEGA", "ACTIVISION", "SONY", "KONAMI"];
  return (
    <div className="seen">
      <div className="wrap">
        <div className="lbl">As seen on</div>
        <div className="seen-row">{brands.map((b) => <span key={b}>{b}</span>)}</div>
      </div>
    </div>
  );
}

export function CatCard({ cat }) {
  const [c1, c2] = cat.c;
  const [err, setErr] = useState(false);
  const count = GAMES.filter((g) => g.cat === cat.key).length;
  const src = "/images/categories/" + cat.key + ".jpg";
  return (
    <Link className="catcard" to={"/games?cat=" + cat.key}>
      <div className="ctop poster-ph" style={{ background: "linear-gradient(150deg," + c1 + "," + c2 + ")" }}>
        {err ? (
          <>
            <div className="ph-glow" />
            <div className="ph-logo"><Logo size={120} /></div>
          </>
        ) : (
          <img className="ctop-img" src={src} alt={cat.name} loading="lazy" onError={() => setErr(true)} />
        )}
        <div className="ctop-shade" />
        <div className="ph-title" style={{ fontSize: 13, opacity: 0.9, zIndex: 3 }}>{count} titles</div>
      </div>
      <div className="cbody">
        <h3>{cat.name}</h3>
        <p>{cat.blurb}</p>
        <span className="clearn">Learn more <IArrow /></span>
      </div>
    </Link>
  );
}

export function PlatCard({ plat }) {
  const count = GAMES.filter((g) => g.plat.includes(plat.key)).length;
  return (
    <div className="platcard">
      <div className="picon">{platIcon(plat.key)}</div>
      <h3>{plat.name}</h3>
      <p>{plat.blurb}</p>
      <Link className="btn btn-purple" to={"/games?plat=" + plat.key}>{plat.short} Games ({count}) <IArrow /></Link>
    </div>
  );
}

export function Advantage() {
  const items = [
    ["Authentic Reviews", "Every review on GameZy comes from real gamers, not paid promotions. Get genuine opinions that help you decide what's worth your time and money."],
    ["Community Ratings", "Our rating system reflects the voice of the gaming community. See what players really think from gameplay mechanics to story and performance."],
    ["All Games, One Hub", "Explore everything from indie gems to AAA blockbusters in one place. Save favourites, browse categories, and discover your next great game with ease."],
  ];
  return (
    <div className="plat-grid">
      {items.map((it, i) => (
        <Reveal key={i} delay={i * 80} style={{ padding: "4px" }}>
          <h3 className="gold-text" style={{ fontSize: 22, marginBottom: 10 }}>{it[0]}</h3>
          <p className="muted" style={{ fontSize: 15 }}>{it[1]}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function Testimonial() {
  return (
    <Reveal className="wrap">
      <div className="quote">
        <div className="eyebrow" style={{ color: "#5e2a8c" }}>What people say</div>
        <div className="q" style={{ marginTop: 18 }}>"GameZy completely changed the way I choose what to play. The reviews are honest, the ratings are accurate, and I finally feel confident before buying any game."</div>
        <div className="who">
          <div className="av">B</div>
          <div><b>BeAlpha</b><span style={{ opacity: 0.7 }}>Gamer in Brighton</span></div>
        </div>
      </div>
    </Reveal>
  );
}

export function CTABanner() {
  const [err, setErr] = useState(false);
  return (
    <Reveal className="wrap">
      <div className="cta-banner">
        {!err && <img className="cta-bg" src="/images/scenes/community.jpg" alt="" aria-hidden="true" loading="lazy" onError={() => setErr(true)} />}
        <div className="cta-content">
          <h2>Join a community where every gamer's voice matters.</h2>
          <p>Share your thoughts, rate your favourite games, and help others discover what's worth playing.</p>
          <Link className="btn btn-gold" to="/games">Join GameZy <IArrow /></Link>
        </div>
      </div>
    </Reveal>
  );
}
