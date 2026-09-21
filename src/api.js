const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const API = {
  base: API_BASE,
  news: `${API_BASE}/news/`,
  featured: `${API_BASE}/news/featured/`,
  important: `${API_BASE}/news/important/`,
  currency: `${API_BASE}/news/currency/`,
  login: `${API_BASE}/auth/login/`,
  register: `${API_BASE}/auth/register/`,
  me: `${API_BASE}/auth/me/`,
  refresh: `${API_BASE}/auth/refresh/`,
  favorites: `${API_BASE}/news/favorites/`,
  view: (id) => `${API_BASE}/news/${id}/view/`,
  like: (id) => `${API_BASE}/news/${id}/like/`,
};

export function getAccessToken() {
  return localStorage.getItem('kontur-access-token');
}

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(url, { ...options, headers });
  if (response.status === 401 && localStorage.getItem('kontur-refresh-token')) {
    const refreshResponse = await fetch(API.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: localStorage.getItem('kontur-refresh-token') }),
    });
    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();
      localStorage.setItem('kontur-access-token', tokens.access);
      if (tokens.refresh) localStorage.setItem('kontur-refresh-token', tokens.refresh);
      headers.set('Authorization', `Bearer ${tokens.access}`);
      response = await fetch(url, { ...options, headers });
    }
  }
  return response;
}

export async function jsonOrError(response) {
  let data = null;
  try { data = await response.json(); } catch { /* empty */ }
  if (!response.ok) {
    const message = data?.detail || data?.message || Object.values(data || {})?.flat?.()[0] || `HTTP ${response.status}`;
    throw new Error(String(message));
  }
  return data;
}
