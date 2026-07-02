'use client'

import dynamic from 'next/dynamic'
import type { EditableProduct } from './ProductForm'

/**
 * Lazy-loads ProductForm (which pulls in MediaUploader + @supabase/supabase-js +
 * the upload logic) so the page shell paints instantly and the heavy client JS
 * streams in afterwards. A skeleton fills the brief hydration gap.
 */
const ProductForm = dynamic(() => import('./ProductForm'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-24 w-full bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-64 w-full bg-gray-200 rounded" />
      <div className="h-11 w-40 bg-gray-200 rounded" />
    </div>
  )
})

export default function ProductFormLoader(props: {
  categories: { id: string; name: string }[]
  product?: EditableProduct
}) {
  return <ProductForm {...props} />
}
