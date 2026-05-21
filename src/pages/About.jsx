import { PageHero, Advantage, StatsStrip, SectionHead, CTABanner } from "../components/blocks.jsx";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Why choose GameZy? Discover our gaming advantage"
        sub="GameZy is built for gamers who want honest opinions, real experiences, and reliable reviews. We bring players together to discover new titles, compare ratings, and share insights that truly matter."
      />

      <section className="section" style={{ paddingTop: 30 }}><div className="wrap"><Advantage /></div></section>

      <section className="section section-alt"><div className="wrap"><StatsStrip /></div></section>

      <section className="section"><div className="wrap" style={{ maxWidth: 820 }}>
        <SectionHead eyebrow="Our mission" title="From Glitches to Glory" sub="" />
        <p className="muted" style={{ fontSize: 18, textAlign: "center" }}>
          GameZy brings gamers together to share real reviews, ratings, and experiences for every title across all platforms. Explore in-depth insights, discover new favourites, and see what the community truly thinks before you play — every game matters.
        </p>
      </div></section>

      <section className="section section-alt"><CTABanner /></section>
    </>
  );
}
