// Login page (/login) and sign-up page (/register): one form for both.
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useLang } from '../../context/LanguageContext.jsx'
import { API_OFF } from '../../utils/api.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One page for both "login" and "register".
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { t } = useLang()
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const home = (u) => location.state?.from || (u?.role === 'admin' ? '/admin' : '/routine')

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={home(user)} replace />

  // website-only mode (for example on Vercel): there is no server for accounts yet
  if (API_OFF) {
    return (
      <section className="container-site pt-36 pb-20">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-extrabold">{t('apiOffTitle')}</h1>
          <p className="card mt-6 text-navy/90">{t('apiOffText')}</p>
          <Link to="/" className="btn-primary mt-6">{t('home')}</Link>
        </div>
      </section>
    )
  }

  function change(name) {
    return (event) => setForm({ ...form, [name]: event.target.value })
  }

  function check() {
    const found = {}
    if (isRegister && form.name.trim().length < 2) found.name = 'eName'
    if (!form.email.trim()) found.email = 'eEmail'
    else if (!EMAIL.test(form.email.trim())) found.email = 'eEmailBad'
    if (!form.password) found.password = 'ePassword'
    else if (isRegister && form.password.length < 8) found.password = 'ePassword'
    return found
  }

  async function submit(event) {
    event.preventDefault()
    const found = check()
    setErrors(found)
    setFailed('')
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      const loggedIn = isRegister
        ? await register(form.name.trim(), form.email.trim(), form.password)
        : await login(form.email.trim(), form.password)
      navigate(home(loggedIn), { replace: true })
    } catch (error) {
      const map = {
        bad_credentials: 'eLogin',
        email_taken: 'eTaken',
        too_many: 'eTooMany',
        network: 'eNetwork',
      }
      setFailed(map[error.code] || 'eServer')
    } finally {
      setBusy(false)
    }
  }

  function field(name, type, autoComplete) {
    return (
      <div>
        <label className="label" htmlFor={'a-' + name}>{t(name)}</label>
        <input
          id={'a-' + name}
          type={type}
          autoComplete={autoComplete}
          dir={name === 'name' ? undefined : 'ltr'}
          className="field"
          value={form[name]}
          onChange={change(name)}
          aria-invalid={!!errors[name]}
          aria-describedby={'a-' + name + '-error'}
        />
        {errors[name] && <p id={'a-' + name + '-error'} className="err">{t(errors[name])}</p>}
      </div>
    )
  }

  return (
    <section className="container-site pt-36 pb-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-extrabold">{t(isRegister ? 'registerTitle' : 'loginTitle')}</h1>
        <p className="mt-2 text-navy/80">{t(isRegister ? 'registerIntro' : 'loginIntro')}</p>

        <form onSubmit={submit} noValidate className="card card-hover mt-6 grid gap-4">
          {isRegister && field('name', 'text', 'name')}
          {field('email', 'email', 'email')}
          {field('password', 'password', isRegister ? 'new-password' : 'current-password')}
          {isRegister && (
            <p className="text-sm text-navy/80">
              {t('agreePrefix')}{' '}
              <Link to="/privacy" className="font-bold text-tealDark underline">{t('privacy')}</Link>
            </p>
          )}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? t('wait') : t(isRegister ? 'register' : 'login')}
          </button>
          <p role="status" className="err !mt-0">{failed ? t(failed) : ''}</p>
        </form>

        <p className="mt-5 text-navy/80">
          {t(isRegister ? 'haveAccount' : 'noAccount')}{' '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state} className="font-bold text-tealDark underline">
            {t(isRegister ? 'login' : 'register')}
          </Link>
        </p>
      </div>
    </section>
  )
}
