// Home section 4 "Categories": three cards (movement, stretching, sports practice).
import Photo from '../../../components/Photo.jsx'
import { Link } from 'react-router-dom'
import { useLang } from '../../../context/LanguageContext.jsx'
import { CATEGORIES } from '../../../data/activities.js'
import { categoryImages } from './images/index.js'
import SectionTitle from '../../../components/SectionTitle.jsx'

const categoryTexts = {
  movement: 'catMovementText',
  stretching: 'catStretchingText',
  'sports practice': 'catSportsText',
}

export default function CategoriesSection() {
  const { t } = useLang()

  return (
    <section className="bg-sky py-20">
      <div className="container-site">
        <SectionTitle tag={t('catTag')} title={t('catTitle')} />
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to="/activities"
              className="group overflow-hidden rounded-2xl bg-white border border-navy/10 transition duration-300 ease-out hover:-translate-y-1.5 hover:border-tealDark/50 hover:shadow-xl hover:shadow-navy/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <Photo
                src={categoryImages[category]}
                alt={t(category)}
                className="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="text-xl font-bold capitalize">{t(category)}</h3>
                <p className="mt-1 text-sm text-navy/80">{t(categoryTexts[category])}</p>
                <p className="mt-3 text-sm font-bold text-tealDark">{t('seeCategory')} →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
