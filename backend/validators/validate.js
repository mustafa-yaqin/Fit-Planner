// Checks everything that comes from the browser. Never trust the browser.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function checkRegister(b) {
  const name = String(b?.name ?? '').trim()
  const email = String(b?.email ?? '').trim().toLowerCase()
  const password = String(b?.password ?? '')
  if (name.length < 2 || name.length > 60) return { error: 'name' }
  if (!EMAIL.test(email) || email.length > 120) return { error: 'email' }
  if (password.length < 8 || password.length > 100) return { error: 'password' }
  return { name, email, password }
}

export function checkLogin(b) {
  const email = String(b?.email ?? '').trim().toLowerCase()
  const password = String(b?.password ?? '')
  if (!EMAIL.test(email) || !password || password.length > 100) return { error: 'credentials' }
  return { email, password }
}

export function checkContact(b) {
  const name = String(b?.name ?? '').trim()
  const email = String(b?.email ?? '').trim()
  const subject = String(b?.subject ?? '').trim()
  const message = String(b?.message ?? '').trim()
  if (!name || name.length > 200) return { error: 'name' }
  if (!EMAIL.test(email) || email.length > 200) return { error: 'email' }
  if (!subject || subject.length > 200) return { error: 'subject' }
  if (!message || message.length > 500) return { error: 'message' }
  const clientId = String(b?.clientId ?? '').slice(0, 60)
  return { name, email, subject, message, clientId }
}

const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x)

export function checkPlanner(b) {
  if (!isObject(b) || !Array.isArray(b.routine) || b.routine.length > 300) return false
  return b.routine.every(
    (r) =>
      isObject(r) &&
      r.id !== undefined &&
      Number.isInteger(r.repeats) &&
      r.repeats >= 1 &&
      r.repeats <= 100000 &&
      typeof r.completed === 'boolean'
  )
}

// A user's own activities: only they (and the admin) see them. Ids start with "my-".
export function checkMine(list, imageAllowed = () => false) {
  if (list === undefined) return []
  if (!Array.isArray(list) || list.length > 50) return null
  const clean = []
  for (const a of list) {
    const id = String(a?.id ?? '')
    const item = checkActivity(a)
    if (item.error || !/^my-[0-9a-z-]{1,30}$/.test(id)) return null
    if (item.image && !imageAllowed(item.image)) return null // only photos this user uploaded
    clean.push({ ...item, id, clientId: '' })
  }
  return clean
}

export const CATEGORIES = ['movement', 'stretching', 'sports practice']

// Returns a clean activity object (only known fields) or { error: 'field' }.
export function checkActivity(b) {
  const text = (value, max) => String(value ?? '').trim().slice(0, max)
  const title = text(b?.title, 120)
  if (!title) return { error: 'title' }
  if (!CATEGORIES.includes(b?.category)) return { error: 'category' }
  const minutes = Number(b?.durationMinutes)
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) return { error: 'durationMinutes' }
  const equipmentRequired = b?.equipmentRequired === true
  const equipmentDescription = equipmentRequired ? text(b?.equipmentDescription, 200) : 'None'
  if (equipmentRequired && !equipmentDescription) return { error: 'equipmentDescription' }
  const clientId = text(b?.clientId, 60)
  const image = text(b?.image, 500)
  if (image && !image.startsWith('/uploads/') && !image.startsWith('https://')) return { error: 'image' }
  return {
    title,
    titleFa: text(b?.titleFa, 120),
    category: b.category,
    durationMinutes: minutes,
    equipmentRequired,
    equipmentDescription,
    equipmentDescriptionFa: equipmentRequired ? text(b?.equipmentDescriptionFa, 200) : '',
    description: text(b?.description, 1000),
    descriptionFa: text(b?.descriptionFa, 1000),
    image,
    clientId,
  }
}
