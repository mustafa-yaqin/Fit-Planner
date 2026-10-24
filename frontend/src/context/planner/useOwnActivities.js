// The user's OWN activities (page "My activities"): save and delete.
// A deleted id is remembered (mineDeleted) until the server knows about it.
export default function useOwnActivities({ mine, changeMine, setMineDeleted }) {
  function saveMine(activity) {
    const exists = mine.some((a) => a.id === activity.id)
    const item = exists ? activity : { ...activity, id: 'my-' + Date.now() }
    changeMine((list) => (exists ? list.map((a) => (a.id === item.id ? item : a)) : [...list, item]))
  }

  function deleteMine(id) {
    changeMine((list) => list.filter((a) => a.id !== id))
    setMineDeleted((list) => (list.includes(id) ? list : [...list, id]))
  }

  return { saveMine, deleteMine }
}
