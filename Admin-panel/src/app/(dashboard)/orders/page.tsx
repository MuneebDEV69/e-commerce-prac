import Link from 'next/link'
import { fetchOrders } from '@/lib/api'
import OrdersTable from '@/components/admin/OrdersTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders — Admin' }

export default async function OrdersPage() {
  const orders = await fetchOrders()
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs text-gray-500 hover:text-brand">
        ← Back to Dashboard
      </Link>
      <h1 className="font-serif text-3xl tracking-[0.15em] text-brand mt-3 mb-1">Orders</h1>
      <p className="text-sm text-gray-500 mb-8">
        {orders.length} total · {pendingCount} awaiting verification. Approve an order once you&apos;ve confirmed its
        payment (check the transaction ID against your JazzCash / EasyPaisa / bank).
      </p>
      <OrdersTable orders={orders} />
    </div>
  )
}
