import SubCategorySlider from '../../components/shop/SubCategorySlider'
import ShopExperience from '../../components/shop/ShopExperience'
import { prisma } from '@/server/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop — Muneeb Ki Araish',
  description: 'Browse premium bedding, cushions, throws, dining and bath collections.'
}

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, priceFrom: true, mediaUrls: true }
  })

  const cards = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    priceFrom: p.priceFrom,
    image: p.mediaUrls[0] ?? null
  }))

  return (
    <div className="pb-12">
      <SubCategorySlider />
      <ShopExperience products={cards} />
    </div>
  )
}
