// The actions of the routine: add, remove, change repeats, mark done, reset.
// Every routine item remembers the time of its last change (t): the newest change wins.
import { validateRepeats } from '../../utils/validate.js'

export default function useRoutineActions({ rawRoutine, changeRoutine, setRoutineRemoved }) {
  // --- add one activity to the routine ---
  function addToRoutine(id) {
    changeRoutine((list) => {
      if (list.some((item) => item.id === id)) return list
      return [...list, { id: id, repeats: 1, completed: false, t: Date.now() }]
    })
    setRoutineRemoved((map) => {
      const next = { ...map }
      delete next[id]
      return next
    })
  }

  function removeFromRoutine(id) {
    changeRoutine((list) => list.filter((item) => item.id !== id))
    setRoutineRemoved((map) => ({ ...map, [id]: Date.now() }))
  }

  function setRepeats(id, value) {
    if (!validateRepeats(value)) return
    changeRoutine((list) =>
      list.map((item) => (item.id === id ? { ...item, repeats: Number(value), t: Date.now() } : item))
    )
  }

  function toggleDone(id) {
    changeRoutine((list) =>
      list.map((item) => (item.id === id ? { ...item, completed: !item.completed, t: Date.now() } : item))
    )
  }

  // --- "Reset routine" button: remove everything ---
  function resetRoutine() {
    const now = Date.now()
    setRoutineRemoved((map) => ({ ...map, ...Object.fromEntries(rawRoutine.map((item) => [item.id, now])) }))
    changeRoutine([])
  }

  return { addToRoutine, removeFromRoutine, setRepeats, toggleDone, resetRoutine }
}
