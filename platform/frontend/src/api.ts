async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  me: () => apiFetch('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getSettings: () => apiFetch('/api/settings'),
  saveSettings: (data: { turso_url: string; turso_token: string }) =>
    apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAccounts: () => apiFetch('/api/accounts'),
  getTransactions: (limit = 20) => apiFetch(`/api/transactions?limit=${limit}`),
  getSummary: (period?: string) =>
    apiFetch(`/api/summary${period ? `?period=${period}` : ''}`),
}
