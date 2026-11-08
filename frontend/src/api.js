export async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}
export const fmt = (n) => `AED ${Number(n || 0)}`
export function money(n, unit) {
  return unit ? `AED ${Number(n || 0)} / ${String(unit).replace(/^per\s+/i, '')}` : `AED ${Number(n || 0)}`
}
