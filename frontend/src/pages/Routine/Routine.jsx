// Routine page (/routine): the user's plan.
// Parts: Summary/ (numbers and goal), Table/ (rows), ResetButton/ (clear everything).
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import { usePlanner } from '../../context/PlannerContext.jsx'
import { totalMinutes, completedCount, completedMinutes } from '../../utils/calc.js'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import RoutineSummary from './Summary/RoutineSummary.jsx'
import RoutineTable from './Table/RoutineTable.jsx'
import ResetRoutineButton from './ResetButton/ResetRoutineButton.jsx'

export default function Routine() {
  const { t } = useLang()
  const { activities, routine, targetText, setTargetText } = usePlanner()

  const rows = routine
    .map((item) => ({ item: item, activity: activities.find((a) => a.id === item.id) }))
    .filter((row) => row.activity)

  return (
    <>
      <PageBanner title={t('planTitle')} intro={t('routineIntro')} />
      <section className="container-site grid gap-6 py-12">
        <div>
          <Link className="btn-primary" to="/my-activities">{t('myActAdd')}</Link>
        </div>

        {/* summary box: total minutes, done, daily goal */}
        <RoutineSummary
          total={totalMinutes(routine, activities)}
          doneCount={completedCount(routine)}
          lines={rows.length}
          doneMinutes={completedMinutes(routine, activities)}
          targetText={targetText}
          setTargetText={setTargetText}
        />

        {rows.length === 0 ? (
          <p className="card">
            {t('emptyRoutine')}{' '}
            <Link className="font-bold text-tealDark underline" to="/activities">
              {t('choose')}
            </Link>
          </p>
        ) : (
          <>
            {/* the table of activities */}
            <RoutineTable rows={rows} />
            {/* the reset button */}
            <div>
              <ResetRoutineButton />
            </div>
          </>
        )}
      </section>
    </>
  )
}
