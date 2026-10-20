"use client";

const STATUSES = ["Pending", "In Progress", "Resolved"];

/** Search box + status/category dropdowns. Calls onChange with the full filter object. */
export default function RequestFilters({ filters, onChange, categories = [] }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="filters">
      <input
        className="filter-search"
        placeholder="Search by ref, location or description…"
        value={filters.q}
        onChange={set("q")}
      />
      <select value={filters.status} onChange={set("status")}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <select value={filters.category} onChange={set("category")}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
    </div>
  );
}

export const EMPTY_FILTERS = { q: "", status: "", category: "" };

export const toQueryString = (filters) =>
  new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
