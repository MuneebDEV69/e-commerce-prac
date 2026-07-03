import LandingPage from '../components/home/LandingPage'
import { fetchLandingSections } from '@/lib/api'

// ISR: cache the homepage, revalidate in the background so admin edits appear.
export const revalidate = 60

export default async function Home() {
  const sections = await fetchLandingSections()
  return <LandingPage sections={sections} />
}
