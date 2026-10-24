// Home section 2 "Overview": about the project, counts and the minutes formula.
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'
import { CATEGORIES } from '../../../data/activities.js'
import { totalMinutes } from '../../../utils/calc.js'

export default function OverviewSection() {
  const { t } = useLang()
  const { activities, routine } = usePlanner()

  return (
    <section className="bg-sky py-14" aria-labelledby="overview-title">
      <div className="container-site">
        <h2 id="overview-title" className="mb-8 text-2xl font-extrabold text-tealDark">
          {t('overviewTitle')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-lg font-bold">{t('ovAbout')}</h3>
            <p className="text-sm text-navy/80">{t('ovAboutText')}</p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold">{t('ovCounts')}</h3>
            <ul className="grid gap-1 text-sm text-navy/80">
              <li>{t('ovActivities', { n: activities.length })}</li>
              <li>{t('ovCategories', { n: CATEGORIES.length })}</li>
              <li>{t('ovRoutine', { n: totalMinutes(routine, activities) })}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold">{t('ovFormula')}</h3>
            <p className="text-sm text-navy/80">{t('ovFormulaText')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
