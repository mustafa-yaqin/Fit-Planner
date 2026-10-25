// The frame around every page: header, content, footer, status bars; also sets the browser tab title.
import Header from './Header/Header.jsx'
import Footer from './Footer/Footer.jsx'
import NetworkStatus from '../components/NetworkStatus.jsx'
import SyncNotice from '../components/SyncNotice.jsx'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext.jsx'

export default function Layout({ children }) {
  const { t, lang } = useLang()
  const { pathname } = useLocation()

  // browser tab title for each page
  useEffect(() => {
    const keys = {
      '/': 'home', '/activities': 'activities', '/routine': 'routine', '/about': 'about',
      '/contact': 'contact', '/login': 'login', '/register': 'register', '/admin': 'admin', '/privacy': 'privacy',
    }
    const key = keys[pathname]
    document.title = (key && pathname !== '/' ? t(key) + ' · ' : '') + 'Fit-Planner'
  }, [pathname, lang, t])

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-navy focus:text-white focus:p-3 focus:rounded"
      >
        {t('skip')}
      </a>
      <NetworkStatus />
      <SyncNotice />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
