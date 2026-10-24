// The FitPlanner logo in the header.
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'

export default function Logo() {
  const { t } = useLang()

  return (
    <Link to="/" className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tealDark/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-lg font-extrabold text-white">
        F
      </span>
      <span className="text-lg font-extrabold tracking-wide">{t('brand')}</span>
    </Link>
  )
}
