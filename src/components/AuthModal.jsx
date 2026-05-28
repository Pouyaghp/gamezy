import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth.jsx";

export default function AuthModal({ open, onClose, defaultMode = "signin" }) {
  const { signInEmail, signUpEmail, signInProvider } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setErr(""); setInfo(""); setMode(defaultMode); } }, [open, defaultMode]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signin") {
        await signInEmail(email, password);
        onClose();
      } else {
        await signUpEmail(email, password, username || email.split("@")[0]);
        setInfo("Check your email to verify your account, then sign in.");
        setMode("signin");
      }
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };
  const oauth = async (provider) => {
    setErr(""); setBusy(true);
    try { await signInProvider(provider); }
    catch (e) { setErr(e.message || "Sign-in failed."); setBusy(false); }
  };

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", background: "rgba(0,0,0,.35)", color: "#fff", fontSize: 14, marginBottom: 10 };
  const social = (bg, label, onClick) => (
    <button type="button" onClick={onClick} disabled={busy}
      style={{ flex: 1, padding: "10px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: bg, color: "#fff", fontSize: 13, fontWeight: 600, cursor: busy ? "default" : "pointer" }}>{label}</button>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: "linear-gradient(180deg,#1a1226 0%,#120a1c 100%)", border: "1px solid rgba(231,167,43,.28)", borderRadius: 16, padding: 26, maxWidth: 400, width: "100%", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 className="gold-text" style={{ fontSize: 24, fontWeight: 800 }}>{mode === "signin" ? "Welcome back" : "Join GameZy"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#cbb8e4", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          {mode === "signin" ? "Sign in to rate games, save favourites and comment." : "Create an account to join the community."}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {social("#4285F4", "Continue with Google", () => oauth("google"))}
          {social("#5865F2", "Continue with Discord", () => oauth("discord"))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>or email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <input style={inp} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          )}
          <input style={inp} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {err && <div style={{ color: "#ff7373", fontSize: 13, marginBottom: 10 }}>{err}</div>}
          {info && <div style={{ color: "#7ee787", fontSize: 13, marginBottom: 10 }}>{info}</div>}
          <button className="btn btn-gold" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13 }} className="muted">
          {mode === "signin" ? (
            <>Don't have an account? <a onClick={() => setMode("signup")} style={{ color: "#f6c558", cursor: "pointer" }}>Sign up</a></>
          ) : (
            <>Already have one? <a onClick={() => setMode("signin")} style={{ color: "#f6c558", cursor: "pointer" }}>Sign in</a></>
          )}
        </div>
      </div>
    </div>
  );
}
