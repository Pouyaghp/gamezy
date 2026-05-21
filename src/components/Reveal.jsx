import { useRef, useState, useEffect } from "react";

/* Fades + lifts children into view on scroll. */
export default function Reveal({ children, tag: Tag = "div", className = "", delay = 0, style }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={"reveal " + (show ? "in " : "") + className} style={{ transitionDelay: delay + "ms", ...style }}>
      {children}
    </Tag>
  );
}
