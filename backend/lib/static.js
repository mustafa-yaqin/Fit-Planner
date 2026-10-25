// Serves the built website (after `npm run build`) and the uploaded photos.
import { gzipSync } from 'node:zlib'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { DIST, UPLOADS } from '../config.js'
import { wantsGzip } from './http.js'

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json',
  '.ico': 'image/x-icon', '.txt': 'text/plain',
}
const COMPRESSIBLE = ['.html', '.js', '.css', '.svg', '.json', '.txt']
const zipped = new Map() // compressed copies are made once, then reused

export function serveUpload(res, pathname) {
  const name = pathname.slice('/uploads/'.length)
  const file = join(UPLOADS, name)
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(name) || !existsSync(file)) {
    res.writeHead(404)
    return res.end()
  }
  const type = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[name.split('.')[1]]
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=2592000, immutable' })
  res.end(readFileSync(file))
}

export function serveStatic(req, res, pathname) {
  if (!existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('API is running. For the website use "npm run dev" (or run "npm run build" first).')
  }
  let file = normalize(join(DIST, decodeURIComponent(pathname)))
  if (!file.startsWith(DIST)) {
    res.writeHead(403)
    return res.end()
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html') // SPA pages
  const ext = extname(file)
  const hashed = file.includes(join(DIST, 'assets'))
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
  }
  let data = readFileSync(file)
  if (COMPRESSIBLE.includes(ext) && data.length > 1024 && wantsGzip(req)) {
    const key = file + statSync(file).mtimeMs
    if (!zipped.has(key)) zipped.set(key, gzipSync(data))
    data = zipped.get(key)
    headers['Content-Encoding'] = 'gzip'
    headers.Vary = 'Accept-Encoding'
  }
  res.writeHead(200, headers)
  res.end(data)
}
