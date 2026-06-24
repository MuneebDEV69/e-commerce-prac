import HeroSlider from '../components/home/HeroSlider'
import CuratedCarousel from '../components/home/CuratedCarousel'
import FeatureShowcase from '../components/home/FeatureShowcase'
import SnugLiving from '../components/home/SnugLiving'
import DiningSection from '../components/home/DiningSection'
import VideoReels from '../components/home/VideoReels'
import LastChance from '../components/home/LastChance'
import InstagramSection from '../components/home/InstagramSection'

export default function Home() {
  return (
    <>
      <HeroSlider />
      <CuratedCarousel />
      <FeatureShowcase />
      <SnugLiving />
      <DiningSection />
      <VideoReels />
      <LastChance />
      <InstagramSection />
    </>
  )
}
