import { useState } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "./Logo.jsx";
import { IInsta, ITikTok, IDiscord } from "./Icons.jsx";

export default function Footer() {
  const [done, setDone] = useState(false);
  const noop = (e) => e.preventDefault();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="fbrand"><BrandMark size={34} /> <span style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: 22 }}>Game<span className="gold-text">Zy</span></span></div>
            <p>Gaming review &amp; community platform. Discover honest reviews, rate your favourite games, and explore what's worth playing next.</p>
            <div className="socials">
              <a href="#" onClick={noop} aria-label="Instagram"><IInsta /></a>
              <a href="#" onClick={noop} aria-label="TikTok"><ITikTok /></a>
              <a href="#" onClick={noop} aria-label="Discord"><IDiscord /></a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/games">All Games</Link></li>
              <li><Link to="/games?cat=action">Action &amp; Adventure</Link></li>
              <li><Link to="/games?cat=rpg">RPG &amp; Open World</Link></li>
              <li><Link to="/games?cat=horror">Horror &amp; Survival</Link></li>
            </ul>
          </div>
          <div>
            <h4>Platforms</h4>
            <ul>
              <li><Link to="/games?plat=pc">PC Games</Link></li>
              <li><Link to="/games?plat=console">Console Games</Link></li>
              <li><Link to="/games?plat=mobile">Mobile Games</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Get updated</h4>
            <p style={{ marginBottom: 0 }}>Stay ahead with the latest game reviews, new releases, and community highlights.</p>
            <form className="subscribe" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
              <input placeholder="you@email.com" type="email" required />
              <button className="btn btn-gold btn-sm" type="submit">{done ? "Subscribed ✓" : "Subscribe"}</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GameZy — From Glitches to Glory.</span>
          <span>Designed with Pouya</span>
        </div>
      </div>
    </footer>
  );
}
