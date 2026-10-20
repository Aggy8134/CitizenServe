"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { homeFor, useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href={user ? homeFor(user) : "/"} className="brand">
          <span className="brand-mark">e</span>
          <span>CitizenServe</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link href="/admin">Dashboard</Link>
              ) : (
                <>
                  <Link href="/dashboard">My Requests</Link>
                  <Link href="/requests/new" className="btn btn-primary btn-sm">+ New Request</Link>
                </>
              )}
              <span className="nav-user" title={user.email}>
                {user.name}
                {user.role === "admin" && <span className="role-pill">Admin</span>}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
