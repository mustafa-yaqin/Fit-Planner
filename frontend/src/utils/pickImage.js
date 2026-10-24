// Chooses the photo for a slot: your own file first, then Pexels, then the local placeholder.
const files = import.meta.glob('/src/**/images/**/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const PHOTO_EXT = ['jpg', 'jpeg', 'webp', 'png', 'avif']

export const fallbackFor = {}

function isSlowConnection() {
  try {
    if (sessionStorage.getItem('forcePhotos') === '1') return false
    const c = navigator.connection
    return Boolean(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')))
  } catch {
    return false
  }
}
export const slowConnection = isSlowConnection()

function pexels(id, ext, width) {
  return (
    'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.' + ext +
    '?auto=compress&cs=tinysrgb&w=' + width
  )
}

export function pickImage(folder, name, remote, width = 720) {
  const base = folder + '/' + name + '.'
  for (const ext of PHOTO_EXT) {
    if (files[base + ext]) return files[base + ext]
  }
  const svg = files[base + 'svg'] || ''
  if (!remote || (slowConnection && svg)) return svg
  const url = pexels(remote.id, remote.ext || 'jpeg', width)
  fallbackFor[url] = svg
  return url
}
