/** Vite: define VITE_API_URL in frontend/.env (trailing slash optional). */
export const API_BASE_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}
