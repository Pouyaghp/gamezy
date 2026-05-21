import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { IArrow } from "../components/Icons.jsx";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty" style={{ paddingTop: 160 }}>
        <div className="logo"><Logo size={90} /></div>
        <h2 style={{ fontSize: 34, marginBottom: 10 }}>Page not found</h2>
        <p style={{ marginBottom: 22 }}>That page wandered off into the shadows.</p>
        <Link className="btn btn-gold" to="/">Back home <IArrow /></Link>
      </div>
    </div>
  );
}
