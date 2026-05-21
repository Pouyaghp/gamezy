export function StarSVG({ size = 16, color = "#f6c558" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: "block" }}>
      <path d="M12 2l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.8 5.9 20.3 7.2 13.6l-5-4.6 6.8-.8z" />
    </svg>
  );
}
export function ISearch({ size = 18 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
}
export function IArrow({ size = 16 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
export function ICheck({ size = 18 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#e7a72b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>);
}
export function IUp({ size = 20 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>);
}
export function IPC({ size = 24 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>);
}
export function IConsole({ size = 24 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 8h12a4 4 0 014 4v2a3 3 0 01-5.5 1.7L15 14H9l-1.5 1.7A3 3 0 012 14v-2a4 4 0 014-4z" /><path d="M7 11v2M6 12h2" /><circle cx="16" cy="11.5" r="1" /><circle cx="18" cy="13.5" r="1" /></svg>);
}
export function IMobile({ size = 24 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>);
}
export const platIcon = (k) => (k === "pc" ? <IPC /> : k === "mobile" ? <IMobile /> : <IConsole />);

export function IInsta({ size = 18 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>);
}
export function ITikTok({ size = 18 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.3 1.7 3.9 4 4.2v3c-1.5 0-2.9-.4-4-1.2v6.3c0 3.4-2.8 5.7-5.8 5.7A5.6 5.6 0 014.7 15c0-3.1 2.6-5.6 5.9-5.2v3a2.5 2.5 0 00-2.8 2.4c0 1.4 1.1 2.4 2.4 2.4 1.4 0 2.8-1 2.8-3V3z" /></svg>);
}
export function IDiscord({ size = 18 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 5.6A16 16 0 0015.5 4l-.3.5a13 13 0 016.3 3.2C19.6 6.4 17 5.3 12 5.3S4.4 6.4 2.5 7.7A13 13 0 018.8 4.5L8.5 4A16 16 0 004.5 5.6 17 17 0 002 18.4 14 14 0 006.8 21l1-1.6c-1-.3-1.9-.8-2.6-1.4l.6-.4a11 11 0 0012.4 0l.6.4c-.8.6-1.7 1.1-2.6 1.4l1 1.6A14 14 0 0022 18.4a17 17 0 00-2.5-12.8zM9 15.4c-.8 0-1.5-.8-1.5-1.7S8.2 12 9 12s1.5.8 1.5 1.7-.7 1.7-1.5 1.7zm6 0c-.8 0-1.5-.8-1.5-1.7S14.2 12 15 12s1.5.8 1.5 1.7-.7 1.7-1.5 1.7z" /></svg>);
}
