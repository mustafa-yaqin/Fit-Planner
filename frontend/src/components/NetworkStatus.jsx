// The bar at the bottom: internet is off / slow, or changes are waiting to be sent.
import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext.jsx'
import { usePlanner } from '../context/PlannerContext.jsx'
import { slowConnection } from '../utils/pickImage.js'

// Tells the visitor when the internet is off or very slow,
// and when changes are waiting on the device to be sent.
export default function NetworkStatus() {
  const { t } = useLang()
  const { pending, syncNow } = usePlanner()
  const [online, setOnline] = useState(() => navigator.onLine)
  const [slowClosed, setSlowClosed] = useState(false)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  function showPhotos() {
    try {
      sessionStorage.setItem('forcePhotos', '1')
    } catch {
      /* storage blocked: the reload just shows the same page */
    }
    window.location.reload()
  }

  if (!online) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-0 z-[70] border-t border-amber-700/30 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900">
        <div className="container-site flex flex-wrap items-center justify-between gap-3">
          <span>
            {t('netOffline')}
            {pending > 0 && ' ' + t('netPending', { n: pending })}
          </span>
          <button type="button" className="btn-danger !py-1.5 !min-h-[36px]" onClick={() => window.location.reload()}>
            {t('netRetry')}
          </button>
        </div>
      </div>
    )
  }

  if (pending > 0) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-0 z-[70] border-t border-navy/15 bg-sky px-4 py-3 text-sm font-semibold text-navy">
        <div className="container-site flex flex-wrap items-center justify-between gap-3">
          <span>{t('netPending', { n: pending })}</span>
          <button type="button" className="btn-primary !py-1.5 !min-h-[36px]" onClick={syncNow}>
            {t('netSendNow')}
          </button>
        </div>
      </div>
    )
  }

  if (slowConnection && !slowClosed) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-0 z-[70] border-t border-navy/15 bg-sky px-4 py-3 text-sm font-semibold text-navy">
        <div className="container-site flex flex-wrap items-center justify-between gap-3">
          <span>{t('netSlow')}</span>
          <span className="flex gap-2">
            <button type="button" className="btn-primary !py-1.5 !min-h-[36px]" onClick={showPhotos}>
              {t('netShowPhotos')}
            </button>
            <button type="button" className="btn-dark !py-1.5 !min-h-[36px]" onClick={() => setSlowClosed(true)} aria-label="OK">
              OK
            </button>
          </span>
        </div>
      </div>
    )
  }

  return null
}
