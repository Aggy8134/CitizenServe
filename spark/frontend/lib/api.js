// Thin wrapper around fetch for talking to the Flask API.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const TOKEN_KEY = "sr_token";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Call the API and return parsed JSON. Throws an Error with the server's
 * message on non-2xx responses. Pass a FormData body for file uploads.
 */
export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const imageUrl = (filename) => `${API_URL}/uploads/${filename}`;

// SQLite stores UTC timestamps as "YYYY-MM-DD HH:MM:SS".
export function formatDate(value) {
  if (!value) return "";
  return new Date(value.replace(" ", "T") + "Z").toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
