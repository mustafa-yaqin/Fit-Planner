// Privacy page (/privacy): what the site saves about the user.
import { useLang } from '../../context/LanguageContext.jsx'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'

export default function Privacy() {
  const { t } = useLang()
  return (
    <>
      <PageBanner title={t('privacy')} intro={t('privacyIntro')} />
      <section className="container-site grid max-w-3xl gap-4 py-12">
        {['privacyData', 'privacyCookie', 'privacyShare', 'privacyDelete'].map((key) => (
          <p key={key} className="card text-navy/90">{t(key)}</p>
        ))}
      </section>
    </>
  )
}
