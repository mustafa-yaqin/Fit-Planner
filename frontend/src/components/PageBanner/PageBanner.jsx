// The big title banner at the top of inner pages (title + short intro).
import Photo from '../Photo.jsx'
import { bannerImage } from './images/index.js'

export default function PageBanner({ tag, title, intro }) {
  return (
    <section className="relative overflow-hidden bg-sky pt-36 pb-14">
      <Photo
        src={bannerImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent" />
      <div className="container-site relative">
        {tag && <p className="mb-2 text-sm font-bold tracking-widest text-tealDark">{tag}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-navy/80">{intro}</p>}
      </div>
    </section>
  )
}
