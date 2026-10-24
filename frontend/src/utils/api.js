// Talks to the Node backend (server/index.js). Every call goes to /api/...
export class ApiError extends Error {
  constructor(status, code) {
    super(code)
    this.status = status
    this.code = code // 'network' = the server could not be reached (or answered too slowly)
  }
}

// Is the backend available? "off" = website only (no accounts, no admin, no calls to /api).
//   VITE_API_MODE=off  -> always off        VITE_API_MODE=on  -> always on
//   not set            -> off on *.vercel.app (Vercel hosts only the website), on everywhere else
const MODE = import.meta.env.VITE_API_MODE
export const API_OFF =
  MODE === 'off' ||
  (MODE !== 'on' && typeof location !== 'undefined' && location.hostname.endsWith('.vercel.app'))

const TIMEOUT = 12000 // on a weak connection a call must not hang forever

async function request(method, path, body, timeout = TIMEOUT) {
  if (API_OFF) throw new ApiError(0, 'network') // website-only mode: never call the server
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let res
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new ApiError(0, 'network')
  } finally {
    clearTimeout(timer)
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || 'server_error')
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, timeout) => request('POST', path, body ?? {}, timeout),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
}
