"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/api";

/** Clickable list of requests. `showCitizen` adds a "Submitted by" column (admin view). */
export default function RequestTable({ requests, showCitizen = false, emptyMessage }) {
  const router = useRouter();

  if (requests.length === 0) {
    return <div className="empty-state">{emptyMessage || "No requests found."}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Category</th>
            <th>Location</th>
            {showCitizen && <th>Submitted by</th>}
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} onClick={() => router.push(`/requests/${r.id}`)}>
              <td className="mono">{r.ref_code}</td>
              <td>{r.category}</td>
              <td className="truncate">{r.location}</td>
              {showCitizen && <td>{r.citizen_name}</td>}
              <td className="muted">{formatDate(r.created_at)}</td>
              <td><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
