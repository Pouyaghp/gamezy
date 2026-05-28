import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./lib/auth.jsx";
import { supabaseEnabled } from "./lib/supabase.js";
import { fetchLiveGames, fetchLiveCategories } from "./lib/db.js";
import "./index.css";

/* On every page load, pull the latest games & categories from Supabase
   (if configured) and stash them in localStorage. The data modules read
   from localStorage so visitors instantly see whatever the admin saved. */
function LiveSync() {
  useEffect(() => {
    if (!supabaseEnabled) return;
    if (sessionStorage.getItem("gamezy_live_synced") === "1") return;
    let cancelled = false;
    (async () => {
      try {
        const games = await fetchLiveGames();
        const cats  = await fetchLiveCategories();
        let changed = false;
        if (games && games.length) {
          const cur = localStorage.getItem("gamezy_games_v1");
          const next = JSON.stringify(games);
          if (cur !== next) { localStorage.setItem("gamezy_games_v1", next); changed = true; }
        }
        if (cats && cats.length) {
          const cur = localStorage.getItem("gamezy_categories_v1");
          const next = JSON.stringify(cats);
          if (cur !== next) { localStorage.setItem("gamezy_categories_v1", next); changed = true; }
        }
        sessionStorage.setItem("gamezy_live_synced", "1");
        if (changed && !cancelled) window.location.reload();
      } catch (e) { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LiveSync />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
