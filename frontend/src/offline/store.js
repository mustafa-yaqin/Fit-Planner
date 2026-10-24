// Small helpers for localStorage (never crash if it is blocked or full).
export function readLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeLocal(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}
