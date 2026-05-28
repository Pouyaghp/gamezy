import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BrandMark } from "./Logo.jsx";
import { ISearch } from "./Icons.jsx";
import { useScrolled } from "../lib/hooks.js";
import { useAuth } from "../lib/auth.jsx";
import AuthModal from "./AuthModal.jsx";

const LINKS = [
  ["/", "Home", true],
  ["/games", "Games", false],
  ["/platforms", "Platforms", false],
  ["/about", "About", false],
];

function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initial = (profile?.username || user?.email || "?")[0].toUpperCase();
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Account"
        style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#5e2a8c,#e7a72b)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        {initial}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 44, minWidth: 200, background: "rgba(20,15,30,.97)", border: "1px solid rgba(231,167,43,.25)", borderRadius: 10, padding: 8, boxShadow: "0 18px 50px rgba(0,0,0,.6)" }}>
          <div style={{ padding: "6px 10px", fontSize: 13 }}>
            <b style={{ color: "#f6c558" }}>{profile?.username || "Player"}</b>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{user?.email}</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,.08)", margin: "6px 0" }} />
          <button onClick={() => { setOpen(false); navigate("/profile"); }} className="usermenu-item">My profile</button>
          {isAdmin && (
            <button onClick={() => { setOpen(false); navigate("/admin"); }} className="usermenu-item">Admin</button>
          )}
          <button onClick={async () => { setOpen(false); await signOut(); }} className="usermenu-item">Sign out</button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const scrolled = useScrolled(20);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate("/games?q=" + encodeURIComponent(q.trim())); setQ(""); setOpen(false); }
  };

  return (
    <>
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="nav-inner">
          <Link className="brand" to="/"><BrandMark size={34} /><span className="brand-name">Game<b>Zy</b></span></Link>
          <div className="nav-links">
            {LINKS.map(([p, l, end]) => (
              <NavLink key={p} to={p} end={end} className={({ isActive }) => (isActive ? "active" : "")}>{l}</NavLink>
            ))}
          </div>
          <div className="nav-right">
            <form className="nav-search" onSubmit={submit}>
              <ISearch /><input placeholder="Search games…" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            {user ? (
              <UserMenu />
            ) : (
              <button className="btn btn-gold btn-sm" onClick={() => setAuthOpen(true)}>Sign in</button>
            )}
            <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Menu"><span /><span /><span /></button>
          </div>
        </div>
      </nav>
      <div className={"mobile-menu" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        {LINKS.map(([p, l, end]) => (
          <NavLink key={p} to={p} end={end} className={({ isActive }) => (isActive ? "active" : "")}>{l}</NavLink>
        ))}
        {!user && (
          <button className="btn btn-gold" style={{ marginTop: 8 }} onClick={() => { setOpen(false); setAuthOpen(true); }}>Sign in</button>
        )}
        <form className="nav-search" style={{ display: "flex", marginTop: 8 }} onSubmit={submit}>
          <ISearch /><input placeholder="Search games…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
