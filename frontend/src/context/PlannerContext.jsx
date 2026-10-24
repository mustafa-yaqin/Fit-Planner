// The one place that holds the planner data of the whole site:
// activities (shared + own), the routine, and their sync with the server.
// The details live in small files: ./planner/ (sync, routine actions, own activities) and ../offline/.
import { createContext, useContext, useMemo, useState } from 'react'
import useStored from '../utils/useStored.js'
import { writeLocal } from '../offline/store.js'
import useCatalog from '../offline/useCatalog.js'
import { useAuth } from './AuthContext.jsx'
import usePlannerSync, { DIRTY_KEY } from './planner/usePlannerSync.js'
import useRoutineActions from './planner/useRoutineActions.js'
import useOwnActivities from './planner/useOwnActivities.js'

const PlannerContext = createContext(null)

export function PlannerProvider({ children }) {
  const { user } = useAuth()
  const [rawRoutine, setRoutine] = useStored('fit.routine', [])
  const [mine, setMine] = useStored('fit.mine', []) // this user's own activities
  const [routineRemoved, setRoutineRemoved] = useStored('fit.routineRemoved', {}) // routine items removed, with the time
  const [mineDeleted, setMineDeleted] = useStored('fit.mineDeleted', []) // own activities deleted, not told to the server yet
  const [notice, setNotice] = useState('') // short message when something changed somewhere else
  const [targetText, setTargetText] = useState('60')

  // every routine change is first kept on the device, then sent to the server
  function changeRoutine(update) {
    setRoutine(update)
    if (user) writeLocal(DIRTY_KEY, user.id)
  }

  function changeMine(update) {
    setMine(update)
    if (user) writeLocal(DIRTY_KEY, user.id)
  }

  function remapRoutine(from, to) {
    changeRoutine((list) => list.map((item) => (item.id === from ? { ...item, id: to } : item)))
  }

  // activity list + waiting changes (see src/offline)
  const {
    activities: sharedActivities, pending, syncNow, saveActivity, deleteActivity, queueContact,
  } = useCatalog({ remapRoutine, onConflict: () => setNotice('syncConflict') })

  // everybody's activities + the user's own
  const activities = useMemo(() => [...sharedActivities, ...mine], [sharedActivities, mine])

  // activities the admin deleted disappear from every routine
  const routine = useMemo(
    () => rawRoutine.filter((item) => activities.some((a) => a.id === item.id)),
    [rawRoutine, activities]
  )

  // sync with the server (see planner/usePlannerSync.js)
  const { sync } = usePlannerSync({
    rawRoutine, mine, routineRemoved, mineDeleted,
    setRoutine, setMine, setRoutineRemoved, setMineDeleted, setNotice, syncNow, pending,
  })

  // actions used by the pages
  const { addToRoutine, removeFromRoutine, setRepeats, toggleDone, resetRoutine } = useRoutineActions({
    rawRoutine, changeRoutine, setRoutineRemoved,
  })
  const { saveMine, deleteMine } = useOwnActivities({ mine, changeMine, setMineDeleted })

  const value = {
    activities,
    sharedActivities,
    myActivities: mine,
    saveMine,
    deleteMine,
    routine,
    targetText,
    setTargetText,
    sync,
    notice,
    dismissNotice: () => setNotice(''),
    pending,
    syncNow,
    addToRoutine,
    removeFromRoutine,
    setRepeats,
    toggleDone,
    resetRoutine,
    saveActivity,
    deleteActivity,
    queueContact,
  }

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner() {
  return useContext(PlannerContext)
}
