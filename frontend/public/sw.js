// Offline cache for FitPlanner (only registered in the production build).
// - on install: the page and all its scripts, styles and main fonts are saved
// - photos and files are saved the first time they are used
// - the API is never cached here (the app keeps its own copy in localStorage)
const VERSION = 'fitplanner-v2'
const MAIN_FONTS = /(vazirmatn-(arabic|latin)|poppins-latin)-\d+-normal-[^.]+\.woff2$/

async function precache() {
  const cache = await caches.open(VERSION)
  const res = await fetch('/index.html', { cache: 'reload' })
  const html = await res.clone().text()
  await cache.put('/index.html', res)
  const files = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
  await Promise.allSettled(files.map((file) => cache.add(file)))
  for (const file of files.filter((f) => f.endsWith('.css'))) {
    const css = await (await cache.match(file)).text()
    const fonts = [...css.matchAll(/url\((\/assets\/[^)]+\.woff2)\)/g)].map((m) => m[1])
    await Promise.allSettled(fonts.filter((f) => MAIN_FONTS.test(f)).map((f) => cache.add(f)))
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().catch(() => {}).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function fetchWithTimeout(request, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

// Pages: the internet first, but on a weak connection the saved page is used after 4 seconds.
async function networkFirstPage(request) {
  const cache = await caches.open(VERSION)
  const cached = await cache.match('/index.html')
  try {
    const fresh = await fetchWithTimeout(request, cached ? 4000 : 20000)
    if (!fresh.ok && cached) return cached
    cache.put('/index.html', fresh.clone())
    return fresh
  } catch {
    return cached || Response.error()
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION)
  const cached = await cache.match(request)
  const update = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone())
      return res
    })
    .catch(() => cached || Response.error())
  return cached || update
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) return // never cache the API
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
  } else if (url.origin === self.location.origin || url.hostname === 'images.pexels.com') {
    event.respondWith(staleWhileRevalidate(request))
  }
})
