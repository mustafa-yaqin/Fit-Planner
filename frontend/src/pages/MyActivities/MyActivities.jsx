// Page "My activities" (/my-activities): the user adds, edits and deletes their own activities.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import { usePlanner } from '../../context/PlannerContext.jsx'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import ActivityForm from '../Admin/Manage/ActivityForm.jsx'
import ActivityTable from '../Admin/Manage/ActivityTable.jsx'

// Every logged-in user can create their own activities here (only that user sees them).
export default function MyActivities() {
  const { t, pick } = useLang()
  const { myActivities, saveMine, deleteMine } = usePlanner()
  const [editing, setEditing] = useState(null)

  async function handleSave(activity) {
    saveMine(activity)
    setEditing(null)
    return 'sent'
  }

  function handleEdit(activity) {
    setEditing(activity)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(activity) {
    if (!window.confirm(t('confirmDel', { t: pick(activity, 'title') }))) return
    deleteMine(activity.id)
    if (editing && editing.id === activity.id) setEditing(null)
  }

  return (
    <>
      <PageBanner title={t('myActTitle')} intro={t('myActIntro')} />
      <section className="container-site grid gap-6 py-12">
        <ActivityForm editing={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
        {myActivities.length === 0 ? (
          <p className="card">{t('myActEmpty')}</p>
        ) : (
          <ActivityTable activities={myActivities} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        <div>
          <Link className="btn-dark" to="/routine">{t('routine')}</Link>
        </div>
      </section>
    </>
  )
}
