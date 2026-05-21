export const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
export const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
export const lerp = (a, b, t) => a + (b - a) * t;
export const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
export const scrollTopSmooth = () => window.scrollTo({ top: 0, behavior: "smooth" });
export const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export const niceDate = (ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
