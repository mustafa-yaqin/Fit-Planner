// Small calculations: minutes of a row, total minutes, done minutes, goal.
export function toInt(value) {
  const text = String(value).trim()
  if (text === '') return NaN
  const number = Number(text)
  return Number.isInteger(number) ? number : NaN
}

export function lineMinutes(activity, repeats) {
  return activity.durationMinutes * repeats
}

export function totalMinutes(routine, activities) {
  let sum = 0
  routine.forEach((item) => {
    const activity = activities.find((a) => a.id === item.id)
    if (activity) sum = sum + lineMinutes(activity, item.repeats)
  })
  return sum
}

export function completedCount(routine) {
  return routine.filter((item) => item.completed).length
}

export function completedMinutes(routine, activities) {
  return totalMinutes(routine.filter((item) => item.completed), activities)
}

export function parseTarget(value) {
  const text = String(value).trim()
  const number = Number(text)
  if (text !== '' && Number.isFinite(number) && number > 0) return number
  return NaN
}
