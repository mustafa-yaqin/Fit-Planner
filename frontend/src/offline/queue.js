// The "waiting list": changes made without internet are kept here (localStorage)
// and sent to the server later. Each item is one of:
//   { kind: 'save', activity }      admin added or edited an activity (photo may be a data: url)
//   { kind: 'delete', id }          admin deleted an activity
//   { kind: 'contact', form }       a contact message
import { readLocal, writeLocal } from './store.js'

const KEY = 'fit.queue'

export class LocalError extends Error {
  constructor() {
    super('storage')
    this.code = 'storage' // the device has no space left
  }
}

export const getQueue = () => readLocal(KEY, [])

export function saveQueue(list) {
  return writeLocal(KEY, list)
}

export const isTemp = (id) => String(id).startsWith('tmp-')
export const newTempId = () => 'tmp-' + Date.now()
export const newClientId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now() + '-' + Math.random().toString(36).slice(2)

const sameSave = (op, id) => op.kind === 'save' && op.activity.id === id

export function withoutSave(queue, id) {
  return queue.filter((op) => !sameSave(op, id))
}

// the newest version of an activity replaces the older waiting one
export function withSave(queue, activity) {
  if (queue.some((op) => sameSave(op, activity.id))) {
    return queue.map((op) => (sameSave(op, activity.id) ? { kind: 'save', activity } : op))
  }
  return [...queue, { kind: 'save', activity }]
}

export function withDelete(queue, id) {
  const cleaned = withoutSave(queue, id)
  return isTemp(id) ? cleaned : [...cleaned, { kind: 'delete', id }]
}

export const withContact = (queue, form) => [...queue, { kind: 'contact', form }]

// Puts the waiting changes on top of the list from the server,
// so the screen never loses something that is not sent yet.
export function applyPending(list, queue) {
  let result = list
  for (const op of queue) {
    if (op.kind === 'delete') {
      result = result.filter((a) => a.id !== op.id)
    } else if (op.kind === 'save') {
      const exists = result.some((a) => a.id === op.activity.id)
      result = exists
        ? result.map((a) => (a.id === op.activity.id ? op.activity : a))
        : [...result, op.activity]
    }
  }
  return result
}
