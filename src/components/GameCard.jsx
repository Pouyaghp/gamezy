import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { StarSVG } from "./Icons.jsx";
import { catShort } from "../data/categories.js";

/* Poster: shows your real photo if you've added one, otherwise a brand-coloured placeholder.
   Just drop a file named  <slug>.jpg  into  public/images/games/
   (e.g. public/images/games/elden-ring.jpg) and it appears automatically.
   You can also set an explicit `image` field on a game in src/data/games.js. */
export function GamePoster({ game, showTitle = true }) {
  const [err, setErr] = useState(false);
  const src = game.image || "/images/games/" + game.slug + ".jpg";
  if (!err) {
    return (
      <img
        src={src}
        alt={game.title}
        loading="lazy"
        onError={() => setErr(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    );
  }
  const [c1, c2] = game.c;
  return (
    <div className="poster-ph" style={{ background: "linear-gradient(150deg," + c1 + "," + c2 + ")" }}>
      <div className="ph-glow" />
      <div className="ph-logo"><Logo size={130} /></div>
      {showTitle && <div className="ph-title">{game.title}</div>}
    </div>
  );
}

export default function GameCard({ game }) {
  return (
    <Link className="gcard" to={"/game/" + game.slug}>
      <div className="poster">
        <span className="pbadge">{catShort(game.cat)}</span>
        <span className="rbadge"><StarSVG size={12} color="#f6c558" />{game.rating.toFixed(1)}</span>
        <GamePoster game={game} />
      </div>
      <div className="gbody">
        <h3>{game.title}</h3>
        <div className="meta"><span>{game.dev}</span><span className="dot" /><span>{game.year}</span></div>
      </div>
    </Link>
  );
}
