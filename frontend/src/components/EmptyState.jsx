import { SearchX } from "lucide-react";

export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <SearchX size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

