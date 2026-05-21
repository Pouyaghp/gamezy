import { useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHeroProgress } from "../lib/hooks.js";
import { seg, lerp } from "../lib/helpers.js";
import { IArrow } from "./Icons.jsx";

/* Big animated emblem driven by scroll segments. */
function HeroShield({ draw, hood, eyes, ctrl }) {
  const gold = "#e7a72b", purple = "#7a3fb0", purpleD = "#4a2273", dark = "#1c1030", goldL = "#f6c558";
  const eyeGlow = "drop-shadow(0 0 " + eyes * 18 + "px rgba(246,197,88," + eyes + "))";
  return (
    <svg className="hero-shield" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 6 C128 14 150 20 178 30 L184 64 C188 120 168 178 100 234 C32 178 12 120 16 64 L22 30 C50 20 72 14 100 6 Z" fill="#150e22" fillOpacity={lerp(0.2, 1, draw)} stroke={gold} strokeWidth="5" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
      <path d="M100 22 C124 29 145 34 168 43 L173 70 C176 118 158 168 100 216 C42 168 24 118 27 70 L32 43 C55 34 76 29 100 22 Z" fill="none" stroke={gold} strokeWidth="2" opacity={draw * 0.85} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
      <path d="M40 56 l16 -7 -2 16 -14 6 z" fill={gold} opacity={draw * 0.9} />
      <path d="M160 56 l-16 -7 2 16 14 6 z" fill={gold} opacity={draw * 0.9} />
      <g opacity={hood}>
        <path d="M100 28 C132 28 154 50 157 86 C159 108 153 130 145 152 C130 150 120 150 100 150 C80 150 70 150 55 152 C47 130 41 108 43 86 C46 50 68 28 100 28 Z" fill={purple} stroke={purpleD} strokeWidth="3" />
        <path d="M100 28 C120 30 134 44 140 70 C133 58 120 50 100 50 C80 50 67 58 60 70 C66 44 80 30 100 28 Z" fill={purpleD} opacity=".55" />
        <path d="M100 52 C120 52 133 70 131 92 C129 112 116 126 100 128 C84 126 71 112 69 92 C67 70 80 52 100 52 Z" fill={dark} />
      </g>
      <g opacity={eyes} style={{ filter: eyeGlow }}>
        <path d="M75 82 L95 89 L92 99 L77 95 Z" fill={goldL} />
        <path d="M125 82 L105 89 L108 99 L123 95 Z" fill={goldL} />
      </g>
      <g opacity={ctrl} style={{ transform: "translateY(" + lerp(34, 0, ctrl) + "px)" }}>
        <path d="M70 156 C60 156 55 164 55 172 C55 182 61 190 69 190 C75 190 78 185 83 185 L117 185 C122 185 125 190 131 190 C139 190 145 182 145 172 C145 164 140 156 130 156 C121 156 117 162 111 162 L89 162 C83 162 79 156 70 156 Z" fill={goldL} stroke={gold} strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 170 h6 v-6 h5 v6 h6 v5 h-6 v6 h-5 v-6 h-6 z" fill={dark} />
        <circle cx="96" cy="174" r="2.4" fill={dark} /><circle cx="104" cy="174" r="2.4" fill={dark} />
        <circle cx="122" cy="170" r="3" fill={dark} /><circle cx="130" cy="176" r="3" fill={dark} />
      </g>
    </svg>
  );
}

export default function ScrollHero() {
  const wrap = useRef(null);
  const p = useHeroProgress(wrap);
  const draw = seg(p, 0.02, 0.34);
  const hood = seg(p, 0.12, 0.42);
  const eyes = seg(p, 0.30, 0.54);
  const ctrl = seg(p, 0.40, 0.62);
  const word = seg(p, 0.52, 0.78);
  const tag = seg(p, 0.66, 0.88);
  const cta = seg(p, 0.82, 1);
  const cue = 1 - seg(p, 0, 0.12);
  const emblemScale = lerp(0.82, 1, seg(p, 0, 0.45));
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
        <div className="hero-emblem" style={{ transform: "translateY(" + lerp(30, -18, p) + "px) scale(" + emblemScale + ")" }}>
          <HeroShield draw={draw} hood={hood} eyes={eyes} ctrl={ctrl} />
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
