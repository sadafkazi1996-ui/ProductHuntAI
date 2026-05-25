const BASE = '/arb/api'

async function req<T>(path: string, opts?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(BASE + path, opts)
    if (!r.ok) return null
    return r.json() as Promise<T>
  } catch { return null }
}

export const api = {
  get:    <T>(path: string)              => req<T>(path),
  post:   <T>(path: string, body: unknown) => req<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  delete: <T>(path: string)              => req<T>(path, { method: 'DELETE' }),
}
