import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import GameCard, { GamePoster } from "../components/GameCard.jsx";
import { Stars, StarPicker } from "../components/Stars.jsx";
import { ICheck, IArrow } from "../components/Icons.jsx";
import Logo from "../components/Logo.jsx";
import AuthModal from "../components/AuthModal.jsx";
import NotFound from "./NotFound.jsx";
import { useReviews } from "../lib/hooks.js";
import { avg, niceDate, initials } from "../lib/helpers.js";
import { GAMES, gameBySlug } from "../data/games.js";
import { catName } from "../data/categories.js";
import { platName } from "../data/platforms.js";
import { useAuth } from "../lib/auth.jsx";
import { supabaseEnabled } from "../lib/supabase.js";
import { fetchReviews, upsertReview, deleteReview, fetchComments, addComment, deleteComment, fetchFavouriteSlugs, toggleFavourite } from "../lib/db.js";

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#ff5277" : "none"} stroke={filled ? "#ff5277" : "currentColor"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CommentBlock({ reviewId, comments, onAdd, onDelete, user, openAuth }) {
  const [text, setText] = useState("");
  const list = comments.filter((c) => c.review_id === reviewId);
  const post = (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    if (!text.trim()) return;
    onAdd(reviewId, text.trim());
    setText("");
  };
  return (
    <div style={{ marginTop: 10, marginLeft: 50, borderLeft: "2px solid rgba(255,255,255,.07)", paddingLeft: 12 }}>
      {list.map((c) => {
        const name = (c.profiles && c.profiles.username) || "Player";
        return (
          <div key={c.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <b style={{ color: "#f6c558" }}>{name}</b>
              <span className="muted" style={{ fontSize: 12 }}>{niceDate(c.created_at)}</span>
              {user && user.id === c.user_id && (
                <button onClick={() => onDelete(c.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ff7373", fontSize: 11, cursor: "pointer" }}>Delete</button>
              )}
            </div>
            <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>{c.text}</p>
          </div>
        );
      })}
      <form onSubmit={post} style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={user ? "Reply…" : "Sign in to comment"}
          style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 13 }} />
        <button type="submit" className="btn btn-sm btn-purple" style={{ padding: "4px 10px", fontSize: 12 }}>Post</button>
      </form>
    </div>
  );
}

export default function GameDetail() {
  const { slug } = useParams();
  const game = gameBySlug(slug);
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  /* legacy localStorage reviews — used only when Supabase isn't configured */
  const [localReviews, addLocalReview] = useReviews(game ? game.id : 0);

  /* DB-backed state */
  const [dbReviews, setDbReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [favs, setFavs] = useState([]);

  /* form state */
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [toast, setToast] = useState("");
  const formRef = useRef(null);

  const loadAll = useCallback(async () => {
    if (!game || !supabaseEnabled) return;
    const rs = await fetchReviews(game.slug);
    setDbReviews(rs);
    if (rs.length) {
      const cs = await fetchComments(rs.map((r) => r.id));
      setComments(cs);
    } else setComments([]);
    if (user) setFavs(await fetchFavouriteSlugs(user.id));
    else setFavs([]);
  }, [game, user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (!game) return <NotFound />;

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2400); };

  /* combine seed + db (or seed + local) */
  const seed = (game.reviews || []).map((r, i) => ({ id: "seed-" + i, name: r.name, stars: r.stars, text: r.text, when: niceDate(r.date), kind: "seed" }));
  const dbList = dbReviews.map((r) => ({ id: r.id, name: (r.profiles && r.profiles.username) || "Player", stars: r.stars, text: r.text, when: niceDate(r.created_at), kind: "db", user_id: r.user_id }));
  const localList = localReviews.map((r) => ({ id: "loc-" + r.ts, name: r.name, stars: r.stars, text: r.text, when: niceDate(r.ts), kind: "local" }));
  const all = supabaseEnabled ? [...dbList, ...seed] : [...localList, ...seed];

  const allStars = all.map((r) => r.stars);
  const community = allStars.length ? avg(allStars) : game.rating;
  const count = all.length;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: allStars.filter((x) => Math.round(x) === s).length }));
  const related = GAMES.filter((g) => g.cat === game.cat && g.id !== game.id).sort((a, b) => b.rating - a.rating).slice(0, 5);
  const shotGrads = [[game.c[0], game.c[1]], [game.c[1], game.c[0]], ["#241433", game.c[1]]];

  const isFav = favs.includes(game.slug);

  const submit = async (e) => {
    e.preventDefault();
    if (!stars || !text.trim()) return;
    if (supabaseEnabled) {
      if (!user) { setAuthOpen(true); return; }
      try {
        await upsertReview(game.slug, user.id, stars, text.trim());
        setStars(0); setText("");
        await loadAll();
        showToast("Review posted ★");
      } catch (e2) { showToast("Error: " + e2.message); }
    } else {
      addLocalReview({ name: (user && user.email) || "Player", stars, text: text.trim() });
      setStars(0); setText("");
      showToast("Review saved locally");
    }
  };
  const removeReview = async (id) => {
    if (!confirm("Delete your review?")) return;
    await deleteReview(id);
    await loadAll();
  };
  const addOrAuth = async (reviewId, t) => { await addComment(reviewId, user.id, t); await loadAll(); };
  const removeComment = async (id) => { await deleteComment(id); await loadAll(); };
  const onFav = async () => {
    if (!user) { setAuthOpen(true); return; }
    try {
      const next = await toggleFavourite(user.id, game.slug, isFav);
      setFavs((cur) => (next ? [...cur, game.slug] : cur.filter((s) => s !== game.slug)));
    } catch (e) { showToast("Error: " + e.message); }
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
                <button type="button" className="btn btn-ghost" onClick={onFav} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <HeartIcon filled={isFav} /> {isFav ? "Saved" : "Save"}
                </button>
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
            {supabaseEnabled && !user && (
              <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
                <a onClick={() => setAuthOpen(true)} style={{ color: "#f6c558", cursor: "pointer" }}>Sign in</a> to post a review that everyone will see.
              </p>
            )}
            <div className="field"><label>Your rating</label><StarPicker value={stars} onChange={setStars} /></div>
            <div className="field"><label>Your review</label><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you love (or not)? Help other gamers decide…" maxLength={600} /></div>
            <button className="btn btn-gold" type="submit">{supabaseEnabled && !user ? "Sign in to post" : "Post review"}</button>
            <span className="muted" style={{ fontSize: 13, marginLeft: 14 }}>
              {supabaseEnabled ? "Visible to everyone." : "Saved in your browser."}
            </span>
          </form>

          <div className="review-list">
            {all.map((r) => (
              <div className="review-item" key={r.id}>
                <div className="rhead">
                  <div className="avatar">{initials(r.name)}</div>
                  <div><div className="rname">{r.name}</div><div className="rdate">{r.when}</div></div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    {r.kind === "db" && user && user.id === r.user_id && <button onClick={() => removeReview(r.id)} style={{ background: "none", border: "none", color: "#ff7373", fontSize: 12, cursor: "pointer" }}>Delete</button>}
                    <Stars value={r.stars} size={15} />
                  </div>
                </div>
                <p className="muted" style={{ color: "var(--muted)", fontSize: 15 }}>{r.text}</p>
                {r.kind === "db" && supabaseEnabled && (
                  <CommentBlock reviewId={r.id} comments={comments} onAdd={addOrAuth} onDelete={removeComment} user={user} openAuth={() => setAuthOpen(true)} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h2>More {catName(game.cat)}</h2>
          <div className="grid grid-games">{related.map((g) => <GameCard key={g.id} game={g} />)}</div>
        </div>
      </div></section>

      {toast && <div className="toast">{toast}</div>}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
