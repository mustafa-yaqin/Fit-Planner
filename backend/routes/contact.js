// Contact messages from the contact form (saved once, even if the browser sends them twice).
import { randomUUID } from 'node:crypto'
import { db, save } from '../database/db.js'
import { currentUser } from '../auth/guards.js'
import { checkContact } from '../validators/validate.js'
import { HttpError, ip, readJson } from '../lib/http.js'
import { limited } from '../lib/rateLimit.js'

export const contactRoutes = {
  'POST /api/contact': async (req) => {
    if (limited('contact:' + ip(req), 20, 3600000)) throw new HttpError(429, 'too_many')
    const input = checkContact(await readJson(req))
    if (input.error) throw new HttpError(400, 'invalid_' + input.error)
    // the same message sent twice (weak internet) is saved only once
    if (input.clientId && db.messages.some((m) => m.clientId === input.clientId)) {
      return { status: 201, body: { ok: true } }
    }
    const user = currentUser(req)
    db.messages.push({ id: randomUUID(), ...input, userId: user ? user.id : null, createdAt: new Date().toISOString() })
    save()
    return { status: 201, body: { ok: true } }
  },
}
