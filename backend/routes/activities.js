// The shared activity list: everybody reads it, only the admin changes it.
import { db, save } from '../database/db.js'
import { requireAdmin } from '../auth/guards.js'
import { checkActivity } from '../validators/validate.js'
import { HttpError, etagOf, readJson } from '../lib/http.js'

const nextActivityId = () => db.activities.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1

export const activityRoutes = {
  // ETag: a visitor who already has the newest list gets a tiny "not modified" answer
  'GET /api/activities': async () => {
    const body = { activities: db.activities }
    return { body, headers: { ETag: etagOf(body), 'Cache-Control': 'no-cache' } }
  },

  'POST /api/admin/activities': async (req) => {
    requireAdmin(req)
    const input = checkActivity(await readJson(req))
    if (input.error) throw new HttpError(400, 'invalid_' + input.error)
    // the same change sent twice (weak internet) is saved only once
    const same = input.clientId && db.activities.find((a) => a.clientId === input.clientId)
    if (same) return { status: 200, body: { activity: same } }
    const activity = { id: nextActivityId(), ...input, rev: 1 }
    db.activities.push(activity)
    save()
    return { status: 201, body: { activity } }
  },

  'PUT /api/admin/activities/:id': async (req, params) => {
    requireAdmin(req)
    const index = db.activities.findIndex((a) => String(a.id) === params.id)
    if (index === -1) throw new HttpError(404, 'not_found')
    const body = await readJson(req)
    const input = checkActivity(body)
    if (input.error) throw new HttpError(400, 'invalid_' + input.error)
    const old = db.activities[index]
    // The edit was made on an older copy (another device, or it waited offline):
    // do NOT overwrite the newer version, tell the browser to reload it.
    if ((Number.isInteger(body.rev) ? body.rev : 1) < (old.rev || 1)) throw new HttpError(409, 'conflict')
    const activity = { id: old.id, ...input, clientId: old.clientId || '', rev: (old.rev || 1) + 1 }
    db.activities[index] = activity
    save()
    return { body: { activity } }
  },

  'DELETE /api/admin/activities/:id': async (req, params) => {
    requireAdmin(req)
    const before = db.activities.length
    db.activities = db.activities.filter((a) => String(a.id) !== params.id)
    if (db.activities.length === before) throw new HttpError(404, 'not_found')
    save()
    return { body: { ok: true } }
  },
}
