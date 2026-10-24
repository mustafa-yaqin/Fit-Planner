// The plus / minus buttons that change how many times one activity is repeated.
import { useLang } from '../../../context/LanguageContext.jsx'

export default function RepeatControl({ id, title, value, onChange }) {
  const { t } = useLang()

  return (
    <div className="inline-flex items-center gap-1">
      <button
        className="btn-dark !px-3"
        aria-label={t('decR', { t: title })}
        disabled={value <= 1}
        onClick={() => onChange(id, value - 1)}
      >
        −
      </button>
      <span className="w-10 text-center font-bold" aria-live="polite">{value}</span>
      <button
        className="btn-dark !px-3"
        aria-label={t('incR', { t: title })}
        onClick={() => onChange(id, value + 1)}
      >
        +
      </button>
    </div>
  )
}
