// Admin panel (/admin): numbers on top and tabs (Activities, Users' activities, Messages, Users).
import { useCallback, useEffect, useState } from 'react'
import { useLang } from '../../context/LanguageContext.jsx'
import { api } from '../../utils/api.js'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import Manage from './Manage/Manage.jsx'
import MessagesPanel from './Messages/MessagesPanel.jsx'
import UsersPanel from './Users/UsersPanel.jsx'
import UserActivitiesPanel from './UserActivities/UserActivitiesPanel.jsx'

const tabs = ['tabActivities', 'tabUserActs', 'tabMessages', 'tabUsers']

// Admin panel: only the admin account can open it (see AdminRoute).
export default function Admin() {
  const { t } = useLang()
  const [tab, setTab] = useState('tabActivities')
  const [stats, setStats] = useState(null)

  const loadStats = useCallback(() => {
    api
      .get('/api/admin/stats')
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(loadStats, [loadStats])

  const cards = [
    ['statActivities', stats?.activities],
    ['statUsers', stats?.users],
    ['statMessages', stats?.messages],
    ['statUnread', stats?.unread],
  ]

  return (
    <>
      <PageBanner title={t('admin')} intro={t('adminIntro')} />
      <section className="container-site grid gap-6 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map(([key, value]) => (
            <div key={key} className="card card-hover text-center">
              <p className="text-3xl font-extrabold text-tealDark">{value ?? '–'}</p>
              <p className="text-sm font-semibold text-navy/80">{t(key)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label={t('admin')} className="flex flex-wrap gap-2">
            {tabs.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={tab === key ? 'btn-primary !py-2' : 'btn-dark !py-2'}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <a href="/api/admin/backup" download className="btn-outline !py-2">{t('backup')}</a>
        </div>

        <div role="tabpanel">
          {tab === 'tabActivities' && <Manage />}
          {tab === 'tabUserActs' && <UserActivitiesPanel />}
          {tab === 'tabMessages' && <MessagesPanel onChange={loadStats} />}
          {tab === 'tabUsers' && <UsersPanel onChange={loadStats} />}
        </div>
      </section>
    </>
  )
}
