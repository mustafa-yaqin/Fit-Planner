// Home section 1 "Hero": big title, text, buttons and 4 photos.
import Photo from '../../../components/Photo.jsx'
import { Link } from 'react-router-dom'
import { useLang } from '../../../context/LanguageContext.jsx'
import { heroImages } from './images/index.js'

export default function HeroSection() {
  const { t } = useLang()

  return (
    <section className="bg-gradient-to-b from-teal/50 to-cream pt-36 pb-16">
      <div className="container-site grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold tracking-widest text-tealDark">{t('heroTag')}</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mt-5 max-w-xl text-lg text-navy/80">{t('heroText')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/activities" className="btn-outline">
              {t('heroBtn1')}
            </Link>
            <Link to="/routine" className="btn-primary">
              {t('heroBtn2')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {heroImages.map((src, index) => (
            <Photo
              key={src}
              src={src}
              alt=""
              sizes="(min-width: 1024px) 280px, 44vw"
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchpriority={index < 2 ? 'high' : 'auto'}
              className={'w-full rounded-2xl object-cover aspect-square transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/20 motion-reduce:transition-none ' + (index % 2 === 1 ? 'mt-6' : '')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
