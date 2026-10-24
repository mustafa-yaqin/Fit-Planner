// Home section 7 "Cta" (call to action): last big box with a button.
import Photo from '../../../components/Photo.jsx'
import { Link } from 'react-router-dom'
import { useLang } from '../../../context/LanguageContext.jsx'
import { ctaImage } from './images/index.js'

export default function CtaSection() {
  const { t } = useLang()

  return (
    <section className="py-20">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-3xl bg-white p-10 text-center sm:p-16">
          <Photo src={ctaImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t('ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy/80">{t('ctaText')}</p>
            <Link to="/routine" className="btn-primary mt-8">
              {t('ctaBtn')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
