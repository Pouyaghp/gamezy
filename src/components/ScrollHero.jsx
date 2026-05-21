import { useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHeroProgress } from "../lib/hooks.js";
import { seg, lerp } from "../lib/helpers.js";
import { IArrow } from "./Icons.jsx";

/* Scroll-scrubbed hero built around your real GameZy logo:
   the emblem reveals + scales + glows as you scroll, then the
   wordmark, tagline and call-to-action come in. */
export default function ScrollHero() {
  const wrap = useRef(null);
  const p = useHeroProgress(wrap);
  const reveal = seg(p, 0.02, 0.42);
  const glow = seg(p, 0.12, 0.55);
  const word = seg(p, 0.5, 0.76);
  const tag = seg(p, 0.64, 0.86);
  const cta = seg(p, 0.8, 1);
  const cue = 1 - seg(p, 0, 0.12);
  const scale = lerp(0.62, 1, seg(p, 0, 0.46));
  const embers = useMemo(
    () => Array.from({ length: 18 }, () => ({
      left: Math.random() * 100, bottom: Math.random() * 75, size: 2 + Math.random() * 5,
      dur: 5 + Math.random() * 8, delay: Math.random() * 6, depth: 0.3 + Math.random() * 1.3,
    })),
    []
  );
  return (
    <div className="hero-wrap" ref={wrap}>
      <div className="hero-stage">
        <div className="hero-bg" style={{ transform: "scale(" + lerp(1.12, 1, p) + ")" }} />
        <div className="hero-grid" style={{ transform: "translateY(" + p * -60 + "px)", opacity: lerp(0.6, 0.12, p) }} />
        {embers.map((e, i) => (
          <div key={i} style={{ position: "absolute", left: e.left + "%", bottom: e.bottom + "%", zIndex: 2, transform: "translateY(" + p * e.depth * -170 + "px)", opacity: lerp(0.15, 0.85, seg(p, 0, 0.4)) }}>
            <div className="ember" style={{ width: e.size, height: e.size, animationDuration: e.dur + "s", animationDelay: e.delay + "s" }} />
          </div>
        ))}
        <div className="hero-emblem" style={{ transform: "translateY(" + lerp(30, -18, p) + "px)" }}>
          <div className="hero-logo-wrap" style={{ transform: "scale(" + scale + ")", opacity: reveal }}>
            <div className="hero-logo-glow" style={{ opacity: glow, transform: "scale(" + lerp(0.8, 1.25, glow) + ")" }} />
            <img
              className="hero-shield"
              src="/images/logo.png"
              alt="GameZy"
              style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 22px 55px rgba(94,42,140," + (0.3 + 0.4 * glow) + ")) drop-shadow(0 0 " + glow * 30 + "px rgba(231,167,43," + glow * 0.55 + "))" }}
            />
          </div>
          <div className="hero-word" style={{ opacity: word, transform: "translateY(" + lerp(46, 0, word) + "px) scale(" + lerp(0.92, 1, word) + ")" }}>Game<b>Zy</b></div>
          <div className="hero-tag" style={{ opacity: tag, transform: "translateY(" + lerp(28, 0, tag) + "px)" }}>From Glitches to Glory,<br /><span className="gradient-text">Every Game Matters.</span></div>
          <p className="hero-sub" style={{ opacity: tag }}>Real reviews, real ratings, real experiences — for every title across all platforms.</p>
          <div className="hero-cta" style={{ opacity: cta, transform: "translateY(" + lerp(20, 0, cta) + "px)", pointerEvents: cta > 0.6 ? "auto" : "none" }}>
            <Link className="btn btn-gold" to="/games">Explore Games <IArrow /></Link>
            <Link className="btn btn-ghost" to="/about">Learn More</Link>
          </div>
        </div>
        <div className="scroll-cue" style={{ opacity: cue, pointerEvents: "none" }}><div className="mouse" /><span>Scroll to enter</span></div>
      </div>
    </div>
  );
}
