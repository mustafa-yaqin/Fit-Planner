// "Reset routine" button: clears the whole routine (all rows) with one click.
// It is shown under the table in Routine.jsx.
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'

export default function ResetRoutineButton() {
  const { t } = useLang()
  const { resetRoutine } = usePlanner()

  return (
    <button className="btn-dark" onClick={resetRoutine}>
      {t('resetRoutine')}
    </button>
  )
}
