// Activities page (/activities): the list with search, filters and sorting.
import { useState } from 'react'
import { useLang } from '../../context/LanguageContext.jsx'
import { usePlanner } from '../../context/PlannerContext.jsx'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import ActivityCard from '../../components/ActivityCard.jsx'
import ActivityFilters from './Filters/ActivityFilters.jsx'

const startFilters = { q: '', cat: '', sort: 'asc', noEquip: false }

export default function Activities() {
  const { t, pick } = useLang()
  const { activities } = usePlanner()
  const [filters, setFilters] = useState(startFilters)

  const search = filters.q.trim().toLowerCase()

  const list = activities
    .filter((a) => {
      const text = (pick(a, 'title') + ' ' + pick(a, 'description')).toLowerCase()
      const matchSearch = !search || text.includes(search)
      const matchCategory = !filters.cat || a.category === filters.cat
      const matchEquipment = !filters.noEquip || !a.equipmentRequired
      return matchSearch && matchCategory && matchEquipment
    })
    .sort((x, y) =>
      filters.sort === 'asc' ? x.durationMinutes - y.durationMinutes : y.durationMinutes - x.durationMinutes
    )

  return (
    <>
      <PageBanner title={t('activities')} intro={t('activitiesIntro')} />
      <section className="container-site grid gap-6 py-12">
        <ActivityFilters filters={filters} setFilters={setFilters} onReset={() => setFilters(startFilters)} />
        <p role="status" className="text-sm font-semibold text-navy/80">
          {t('shown', { n: list.length, m: activities.length })}
        </p>
        {list.length === 0 ? (
          <p className="card">{t('noMatch')}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
