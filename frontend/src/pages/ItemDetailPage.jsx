import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  Trash2,
  UserRound
} from "lucide-react";
import api, { errorMessage, imageUrl } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatDate } from "../utils/constants.js";

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadItem = () => {
    setLoading(true);
    api
      .get(`/items/${id}`)
      .then(({ data }) => setItem(data.item))
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(loadItem, [id]);

  if (loading) return <Loader label="Opening report" />;
  if (error || !item) {
    return (
      <section className="page-section container">
        <EmptyState title="Report not found" text={error || "This report may have been removed."} />
      </section>
    );
  }

  const ownerId = item.createdBy?._id || item.createdBy;
  const ownsItem = user && (user.id === ownerId || user.role === "admin");

  const submitClaim = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/items/${id}` } });
      return;
    }
    setSending(true);
    try {
      await api.post(`/items/${id}/claims`, { message: claimMessage });
      setClaimMessage("");
      showToast("Your claim request was sent");
      loadItem();
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch(`/items/${id}/status`, { status });
      setItem((current) => ({ ...current, status: data.item.status }));
      showToast(`Item marked ${status}`);
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    }
  };

  const removeItem = async () => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/items/${id}`);
      showToast("Report deleted");
      navigate(user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (requestError) {
      showToast(errorMessage(requestError), "error");
    }
  };

  return (
    <section className="page-section detail-page">
      <div className="container">
        <Link className="back-link" to="/browse"><ArrowLeft size={16} /> Back to reports</Link>
        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-image">
              {item.image ? (
                <img src={imageUrl(item.image)} alt={item.title} />
              ) : (
                <div className="image-placeholder detail-placeholder"><span>{item.category?.slice(0, 1)}</span></div>
              )}
              <span className={`type-pill type-${item.type}`}>{item.type}</span>
            </div>
            <div className="detail-content">
              <div className="detail-title-row">
                <div>
                  <span className="eyebrow">{item.category}</span>
                  <h1>{item.title}</h1>
                </div>
                <span className={`large-status status-${item.status}`}>
                  <CheckCircle2 size={16} /> {item.status}
                </span>
              </div>
              <div className="detail-meta">
                <span><MapPin size={17} /><strong>{item.location}</strong><small>Location</small></span>
                <span><CalendarDays size={17} /><strong>{formatDate(item.incidentDate)}</strong><small>Date {item.type}</small></span>
                <span><UserRound size={17} /><strong>{item.createdBy?.name}</strong><small>Reported by</small></span>
              </div>
              <div className="detail-description">
                <h2>About this item</h2>
                <p>{item.description}</p>
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            {ownsItem ? (
              <div className="side-card">
                <span className="eyebrow">Manage report</span>
                <h3>This is your post</h3>
                <p>Keep the details and recovery status up to date.</p>
                <Link className="button button-primary button-full" to={`/items/${id}/edit`}>
                  <Pencil size={16} /> Edit report
                </Link>
                <div className="status-actions">
                  <button onClick={() => updateStatus("open")}>Open</button>
                  <button onClick={() => updateStatus(item.type === "found" ? "returned" : "resolved")}>
                    Mark {item.type === "found" ? "returned" : "resolved"}
                  </button>
                </div>
                <button className="danger-button" onClick={removeItem}><Trash2 size={16} /> Delete report</button>
              </div>
            ) : (
              <div className="side-card claim-card">
                <span className="eyebrow">Could this be yours?</span>
                <h3>Send a claim request</h3>
                {item.status === "open" ? (
                  <form onSubmit={submitClaim}>
                    <label className="field-label">
                      Explain how you can identify the item
                      <textarea
                        required
                        minLength="10"
                        maxLength="600"
                        rows="5"
                        value={claimMessage}
                        onChange={(event) => setClaimMessage(event.target.value)}
                        placeholder="Include a detail only the owner would know…"
                      />
                    </label>
                    <button className="button button-primary button-full" disabled={sending}>
                      <Send size={16} /> {sending ? "Sending…" : "Send claim"}
                    </button>
                  </form>
                ) : (
                  <div className="closed-note"><CheckCircle2 size={20} /> This report has been closed.</div>
                )}
              </div>
            )}

            <div className="side-card reporter-card">
              <span className="eyebrow">Reporter</span>
              <div className="reporter-avatar">{item.createdBy?.name?.slice(0, 1)}</div>
              <h3>{item.createdBy?.name}</h3>
              <a href={`mailto:${item.createdBy?.email}`}><Mail size={16} /> {item.createdBy?.email}</a>
              {item.contactPhone && <a href={`tel:${item.contactPhone}`}><Phone size={16} /> {item.contactPhone}</a>}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

