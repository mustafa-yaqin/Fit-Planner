// The contact form. If there is no internet the message waits on the device and is sent later.
import { useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { API_OFF, api } from '../../../utils/api.js'
import { usePlanner } from '../../../context/PlannerContext.jsx'
import { newClientId } from '../../../offline/queue.js'
import { validateContact } from '../../../utils/validate.js'

const blank = { name: '', email: '', subject: '', message: '' }
const MAX_MESSAGE = 500

export default function ContactForm() {
  const { t } = useLang()
  const { queueContact } = usePlanner()
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  function change(name) {
    return (event) => {
      const limit = name === 'message' ? MAX_MESSAGE : 200
      setForm({ ...form, [name]: event.target.value.slice(0, limit) })
    }
  }

  async function submit(event) {
    event.preventDefault()
    const found = validateContact(form)
    setErrors(found)
    setNote('')
    setFailed('')
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      const payload = { ...form, clientId: newClientId() }
      try {
        await api.post('/api/contact', payload)
        setNote('sentOk')
      } catch (error) {
        if (error.code !== 'network') throw error
        queueContact(payload) // no internet: kept on the device, sent later
        setNote('savedOfflineMsg')
      }
      setForm(blank)
    } catch (error) {
      setFailed(error.code === 'storage' ? 'eStorage' : error.code === 'too_many' ? 'eTooMany' : 'eServer')
    } finally {
      setBusy(false)
    }
  }

  function textField(name, type = 'text') {
    return (
      <div>
        <label className="label" htmlFor={'c-' + name}>{t(name)}</label>
        <input
          id={'c-' + name}
          type={type}
          dir={name === 'email' ? 'ltr' : undefined}
          className="field"
          value={form[name]}
          onChange={change(name)}
          aria-invalid={!!errors[name]}
          aria-describedby={'c-' + name + '-error'}
        />
        {errors[name] && <p id={'c-' + name + '-error'} className="err">{t(errors[name])}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="card grid gap-4">
      {textField('name')}
      {textField('email', 'email')}
      {textField('subject')}

      <div>
        <label className="label" htmlFor="c-message">{t('message')}</label>
        <textarea
          id="c-message"
          rows="5"
          className="field"
          value={form.message}
          onChange={change('message')}
          aria-invalid={!!errors.message}
          aria-describedby="c-message-error c-count"
        />
        <p id="c-count" className="text-sm text-navy/80">
          {t('chars', { n: form.message.length, m: MAX_MESSAGE })}
        </p>
        {errors.message && <p id="c-message-error" className="err">{t(errors.message)}</p>}
      </div>

      <div>
        <button className="btn-primary" type="submit" disabled={busy || API_OFF}>{busy ? t('wait') : t('send')}</button>
        {API_OFF && <p role="status" className="text-sm font-semibold text-navy/80">{t('contactOff')}</p>}
      </div>
      <p role="status" className={failed ? 'err' : 'font-semibold text-tealDark'}>
        {failed ? t(failed) : note ? t(note) : ''}
      </p>
    </form>
  )
}
