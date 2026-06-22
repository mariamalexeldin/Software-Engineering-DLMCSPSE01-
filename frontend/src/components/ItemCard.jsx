import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { imageUrl } from "../api/client.js";
import { formatRelativeDate } from "../utils/constants.js";

export default function ItemCard({ item }) {
  return (
    <article className="item-card">
      <Link className="item-image" to={`/items/${item._id}`}>
        {item.image ? (
          <img src={imageUrl(item.image)} alt={item.title} />
        ) : (
          <div className="image-placeholder" aria-label="No item image">
            <span>{item.category?.slice(0, 1)}</span>
          </div>
        )}
        <span className={`type-pill type-${item.type}`}>{item.type}</span>
        {item.status !== "open" && <span className="status-pill">{item.status}</span>}
      </Link>
      <div className="item-card-body">
        <div className="card-eyebrow">{item.category}</div>
        <Link to={`/items/${item._id}`} className="card-title-link">
          <h3>{item.title}</h3>
          <ArrowUpRight size={18} />
        </Link>
        <p>{item.description}</p>
        <div className="item-meta">
          <span><MapPin size={15} /> {item.location}</span>
          <span><CalendarDays size={15} /> {formatRelativeDate(item.incidentDate)}</span>
        </div>
      </div>
    </article>
  );
}

