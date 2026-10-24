// Tab "Messages": contact messages. Mark as read / delete.
import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { api } from '../../../utils/api.js'

export default function MessagesPanel({ onChange }) {
  const { t } = useLang()
  const [messages, setMessages] = useState(null)
  const [failed, setFailed] = useState('')

  const load = useCallback(() => {
    api
      .get('/api/admin/messages')
      .then((data) => setMessages(data.messages))
      .catch((error) => setFailed(error.code === 'network' ? 'eNetwork' : 'eServer'))
  }, [])

  useEffect(load, [load])

  async function act(run) {
    setFailed('')
    try {
      await run()
      load()
      if (onChange) onChange()
    } catch (error) {
      setFailed(error.code === 'network' ? 'eNetwork' : 'eServer')
    }
  }

  if (failed && !messages) return <p role="status" className="err">{t(failed)}</p>
  if (!messages) return <p role="status" className="text-navy/80">{t('loading')}</p>
  if (messages.length === 0) return <p className="card text-navy/80">{t('noMessages')}</p>

  return (
    <div className="grid gap-4">
      {failed && <p role="status" className="err">{t(failed)}</p>}
      {messages.map((m) => (
        <article key={m.id} className={'card ' + (m.read ? '' : 'border-tealDark')}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{m.subject}</h3>
              <p className="text-sm text-navy/80">
                {m.name} · <span dir="ltr">{m.email}</span> · {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
            {!m.read && <span className="rounded-full bg-teal px-3 py-1 text-xs font-bold">{t('statUnread')}</span>}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-navy/90">{m.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!m.read && (
              <button type="button" className="btn-dark !py-1.5 !min-h-[36px]" onClick={() => act(() => api.post('/api/admin/messages/' + m.id + '/read'))}>
                {t('markRead')}
              </button>
            )}
            <button
              type="button"
              className="btn-danger !py-1.5 !min-h-[36px]"
              onClick={() => window.confirm(t('confirmDelMsg')) && act(() => api.del('/api/admin/messages/' + m.id))}
            >
              {t('delete')}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
