/* GameZy studios / publishers — baked-in defaults.
   Use the admin (`/admin` → Companies tab) to edit, add or remove. */
export const BASE_COMPANIES = [
  { key: "rockstar-games", name: "Rockstar Games", country: "United States", founded: 1998, website: "https://www.rockstargames.com",
    blurb: "Open-world legends behind GTA and Red Dead.",
    about: "Founded in 1998, Rockstar Games is famed for genre-defining open-world titles. Their work fuses cinematic storytelling with sandbox freedom, setting the bar for AAA production.",
    c: ["#d6336c", "#f6c558"] },
  { key: "sucker-punch", name: "Sucker Punch Productions", country: "United States", founded: 1997, website: "https://www.suckerpunch.com",
    blurb: "Painterly action-adventure specialists.",
    about: "Best known for Sly Cooper, Infamous and the Ghost of Tsushima series, Sucker Punch crafts atmospheric worlds with elegant combat.",
    c: ["#b45309", "#fde68a"] },
  { key: "insomniac-games", name: "Insomniac Games", country: "United States", founded: 1994, website: "https://insomniac.games",
    blurb: "Speed, polish and superhero spectacle.",
    about: "From Ratchet & Clank to Marvel's Spider-Man, Insomniac pairs slick traversal with brilliant pacing and humour.",
    c: ["#b91c1c", "#1d4ed8"] },
  { key: "ubisoft", name: "Ubisoft", country: "France", founded: 1986, website: "https://www.ubisoft.com",
    blurb: "French publisher of vast open-world franchises.",
    about: "One of the largest game publishers in the world, Ubisoft is the home of Assassin's Creed, Far Cry, Rainbow Six and many more.",
    c: ["#7c2d12", "#dc2626"] },
  { key: "fromsoftware", name: "FromSoftware", country: "Japan", founded: 1986, website: "https://www.fromsoftware.jp",
    blurb: "Dark, brutal, brilliant action RPGs.",
    about: "Creators of Dark Souls, Bloodborne, Sekiro and Elden Ring. FromSoftware pioneered the modern soulslike with uncompromising design.",
    c: ["#2c1410", "#c2410c"] },
  { key: "cd-projekt-red", name: "CD Projekt Red", country: "Poland", founded: 2002, website: "https://www.cdprojektred.com",
    blurb: "Story-rich worlds from Warsaw.",
    about: "The studio behind The Witcher series and Cyberpunk 2077 — known for deep RPG storytelling and ambitious open worlds.",
    c: ["#7c3a1d", "#e7a72b"] },
  { key: "valve", name: "Valve", country: "United States", founded: 1996, website: "https://www.valvesoftware.com",
    blurb: "Half-Life, Portal, Steam.",
    about: "Half-Life, Portal, Counter-Strike, Dota 2, Team Fortress — and the Steam platform that powers PC gaming worldwide.",
    c: ["#1d4e6b", "#e7a72b"] },
  { key: "capcom", name: "Capcom", country: "Japan", founded: 1979, website: "https://www.capcom.com",
    blurb: "Street Fighter, Resident Evil, Monster Hunter.",
    about: "A Japanese giant with iconic franchises spanning fighting, horror and monster-hunting genres.",
    c: ["#1a1414", "#5e2a8c"] },
];

let _rt = BASE_COMPANIES;
try {
  if (typeof localStorage !== "undefined") {
    const v = localStorage.getItem("gamezy_companies_v1");
    if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) _rt = p; }
  }
} catch (e) {}
export const COMPANIES = _rt;
export const companyByKey = (k) => COMPANIES.find((c) => c.key === k);
export const companyByDevName = (dev) => COMPANIES.find((c) => c.name === dev || c.key === dev);
