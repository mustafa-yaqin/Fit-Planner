// The routine and the own activities of the logged-in user.
//
// IMPORTANT: a save is a MERGE, never "replace everything with what the browser has".
// A browser with an old copy (site left open, second device, changes made offline)
// can therefore never wipe a newer change, for example one made by the admin.
//   - own activities: every activity has a revision number (rev). An edit is only
//     accepted if it was made on the newest revision. Deleted ids are remembered.
//   - routine: every item has the time of its last change (t); the newest change wins,
//     and removals are remembered with their time.
import { db, save } from '../database/db.js'
import { requireUser } from '../auth/guards.js'
import { checkMine, checkPlanner } from '../validators/validate.js'
import { HttpError, etagOf, readJson } from '../lib/http.js'
import { ownsUpload, removeUserPhotos } from './upload.js'

const MAX_ITEMS = 300

function stateOf(planner) {
  return {
    routine: planner?.routine || [],
    myActivities: planner?.myActivities || [],
  }
}

// the content of an activity (without bookkeeping fields), for "did it really change?"
const fields = (a) =>
  JSON.stringify(Object.entries(a).filter(([key]) => key !== 'rev' && key !== 'clientId').sort())

// ---- own activities (rev) ----
function mergeMine(serverList, deleted, incoming, incomingDeleted) {
  const result = serverList.map((a) => ({ ...a, rev: a.rev || 1 }))
  const gone = new Set(deleted)
  let kept = 0 // how many of the user's edits were NOT accepted (changed elsewhere meanwhile)

  for (const id of incomingDeleted) {
    gone.add(id)
    const at = result.findIndex((a) => a.id === id)
    if (at !== -1) result.splice(at, 1)
  }
  for (const item of incoming) {
    const at = result.findIndex((a) => a.id === item.id)
    if (at !== -1) {
      const current = result[at]
      const base = item.rev || 1 // the revision the browser based its edit on
      if (base < current.rev) {
        if (fields(item) !== fields(current)) kept += 1 // the newer version wins
      } else if (fields(item) !== fields(current)) {
        result[at] = { ...item, rev: current.rev + 1 }
      }
    } else if (gone.has(item.id)) {
      kept += 1 // deleted meanwhile (for example by the admin): do not bring it back
    } else {
      result.push({ ...item, rev: 1 })
    }
  }
  return { list: result.slice(0, 50), deleted: [...gone].slice(-MAX_ITEMS), kept }
}

// ---- routine (t) ----
function mergeRoutine(serverList, removed, incoming, incomingRemoved) {
  const items = new Map(serverList.map((r) => [String(r.id), { ...r, t: r.t || 0 }]))
  const tomb = { ...removed }

  for (const [id, t] of Object.entries(incomingRemoved)) {
    const item = items.get(id)
    if (item && item.t <= t) items.delete(id)
    if (!item || item.t <= t) tomb[id] = Math.max(tomb[id] || 0, t)
  }
  for (const r of incoming) {
    const id = String(r.id)
    if ((tomb[id] || 0) >= r.t && (tomb[id] || 0) > 0) continue // removed later than this change
    const current = items.get(id)
    if (!current || r.t >= current.t) {
      items.set(id, r)
      delete tomb[id]
    }
  }
  const list = [...items.values()].slice(0, MAX_ITEMS)
  const entries = Object.entries(tomb).sort((a, b) => b[1] - a[1]).slice(0, MAX_ITEMS)
  return { list, removed: Object.fromEntries(entries) }
}

const cleanTimes = (map) => {
  const now = Date.now() + 60000 // a wrong clock far in the future must not win forever
  const result = {}
  if (map && typeof map === 'object' && !Array.isArray(map)) {
    for (const [id, t] of Object.entries(map).slice(0, MAX_ITEMS)) {
      if (Number.isFinite(Number(t))) result[String(id).slice(0, 40)] = Math.min(Number(t), now)
    }
  }
  return result
}

export const plannerRoutes = {
  // The newest state. Answers "304" (empty) when nothing changed since the last time.
  'GET /api/planner': async (req) => {
    const user = requireUser(req)
    const saved = db.planners[user.id]
    const body = { planner: saved ? stateOf(saved) : null }
    // private + Vary: another account on the same browser/proxy never gets this answer
    return { body, headers: { ETag: etagOf(body), 'Cache-Control': 'private, no-cache', Vary: 'Cookie' } }
  },

  'PUT /api/planner': async (req) => {
    const user = requireUser(req)
    const body = await readJson(req)
    const planner = db.planners[user.id] || {}

    // photos allowed: the ones this user uploaded + the ones already on their activities (e.g. set by the admin)
    const before = new Set((planner.myActivities || []).map((a) => a.image))
    const mine = checkMine(body?.myActivities, (url) => before.has(url) || ownsUpload(url, user.id))
    if (!checkPlanner(body) || !mine) throw new HttpError(400, 'invalid_planner')

    // the revision of each edited activity, as the browser knew it
    const raw = Array.isArray(body.myActivities) ? body.myActivities : []
    const incomingMine = mine.map((a, i) => ({ ...a, rev: Number.isInteger(raw[i]?.rev) ? raw[i].rev : 1 }))
    const incomingDeleted = (Array.isArray(body.deletedMine) ? body.deletedMine : [])
      .map((id) => String(id))
      .filter((id) => /^my-[0-9a-z-]{1,30}$/.test(id))
      .slice(0, MAX_ITEMS)

    const now = Date.now() + 60000
    const incomingRoutine = body.routine.map((r) => ({
      id: r.id,
      repeats: r.repeats,
      completed: r.completed,
      t: Math.min(Number(r.t) || 0, now),
    }))

    const mergedMine = mergeMine(planner.myActivities || [], planner.deletedMine || [], incomingMine, incomingDeleted)
    const mergedRoutine = mergeRoutine(
      planner.routine || [],
      planner.routineRemoved || {},
      incomingRoutine,
      cleanTimes(body.routineRemoved)
    )

    db.planners[user.id] = {
      routine: mergedRoutine.list,
      routineRemoved: mergedRoutine.removed,
      myActivities: mergedMine.list,
      deletedMine: mergedMine.deleted,
      updatedAt: new Date().toISOString(),
    }
    if (user.role !== 'admin') removeUserPhotos(user.id, new Set(mergedMine.list.map((a) => a.image)), 3600000)
    save()

    // the browser takes this newest state (it may contain changes made elsewhere)
    return { body: { ok: true, planner: stateOf(db.planners[user.id]), kept: mergedMine.kept } }
  },
}
