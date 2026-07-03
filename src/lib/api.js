const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

export async function fetchWeddingData() {
  return apiFetch("/api/wedding");
}

export async function publishWedding({ password, coupleName, weddingDate, guests }) {
  await apiFetch("/api/wedding/publish", {
    method: "POST",
    body: JSON.stringify({ password, coupleName, weddingDate, guests }),
  });
}
