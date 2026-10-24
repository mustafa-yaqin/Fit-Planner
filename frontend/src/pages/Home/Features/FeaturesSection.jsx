// Home section 3 "Features": the cards that explain what the site can do.
import { useLang } from '../../../context/LanguageContext.jsx'
import SectionTitle from '../../../components/SectionTitle.jsx'

const features = [
  { icon: '🔎', title: 'f1Title', text: 'f1Text' },
  { icon: '📋', title: 'f2Title', text: 'f2Text' },
  { icon: '⏱️', title: 'f3Title', text: 'f3Text' },
  { icon: '✏️', title: 'f4Title', text: 'f4Text' },
]

export default function FeaturesSection() {
  const { t } = useLang()

  return (
    <section className="py-20">
      <div className="container-site">
        <SectionTitle tag={t('featTag')} title={t('featTitle')} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div key={item.title} className="card card-hover text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal text-2xl">
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold">{t(item.title)}</h3>
              <p className="text-sm text-navy/80">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
