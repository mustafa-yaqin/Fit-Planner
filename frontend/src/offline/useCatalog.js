// The shared activity list + the waiting list of changes.
// - the list is also kept in localStorage, so it shows without internet
// - changes made without internet wait in localStorage and are sent later
import { useCallback, useRef, useState } from 'react'
import { seedActivities } from '../data/activities.js'
import useStored from '../utils/useStored.js'
import { api } from '../utils/api.js'
import {
  LocalError, applyPending, getQueue, isTemp, newClientId, newTempId, saveQueue,
  withContact, withDelete, withSave, withoutSave,
} from './queue.js'
import { flushQueue, sendOp, uploadPhoto } from './sendQueue.js'
import { warmImages } from './warmImages.js'

export default function useCatalog({ remapRoutine, onConflict }) {
  const [activities, setActivities] = useStored('fit.catalog', seedActivities)
  const [pending, setPending] = useState(() => getQueue().length)
  const busy = useRef(false)
  const remap = useRef(remapRoutine)
  remap.current = remapRoutine
  const conflict = useRef(onConflict)
  conflict.current = onConflict

  function storeQueue(list) {
    if (!saveQueue(list)) throw new LocalError()
    setPending(list.length)
  }

  const applySaved = useCallback(
    (from, saved) => {
      setActivities((list) =>
        list.some((a) => a.id === from) ? list.map((a) => (a.id === from ? saved : a)) : [...list, saved]
      )
      if (from !== saved.id) remap.current(from, saved.id) // a new activity got its real number
    },
    [setActivities]
  )

  // 1) send what is waiting  2) load the newest list from the server
  const syncNow = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    try {
      const queue = getQueue()
      if (queue.length) {
        const result = await flushQueue(queue)
        result.saved.forEach((item) => applySaved(item.from, item.activity))
        saveQueue(result.left)
        setPending(result.left.length)
        if (result.conflict && conflict.current) conflict.current() // an edit waiting offline was out of date
        if (result.problem === 'network') return
      }
      const data = await api.get('/api/activities')
      if (Array.isArray(data.activities)) {
        const list = applyPending(data.activities, getQueue())
        setActivities(list)
        warmImages(list)
      }
    } catch {
      // no internet: keep the saved copy
    } finally {
      busy.current = false
    }
  }, [applySaved, setActivities])

  // admin: add or edit. Returns 'sent' or 'queued' (saved on the device, sent later).
  async function saveActivity(activity) {
    const isNew = !activities.some((a) => a.id === activity.id)
    let op = {
      kind: 'save',
      activity: isNew ? { ...activity, id: newTempId(), clientId: newClientId() } : activity,
    }
    try {
      op = await uploadPhoto(op)
      const result = await sendOp(op)
      storeQueue(withoutSave(getQueue(), op.activity.id))
      applySaved(op.activity.id, result.activity)
      return 'sent'
    } catch (error) {
      if (error.status === 409) syncNow() // changed elsewhere meanwhile: load the newest version
      if (error.code !== 'network') throw error
      storeQueue(withSave(getQueue(), op.activity))
      setActivities((list) =>
        list.some((a) => a.id === op.activity.id)
          ? list.map((a) => (a.id === op.activity.id ? op.activity : a))
          : [...list, op.activity]
      )
      return 'queued'
    }
  }

  async function deleteActivity(id) {
    let result = 'sent'
    if (isTemp(id)) {
      storeQueue(withDelete(getQueue(), id)) // never reached the server: just forget it
    } else {
      try {
        await api.del('/api/admin/activities/' + id)
        storeQueue(withoutSave(getQueue(), id))
      } catch (error) {
        if (error.code === 'network') {
          storeQueue(withDelete(getQueue(), id))
          result = 'queued'
        } else if (error.status !== 404) {
          throw error
        }
      }
    }
    setActivities((list) => list.filter((a) => a.id !== id))
    return result
  }

  function queueContact(form) {
    storeQueue(withContact(getQueue(), form))
  }

  return { activities, pending, syncNow, saveActivity, deleteActivity, queueContact }
}
