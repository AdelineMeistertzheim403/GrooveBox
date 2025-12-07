const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function jsonFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erreur réseau");
  return data;
}

export async function register(email: string, password: string) {
  return jsonFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return jsonFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function savePatternRemote(token: string, name: string, data: any) {
  return jsonFetch("/patterns", {
    method: "POST",
    body: JSON.stringify({ name, data }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updatePatternRemote(token: string, id: number, name: string, data: any) {
  return jsonFetch(`/patterns/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, data }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listPatternsRemote(token: string) {
  return jsonFetch("/patterns", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function loadPatternRemote(token: string, id: number) {
  return jsonFetch(`/patterns/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
