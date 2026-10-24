// One activity card (photo, title, minutes, buttons). Used on Home (Popular) and on the Activities page.
import Photo from './Photo.jsx'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext.jsx'
import { usePlanner } from '../context/PlannerContext.jsx'
import { activityImage } from '../pages/Activities/images/index.js'

export default function ActivityCard({ activity }) {
  const { t, pick } = useLang()
  const { routine, addToRoutine } = usePlanner()
  const added = routine.some((item) => item.id === activity.id)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white transition duration-300 ease-out hover:-translate-y-1.5 hover:border-tealDark/50 hover:shadow-xl hover:shadow-navy/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="overflow-hidden">
        <Photo
          src={activityImage(activity)}
          alt={pick(activity, 'title')}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-tealDark">{t(activity.category)}</p>
        <h3 className="text-lg font-bold">{pick(activity, 'title')}</h3>
        <p className="text-sm text-navy/80">{t('minPer', { n: activity.durationMinutes })}</p>
        <p className="text-sm text-navy/80">
          {t('equipment')}:{' '}
          {activity.equipmentRequired ? pick(activity, 'equipmentDescription') : t('noneNeeded')}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link className="btn-dark" to={'/activities/' + activity.id}>
            {t('details')}
          </Link>
          <button className="btn-primary" disabled={added} onClick={() => addToRoutine(activity.id)}>
            {added ? t('inRoutine') : t('add')}
          </button>
        </div>
      </div>
    </article>
  )
}
