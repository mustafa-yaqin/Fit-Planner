// Helpers for answers and requests: send JSON (gzip, 304), read JSON, HttpError.
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { MAX_BODY } from '../config.js'

export class HttpError extends Error {
  constructor(status, code) {
    super(code)
    this.status = status
    this.code = code
  }
}

export const ip = (req) => req.socket.remoteAddress || 'unknown'

// A short fingerprint of an answer. The browser sends it back next time and,
// if nothing changed, the server answers "304" with no body (very cheap on a weak connection).
export const etagOf = (body) => '"' + createHash('sha1').update(JSON.stringify(body)).digest('base64url') + '"'

export function wantsGzip(req) {
  return /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''))
}

// Sends JSON. Big answers are compressed (helps a lot on a weak connection).
export function send(req, res, status, body, headers = {}) {
  if (status === 200 && headers.ETag && req.headers['if-none-match'] === headers.ETag) {
    res.writeHead(304, { ETag: headers.ETag, 'Cache-Control': 'no-cache' })
    return res.end()
  }
  let data = Buffer.from(body === undefined ? '' : JSON.stringify(body))
  const extra = { ...headers }
  if (data.length > 1024 && wantsGzip(req)) {
    data = gzipSync(data)
    extra['Content-Encoding'] = 'gzip'
    extra.Vary = 'Accept-Encoding'
  }
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extra,
  })
  res.end(data)
}

export function readJson(req, maxBody = MAX_BODY) {
  return new Promise((resolve, reject) => {
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
      return reject(new HttpError(415, 'json_required'))
    }
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBody) {
        reject(new HttpError(413, 'too_large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(new HttpError(400, 'bad_json'))
      }
    })
    req.on('error', () => reject(new HttpError(400, 'bad_request')))
  })
}
