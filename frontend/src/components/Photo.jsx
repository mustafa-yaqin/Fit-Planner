// An <img> that retries once and then shows the local placeholder if the photo fails to load.
import { useEffect, useRef, useState } from 'react'
import { fallbackFor } from '../utils/pickImage.js'

// Pexels photos get several sizes (srcSet): a phone downloads a small file, a big screen a big one.
const WIDTHS = [320, 480, 720, 1080, 1600]

function makeSrcSet(url) {
  const m = /^(https:\/\/images\.pexels\.com\/[^?]+\?.*?\bw=)(\d+)$/.exec(url)
  if (!m) return undefined
  const max = Number(m[2])
  const sizes = WIDTHS.filter((w) => w < max).concat(max)
  return sizes.map((w) => m[1] + w + ' ' + w + 'w').join(', ')
}

// <img> for flaky networks:
// - soft background while loading (no empty white hole)
// - one automatic retry after 2.5 s
// - then the local placeholder, so the page never shows a broken image
export default function Photo({ src, alt = '', className = '', ...rest }) {
  const [current, setCurrent] = useState(src)
  const tries = useRef(0)
  const timer = useRef(null)

  useEffect(() => {
    setCurrent(src)
    tries.current = 0
    return () => clearTimeout(timer.current)
  }, [src])

  function handleError() {
    const fallback = fallbackFor[src]
    if (!fallback || current === fallback) return
    if (tries.current === 0 && navigator.onLine) {
      tries.current = 1
      timer.current = setTimeout(() => {
        setCurrent(src + (src.includes('?') ? '&' : '?') + 'retry=1')
      }, 2500)
      return
    }
    setCurrent(fallback)
  }

  return (
    <img
      loading="lazy"
      decoding="async"
      sizes="(min-width: 1024px) 400px, 100vw"
      {...rest}
      srcSet={current === src ? makeSrcSet(src) : undefined}
      src={current}
      alt={alt}
      className={'bg-sky ' + className}
      onError={handleError}
    />
  )
}
