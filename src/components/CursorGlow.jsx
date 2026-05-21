import { useEffect, useRef } from "react";

/* Custom site cursor: a gold dot that tracks the mouse exactly,
   plus a ring that trails with easing and reacts on hover/click.
   Automatically disabled on touch / coarse-pointer devices. */
export default function CursorGlow() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    document.body.classList.add("custom-cursor");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, raf = 0;

    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const HOT = "a,button,input,textarea,select,.chip,.gcard,.catcard,.platcard,.star-pick span";
    const over = (e) => { if (e.target.closest && e.target.closest(HOT)) document.body.classList.add("cursor-hot"); };
    const out = (e) => { if (e.target.closest && e.target.closest(HOT)) document.body.classList.remove("cursor-hot"); };
    const down = () => document.body.classList.add("cursor-down");
    const up = () => document.body.classList.remove("cursor-down");
    const leave = () => document.body.classList.add("cursor-hidden");
    const enter = () => document.body.classList.remove("cursor-hidden");

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      document.body.classList.remove("custom-cursor", "cursor-hot", "cursor-down", "cursor-hidden");
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
