export const PLATFORMS = [
  { key: "pc",      name: "PC Gaming",      short: "PC",      blurb: "The home of high-performance gameplay, mods, and competitive titles. Explore Steam, Epic, Battle.net and more — with optimized settings and performance notes." },
  { key: "console", name: "Console Gaming", short: "Console", blurb: "PlayStation • Xbox • Nintendo. Experience exclusive titles, cinematic gameplay, and controller-based adventures across PS5, Xbox, and Switch." },
  { key: "mobile",  name: "Mobile Gaming",  short: "Mobile",  blurb: "Gaming on the go — from casual hits to competitive mobile esports. Top free-to-play picks, iOS & Android reviews, and battery/performance notes." },
];

export const platName = (k) => (PLATFORMS.find((p) => p.key === k) || {}).short || k;
