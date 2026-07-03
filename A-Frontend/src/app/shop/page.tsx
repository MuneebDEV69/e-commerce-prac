import SubCategorySlider from '../../components/shop/SubCategorySlider'
import ShopExperience from '../../components/shop/ShopExperience'
import AdminBackBar from '../../components/shop/AdminBackBar'
import { fetchProducts } from '@/lib/api'

// ISR: serve cached HTML instantly, revalidate in the background.
export const revalidate = 120

export const metadata = {
  title: 'Shop — Muneeb Ki Araish',
  description: 'Browse premium bedding, cushions, throws, dining and bath collections.'
}

export default async function ShopPage() {
  const products = await fetchProducts()

  const cards = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    priceFrom: p.priceFrom,
    image: p.mediaUrls[0] ?? null
  }))

  return (
    <div className="pb-12">
      <AdminBackBar />
      <SubCategorySlider />
      <ShopExperience products={cards} />
    </div>
  )
}
