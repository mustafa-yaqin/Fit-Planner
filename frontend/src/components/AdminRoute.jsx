// Guard: only the admin account can open the page inside it; others are sent away.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

// Only the admin account may open the pages inside this wrapper.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const { t } = useLang()
  const location = useLocation()

  if (loading) {
    return (
      <p role="status" className="container-site pt-40 pb-24 text-center font-semibold text-navy/80">
        {t('loading')}
      </p>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
