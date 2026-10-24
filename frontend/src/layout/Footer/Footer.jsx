// The footer at the bottom of every page.
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import { navLinks } from '../Header/navLinks.js'
import Logo from '../Header/Logo.jsx'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="border-t border-white/15 bg-navy">
      <div className="container-site grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-3 content-start">
          <Logo />
          <p className="text-sm text-white/70">{t('footerAbout')}</p>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-teal">{t('footerLinks')}</h2>
          <ul className="grid gap-2 text-sm text-white/80">
            {navLinks.filter((link) => !link.adminOnly).map((link) => (
              <li key={link.to}>
                <Link className="hover:text-teal" to={link.to}>
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-teal" to="/privacy">{t('privacy')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-teal">{t('footerContact')}</h2>
          <ul className="grid gap-2 text-sm text-white/80">
            <li dir="ltr" className="text-start">hello@fitplanner.example</li>
            <li>{t('contactPlaceText')}</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold text-teal">{t('footerHours')}</h2>
          <p className="text-sm text-white/80">{t('footerHoursText')}</p>
        </div>
      </div>

      <div className="border-t border-white/15 py-4 text-center text-sm text-white/60">
        © 2026 {t('brand')}. {t('footerRights')}
      </div>
    </footer>
  )
}
