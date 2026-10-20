"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthProvider";
import RequestList from "@/components/RequestList";
import StatCards from "@/components/StatCards";
import { api } from "@/lib/api";

export default function CitizenDashboard() {
  const { user, ready } = useRequireAuth("citizen");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (ready) api("/api/stats").then(setStats).catch(() => {});
  }, [ready]);

  if (!ready) return <div className="empty-state">Loading…</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Hello, {user.name.split(" ")[0]} 👋</h1>
          <p className="muted">Here are the service requests you have submitted.</p>
        </div>
        <Link href="/requests/new" className="btn btn-primary">+ New Request</Link>
      </div>

      <StatCards stats={stats} />

      <RequestList
        emptyMessage={
          <>You haven&apos;t submitted any requests yet. <Link href="/requests/new">Submit one now</Link>.</>
        }
      />
    </>
  );
}
