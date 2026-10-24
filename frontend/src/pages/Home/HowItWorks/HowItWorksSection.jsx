// Home section 6 "How it works": the steps.
import { useLang } from '../../../context/LanguageContext.jsx'
import SectionTitle from '../../../components/SectionTitle.jsx'

const steps = [
  { number: '1', title: 's1Title', text: 's1Text' },
  { number: '2', title: 's2Title', text: 's2Text' },
  { number: '3', title: 's3Title', text: 's3Text' },
]

export default function HowItWorksSection() {
  const { t } = useLang()

  return (
    <section className="bg-sky py-20">
      <div className="container-site">
        <SectionTitle tag={t('howTag')} title={t('howTitle')} />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="card card-hover">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal text-xl font-extrabold text-navy">
                {step.number}
              </div>
              <h3 className="mb-2 text-xl font-bold">{t(step.title)}</h3>
              <p className="text-sm text-navy/80">{t(step.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
