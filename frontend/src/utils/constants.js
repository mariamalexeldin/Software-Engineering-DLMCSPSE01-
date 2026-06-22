export const categories = [
  "ID & Cards",
  "Electronics",
  "Wallets & Bags",
  "Books & Notes",
  "Keys",
  "Clothing",
  "Accessories",
  "Other"
];

export function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatRelativeDate(value) {
  const elapsed = Date.now() - new Date(value).getTime();
  const days = Math.floor(elapsed / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

