"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { homeFor, useAuth } from "./AuthProvider";

/** Shared login / register form. `mode` is "login" or "register". */
export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the form.
  useEffect(() => {
    if (!auth.loading && auth.user) router.replace(homeFor(auth.user));
  }, [auth.loading, auth.user, router]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = isRegister
        ? await auth.register(form.name, form.email, form.password)
        : await auth.login(form.email, form.password);
      router.push(homeFor(user));
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>{isRegister ? "Create an account" : "Welcome back"}</h1>
        <p className="muted">
          {isRegister ? "Register to submit and track service requests." : "Log in to manage your requests."}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {isRegister && (
          <label className="field">
            <span>Full name</span>
            <input value={form.name} onChange={update("name")} required autoFocus />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={update("email")} required autoFocus={!isRegister} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Please wait…" : isRegister ? "Register" : "Log in"}
        </button>

        <p className="muted center">
          {isRegister ? (
            <>Already have an account? <Link href="/login">Log in</Link></>
          ) : (
            <>New here? <Link href="/register">Create an account</Link></>
          )}
        </p>
        {!isRegister && (
          <p className="hint center">Demo admin: admin@city.gov / admin123</p>
        )}
      </form>
    </div>
  );
}
