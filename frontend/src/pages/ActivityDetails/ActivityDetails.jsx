// Page of ONE activity (/activities/:id): photo, details, "add to routine" button.
import Photo from '../../components/Photo.jsx'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import { usePlanner } from '../../context/PlannerContext.jsx'
import { activityImage } from '../Activities/images/index.js'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'

export default function ActivityDetails() {
  const { t, pick } = useLang()
  const { activities, routine, addToRoutine } = usePlanner()
  const { id } = useParams()
  const activity = activities.find((a) => String(a.id) === id)

  if (!activity) {
    return (
      <>
        <PageBanner title={t('notFoundAct')} />
        <div className="container-site py-12">
          <Link className="btn-primary" to="/activities">{t('back')}</Link>
        </div>
      </>
    )
  }

  const inRoutine = routine.some((item) => item.id === activity.id)

  return (
    <>
      <PageBanner tag={t(activity.category).toUpperCase()} title={pick(activity, 'title')} />
      <section className="container-site grid gap-8 py-12 md:grid-cols-2">
        <Photo src={activityImage(activity)} alt={pick(activity, 'title')} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <article className="grid content-start gap-5">
          <p className="text-lg text-navy/90">{pick(activity, 'description')}</p>
          <dl className="card grid grid-cols-[auto,1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="font-bold text-tealDark">{t('category')}</dt>
            <dd>{t(activity.category)}</dd>
            <dt className="font-bold text-tealDark">{t('duration')}</dt>
            <dd>{activity.durationMinutes}</dd>
            <dt className="font-bold text-tealDark">{t('equipment')}</dt>
            <dd>{activity.equipmentRequired ? pick(activity, 'equipmentDescription') : t('noneNeeded')}</dd>
          </dl>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-dark" to="/activities">{t('back')}</Link>
            <button className="btn-primary" disabled={inRoutine} onClick={() => addToRoutine(activity.id)}>
              {inRoutine ? t('inRoutine') : t('add')}
            </button>
          </div>
        </article>
      </section>
    </>
  )
}
