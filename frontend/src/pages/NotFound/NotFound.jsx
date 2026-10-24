// Page shown when the address does not exist (404).
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'

export default function NotFound() {
  const { t } = useLang()

  return (
    <>
      <PageBanner title={t('notFound')} />
      <div className="container-site py-12">
        <Link className="btn-primary" to="/">{t('goHome')}</Link>
      </div>
    </>
  )
}
