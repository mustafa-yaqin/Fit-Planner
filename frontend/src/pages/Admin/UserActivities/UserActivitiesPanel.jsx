// Tab "Users' activities": see, edit and delete the own activities of every user.
import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { api } from '../../../utils/api.js'
import { uploadPhoto } from '../../../offline/sendQueue.js'
import { activityImage } from '../../Activities/images/index.js'
import Photo from '../../../components/Photo.jsx'
import ActivityForm from '../Manage/ActivityForm.jsx'

// "Users' activities" tab: the admin sees everything the users added and can edit or delete it.
export default function UserActivitiesPanel() {
  const { t, pick } = useLang()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null) // { owner, activity }
  const [failed, setFailed] = useState('')

  const load = useCallback(() => {
    api
      .get('/api/admin/user-activities')
      .then((data) => setItems(data.items))
      .catch((error) => setFailed(error.code === 'network' ? 'eNetwork' : 'eServer'))
  }, [])

  useEffect(load, [load])

  async function handleSave(activity) {
    const op = await uploadPhoto({ kind: 'save', activity })
    await api.put('/api/admin/user-activities/' + editing.owner + '/' + editing.activity.id, op.activity)
    setEditing(null)
    load()
    return 'sent'
  }

  async function handleDelete(item) {
    if (!window.confirm(t('confirmDel', { t: pick(item.activity, 'title') }))) return
    setFailed('')
    try {
      await api.del('/api/admin/user-activities/' + item.owner + '/' + item.activity.id)
      if (editing && editing.activity.id === item.activity.id) setEditing(null)
      load()
    } catch (error) {
      setFailed(error.code === 'network' ? 'eNetwork' : 'eServer')
    }
  }

  if (failed && !items) return <p role="status" className="err">{t(failed)}</p>
  if (!items) return <p role="status" className="text-navy/80">{t('loading')}</p>

  return (
    <div className="grid gap-6">
      {editing && (
        <ActivityForm editing={editing.activity} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {failed && <p role="status" className="err">{t(failed)}</p>}
      {items.length === 0 ? (
        <p className="card">{t('myActEmpty')}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="min-w-full text-sm">
            <caption className="sr-only">{t('tabUserActs')}</caption>
            <thead className="bg-sky">
              <tr>
                {['owner', 'photo', 'title', 'category', 'minutes', 'actions'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-start font-bold text-tealDark">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.owner + item.activity.id} className="border-t border-navy/10 transition hover:bg-sky/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.ownerName}</p>
                    <p dir="ltr" className="text-xs text-navy/80">{item.ownerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Photo src={activityImage(item.activity)} alt="" className="h-10 w-14 rounded object-cover" />
                  </td>
                  <th scope="row" className="px-4 py-3 text-start font-semibold">{pick(item.activity, 'title')}</th>
                  <td className="px-4 py-3">{t(item.activity.category)}</td>
                  <td className="px-4 py-3">{item.activity.durationMinutes}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="btn-dark"
                        aria-label={t('edit') + ' ' + pick(item.activity, 'title')}
                        onClick={() => {
                          setEditing({ owner: item.owner, activity: item.activity })
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        {t('edit')}
                      </button>
                      <button className="btn-danger" aria-label={t('del') + ' ' + pick(item.activity, 'title')} onClick={() => handleDelete(item)}>
                        {t('del')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
