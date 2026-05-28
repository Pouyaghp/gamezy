import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(URL && KEY);

export const supabase = supabaseEnabled
  ? createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

if (!supabaseEnabled && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn("[GameZy] Supabase env vars missing — running in local-only mode. See SETUP-SUPABASE.md.");
}
