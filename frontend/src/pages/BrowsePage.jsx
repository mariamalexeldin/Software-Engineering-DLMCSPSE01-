import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ItemCard from "../components/ItemCard.jsx";
import Loader from "../components/Loader.jsx";
import { categories } from "../utils/constants.js";

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filters = {
    search: params.get("search") || "",
    type: params.get("type") || "",
    category: params.get("category") || "",
    status: params.get("status") || "",
    sort: params.get("sort") || "newest",
    page: params.get("page") || "1"
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/items", { params: filters })
      .then(({ data }) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .catch((requestError) => setError(errorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [params.toString()]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const clear = () => setParams({});
  const activeCount = ["search", "type", "category", "status"].filter((key) => filters[key]).length;

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading browse-heading">
          <div>
            <span className="eyebrow">Campus reports</span>
            <h1>Browse lost &amp; found</h1>
            <p>Search current reports and help an item make its way back.</p>
          </div>
          <button className="button button-outline filter-toggle" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal size={17} /> Filters {activeCount ? `(${activeCount})` : ""}
          </button>
        </div>

        <div className="browse-layout">
          <aside className={`filter-panel ${mobileFilters ? "filter-panel-open" : ""}`}>
            <div className="filter-header">
              <h3>Filter reports</h3>
              <button className="icon-button filter-close" onClick={() => setMobileFilters(false)}><X /></button>
            </div>
            <label className="field-label">
              Search
              <span className="input-icon">
                <Search size={17} />
                <input
                  value={filters.search}
                  onChange={(event) => update("search", event.target.value)}
                  placeholder="Item or location"
                />
              </span>
            </label>
            <div className="filter-group">
              <span className="field-title">Report type</span>
              <div className="segment-control">
                {[
                  ["", "All"],
                  ["lost", "Lost"],
                  ["found", "Found"]
                ].map(([value, label]) => (
                  <button
                    className={filters.type === value ? "active" : ""}
                    onClick={() => update("type", value)}
                    key={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field-label">
              Category
              <select value={filters.category} onChange={(event) => update("category", event.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="field-label">
              Status
              <select value={filters.status} onChange={(event) => update("status", event.target.value)}>
                <option value="">Any status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="returned">Returned</option>
              </select>
            </label>
            {activeCount > 0 && <button className="clear-button" onClick={clear}>Clear all filters</button>}
          </aside>

          <div className="browse-results">
            <div className="results-bar">
              <p><strong>{pagination.total}</strong> {pagination.total === 1 ? "report" : "reports"} found</p>
              <select value={filters.sort} onChange={(event) => update("sort", event.target.value)} aria-label="Sort reports">
                <option value="newest">Newest posted</option>
                <option value="oldest">Oldest posted</option>
                <option value="incident">Recent incident date</option>
              </select>
            </div>
            {loading ? (
              <Loader label="Looking around campus" />
            ) : error ? (
              <EmptyState title="Couldn’t load reports" text={error} />
            ) : items.length ? (
              <>
                <div className="item-grid item-grid-results">
                  {items.map((item) => <ItemCard item={item} key={item._id} />)}
                </div>
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button disabled={pagination.page <= 1} onClick={() => update("page", pagination.page - 1)}>Previous</button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button disabled={pagination.page >= pagination.pages} onClick={() => update("page", pagination.page + 1)}>Next</button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Nothing matches just yet"
                text="Try changing a filter or using a broader search phrase."
                action={<button className="button button-primary" onClick={clear}>Clear filters</button>}
              />
            )}
          </div>
        </div>
      </div>
      {mobileFilters && <button className="filter-backdrop" onClick={() => setMobileFilters(false)} aria-label="Close filters" />}
    </section>
  );
}

