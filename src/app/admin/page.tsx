import Link from 'next/link'
import { Plus, ShoppingBag, ListChecks } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Muneeb Ki Araish' }

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl tracking-[0.2em] text-brand mb-2">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-10">Manage your store catalogue.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 border border-gray-200 p-6 hover:border-brand hover:bg-cream transition-colors"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full bg-brand/10 text-brand">
            <Plus size={22} />
          </span>
          <span>
            <span className="block text-sm tracking-wider text-gray-800">Add New Product</span>
            <span className="block text-xs text-gray-500">Create a product with images &amp; video</span>
          </span>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 border border-gray-200 p-6 hover:border-brand hover:bg-cream transition-colors"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full bg-brand/10 text-brand">
            <ListChecks size={22} />
          </span>
          <span>
            <span className="block text-sm tracking-wider text-gray-800">Manage Products</span>
            <span className="block text-xs text-gray-500">Edit, delete, adjust stock &amp; price</span>
          </span>
        </Link>

        <Link
          href="/shop"
          className="flex items-center gap-4 border border-gray-200 p-6 hover:border-brand hover:bg-cream transition-colors"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full bg-brand/10 text-brand">
            <ShoppingBag size={22} />
          </span>
          <span>
            <span className="block text-sm tracking-wider text-gray-800">View Shop</span>
            <span className="block text-xs text-gray-500">See the live storefront grid</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
