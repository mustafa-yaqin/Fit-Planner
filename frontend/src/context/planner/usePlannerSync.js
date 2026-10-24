// Keeps the routine and the user's own activities in sync with the server.
// Parts of this file:
//   1. "Ask the server again" triggers: internet back, tab focused, every minute
//   2. The big sync effect: sends what changed (merge on the server) and takes the newest state
// The server MERGES (it never just replaces), so an old open copy can not wipe a newer change.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../utils/api.js'
import { readLocal, removeLocal } from '../../offline/store.js'
import { uploadMinePhotos } from '../../offline/uploadMinePhotos.js'
import { useAuth } from '../AuthContext.jsx'

export const DIRTY_KEY = 'fit.routineDirty' // holds the user id while there are changes not sent yet
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export default function usePlannerSync({
  rawRoutine, mine, routineRemoved, mineDeleted,
  setRoutine, setMine, setRoutineRemoved, setMineDeleted, setNotice, syncNow, pending,
}) {
  const { user, expire } = useAuth()
  const [retry, setRetry] = useState(0) // +1 = "ask the server again"
  const [sync, setSync] = useState('idle') // idle | loading | saving | saved | error
  const [syncedUser, setSyncedUser] = useState(null) // user whose server data is loaded
  const hadUser = useRef(false)
  const latest = useRef(rawRoutine)
  latest.current = rawRoutine
  const latestMine = useRef(mine)
  latestMine.current = mine
  const latestRemoved = useRef(routineRemoved)
  latestRemoved.current = routineRemoved
  const latestDeleted = useRef(mineDeleted)
  latestDeleted.current = mineDeleted

  // Check the server again when: internet comes back, the visitor returns to this tab/window,
  // and once a minute while the page is open. So a change made by the admin shows up
  // without reopening the site. (If nothing changed the server answers with a tiny "304".)
  useEffect(() => {
    const again = () => setRetry((n) => n + 1)
    const onVisible = () => {
      if (document.visibilityState === 'visible') again()
    }
    window.addEventListener('online', again)
    window.addEventListener('focus', again)
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) again()
    }, 60000)
    return () => {
      window.removeEventListener('online', again)
      window.removeEventListener('focus', again)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [])

  // a weak connection can say "online" and still fail: while something is waiting, try every 20 seconds
  useEffect(() => {
    if (pending === 0 && sync !== 'error') return undefined
    const timer = setInterval(() => setRetry((n) => n + 1), 20000)
    return () => clearInterval(timer)
  }, [pending, sync])

  // 0) send waiting changes, then load the shared activity list
  useEffect(() => {
    syncNow()
  }, [syncNow, retry, user])

  // The routine and own activities. The server MERGES what we send with what it has
  // (it never just replaces it), then answers with the newest state, which we take.
  // So an old open copy of the site can never wipe a newer change (for example the admin's).
  useEffect(() => {
    if (!user) {
      setSyncedUser(null)
      setSync('idle')
      if (hadUser.current) {
        hadUser.current = false // just logged out: do not leave this account's data on screen
        removeLocal(DIRTY_KEY)
        setRoutine([])
        setMine([])
        setRoutineRemoved({})
        setMineDeleted([])
      }
      return undefined
    }
    hadUser.current = true
    const sentRoutine = rawRoutine
    const sentMine = mine
    const sentRemoved = routineRemoved
    const sentDeleted = mineDeleted
    const dirty = readLocal(DIRTY_KEY, null) === user.id
    let stop = false
    if (dirty) setSync('saving')
    else if (syncedUser !== user.id) setSync('loading')

    const timer = setTimeout(async () => {
      try {
        let planner = null
        let kept = 0
        if (dirty) {
          // photos kept on the device go to the server first; then the list is saved with their web addresses
          const done = await uploadMinePhotos(sentMine)
          if (done.length > 0) {
            setMine((list) =>
              list.map((a) => {
                const found = done.find((d) => d.id === a.id && d.from === a.image)
                return found ? { ...a, image: found.url } : a
              })
            )
            return
          }
          const result = await api.put('/api/planner', {
            routine: sentRoutine,
            myActivities: sentMine,
            routineRemoved: sentRemoved,
            deletedMine: sentDeleted,
          })
          planner = result.planner
          kept = result.kept || 0
        } else {
          planner = (await api.get('/api/planner')).planner
        }
        if (stop) return
        // if the visitor changed something while we were waiting, the next round will send it
        const unchanged =
          latest.current === sentRoutine &&
          latestMine.current === sentMine &&
          latestRemoved.current === sentRemoved &&
          latestDeleted.current === sentDeleted
        if (unchanged) {
          if (planner) {
            if (!sameJson(planner.routine, sentRoutine)) setRoutine(planner.routine)
            if (!sameJson(planner.myActivities, sentMine)) setMine(planner.myActivities)
          }
          if (dirty) {
            removeLocal(DIRTY_KEY)
            if (Object.keys(sentRemoved).length) setRoutineRemoved({})
            if (sentDeleted.length) setMineDeleted([])
          }
        }
        if (kept > 0) setNotice('syncKept')
        setSyncedUser(user.id)
        setSync('saved')
      } catch (error) {
        if (error.status === 401) expire()
        else setSync('error')
      }
    }, 700)
    return () => {
      stop = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, retry, rawRoutine, mine, routineRemoved, mineDeleted])

  return { sync }
}
