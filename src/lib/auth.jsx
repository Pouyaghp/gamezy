import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, supabaseEnabled } from "./supabase.js";

const AuthCtx = createContext({
  user: null, profile: null, isAdmin: false, loading: true,
  signInEmail: async () => {}, signUpEmail: async () => {},
  signInProvider: async () => {}, signOut: async () => {}, refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    if (!supabaseEnabled || !uid) { setProfile(null); setIsAdmin(false); return; }
    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile(p || null);
    const { data: a } = await supabase.from("admins").select("user_id").eq("user_id", uid).maybeSingle();
    setIsAdmin(Boolean(a));
  }, []);

  useEffect(() => {
    if (!supabaseEnabled) { setLoading(false); return; }
    let unsub = () => {};
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
      const sub = supabase.auth.onAuthStateChange(async (_e, sess) => {
        setUser(sess?.user || null);
        if (sess?.user) await loadProfile(sess.user.id);
        else { setProfile(null); setIsAdmin(false); }
      });
      unsub = () => sub.data.subscription.unsubscribe();
    })();
    return () => unsub();
  }, [loadProfile]);

  const signInEmail = async (email, password) => {
    if (!supabaseEnabled) throw new Error("Auth not configured. See SETUP-SUPABASE.md.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signUpEmail = async (email, password, username) => {
    if (!supabaseEnabled) throw new Error("Auth not configured. See SETUP-SUPABASE.md.");
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { username } }
    });
    if (error) throw error;
  };
  const signInProvider = async (provider /* 'google' | 'discord' | 'github' */) => {
    if (!supabaseEnabled) throw new Error("Auth not configured. See SETUP-SUPABASE.md.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    // Always wipe local state first so the UI flips immediately
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    // Clear the admin session flag too
    try { sessionStorage.removeItem("gamezy_admin_auth"); } catch (e) {}
    // Tell Supabase to invalidate the session
    if (supabaseEnabled) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("[GameZy] supabase.auth.signOut error:", e);
        // As a last resort, clear all Supabase keys from localStorage
        try {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("sb-") || k.includes("supabase")) localStorage.removeItem(k);
          });
        } catch (_) {}
      }
    }
  };

  const refreshProfile = async () => { if (user) await loadProfile(user.id); };

  return (
    <AuthCtx.Provider value={{ user, profile, isAdmin, loading, signInEmail, signUpEmail, signInProvider, signOut, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
