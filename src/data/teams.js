/* GameZy esports teams — baked-in defaults.
   Use /admin → Teams to edit, add or remove. */
export const BASE_TEAMS = [
  { key: "team-liquid", name: "Team Liquid", country: "Netherlands", city: "Utrecht", founded: 2000,
    website: "https://www.teamliquid.com",
    blurb: "One of the most decorated multi-game esports organisations in the world.",
    about: "Founded in 2000 as a StarCraft community, Team Liquid has grown into a global powerhouse fielding rosters across nearly every major esport.",
    league: "Multi-league (LCS, LEC, BLAST, Pro League)",
    platforms: ["pc", "console"], rank: "#1 worldwide (Esports Earnings)",
    games: ["dota-2", "csgo", "league-of-legends", "valorant"],
    c: ["#0a1a2f", "#2a8be8"] },
  { key: "fnatic", name: "Fnatic", country: "United Kingdom", city: "London", founded: 2004,
    website: "https://fnatic.com",
    blurb: "British esports icons with a global reach.",
    about: "Founded in 2004, Fnatic has competed at the highest level in League of Legends, CS:GO, Valorant, Dota 2 and many more.",
    league: "LEC, Champions Tour, BLAST Premier",
    platforms: ["pc", "console"], rank: "Top 5 EU LoL",
    games: ["league-of-legends", "csgo", "valorant", "dota-2"],
    c: ["#0a0a0a", "#ff5900"] },
  { key: "cloud9", name: "Cloud9", country: "United States", city: "Los Angeles", founded: 2013,
    website: "https://cloud9.gg",
    blurb: "North American multi-title legends in blue.",
    about: "Cloud9 is one of the most successful organisations in North American esports with rosters in LoL, CS:GO, Valorant and more.",
    league: "LCS, BLAST, Champions Tour",
    platforms: ["pc"], rank: "Top 3 NA LoL",
    games: ["league-of-legends", "valorant", "csgo"],
    c: ["#0a1a2f", "#3ec3ff"] },
  { key: "t1", name: "T1", country: "South Korea", city: "Seoul", founded: 2002,
    website: "https://www.t1.gg",
    blurb: "Korean dynasty — home of Faker.",
    about: "Originally SK Telecom T1, the squad is the most-decorated LoL franchise in history with multiple World Championship titles.",
    league: "LCK, Worlds",
    platforms: ["pc"], rank: "Reigning LCK champion",
    games: ["league-of-legends", "valorant"],
    c: ["#1a0a0a", "#e60012"] },
  { key: "navi", name: "Natus Vincere (NAVI)", country: "Ukraine", city: "Kyiv", founded: 2009,
    website: "https://navi.gg",
    blurb: "Born to win — Ukrainian CS:GO royalty.",
    about: "NAVI rose to global fame on the back of legendary CS:GO play and have championship pedigree in Dota 2 and Rainbow Six.",
    league: "BLAST, ESL Pro League, PGL Majors",
    platforms: ["pc"], rank: "Top 3 CS2 worldwide",
    games: ["csgo", "dota-2", "rainbow-six"],
    c: ["#0a0a0a", "#ffd900"] },
  { key: "g2-esports", name: "G2 Esports", country: "Germany", city: "Berlin", founded: 2014,
    website: "https://g2esports.com",
    blurb: "European LoL & Valorant titans.",
    about: "Founded in 2014, G2 are best known for their dominant European League of Legends roster and growing Valorant presence.",
    league: "LEC, Champions Tour",
    platforms: ["pc"], rank: "Reigning LEC champion",
    games: ["league-of-legends", "valorant", "rocket-league"],
    c: ["#0a0a0a", "#ff0d4d"] },
];

let _rt = BASE_TEAMS;
try {
  if (typeof localStorage !== "undefined") {
    const v = localStorage.getItem("gamezy_teams_v1");
    if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length) _rt = p; }
  }
} catch (e) {}
export const TEAMS = _rt;
export const teamByKey = (k) => TEAMS.find((t) => t.key === k);
