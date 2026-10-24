// Home page (/): the sections one after another. Each section has its own folder here.
import HeroSection from './Hero/HeroSection.jsx'
import OverviewSection from './Overview/OverviewSection.jsx'
import FeaturesSection from './Features/FeaturesSection.jsx'
import CategoriesSection from './Categories/CategoriesSection.jsx'
import PopularSection from './Popular/PopularSection.jsx'
import HowItWorksSection from './HowItWorks/HowItWorksSection.jsx'
import CtaSection from './Cta/CtaSection.jsx'

export default function Home() {
  return (
    <>
      <HeroSection />
      <OverviewSection />
      <FeaturesSection />
      <CategoriesSection />
      <PopularSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  )
}
