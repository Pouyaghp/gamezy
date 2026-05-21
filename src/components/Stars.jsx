import { useState } from "react";
import { StarSVG } from "./Icons.jsx";
import { clamp } from "../lib/helpers.js";

/* Read-only star display with fractional fill. */
export function Stars({ value, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, verticalAlign: "middle" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = clamp(value - i, 0, 1);
        return (
          <span key={i} style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 0 }}><StarSVG size={size} color="rgba(255,255,255,.16)" /></span>
            <span style={{ position: "absolute", inset: 0, width: f * 100 + "%", overflow: "hidden" }}><StarSVG size={size} color="#f6c558" /></span>
          </span>
        );
      })}
    </span>
  );
}

/* Interactive star input. */
export function StarPicker({ value, onChange, size = 30 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-pick" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onMouseEnter={() => setHover(i)} onClick={() => onChange(i)}>
          <StarSVG size={size} color={(hover || value) >= i ? "#f6c558" : "rgba(255,255,255,.2)"} />
        </span>
      ))}
    </div>
  );
}
