"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { homeFor, useRequireAuth } from "@/components/AuthProvider";
import StatusBadge from "@/components/StatusBadge";
import { api, formatDate, imageUrl } from "@/lib/api";

const STATUSES = ["Pending", "In Progress", "Resolved"];

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user, ready } = useRequireAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    setJustCreated(new URLSearchParams(window.location.search).has("created"));
  }, []);

  useEffect(() => {
    if (ready) api(`/api/requests/${id}`).then(setData).catch((e) => setError(e.message));
  }, [ready, id]);

  if (!ready || (!data && !error)) return <div className="empty-state">Loading…</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { request: req, history } = data;

  return (
    <div className="narrow">
      <Link href={homeFor(user)} className="back-link">← Back to dashboard</Link>

      {justCreated && (
        <div className="alert alert-success">
          Your request was submitted. Keep your reference number <b>{req.ref_code}</b> to track it.
        </div>
      )}

      <div className="card">
        <div className="detail-header">
          <div>
            <div className="mono muted">{req.ref_code}</div>
            <h1>{req.category}</h1>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <StatusStepper status={req.status} />

        <dl className="detail-grid">
          <dt>Location</dt><dd>{req.location}</dd>
          <dt>Submitted</dt><dd>{formatDate(req.created_at)}</dd>
          <dt>Last updated</dt><dd>{formatDate(req.updated_at)}</dd>
          {user.role === "admin" && (<><dt>Citizen</dt><dd>{req.citizen_name} ({req.citizen_email})</dd></>)}
        </dl>

        <h3 className="card-title">Description</h3>
        <p className="description">{req.description}</p>

        {req.image_path && (
          <a href={imageUrl(req.image_path)} target="_blank" rel="noreferrer">
            <img src={imageUrl(req.image_path)} alt="Attached photo" className="detail-image" />
          </a>
        )}
      </div>

      {user.role === "admin" && (
        <StatusUpdateForm request={req} onUpdated={setData} />
      )}

      <div className="card">
        <h3 className="card-title">Activity</h3>
        <ul className="timeline">
          {history.map((h, i) => (
            <li key={i}>
              <StatusBadge status={h.status} />
              <div>
                {h.note && <div>{h.note}</div>}
                <div className="muted small">
                  {formatDate(h.created_at)}{h.changed_by_name && ` · ${h.changed_by_name}`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Visual progress indicator: Pending → In Progress → Resolved. */
function StatusStepper({ status }) {
  const current = STATUSES.indexOf(status);
  return (
    <ol className="stepper">
      {STATUSES.map((s, i) => (
        <li key={s} className={i <= current ? "done" : ""}>
          <span className="step-dot">{i < current || status === "Resolved" ? "✓" : i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

/** Admin-only panel to move a request to a new status with an optional note. */
function StatusUpdateForm({ request, onUpdated }) {
  const [status, setStatus] = useState(request.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = await api(`/api/requests/${request.id}/status`, {
        method: "PATCH",
        body: { status, note },
      });
      onUpdated(data);
      setNote("");
      setMessage({ type: "success", text: "Status updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3 className="card-title">Update Status</h3>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="status-options">
        {STATUSES.map((s) => (
          <label key={s} className={`status-option ${status === s ? "selected" : ""}`}>
            <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
            {s}
          </label>
        ))}
      </div>
      <label className="field">
        <span>Note for the citizen (optional)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Crew dispatched to site" />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save update"}</button>
      </div>
    </form>
  );
}
