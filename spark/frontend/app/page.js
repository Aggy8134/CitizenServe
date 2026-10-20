"use client";

import Link from "next/link";
import { homeFor, useAuth } from "@/components/AuthProvider";

const SERVICES = [
  { icon: "💡", title: "Streetlights", text: "Broken or flickering lights" },
  { icon: "🚰", title: "Water Supply", text: "Leaks, outages, low pressure" },
  { icon: "🗑️", title: "Garbage", text: "Missed or overflowing collection" },
  { icon: "🛣️", title: "Roads", text: "Potholes and damaged roads" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <h1>Report a public service issue in minutes</h1>
        <p>
          Submit requests for broken streetlights, water problems, garbage collection and more —
          then track progress from <b>Pending</b> to <b>Resolved</b>.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link href={homeFor(user)} className="btn btn-primary">Go to dashboard</Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary">Get started</Link>
              <Link href="/login" className="btn btn-ghost">I have an account</Link>
            </>
          )}
        </div>
      </section>

      <section className="service-grid">
        {SERVICES.map((s) => (
          <div key={s.title} className="card service-card">
            <div className="service-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="steps card">
        <h2>How it works</h2>
        <ol>
          <li><b>Register</b> with your name and email.</li>
          <li><b>Submit</b> a request with the category, location and an optional photo.</li>
          <li><b>Track</b> it with your reference number as the city works on it.</li>
        </ol>
      </section>
    </>
  );
}
