import { useState, useEffect } from "react";
import { IUp } from "./Icons.jsx";
import { useScrolled } from "../lib/hooks.js";
import { scrollTopSmooth } from "../lib/helpers.js";

/* Thin gold bar at the very top tracking overall page scroll. */
export function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setW(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="scroll-progress" style={{ width: w + "%" }} />;
}

export function BackToTop() {
  const show = useScrolled(600);
  return (
    <button className={"totop" + (show ? " show" : "")} onClick={scrollTopSmooth} aria-label="Back to top"><IUp /></button>
  );
}
