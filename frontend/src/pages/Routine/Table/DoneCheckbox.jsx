// The "Done" checkbox of ONE row: marks the activity as done / not done.
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'

export default function DoneCheckbox({ id, name, done }) {
  const { t } = useLang()
  const { toggleDone } = usePlanner()

  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        className="h-5 w-5 accent-tealDark"
        checked={done}
        onChange={() => toggleDone(id)}
      />
      <span>
        {done ? t('doneL') : t('notDone')}
        <span className="sr-only"> {name}</span>
      </span>
    </label>
  )
}
