import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { errorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const registerMode = mode === "register";
  const { user, login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (registerMode) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-aside">
        <div className="auth-aside-content">
          <span className="overline overline-light">Findly campus community</span>
          <h1>{registerMode ? "A small account. A much more helpful campus." : "Welcome back to your campus community."}</h1>
          <p>Report belongings, keep track of claims, and help good things find their owners.</p>
          <div className="auth-quote">
            <span>“</span>
            <p>Someone found my ID card before I even realized it was gone.</p>
            <small>— A very relieved student</small>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">{registerMode ? "Join Findly" : "Log in"}</span>
          <h2>{registerMode ? "Create your account" : "Good to see you again"}</h2>
          <p className="form-intro">
            {registerMode ? "It only takes a minute." : "Enter your details to continue."}
          </p>
          {error && <div className="form-error">{error}</div>}
          {registerMode && (
            <label className="field-label">
              Full name
              <span className="input-icon">
                <UserRound size={17} />
                <input
                  required
                  minLength="2"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Your name"
                />
              </span>
            </label>
          )}
          <label className="field-label">
            Email address
            <span className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@campus.edu"
              />
            </span>
          </label>
          <label className="field-label">
            Password
            <span className="input-icon password-input">
              <LockKeyhole size={17} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength="6"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Show password">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <button className="button button-primary button-full" type="submit" disabled={loading}>
            {loading ? "Please wait…" : registerMode ? "Create account" : "Log in"}
            {!loading && <ArrowRight size={17} />}
          </button>
          <p className="auth-switch">
            {registerMode ? "Already have an account?" : "New to Findly?"}{" "}
            <Link to={registerMode ? "/login" : "/register"}>
              {registerMode ? "Log in" : "Create an account"}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

