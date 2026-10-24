// Contact page (/contact): texts + the form.
import { useLang } from '../../context/LanguageContext.jsx'
import PageBanner from '../../components/PageBanner/PageBanner.jsx'
import ContactForm from './Form/ContactForm.jsx'

export default function Contact() {
  const { t } = useLang()

  return (
    <>
      <PageBanner title={t('contact')} intro={t('contactIntro')} />
      <section className="container-site grid gap-8 py-12 lg:grid-cols-3">
        <div className="card grid content-start gap-4">
          <div>
            <h2 className="font-bold text-tealDark">{t('contactEmail')}</h2>
            <p dir="ltr" className="text-start text-navy/80">hello@fitplanner.example</p>
          </div>
          <div>
            <h2 className="font-bold text-tealDark">{t('contactPlace')}</h2>
            <p className="text-navy/80">{t('contactPlaceText')}</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
