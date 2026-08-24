const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export function apiUrl(path) {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}

export { API_URL };
