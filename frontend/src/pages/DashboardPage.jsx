import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, CircleDot, PackageOpen, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ItemCard from "../components/ItemCard.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatDate } from "../utils/constants.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/items/mine")
      .then(({ data }) => setItems(data.items))
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = useMemo(
    () => items.filter((item) => tab === "all" || item.type === tab),
    [items, tab]
  );
  const pendingClaims = items.reduce(
    (total, item) => total + item.claims.filter((claim) => claim.status === "pending").length,
    0
  );

  const manageClaim = async (itemId, claimId, status) => {
    try {
      await api.patch(`/items/${itemId}/claims/${claimId}`, { status });
      showToast(`Claim ${status}`);
      load();
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    }
  };

  return (
    <section className="page-section dashboard-page">
      <div className="container">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">Your Findly space</span>
            <h1>Hello, {user.name.split(" ")[0]}.</h1>
            <p>Manage your reports and help complete the next campus reunion.</p>
          </div>
          <Link className="button button-primary" to="/report"><Plus size={17} /> New report</Link>
        </div>

        <div className="stat-row">
          <article><PackageOpen /><div><strong>{items.length}</strong><span>Total reports</span></div></article>
          <article><CircleDot /><div><strong>{items.filter((item) => item.status === "open").length}</strong><span>Still open</span></div></article>
          <article><Check /><div><strong>{items.filter((item) => item.status !== "open").length}</strong><span>Reunited</span></div></article>
          <article><span className="claim-stat">↗</span><div><strong>{pendingClaims}</strong><span>Pending claims</span></div></article>
        </div>

        {pendingClaims > 0 && (
          <div className="claims-section">
            <div className="section-heading compact-heading">
              <div><span className="eyebrow">Needs your attention</span><h2>Claim requests</h2></div>
            </div>
            <div className="claim-list">
              {items.flatMap((item) =>
                item.claims
                  .filter((claim) => claim.status === "pending")
                  .map((claim) => (
                    <article className="claim-row" key={claim._id}>
                      <button className="claim-summary" onClick={() => setExpanded(expanded === claim._id ? "" : claim._id)}>
                        <span className="claim-avatar">{claim.claimant?.name?.slice(0, 1)}</span>
                        <span>
                          <strong>{claim.claimant?.name}</strong> may have a match for <Link to={`/items/${item._id}`}>{item.title}</Link>
                          <small>{formatDate(claim.createdAt)}</small>
                        </span>
                        <ChevronDown className={expanded === claim._id ? "rotate" : ""} />
                      </button>
                      {expanded === claim._id && (
                        <div className="claim-expanded">
                          <p>“{claim.message}”</p>
                          <a href={`mailto:${claim.claimant?.email}`}>{claim.claimant?.email}</a>
                          <div>
                            <button className="button button-small button-primary" onClick={() => manageClaim(item._id, claim._id, "approved")}><Check size={15} /> Approve</button>
                            <button className="button button-small button-outline" onClick={() => manageClaim(item._id, claim._id, "rejected")}><X size={15} /> Reject</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))
              )}
            </div>
          </div>
        )}

        <div className="dashboard-content">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow">Your activity</span><h2>My reports</h2></div>
            <div className="tab-control">
              {["all", "lost", "found"].map((value) => (
                <button className={tab === value ? "active" : ""} onClick={() => setTab(value)} key={value}>
                  {value}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <Loader label="Loading your reports" />
          ) : error ? (
            <EmptyState title="Couldn’t load your reports" text={error} />
          ) : visible.length ? (
            <div className="item-grid">{visible.map((item) => <ItemCard item={item} key={item._id} />)}</div>
          ) : (
            <EmptyState
              title="No reports here"
              text={tab === "all" ? "When you report an item, it will appear here." : `You have no ${tab} item reports.`}
              action={<Link className="button button-primary" to="/report">Create a report</Link>}
            />
          )}
        </div>
      </div>
    </section>
  );
}

