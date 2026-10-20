"use client";

import { useEffect, useState } from "react";
import Analytics from "@/components/Analytics";
import { useRequireAuth } from "@/components/AuthProvider";
import RequestList from "@/components/RequestList";
import StatCards from "@/components/StatCards";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const { ready } = useRequireAuth("admin");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (ready) api("/api/stats").then(setStats).catch(() => {});
  }, [ready]);

  if (!ready) return <div className="empty-state">Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">Monitor and manage all citizen service requests.</p>
        </div>
      </div>

      <StatCards stats={stats} />
      <Analytics stats={stats} />

      <h2 className="section-title">All Requests</h2>
      <RequestList showCitizen emptyMessage="No requests match your filters." />
    </>
  );
}
