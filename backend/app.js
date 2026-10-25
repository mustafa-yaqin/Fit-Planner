// The web server: security headers, /api, /uploads and the built website.
import { createServer } from 'node:http'
import { routes } from './routes/index.js'
import { findRoute } from './lib/router.js'
import { HttpError, send } from './lib/http.js'
import { serveStatic, serveUpload } from './lib/static.js'

// Websites (besides this server itself) that may call the API, for example your Vercel site:
//   ALLOWED_ORIGINS=https://fit-planner-code.vercel.app
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)

// What the page may load (protects against injected scripts). Pexels = the photos.
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.pexels.com", "font-src 'self' data:",
  "connect-src 'self' https://images.pexels.com", "worker-src 'self'", "object-src 'none'",
  "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ')

async function handleApi(req, res, pathname) {
  // Block other websites from sending requests with the visitor's cookie.
  const origin = req.headers.origin
  if (origin && req.method !== 'GET') {
    let sameSite = false
    try {
      sameSite = new URL(origin).host === req.headers.host
    } catch {
      sameSite = false
    }
    if (!sameSite && !ALLOWED_ORIGINS.includes(origin)) return send(req, res, 403, { error: 'forbidden_origin' })
  }
  const found = findRoute(routes, req.method, pathname)
  if (!found) return send(req, res, 404, { error: 'not_found' })
  try {
    const result = await found.handler(req, found.params)
    if (result.body === undefined && !result.status) return send(req, res, 200, result)
    send(req, res, result.status || 200, result.body, result.headers)
  } catch (error) {
    if (error instanceof HttpError) return send(req, res, error.status, { error: error.code })
    console.error('Server error:', error)
    send(req, res, 500, { error: 'server_error' })
  }
}

export function createApp() {
  return createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'same-origin')
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.setHeader('Content-Security-Policy', CSP)
    let pathname = '/'
    try {
      pathname = new URL(req.url, 'http://localhost').pathname
    } catch {
      res.writeHead(400)
      return res.end()
    }
    if (pathname.startsWith('/api/')) return handleApi(req, res, pathname)
    if (pathname.startsWith('/uploads/')) return serveUpload(res, pathname)
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      return res.end()
    }
    try {
      serveStatic(req, res, pathname)
    } catch {
      res.writeHead(400)
      res.end()
    }
  })
}
