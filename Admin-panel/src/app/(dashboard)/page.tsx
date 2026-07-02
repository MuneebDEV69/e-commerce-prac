import Link from 'next/link'
import { Plus, ListChecks, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Admin' }

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl tracking-[0.2em] text-brand mb-2">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-10">Manage your store catalogue.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          href="/products/new"
          className="flex items-center gap-4 border border-gray-200 bg-white p-6 hover:border-brand hover:bg-cream transition-colors"
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
          href="/products"
          className="flex items-center gap-4 border border-gray-200 bg-white p-6 hover:border-brand hover:bg-cream transition-colors"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full bg-brand/10 text-brand">
            <ListChecks size={22} />
          </span>
          <span>
            <span className="block text-sm tracking-wider text-gray-800">Manage Products</span>
            <span className="block text-xs text-gray-500">Edit, delete, adjust stock &amp; price</span>
          </span>
        </Link>

        <a
          href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'}/shop`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 border border-gray-200 bg-white p-6 hover:border-brand hover:bg-cream transition-colors"
        >
          <span className="grid place-items-center w-12 h-12 rounded-full bg-brand/10 text-brand">
            <ShoppingBag size={22} />
          </span>
          <span>
            <span className="block text-sm tracking-wider text-gray-800">View Storefront</span>
            <span className="block text-xs text-gray-500">Open the live shop</span>
          </span>
        </a>
      </div>
    </div>
  )
}
