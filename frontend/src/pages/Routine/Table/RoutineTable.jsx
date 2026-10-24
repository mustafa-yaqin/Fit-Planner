// The routine table: one row per activity in the routine.
// Each row has: repeats (RepeatControl), done checkbox (DoneCheckbox), remove button (RemoveButton).
import { useLang } from '../../../context/LanguageContext.jsx'
import { usePlanner } from '../../../context/PlannerContext.jsx'
import { lineMinutes } from '../../../utils/calc.js'
import RepeatControl from './RepeatControl.jsx'
import DoneCheckbox from './DoneCheckbox.jsx'
import RemoveButton from './RemoveButton.jsx'

const heads = ['cActivity', 'cMin', 'cRepeats', 'cPlanned', 'cDone', 'cRemove']

export default function RoutineTable({ rows }) {
  const { t, pick } = useLang()
  const { setRepeats } = usePlanner()

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
      <table className="min-w-full text-sm">
        <caption className="sr-only">{t('planTitle')}</caption>
        <thead className="bg-sky">
          <tr>
            {heads.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 text-start font-bold text-tealDark">{t(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ item, activity }) => {
            const name = pick(activity, 'title')
            return (
              <tr key={activity.id} className="border-t border-navy/10 transition hover:bg-sky/70">
                <th scope="row" className="px-4 py-3 text-start font-semibold">{name}</th>
                <td className="px-4 py-3">{activity.durationMinutes}</td>
                {/* column "Repeats": plus / minus */}
                <td className="px-4 py-3">
                  <RepeatControl id={activity.id} title={name} value={item.repeats} onChange={setRepeats} />
                </td>
                <td className="px-4 py-3 font-bold">{lineMinutes(activity, item.repeats)}</td>
                {/* column "Done": checkbox */}
                <td className="px-4 py-3">
                  <DoneCheckbox id={activity.id} name={name} done={item.completed} />
                </td>
                {/* column "Remove": delete this row from the routine */}
                <td className="px-4 py-3">
                  <RemoveButton id={activity.id} name={name} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
