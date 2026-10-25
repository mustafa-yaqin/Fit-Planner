// Tiny rate limiter (stops password guessing and spam).
const hits = new Map()

export function limited(key, max, windowMs) {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs })
    return false
  }
  entry.count += 1
  return entry.count > max
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) if (entry.reset < now) hits.delete(key)
}, 60000).unref()
