"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";

export default function NewRequestPage() {
  const { ready } = useRequireAuth("citizen");
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", location: "", description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api("/api/categories").then((d) => setCategories(d.categories)).catch((e) => setError(e.message));
  }, []);

  // Free the object URL used for the image preview when it changes.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    if (image) body.append("image", image);

    try {
      const { request } = await api("/api/requests", { method: "POST", body });
      router.push(`/requests/${request.id}?created=1`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!ready) return <div className="empty-state">Loading…</div>;

  return (
    <div className="narrow">
      <div className="page-header">
        <div>
          <h1>Submit a Service Request</h1>
          <p className="muted">Tell us what&apos;s wrong and where. A photo helps our crews find it faster.</p>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <label className="field">
          <span>Category *</span>
          <select value={form.category} onChange={update("category")} required>
            <option value="" disabled>Select a category</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Location *</span>
          <input
            value={form.location}
            onChange={update("location")}
            placeholder="e.g. Corner of Moi Avenue & Kenyatta Ave, Nairobi"
            required
          />
        </label>

        <label className="field">
          <span>Description *</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={update("description")}
            placeholder="Describe the issue (at least 10 characters)"
            minLength={10}
            required
          />
        </label>

        <label className="field">
          <span>Photo (optional, max 5 MB)</span>
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImage} />
        </label>
        {preview && <img src={preview} alt="Preview" className="image-preview" />}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
