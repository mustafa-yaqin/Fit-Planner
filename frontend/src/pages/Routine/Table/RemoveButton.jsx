// "Remove" button of ONE row: deletes this single activity from the routine
// (the activity itself stays in the activity list).
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'

export default function RemoveButton({ id, name }) {
  const { t } = useLang()
  const { removeFromRoutine } = usePlanner()

  return (
    <button
      className="btn-danger"
      aria-label={t('remove') + ' ' + name}
      onClick={() => removeFromRoutine(id)}
    >
      {t('remove')}
    </button>
  )
}
