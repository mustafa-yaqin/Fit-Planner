// Tab "Activities" of the admin panel: form + table of the shared activities.
import { useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'
import ActivityForm from './ActivityForm.jsx'
import ActivityTable from './ActivityTable.jsx'

// "Activities" tab of the admin panel: add, edit and delete activities.
export default function Manage() {
  const { t, pick } = useLang()
  const { sharedActivities: activities, saveActivity, deleteActivity } = usePlanner()
  const [editing, setEditing] = useState(null)
  const [failed, setFailed] = useState('')

  async function handleSave(activity) {
    const result = await saveActivity(activity) // throws if the server says no; the form shows it
    setEditing(null)
    return result
  }

  function handleEdit(activity) {
    setEditing(activity)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(activity) {
    if (!window.confirm(t('confirmDel', { t: pick(activity, 'title') }))) return
    setFailed('')
    try {
      await deleteActivity(activity.id)
      if (editing && editing.id === activity.id) setEditing(null)
    } catch (error) {
      setFailed(error.code === 'storage' ? 'eStorage' : 'eServer')
    }
  }

  return (
    <div className="grid gap-6">
      <ActivityForm editing={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      {failed && <p role="status" className="err">{t(failed)}</p>}
      <ActivityTable activities={activities} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
