"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RequestFilters, { EMPTY_FILTERS, toQueryString } from "./RequestFilters";
import RequestTable from "./RequestTable";

/** Fetches /api/requests with live filters. Used by both the citizen and admin dashboards. */
export default function RequestList({ showCitizen = false, emptyMessage }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/categories").then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  // Debounce so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      api(`/api/requests?${toQueryString(filters)}`)
        .then((d) => setRequests(d.requests))
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <div className="card">
      <RequestFilters filters={filters} onChange={setFilters} categories={categories} />
      {error && <div className="alert alert-error">{error}</div>}
      {requests === null ? (
        <div className="empty-state">Loading…</div>
      ) : (
        <RequestTable requests={requests} showCitizen={showCitizen} emptyMessage={emptyMessage} />
      )}
    </div>
  );
}
