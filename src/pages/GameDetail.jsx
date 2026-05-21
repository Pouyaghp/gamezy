import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import GameCard, { GamePoster } from "../components/GameCard.jsx";
import { Stars, StarPicker } from "../components/Stars.jsx";
import { ICheck, IArrow } from "../components/Icons.jsx";
import Logo from "../components/Logo.jsx";
import NotFound from "./NotFound.jsx";
import { useReviews } from "../lib/hooks.js";
import { avg, niceDate, initials } from "../lib/helpers.js";
import { GAMES, gameBySlug } from "../data/games.js";
import { catName } from "../data/categories.js";
import { platName } from "../data/platforms.js";

export default function GameDetail() {
  const { slug } = useParams();
  const game = gameBySlug(slug);

  const [userReviews, addReview] = useReviews(game ? game.id : 0);
  const [stars, setStars] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [toast, setToast] = useState(false);
  const formRef = useRef(null);

  if (!game) return <NotFound />;

  const seed = (game.reviews || []).map((r) => ({ ...r, when: niceDate(r.date), ts: new Date(r.date).getTime() }));
  const mine = userReviews.map((r) => ({ ...r, when: niceDate(r.ts) }));
  const all = [...mine, ...seed];
  const allStars = all.map((r) => r.stars);
  const community = allStars.length ? avg(allStars) : game.rating;
  const count = all.length;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: allStars.filter((x) => Math.round(x) === s).length }));
  const related = GAMES.filter((g) => g.cat === game.cat && g.id !== game.id).sort((a, b) => b.rating - a.rating).slice(0, 5);
  const shotGrads = [[game.c[0], game.c[1]], [game.c[1], game.c[0]], ["#241433", game.c[1]]];

  const submit = (e) => {
    e.preventDefault();
    if (!stars || !name.trim() || !text.trim()) return;
    addReview({ name: name.trim(), stars, text: text.trim() });
    setStars(0); setName(""); setText("");
    setToast(true); setTimeout(() => setToast(false), 2400);
  };

  return (
    <>
      <section className="detail-hero">
        <div className="dh-bg" style={{ background: "linear-gradient(150deg," + game.c[0] + "," + game.c[1] + ")" }} />
        <div className="wrap">
          <div className="crumb">
            <Link to="/">Home</Link> / <Link to="/games">Games</Link> / <Link to={"/games?cat=" + game.cat}>{catName(game.cat)}</Link> / <span style={{ color: "var(--text)" }}>{game.title}</span>
          </div>
          <div className="detail-grid">
            <div className="detail-poster"><GamePoster game={game} showTitle={false} /></div>
            <div className="detail-info">
              <span className="pbadge" style={{ position: "static", display: "inline-block", marginBottom: 12 }}>{catName(game.cat)}</span>
              <h1>{game.title}</h1>
              <p className="muted" style={{ fontSize: 19, fontStyle: "italic" }}>{game.tagline}</p>
              <div className="detail-tags">{game.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <div className="rating-big">
                <span className="score">{community.toFixed(1)}</span>
                <div><Stars value={community} size={22} /><div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{count} community rating{count !== 1 ? "s" : ""}</div></div>
              </div>
              <p style={{ fontSize: 17 }}>{game.summary}</p>
              <div className="metalist">
                <div className="mi"><div className="mk">Developer</div><div className="mv">{game.dev}</div></div>
                <div className="mi"><div className="mk">Release</div><div className="mv">{game.year}</div></div>
                <div className="mi"><div className="mk">Category</div><div className="mv">{catName(game.cat)}</div></div>
                <div className="mi"><div className="mk">Platforms</div><div className="mv">{game.plat.map(platName).join(" • ")}</div></div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-gold" onClick={() => formRef.current && formRef.current.scrollIntoView({ behavior: "smooth", block: "center" })}>Write a review <IArrow /></button>
                <Link className="btn btn-ghost" to="/games">Back to library</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}><div className="wrap">
        <div className="detail-section">
          <h2>About this game</h2>
          <p style={{ fontSize: 17, maxWidth: 820 }}>{game.about}</p>
        </div>

        <div className="detail-section">
          <h2>Key features</h2>
          <ul className="feature-list">{game.features.map((f, i) => <li key={i}><ICheck /><span>{f}</span></li>)}</ul>
        </div>

        <div className="detail-section">
          <h2>Screenshots</h2>
          <div className="shots">{shotGrads.map((g, i) => (
            <div className="shot" key={i}>
              <div className="poster-ph" style={{ background: "linear-gradient(140deg," + g[0] + "," + g[1] + ")" }}>
                <div className="ph-glow" /><div className="ph-logo" style={{ opacity: 0.2, width: "32%" }}><Logo size={80} /></div>
              </div>
            </div>
          ))}</div>
          <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Placeholder art — drop your own screenshots in by setting an <code>image</code> on the game.</p>
        </div>

        <div className="detail-section">
          <h2>Community reviews</h2>
          <div className="review-summary">
            <div className="big"><div className="n">{community.toFixed(1)}</div><Stars value={community} size={18} /><div className="c">{count} review{count !== 1 ? "s" : ""}</div></div>
            <div className="bars">{dist.map((d) => {
              const pct = count ? (d.n / count) * 100 : 0;
              return (
                <div className="barrow" key={d.s}>
                  <span style={{ width: 28 }}>{d.s} ★</span>
                  <div className="track"><div className="fill" style={{ width: pct + "%" }} /></div>
                  <span style={{ width: 24, textAlign: "right" }}>{d.n}</span>
                </div>
              );
            })}</div>
          </div>

          <form className="review-form" ref={formRef} onSubmit={submit}>
            <h3>Rate &amp; review {game.title}</h3>
            <div className="field"><label>Your rating</label><StarPicker value={stars} onChange={setStars} /></div>
            <div className="field"><label>Display name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ShadowGamer" maxLength={32} /></div>
            <div className="field"><label>Your review</label><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you love (or not)? Help other gamers decide…" maxLength={600} /></div>
            <button className="btn btn-gold" type="submit">Post review</button>
            <span className="muted" style={{ fontSize: 13, marginLeft: 14 }}>Saved in your browser.</span>
          </form>

          <div className="review-list">
            {all.map((r, i) => (
              <div className="review-item" key={r.id || ("seed" + i)}>
                <div className="rhead">
                  <div className="avatar">{initials(r.name)}</div>
                  <div><div className="rname">{r.name}</div><div className="rdate">{r.when}</div></div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>{r.mine && <span className="mine">You</span>}<Stars value={r.stars} size={15} /></div>
                </div>
                <p className="muted" style={{ color: "var(--muted)", fontSize: 15 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h2>More {catName(game.cat)}</h2>
          <div className="grid grid-games">{related.map((g) => <GameCard key={g.id} game={g} />)}</div>
        </div>
      </div></section>

      {toast && <div className="toast">Review posted — thanks! ★</div>}
    </>
  );
}
