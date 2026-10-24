// A short message when something was changed somewhere else (for example by the admin).
import { useLang } from '../context/LanguageContext.jsx'
import { usePlanner } from '../context/PlannerContext.jsx'

// A short message when something was changed somewhere else (for example by the admin)
// and the newest version replaced the old copy on this screen.
export default function SyncNotice() {
  const { t } = useLang()
  const { notice, dismissNotice } = usePlanner()
  if (!notice) return null
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-24 z-[60] px-4">
      <div className="container-site flex items-center justify-between gap-3 rounded-2xl border border-tealDark/30 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-lg">
        <span>{t(notice)}</span>
        <button type="button" className="btn-dark !py-1.5 !min-h-[36px]" onClick={dismissNotice}>OK</button>
      </div>
    </div>
  )
}
