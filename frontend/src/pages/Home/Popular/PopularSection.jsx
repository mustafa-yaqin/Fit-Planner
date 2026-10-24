// Home section 5 "Popular": a few activity cards and the "view all" link.
import { Link } from 'react-router-dom'
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'
import SectionTitle from '../../../components/SectionTitle.jsx'
import ActivityCard from '../../../components/ActivityCard.jsx'

export default function PopularSection() {
  const { t } = useLang()
  const { activities } = usePlanner()
  const firstThree = activities.slice(0, 3)

  return (
    <section className="py-20">
      <div className="container-site">
        <SectionTitle tag={t('popTag')} title={t('popTitle')} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {firstThree.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/activities" className="btn-primary">
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
