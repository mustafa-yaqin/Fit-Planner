// Photo upload. The browser shrinks the photo first;
// here we only check that it really is an image.
// Every file remembers who uploaded it (db.uploads), so one user cannot use another user's photo.
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { UPLOADS, MAX_UPLOAD_BODY } from '../config.js'
import { db, save } from '../database/db.js'
import { requireAdmin, requireUser } from '../auth/guards.js'
import { HttpError, readJson } from '../lib/http.js'
import { limited } from '../lib/rateLimit.js'

const IMAGE_TYPES = [
  { ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', test: (b) => b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG' },
  { ext: 'webp', test: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP' },
]

const MAX_USER_PHOTOS = 30

async function storeImage(req, userId) {
  const body = await readJson(req, MAX_UPLOAD_BODY)
  const match = /^data:image\/[a-z+]+;base64,([A-Za-z0-9+/=]+)$/.exec(String(body?.data ?? ''))
  if (!match) throw new HttpError(400, 'invalid_image')
  const bytes = Buffer.from(match[1], 'base64')
  if (bytes.length < 100 || bytes.length > 1500 * 1024) throw new HttpError(400, 'invalid_image')
  const kind = IMAGE_TYPES.find((type) => type.test(bytes))
  if (!kind) throw new HttpError(400, 'invalid_image')
  mkdirSync(UPLOADS, { recursive: true })
  const name = randomUUID() + '.' + kind.ext
  writeFileSync(join(UPLOADS, name), bytes)
  db.uploads[name] = { userId, at: Date.now() }
  save()
  return { status: 201, body: { url: '/uploads/' + name } }
}

export const ownsUpload = (url, userId) => db.uploads[String(url).replace('/uploads/', '')]?.userId === userId

// Deletes photos of one user that no activity uses any more (older than olderThanMs).
export function removeUserPhotos(userId, usedUrls, olderThanMs) {
  const now = Date.now()
  for (const [name, info] of Object.entries(db.uploads)) {
    if (info.userId !== userId || now - info.at < olderThanMs || usedUrls.has('/uploads/' + name)) continue
    try {
      unlinkSync(join(UPLOADS, name))
    } catch {
      /* already gone */
    }
    delete db.uploads[name]
  }
}

export const uploadRoutes = {
  // the admin: no limit
  'POST /api/admin/upload': async (req) => {
    const admin = requireAdmin(req)
    return storeImage(req, admin.id)
  },

  // every logged-in user: photos for their own activities (limited)
  'POST /api/upload': async (req) => {
    const user = requireUser(req)
    if (user.role !== 'admin') {
      if (limited('upload:' + user.id, 30, 3600000)) throw new HttpError(429, 'too_many')
      const count = Object.values(db.uploads).filter((u) => u.userId === user.id).length
      if (count >= MAX_USER_PHOTOS) throw new HttpError(429, 'too_many_photos')
    }
    return storeImage(req, user.id)
  },
}
