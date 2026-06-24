import SubCategorySlider from '../../components/shop/SubCategorySlider'
import ShopExperience from '../../components/shop/ShopExperience'
import { PRODUCTS } from '../../lib/products'

export const metadata = {
  title: 'Shop — Muneeb Ki Araish',
  description: 'Browse premium bedding, cushions, throws, dining and bath collections.'
}

export default function ShopPage() {
  return (
    <div className="pb-12">
      <SubCategorySlider />
      <ShopExperience products={PRODUCTS} />
    </div>
  )
}
