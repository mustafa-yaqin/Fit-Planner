// Sends waiting changes to the server (and thereby into the database).
import { api } from '../utils/api.js'
import { isTemp } from './queue.js'

const UPLOAD_TIMEOUT = 40000

// A photo kept on the device (data: url) is uploaded first; the activity then points to the server url.
export async function uploadPhoto(op) {
  const image = op.activity.image
  if (op.kind !== 'save' || !image || !image.startsWith('data:')) return op
  const result = await api.post('/api/admin/upload', { data: image }, UPLOAD_TIMEOUT)
  return { ...op, activity: { ...op.activity, image: result.url } }
}

// Sends one item. Returns { activity } for saved activities.
export async function sendOp(op) {
  if (op.kind === 'contact') {
    await api.post('/api/contact', op.form)
    return null
  }
  if (op.kind === 'delete') {
    try {
      await api.del('/api/admin/activities/' + op.id)
    } catch (error) {
      if (error.status !== 404) throw error // 404 = already gone, fine
    }
    return null
  }
  const activity = op.activity
  const data = isTemp(activity.id)
    ? await api.post('/api/admin/activities', activity)
    : await api.put('/api/admin/activities/' + activity.id, activity)
  return { activity: data.activity }
}

// Goes through the whole waiting list.
// Returns what is still waiting (left), what was saved ({ from, activity }) and why it stopped (problem).
export async function flushQueue(queue) {
  const left = []
  const saved = []
  let problem = ''
  let conflict = false
  for (let i = 0; i < queue.length; i += 1) {
    let op = queue[i]
    try {
      op = await uploadPhoto(op)
      const result = await sendOp(op)
      if (result) saved.push({ from: op.activity.id, activity: result.activity })
    } catch (error) {
      const weak = error.code === 'network' || error.status >= 500 || error.status === 429
      if (weak) {
        problem = 'network'
        left.push(op, ...queue.slice(i + 1)) // keep the rest, try again later
        break
      }
      if (error.status === 401 || error.status === 403) {
        problem = 'login' // admin must log in again; keep it and go on with the others
        left.push(op)
      }
      if (error.status === 409) conflict = true // out of date: the newer version stays, this edit is dropped
      // any other answer (400, 404, 409) can never work: this change is dropped
    }
  }
  return { left, saved, problem, conflict }
}
