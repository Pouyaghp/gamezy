export const CATEGORIES = [
  { key: "action",  name: "Action & Adventure", blurb: "Fast-paced, story-driven games full of combat, exploration, and cinematic moments.", c: ["#5e2a8c", "#e7a72b"] },
  { key: "shooter", name: "Shooter (FPS / TPS)", blurb: "From tactical realism to futuristic battles — all the best first- and third-person shooters.", c: ["#3a1a59", "#c2410c"] },
  { key: "rpg",     name: "RPG & Open World",    blurb: "Immersive worlds, character progression, and deep storytelling experiences.", c: ["#7c3a1d", "#e7a72b"] },
  { key: "sports",  name: "Sports & Racing",     blurb: "Football, basketball, car racing, and more — all your favourite competitive titles.", c: ["#1d4e6b", "#e7a72b"] },
  { key: "horror",  name: "Horror & Survival",   blurb: "Terrifying stories, jump scares, and intense survival gameplay.", c: ["#1a1414", "#5e2a8c"] },
  { key: "indie",   name: "Indie & Creative",    blurb: "Unique, artistic, and innovative games made by independent studios.", c: ["#155e63", "#8b4fc6"] },
];

export const catName = (k) => (CATEGORIES.find((c) => c.key === k) || {}).name || k;
export const catShort = (k) => ({ action: "Action", shooter: "Shooter", rpg: "RPG", sports: "Sports", horror: "Horror", indie: "Indie" }[k] || k);
