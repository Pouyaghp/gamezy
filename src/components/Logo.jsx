import { useState } from "react";

/* BrandMark: uses your real logo image at /images/logo.png if it exists,
   and falls back to the built-in SVG emblem if the file isn't there yet.
   Drop your logo at  public/images/logo.png  (transparent PNG or SVG). */
export function BrandMark({ size = 34 }) {
  const [err, setErr] = useState(false);
  if (err) return <Logo size={size} />;
  return (
    <img
      src="/images/logo.png"
      alt="GameZy logo"
      height={size * 1.18}
      style={{ height: size * 1.18, width: "auto", display: "block", objectFit: "contain" }}
      onError={() => setErr(true)}
    />
  );
}

/* Hooded-shield gamer emblem — scalable recreation of the GameZy mark. */
export default function Logo({ size = 40, glow = false, eyeColor = "#ffffff" }) {
  const gold = "#e7a72b", purple = "#7a3fb0", purpleD = "#4a2273", dark = "#241433", goldL = "#f6c558";
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: "drop-shadow(0 0 14px rgba(231,167,43,.5))" } : undefined}>
      <path d="M100 6 C128 14 150 20 178 30 L184 64 C188 120 168 178 100 234 C32 178 12 120 16 64 L22 30 C50 20 72 14 100 6 Z" fill="#150e22" stroke={gold} strokeWidth="6" strokeLinejoin="round" />
      <path d="M100 22 C124 29 145 34 168 43 L173 70 C176 118 158 168 100 216 C42 168 24 118 27 70 L32 43 C55 34 76 29 100 22 Z" fill="none" stroke={gold} strokeWidth="2.4" opacity=".85" />
      <path d="M40 56 l16 -7 -2 16 -14 6 z" fill={gold} opacity=".9" />
      <path d="M160 56 l-16 -7 2 16 14 6 z" fill={gold} opacity=".9" />
      <path d="M100 28 C132 28 154 50 157 86 C159 108 153 130 145 152 C130 150 120 150 100 150 C80 150 70 150 55 152 C47 130 41 108 43 86 C46 50 68 28 100 28 Z" fill={purple} stroke={purpleD} strokeWidth="3" />
      <path d="M100 28 C120 30 134 44 140 70 C133 58 120 50 100 50 C80 50 67 58 60 70 C66 44 80 30 100 28 Z" fill={purpleD} opacity=".55" />
      <path d="M100 52 C120 52 133 70 131 92 C129 112 116 126 100 128 C84 126 71 112 69 92 C67 70 80 52 100 52 Z" fill={dark} />
      <path d="M75 82 L95 89 L92 99 L77 95 Z" fill={eyeColor} style={glow ? { filter: "drop-shadow(0 0 6px " + eyeColor + ")" } : undefined} />
      <path d="M125 82 L105 89 L108 99 L123 95 Z" fill={eyeColor} style={glow ? { filter: "drop-shadow(0 0 6px " + eyeColor + ")" } : undefined} />
      <g>
        <path d="M70 156 C60 156 55 164 55 172 C55 182 61 190 69 190 C75 190 78 185 83 185 L117 185 C122 185 125 190 131 190 C139 190 145 182 145 172 C145 164 140 156 130 156 C121 156 117 162 111 162 L89 162 C83 162 79 156 70 156 Z" fill={goldL} stroke={gold} strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 170 h6 v-6 h5 v6 h6 v5 h-6 v6 h-5 v-6 h-6 z" fill={dark} />
        <circle cx="96" cy="174" r="2.4" fill={dark} />
        <circle cx="104" cy="174" r="2.4" fill={dark} />
        <circle cx="122" cy="170" r="3" fill={dark} />
        <circle cx="130" cy="176" r="3" fill={dark} />
      </g>
    </svg>
  );
}
