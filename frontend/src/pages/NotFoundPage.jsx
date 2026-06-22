import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <span>404</span>
      <h1>This page wandered off.</h1>
      <p>Unlike a lost wallet, we know exactly how to get you back.</p>
      <Link className="button button-primary" to="/">Return home</Link>
    </section>
  );
}

