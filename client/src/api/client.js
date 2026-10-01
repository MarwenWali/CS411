const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export async function request(path, options = {}) {
  const token = localStorage.getItem('fablab_token')
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('fablab:unauthorized'))
    throw new Error(payload?.error || 'Something went wrong')
  }
  return payload
}

export { API_URL }
