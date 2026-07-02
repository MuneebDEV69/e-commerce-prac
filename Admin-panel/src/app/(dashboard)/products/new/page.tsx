import Link from 'next/link'
import { fetchCategories } from '@/lib/api'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'New Product — Admin' }

export default async function NewProductPage() {
  const categories = await fetchCategories()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs text-gray-500 hover:text-brand">
        ← Back to Dashboard
      </Link>
      <h1 className="font-serif text-3xl tracking-[0.15em] text-brand mt-3 mb-8">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
