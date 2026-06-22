import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Menu, Plus, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark"><MapPin size={20} /></span>
          <span>Findly</span>
        </Link>

        <button
          className="menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`main-nav ${open ? "nav-open" : ""}`}>
          <NavLink to="/browse" onClick={close}>Browse</NavLink>
          {user && <NavLink to="/dashboard" onClick={close}>My posts</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
          {user ? (
            <>
              <Link className="button button-small button-primary" to="/report" onClick={close}>
                <Plus size={16} /> Report item
              </Link>
              <button className="nav-user" onClick={handleLogout} title="Log out">
                <span><UserRound size={16} /> {user.name.split(" ")[0]}</span>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link className="button button-small button-primary" to="/register" onClick={close}>
                Join Findly
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

