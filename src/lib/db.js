/* Supabase data helpers. All functions are safe to call when Supabase
   isn't configured — they just return [] / null. */
import { supabase, supabaseEnabled } from "./supabase.js";

/* ---------- Games / categories (live overrides for everyone) ---------- */
export async function fetchLiveGames() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from("games").select("data, position").order("position", { ascending: true });
  if (error) { console.warn("fetchLiveGames", error.message); return null; }
  if (!data || !data.length) return null;
  return data.map((r) => r.data);
}
export async function fetchLiveCategories() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from("categories").select("data, position").order("position", { ascending: true });
  if (error) { console.warn("fetchLiveCategories", error.message); return null; }
  if (!data || !data.length) return null;
  return data.map((r) => r.data);
}
export async function upsertGames(games) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const rows = games.map((g, i) => ({ id: g.id, slug: g.slug, data: g, position: i, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from("games").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}
export async function deleteGameById(id) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw error;
}
export async function upsertCategories(cats) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const rows = cats.map((c, i) => ({ key: c.key, data: c, position: i }));
  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
export async function deleteCategoryByKey(key) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("categories").delete().eq("key", key);
  if (error) throw error;
}

/* ---------- Reviews ---------- */
export async function fetchReviews(gameSlug) {
  if (!supabaseEnabled) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, stars, text, created_at, user_id, profiles(username, avatar_url)")
    .eq("game_slug", gameSlug)
    .order("created_at", { ascending: false });
  if (error) { console.warn("fetchReviews", error.message); return []; }
  return data || [];
}
export async function upsertReview(gameSlug, userId, stars, text) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").upsert(
    { game_slug: gameSlug, user_id: userId, stars, text }, { onConflict: "game_slug,user_id" }
  );
  if (error) throw error;
}
export async function deleteReview(id) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Comments ---------- */
export async function fetchComments(reviewIds) {
  if (!supabaseEnabled || !reviewIds.length) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("id, review_id, text, created_at, user_id, profiles(username, avatar_url)")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });
  if (error) { console.warn("fetchComments", error.message); return []; }
  return data || [];
}
export async function addComment(reviewId, userId, text) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("comments").insert({ review_id: reviewId, user_id: userId, text });
  if (error) throw error;
}
export async function deleteComment(id) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Favourites ---------- */
export async function fetchFavouriteSlugs(userId) {
  if (!supabaseEnabled || !userId) return [];
  const { data, error } = await supabase.from("favourites").select("game_slug").eq("user_id", userId);
  if (error) { console.warn("fetchFavourites", error.message); return []; }
  return (data || []).map((r) => r.game_slug);
}
export async function toggleFavourite(userId, gameSlug, isFav) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  if (isFav) {
    const { error } = await supabase.from("favourites").delete().eq("user_id", userId).eq("game_slug", gameSlug);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("favourites").insert({ user_id: userId, game_slug: gameSlug });
  if (error) throw error;
  return true;
}

/* ---------- Profile ---------- */
export async function updateProfile(userId, fields) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (error) throw error;
}

/* ---------- Storage (image uploads) ---------- */
const BUCKET = "game-media";

export async function uploadGameImage(file, slug) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  if (!file) throw new Error("No file selected.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeSlug = (slug || "game").toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const path = "games/" + safeSlug + "-" + Date.now() + "." + ext;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteGameImage(publicUrl) {
  if (!supabaseEnabled || !publicUrl) return;
  // Convert public URL back to bucket path
  const marker = "/storage/v1/object/public/" + BUCKET + "/";
  const i = publicUrl.indexOf(marker);
  if (i < 0) return;
  const path = publicUrl.substring(i + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}

/* ---------- Companies ---------- */
export async function fetchLiveCompanies() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from("companies").select("data, position").order("position", { ascending: true });
  if (error) { console.warn("fetchLiveCompanies", error.message); return null; }
  if (!data || !data.length) return null;
  return data.map((r) => r.data);
}
export async function upsertCompanies(items) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const rows = items.map((c, i) => ({ key: c.key, data: c, position: i, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from("companies").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
export async function deleteCompanyByKey(key) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("companies").delete().eq("key", key);
  if (error) throw error;
}

/* ---------- Teams ---------- */
export async function fetchLiveTeams() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from("teams").select("data, position").order("position", { ascending: true });
  if (error) { console.warn("fetchLiveTeams", error.message); return null; }
  if (!data || !data.length) return null;
  return data.map((r) => r.data);
}
export async function upsertTeams(items) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const rows = items.map((t, i) => ({ key: t.key, data: t, position: i, updated_at: new Date().toISOString() }));
  const { error } = await supabase.from("teams").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
export async function deleteTeamByKey(key) {
  if (!supabaseEnabled) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("teams").delete().eq("key", key);
  if (error) throw error;
}
