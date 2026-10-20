"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, getToken, setToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from a stored token on first load.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const data = await api(path, { method: "POST", body });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    login: (email, password) => authenticate("/api/auth/login", { email, password }),
    register: (name, email, password) => authenticate("/api/auth/register", { name, email, password }),
    logout: () => {
      clearToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Redirects to /login if signed out, or to the right home page if the role doesn't match. */
export function useRequireAuth(role) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) router.replace("/login");
    else if (role && auth.user.role !== role) router.replace(homeFor(auth.user));
  }, [auth.loading, auth.user, role, router]);

  const ready = !auth.loading && auth.user && (!role || auth.user.role === role);
  return { ...auth, ready };
}

export const homeFor = (user) => (user?.role === "admin" ? "/admin" : "/dashboard");
