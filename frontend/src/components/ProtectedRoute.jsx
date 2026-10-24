// Guard: the page inside it needs a login; visitors without login are sent to /login.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { API_OFF } from '../utils/api.js'

// Pages inside this wrapper need a login.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLang()
  const location = useLocation()

  // website-only mode: no accounts, the routine is kept on this device
  if (API_OFF) return children

  if (loading) {
    return (
      <p role="status" className="container-site pt-40 pb-24 text-center font-semibold text-navy/80">
        {t('loading')}
      </p>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
