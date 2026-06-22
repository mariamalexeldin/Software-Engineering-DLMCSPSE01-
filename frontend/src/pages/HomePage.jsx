import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HandHeart,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "../api/client.js";
import ItemCard from "../components/ItemCard.jsx";

export default function HomePage() {
  const [recent, setRecent] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/items", { params: { status: "open", limit: 6 } })
      .then(({ data }) => setRecent(data.items))
      .catch(() => setRecent([]));
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/browse${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="overline"><Sparkles size={15} /> Campus things find their way home</span>
            <h1>Lost something?<br /><em>Let’s find it.</em></h1>
            <p>
              One trusted place for students and staff to report, search, and recover belongings
              across campus.
            </p>
            <form className="hero-search" onSubmit={submitSearch}>
              <Search size={20} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try “blue wallet” or “library”"
                aria-label="Search lost and found items"
              />
              <button className="button button-primary" type="submit">Search</button>
            </form>
            <div className="hero-actions">
              <Link className="button button-dark" to="/report">Report an item <ArrowRight size={17} /></Link>
              <Link className="text-link" to="/browse">Browse all reports <ArrowRight size={16} /></Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-card hero-card-main">
              <div className="visual-label">Recently reunited</div>
              <div className="visual-object">🎧</div>
              <h3>Wireless headphones</h3>
              <p>Found near the Student Center</p>
              <span><CheckCircle2 size={15} /> Returned to owner</span>
            </div>
            <div className="hero-float hero-float-left">
              <span className="float-icon">🔑</span>
              <div><strong>Keys found</strong><small>Science block</small></div>
            </div>
            <div className="hero-float hero-float-right">
              <HandHeart size={23} />
              <div><strong>Community powered</strong><small>Students helping students</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><ShieldCheck /><span><strong>Secure accounts</strong>Protected campus community</span></div>
          <div><Search /><span><strong>Quick discovery</strong>Search by item or location</span></div>
          <div><HandHeart /><span><strong>Simple claiming</strong>Connect safely with reporters</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Latest reports</span>
              <h2>Fresh from around campus</h2>
            </div>
            <Link className="text-link" to="/browse">See everything <ArrowRight size={16} /></Link>
          </div>
          <div className="item-grid">
            {recent.map((item) => <ItemCard item={item} key={item._id} />)}
          </div>
          {!recent.length && (
            <div className="home-empty">
              <p>No reports yet. You can be the first to help the campus community.</p>
              <Link className="button button-primary" to="/report">Create first report</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section how-section">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">How it works</span>
            <h2>Three small steps. One happy reunion.</h2>
          </div>
          <div className="steps-grid">
            <article><span>01</span><h3>Report it</h3><p>Add the item, location, date, and a helpful photo.</p></article>
            <article><span>02</span><h3>Find a match</h3><p>Browse searchable reports from across your campus.</p></article>
            <article><span>03</span><h3>Bring it home</h3><p>Send a claim, verify ownership, and mark it returned.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container cta-panel">
          <div>
            <span className="overline overline-light">A kinder campus starts here</span>
            <h2>Found something that isn’t yours?</h2>
            <p>Your two-minute report could make somebody’s entire day.</p>
          </div>
          <Link className="button button-light" to="/report">Post a found item <ArrowRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}

