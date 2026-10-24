// The top menu: links, language button, login / logout, mobile menu.
import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usePlanner } from '../../context/PlannerContext.jsx'
import Logo from './Logo.jsx'
import { API_OFF } from '../../utils/api.js'
import { navLinks } from './navLinks.js'

function linkClass({ isActive }) {
  const base = 'rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tealDark/40 '
  return base + (isActive ? 'text-tealDark' : 'text-navy/90 hover:text-tealDark')
}

export default function Header() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { sync } = usePlanner()
  const navigate = useNavigate()
  const visibleLinks = navLinks.filter((link) => !link.adminOnly || user?.role === 'admin')
  const syncKey = { saving: 'syncSaving', loading: 'syncSaving', saved: 'syncSaved', error: 'syncError' }[sync]

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-3">
      <div className="mx-auto max-w-6xl rounded-2xl border border-navy/20 bg-white/70 shadow-lg shadow-navy/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {visibleLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.to === '/'} className={linkClass}>
                    {t(link.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-navy/30 px-3 py-2 text-sm font-semibold transition hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tealDark/40"
              lang={lang === 'fa' ? 'en' : 'fa'}
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            >
              {t('langBtn')}
            </button>
            {user && syncKey && (
              <span role="status" className={'hidden text-xs font-semibold xl:inline ' + (sync === 'error' ? 'text-amber-800' : 'text-navy/80')}>
                {t(syncKey)}
              </span>
            )}
            {API_OFF ? null : user ? (
              <button type="button" onClick={handleLogout} className="btn-outline hidden sm:inline-flex !py-2 !min-h-[40px]">
                {t('logout')}
              </button>
            ) : (
              <Link to="/login" className="btn-outline hidden sm:inline-flex !py-2 !min-h-[40px]">
                {t('login')}
              </Link>
            )}
            <Link to="/routine" className="btn-primary hidden sm:inline-flex !py-2 !min-h-[40px]">
              {t('planNow')}
            </Link>
            <button
              className="lg:hidden rounded-full border border-navy/30 px-3 py-2 text-sm font-bold transition hover:bg-navy hover:text-white"
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => setOpen(!open)}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {open && (
          <nav aria-label="Mobile" className="lg:hidden border-t border-navy/15 px-4 py-3">
            <ul className="grid gap-1">
              {visibleLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    {t(link.key)}
                  </NavLink>
                </li>
              ))}
              <li className={API_OFF ? 'hidden' : undefined}>
                {user ? (
                  <button type="button" onClick={handleLogout} className={linkClass({ isActive: false }) + 'w-full text-start'}>
                    {t('logout')} ({user.name})
                  </button>
                ) : (
                  <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                    {t('login')}
                  </NavLink>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
