import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark"><MapPin size={19} /></span>
            <span>Findly</span>
          </Link>
          <p>A calmer, clearer way for a campus community to reunite people with their things.</p>
        </div>
        <div className="footer-links">
          <Link to="/browse">Browse items</Link>
          <Link to="/report">Report an item</Link>
          <Link to="/dashboard">My dashboard</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Findly Campus Lost &amp; Found</span>
        <span>Built for the campus community.</span>
      </div>
    </footer>
  );
}

