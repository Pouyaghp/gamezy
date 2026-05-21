import { Link } from "react-router-dom";
import { IArrow } from "../components/Icons.jsx";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty" style={{ paddingTop: 160 }}>
        <div className="logo"><img src="/images/logo.png" alt="GameZy" style={{ width: "100%", display: "block" }} /></div>
        <h2 style={{ fontSize: 34, marginBottom: 10 }}>Page not found</h2>
        <p style={{ marginBottom: 22 }}>That page wandered off into the shadows.</p>
        <Link className="btn btn-gold" to="/">Back home <IArrow /></Link>
      </div>
    </div>
  );
}
