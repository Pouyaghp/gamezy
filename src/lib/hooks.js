import { useState, useEffect } from "react";
import { clamp } from "./helpers.js";

/* ---- persisted reviews (localStorage) ---- */
const RKEY = "gamezy_reviews_v1";
function loadAll() {
  try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch (e) { return {}; }
}
export function useReviews(gameId) {
  const [list, setList] = useState(() => loadAll()[gameId] || []);
  const add = (r) => {
    const all = loadAll();
    const entry = { ...r, id: Date.now(), mine: true, ts: Date.now() };
    const next = [entry, ...(all[gameId] || [])];
    all[gameId] = next;
    try { localStorage.setItem(RKEY, JSON.stringify(all)); } catch (e) { /* storage unavailable */ }
    setList(next);
  };
  return [list, add];
}

/* ---- is the page scrolled past a threshold? ---- */
export function useScrolled(threshold = 24) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return s;
}

/* ---- 0..1 progress while a tall section scrolls past ---- */
export function useHeroProgress(wrapRef) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, total);
      setP(total > 0 ? scrolled / total : 0);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wrapRef]);
  return p;
}
