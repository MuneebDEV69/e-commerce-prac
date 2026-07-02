import Link from 'next/link'
import { Plus } from 'lucide-react'
import { fetchProducts } from '@/lib/api'
import ProductsTable, { type AdminProductRow } from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const products = await fetchProducts()

  const rows: AdminProductRow[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    priceFrom: p.priceFrom,
    stock: p.stock,
    image: p.mediaUrls[0] ?? null,
    category: p.category?.name ?? null
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-xs text-gray-500 hover:text-brand">
            ← Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl tracking-[0.15em] text-brand mt-2">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{rows.length} total</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-brand text-white text-sm tracking-wider px-5 py-2.5 hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      <ProductsTable products={rows} />
    </div>
  )
}
