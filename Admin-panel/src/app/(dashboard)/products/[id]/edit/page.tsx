import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchProductById, fetchCategories } from '@/lib/api'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    fetchProductById(params.id),
    fetchCategories()
  ])

  if (!product) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/products" className="text-xs text-gray-500 hover:text-brand">
        ← Back to Products
      </Link>
      <h1 className="font-serif text-3xl tracking-[0.15em] text-brand mt-3 mb-8">Edit Product</h1>
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          priceFrom: product.priceFrom,
          stock: product.stock,
          categoryId: product.categoryId,
          mediaUrls: product.mediaUrls
        }}
      />
    </div>
  )
}
