// After a visit with internet, quietly downloads all site photos once,
// so the service worker keeps them and they show later without internet.
import { slowConnection } from '../utils/pickImage.js'
import { activityImage } from '../pages/Activities/images/index.js'
import { heroImages } from '../pages/Home/Hero/images/index.js'
import { categoryImages } from '../pages/Home/Categories/images/index.js'
import { ctaImage } from '../pages/Home/Cta/images/index.js'
import { bannerImage } from '../components/PageBanner/images/index.js'
import { aboutImage } from '../pages/About/images/index.js'

const done = new Set()

export function warmImages(activities) {
  if (slowConnection || !navigator.onLine) return
  const urls = [
    ...heroImages, ...Object.values(categoryImages), ctaImage, bannerImage, aboutImage,
    ...activities.map(activityImage),
  ].filter((url) => url && !url.startsWith('data:') && !done.has(url))
  urls.forEach((url) => done.add(url))

  function next() {
    const url = urls.shift()
    if (!url) return
    const img = new Image()
    img.onload = img.onerror = () => setTimeout(next, 200)
    img.src = url
  }
  setTimeout(() => {
    next()
    next()
  }, 3000)
}
