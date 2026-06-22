import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CircleDot,
  PackageSearch,
  Search,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import { formatDate } from "../utils/constants.js";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users")])
      .then(([statsResponse, usersResponse]) => {
        setData(statsResponse.data);
        setUsers(usersResponse.data.users);
      })
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Opening admin dashboard" />;
  if (error || !data) {
    return <section className="page-section container"><EmptyState title="Admin data unavailable" text={error} /></section>;
  }

  const stats = data.stats;
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="page-section admin-page">
      <div className="container">
        <div className="dashboard-hero admin-hero">
          <div>
            <span className="eyebrow">System management</span>
            <h1>Admin dashboard</h1>
            <p>A clear view of reports, users, and recovery activity across Findly.</p>
          </div>
          <span className="admin-badge"><ShieldCheck size={17} /> Administrator</span>
        </div>

        <div className="admin-tabs">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
        </div>

        {tab === "overview" ? (
          <>
            <div className="admin-stat-grid">
              <article><span className="admin-stat-icon icon-green"><UsersRound /></span><div><small>Registered users</small><strong>{stats.users}</strong></div></article>
              <article><span className="admin-stat-icon icon-blue"><PackageSearch /></span><div><small>Total reports</small><strong>{stats.totalItems}</strong></div></article>
              <article><span className="admin-stat-icon icon-orange"><CircleDot /></span><div><small>Open reports</small><strong>{stats.openItems}</strong></div></article>
              <article><span className="admin-stat-icon icon-red"><AlertCircle /></span><div><small>Pending claims</small><strong>{stats.pendingClaims}</strong></div></article>
            </div>

            <div className="admin-panels">
              <article className="admin-panel">
                <div className="panel-title"><div><span className="eyebrow">Recent activity</span><h2>Latest reports</h2></div><Link to="/browse">View all</Link></div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Item</th><th>Type</th><th>Reporter</th><th>Status</th><th>Date</th><th /></tr></thead>
                    <tbody>
                      {data.recentItems.map((item) => (
                        <tr key={item._id}>
                          <td><strong>{item.title}</strong><small>{item.location}</small></td>
                          <td><span className={`mini-type type-${item.type}`}>{item.type}</span></td>
                          <td>{item.createdBy?.name}</td>
                          <td><span className={`table-status table-${item.status}`}>{item.status}</span></td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td><Link to={`/items/${item._id}`} aria-label={`Open ${item.title}`}><ArrowUpRight size={17} /></Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="admin-panel distribution-panel">
                <div className="panel-title"><div><span className="eyebrow">Report split</span><h2>Lost vs. found</h2></div></div>
                <div
                  className="donut"
                  style={{
                    "--lost": `${stats.totalItems ? (stats.lostItems / stats.totalItems) * 100 : 50}%`
                  }}
                >
                  <div><strong>{stats.totalItems}</strong><span>reports</span></div>
                </div>
                <div className="donut-legend">
                  <span><i className="legend-lost" /> Lost <strong>{stats.lostItems}</strong></span>
                  <span><i className="legend-found" /> Found <strong>{stats.foundItems}</strong></span>
                </div>
              </article>
            </div>
          </>
        ) : (
          <article className="admin-panel users-panel">
            <div className="panel-title">
              <div><span className="eyebrow">Community</span><h2>Registered users</h2></div>
              <span className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" /></span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

