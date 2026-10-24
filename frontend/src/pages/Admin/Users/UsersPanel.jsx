// Tab "Users": list of accounts. The admin can delete a user.
import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { api } from '../../../utils/api.js'

export default function UsersPanel({ onChange }) {
  const { t } = useLang()
  const [users, setUsers] = useState(null)
  const [failed, setFailed] = useState('')

  const load = useCallback(() => {
    api
      .get('/api/admin/users')
      .then((data) => setUsers(data.users))
      .catch((error) => setFailed(error.code === 'network' ? 'eNetwork' : 'eServer'))
  }, [])

  useEffect(load, [load])

  async function remove(user) {
    if (!window.confirm(t('confirmDelUser', { n: user.name }))) return
    setFailed('')
    try {
      await api.del('/api/admin/users/' + user.id)
      load()
      if (onChange) onChange()
    } catch (error) {
      setFailed(error.code === 'network' ? 'eNetwork' : 'eServer')
    }
  }

  if (failed && !users) return <p role="status" className="err">{t(failed)}</p>
  if (!users) return <p role="status" className="text-navy/80">{t('loading')}</p>

  return (
    <div className="grid gap-3">
      {failed && <p role="status" className="err">{t(failed)}</p>}
      <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="min-w-full text-sm">
          <caption className="sr-only">{t('tabUsers')}</caption>
          <thead className="bg-sky">
            <tr>
              {['name', 'email', 'role', 'joined', 'actions'].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-bold text-tealDark">{t(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-navy/10 transition hover:bg-sky/70">
                <th scope="row" className="px-4 py-3 text-start font-semibold">{u.name}</th>
                <td className="px-4 py-3" dir="ltr">{u.email}</td>
                <td className="px-4 py-3">{u.role === 'admin' ? t('roleAdmin') : t('roleUser')}</td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button type="button" className="btn-danger !py-1.5 !min-h-[36px]" onClick={() => remove(u)}>
                      {t('delete')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
