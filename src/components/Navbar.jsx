import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BrandMark } from "./Logo.jsx";
import { ISearch } from "./Icons.jsx";
import { useScrolled } from "../lib/hooks.js";

const LINKS = [
  ["/", "Home", true],
  ["/games", "Games", false],
  ["/platforms", "Platforms", false],
  ["/about", "About", false],
];

export default function Navbar() {
  const scrolled = useScrolled(20);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate("/games?q=" + encodeURIComponent(q.trim())); setQ(""); setOpen(false); }
  };

  return (
    <>
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="nav-inner">
          <Link className="brand" to="/"><BrandMark size={34} /> Game<b>Zy</b></Link>
          <div className="nav-links">
            {LINKS.map(([p, l, end]) => (
              <NavLink key={p} to={p} end={end} className={({ isActive }) => (isActive ? "active" : "")}>{l}</NavLink>
            ))}
          </div>
          <div className="nav-right">
            <form className="nav-search" onSubmit={submit}>
              <ISearch /><input placeholder="Search games…" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            <Link className="btn btn-gold btn-sm" to="/games">Browse</Link>
            <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Menu"><span /><span /><span /></button>
          </div>
        </div>
      </nav>
      <div className={"mobile-menu" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        {LINKS.map(([p, l, end]) => (
          <NavLink key={p} to={p} end={end} className={({ isActive }) => (isActive ? "active" : "")}>{l}</NavLink>
        ))}
        <form className="nav-search" style={{ display: "flex", marginTop: 8 }} onSubmit={submit}>
          <ISearch /><input placeholder="Search games…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
      </div>
    </>
  );
}
