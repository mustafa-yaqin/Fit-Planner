// The form to add or edit a shared activity (title, Persian title, category, minutes, photo ...).
import { useEffect, useState } from 'react'
import { useLang } from '../../../context/LanguageContext.jsx'
import { CATEGORIES } from '../../../data/activities.js'
import { toInt } from '../../../utils/calc.js'
import { validateActivity } from '../../../utils/validate.js'
import { resizeImage } from '../../../utils/resizeImage.js'
import Photo from '../../../components/Photo.jsx'

const blank = {
  title: '',
  titleFa: '',
  category: 'movement',
  durationMinutes: '20',
  equipmentRequired: false,
  equipmentDescription: '',
  equipmentDescriptionFa: '',
  description: '',
  descriptionFa: '',
  image: '',
}

export default function ActivityForm({ editing, onSave, onCancel, allowPhoto = true }) {
  const { t } = useLang()
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [okMessage, setOkMessage] = useState('')
  const [failed, setFailed] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({ ...blank, ...editing, durationMinutes: String(editing.durationMinutes) })
    } else {
      setForm(blank)
    }
    setErrors({})
    setFailed('')
  }, [editing])

  function change(name) {
    return (event) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setForm({ ...form, [name]: value })
    }
  }

  function errorKey(error) {
    if (error.code === 'network') return 'eNetwork'
    if (error.code === 'storage') return 'eStorage'
    if (error.status === 401 || error.status === 403) return 'eAdmin'
    if (error.status === 409) return 'eConflict'
    return 'eServer'
  }

  async function choosePhoto(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    setFailed('')
    setUploading(true)
    try {
      const data = await resizeImage(file, 1000, 0.75)
      setForm((f) => ({ ...f, image: data })) // kept here; sent to the server when you press save
    } catch {
      setFailed('photoBad')
    } finally {
      setUploading(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    const found = validateActivity(form)
    setErrors(found)
    setOkMessage('')
    setFailed('')
    if (Object.keys(found).length > 0) return

    setBusy(true)
    try {
      const result = await onSave({
        ...form,
        id: editing ? editing.id : 0, // the server gives new activities their number
        title: form.title.trim(),
        titleFa: form.titleFa.trim(),
        durationMinutes: toInt(form.durationMinutes),
        equipmentDescription: form.equipmentRequired ? form.equipmentDescription.trim() : 'None',
        equipmentDescriptionFa: form.equipmentRequired ? form.equipmentDescriptionFa.trim() : '',
        description: form.description.trim(),
        descriptionFa: form.descriptionFa.trim(),
      })
      setOkMessage(result === 'queued' ? t('savedOffline') : editing ? t('updated') : t('added'))
      setForm(blank)
    } catch (error) {
      setFailed(errorKey(error))
    } finally {
      setBusy(false)
    }
  }

  function showError(name) {
    if (!errors[name]) return null
    return <p id={name + '-error'} className="err">{t(errors[name])}</p>
  }

  return (
    <form onSubmit={submit} noValidate className="card grid gap-4 sm:grid-cols-2">
      <h2 className="text-xl font-bold text-tealDark sm:col-span-2">
        {editing ? t('editAct') : t('addAct')}
      </h2>

      <div>
        <label className="label" htmlFor="title">{t('title')} (English)</label>
        <input id="title" dir="ltr" className="field" value={form.title} onChange={change('title')} aria-invalid={!!errors.title} aria-describedby="title-error" />
        {showError('title')}
      </div>

      <div>
        <label className="label" htmlFor="titleFa">{t('title')} (فارسی)</label>
        <input id="titleFa" className="field" value={form.titleFa} onChange={change('titleFa')} />
      </div>

      <div>
        <label className="label" htmlFor="category">{t('category')}</label>
        <select id="category" className="field" value={form.category} onChange={change('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(c)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="durationMinutes">{t('duration')}</label>
        <input id="durationMinutes" inputMode="numeric" dir="ltr" className="field" value={form.durationMinutes} onChange={change('durationMinutes')} aria-invalid={!!errors.durationMinutes} aria-describedby="durationMinutes-error" />
        {showError('durationMinutes')}
      </div>

      <div className="flex items-end sm:col-span-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-tealDark" checked={form.equipmentRequired} onChange={change('equipmentRequired')} />
          {t('equipReq')}
        </label>
      </div>

      {form.equipmentRequired && (
        <>
          <div>
            <label className="label" htmlFor="equipmentDescription">{t('equipDesc')} (English)</label>
            <input id="equipmentDescription" dir="ltr" className="field" value={form.equipmentDescription} onChange={change('equipmentDescription')} aria-describedby="equipmentDescription-error" />
            {showError('equipmentDescription')}
          </div>
          <div>
            <label className="label" htmlFor="equipmentDescriptionFa">{t('equipDesc')} (فارسی)</label>
            <input id="equipmentDescriptionFa" className="field" value={form.equipmentDescriptionFa} onChange={change('equipmentDescriptionFa')} />
          </div>
        </>
      )}

      <div>
        <label className="label" htmlFor="description">{t('descr')} (English)</label>
        <textarea id="description" dir="ltr" rows="3" className="field" value={form.description} onChange={change('description')} />
      </div>

      <div>
        <label className="label" htmlFor="descriptionFa">{t('descr')} (فارسی)</label>
        <textarea id="descriptionFa" rows="3" className="field" value={form.descriptionFa} onChange={change('descriptionFa')} />
      </div>

      {allowPhoto && (
        <div className="sm:col-span-2">
          <span className="label">{t('photo')}</span>
          <div className="flex flex-wrap items-center gap-4">
            {form.image && (
              <Photo src={form.image} alt="" className="h-24 w-32 rounded-lg object-cover" />
            )}
            <label className="btn-dark cursor-pointer">
              {uploading ? t('uploading') : t('uploadPhoto')}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={choosePhoto} disabled={uploading} />
            </label>
            {form.image && (
              <button type="button" className="btn-danger" onClick={() => setForm({ ...form, image: '' })}>
                {t('removePhoto')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button className="btn-primary" type="submit" disabled={busy || uploading}>
          {busy ? t('wait') : editing ? t('save') : t('addAct')}
        </button>
        {editing && (
          <button type="button" className="btn-dark" onClick={onCancel}>{t('cancel')}</button>
        )}
        <p role="status" className={failed ? 'err !mt-0' : 'text-sm font-semibold text-tealDark'}>
          {failed ? t(failed) : okMessage}
        </p>
      </div>
    </form>
  )
}
