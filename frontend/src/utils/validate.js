// Checks of the forms (activity, contact, repeats) with the error text key.
import { toInt } from './calc.js'

export function validateActivity(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'eTitle'
  if (!form.category) errors.category = 'eCat'
  const duration = toInt(form.durationMinutes)
  if (Number.isNaN(duration) || duration <= 0) errors.durationMinutes = 'eDur'
  if (form.equipmentRequired && !form.equipmentDescription.trim()) {
    errors.equipmentDescription = 'eEquip'
  }
  return errors
}

export function validateRepeats(value) {
  const number = toInt(value)
  return !Number.isNaN(number) && number > 0
}

export function validateContact(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'eName'
  if (!form.email.trim()) {
    errors.email = 'eEmail'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'eEmailBad'
  }
  if (!form.subject.trim()) errors.subject = 'eSubject'
  if (!form.message.trim()) errors.message = 'eMessage'
  return errors
}
