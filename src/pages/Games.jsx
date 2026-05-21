import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GameCard from "../components/GameCard.jsx";
import Logo from "../components/Logo.jsx";
import { ISearch } from "../components/Icons.jsx";
import { PageHero } from "../components/blocks.jsx";
import { GAMES } from "../data/games.js";
import { CATEGORIES, catName } from "../data/categories.js";
import { PLATFORMS, platName } from "../data/platforms.js";

export default function Games() {
  const [sp] = useSearchParams();
  const qParam = sp.get("q") || "";
  const catParam = sp.get("cat") || "all";
  const platParam = sp.get("plat") || "all";

  const [q, setQ] = useState(qParam);
  const [cat, setCat] = useState(catParam);
  const [plat, setPlat] = useState(platParam);
  const [sort, setSort] = useState("rating");

  useEffect(() => { setQ(qParam); setCat(catParam); setPlat(platParam); }, [qParam, catParam, platParam]);

  let list = GAMES.filter((g) => {
    if (cat !== "all" && g.cat !== cat) return false;
    if (plat !== "all" && !g.plat.includes(plat)) return false;
    if (q) {
      const t = q.toLowerCase();
      const hay = (g.title + " " + g.dev + " " + g.tags.join(" ") + " " + catName(g.cat)).toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });
  list = [...list].sort((a, b) =>
    sort === "rating" ? b.rating - a.rating : sort === "year" ? b.year - a.year : a.title.localeCompare(b.title)
  );

  const heading =
    cat !== "all" ? catName(cat) : plat !== "all" ? platName(plat) + " Games" : q ? 'Results for "' + q + '"' : "All Games";

  return (
    <>
      <PageHero eyebrow="Game library" title={heading} sub="Browse, filter, and dive into honest reviews for every title." />
      <section className="section" style={{ paddingTop: 30 }}><div className="wrap">
        <div className="toolbar">
          <div className="search-big"><ISearch /><input placeholder="Search by title, studio, or tag…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="select" value={plat} onChange={(e) => setPlat(e.target.value)}>
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.short}</option>)}
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Sort: Top rated</option>
            <option value="year">Sort: Newest</option>
            <option value="az">Sort: A–Z</option>
          </select>
        </div>
        <div className="chips" style={{ marginBottom: 28 }}>
          <button className={"chip" + (cat === "all" ? " active" : "")} onClick={() => setCat("all")}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={"chip" + (cat === c.key ? " active" : "")} onClick={() => setCat(c.key)}>{c.name}</button>
          ))}
        </div>
        <div className="muted" style={{ marginBottom: 18, fontSize: 14 }}>{list.length} game{list.length !== 1 ? "s" : ""} found</div>
        {list.length ? (
          <div className="grid grid-games">{list.map((g) => <GameCard key={g.id} game={g} />)}</div>
        ) : (
          <div className="empty">
            <div className="logo"><Logo size={80} /></div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>No games match that</h3>
            <p>Try a different search or clear your filters.</p>
            <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={() => { setQ(""); setCat("all"); setPlat("all"); }}>Clear filters</button>
          </div>
        )}
      </div></section>
    </>
  );
}
