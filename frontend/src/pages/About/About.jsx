// About page (/about).
import Photo from '../../components/Photo.jsx'
import { useLang } from '../../context/LanguageContext.jsx'
import { aboutImage } from './images/index.js'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'

export default function About() {
  const { t } = useLang()

  return (
    <>
      <PageBanner title={t('about')} intro={t('aboutIntro')} />
      <section className="container-site grid items-center gap-10 py-12 md:grid-cols-2">
        <Photo src={aboutImage} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <div className="grid gap-4">
          <p className="text-lg text-navy/90">{t('aboutText')}</p>
          <p className="card card-hover text-navy/80">{t('formula')}</p>
          <p className="text-sm font-bold text-tealDark">
            {t('builtWith')}: React · React Router · Tailwind CSS
          </p>
        </div>
      </section>
    </>
  )
}
