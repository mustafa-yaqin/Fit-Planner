// Admin only: see, edit and delete the own activities of every user.
import { db, save } from '../database/db.js'
import { requireAdmin } from '../auth/guards.js'
import { checkActivity } from '../validators/validate.js'
import { HttpError, readJson } from '../lib/http.js'

function findMine(owner, id) {
  const mine = db.planners[owner]?.myActivities
  const index = mine ? mine.findIndex((a) => a.id === id) : -1
  if (index === -1) throw new HttpError(404, 'not_found')
  return { mine, index }
}

export const userActivityRoutes = {
  'GET /api/admin/user-activities': async (req) => {
    requireAdmin(req)
    const list = []
    for (const user of db.users) {
      for (const activity of db.planners[user.id]?.myActivities || []) {
        list.push({ owner: user.id, ownerName: user.name, ownerEmail: user.email, activity })
      }
    }
    return { body: { items: list } }
  },

  'PUT /api/admin/user-activities/:owner/:id': async (req, params) => {
    requireAdmin(req)
    const { mine, index } = findMine(params.owner, params.id)
    const body = await readJson(req)
    const input = checkActivity(body)
    if (input.error) throw new HttpError(400, 'invalid_' + input.error)
    const old = mine[index]
    // the user changed it after the admin opened it: do not overwrite their newer version
    if ((Number.isInteger(body.rev) ? body.rev : 1) < (old.rev || 1)) throw new HttpError(409, 'conflict')
    mine[index] = { ...input, id: params.id, clientId: '', rev: (old.rev || 1) + 1 }
    save()
    return { body: { activity: mine[index] } }
  },

  'DELETE /api/admin/user-activities/:owner/:id': async (req, params) => {
    requireAdmin(req)
    const { mine, index } = findMine(params.owner, params.id)
    mine.splice(index, 1)
    // remember the deletion, so an old open copy of the site can not bring it back
    const planner = db.planners[params.owner]
    planner.deletedMine = [...(planner.deletedMine || []), params.id].slice(-300)
    save()
    return { body: { ok: true } }
  },
}
