import { NextResponse } from 'next/server'
import { fetchOrders } from '@/lib/api'

/**
 * Recent orders for the admin notifications bell. Uses the signed-in admin's
 * session (fetchOrders forwards the Supabase token to the backend).
 */
export async function GET() {
  try {
    const orders = await fetchOrders()
    const recent = orders.slice(0, 20).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    }))
    return NextResponse.json({ orders: recent })
  } catch {
    return NextResponse.json({ orders: [] })
  }
}
