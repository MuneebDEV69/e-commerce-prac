'use client'

import { useState, useTransition } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { updateOrderStatus } from '@/actions/order'
import type { ApiOrder } from '@/lib/api'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-gray-200 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700'
}
const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function money(n: number) {
  return `Rs.${n.toLocaleString('en-US')}`
}

function when(iso: string) {
  return new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function OrdersTable({ orders }: { orders: ApiOrder[] }) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const change = (id: string, status: string) => {
    setError(null)
    startTransition(async () => {
      const r = await updateOrderStatus(id, status)
      if (!r.ok) setError(r.error)
    })
  }

  if (orders.length === 0) {
    return <p className="text-sm text-gray-500">No orders yet.</p>
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</div>}

      {orders.map((o) => {
        const expanded = open === o.id
        return (
          <div key={o.id} className="border border-gray-200 bg-white">
            {/* Row header */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                onClick={() => setOpen(expanded ? null : o.id)}
                className="flex items-center gap-2 text-left min-w-0 flex-1"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className="text-sm text-gray-500 truncate">{o.customerName} · {o.customerPhone}</span>
                  </span>
                  <span className="block text-xs text-gray-400">{when(o.createdAt)}</span>
                </span>
              </button>

              <span className="text-sm font-medium text-gray-800 tabular-nums">{money(o.totalAmount)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{o.paymentMethod}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] ?? 'bg-gray-100'}`}>
                {o.status}
              </span>

              {o.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => change(o.id, 'CONFIRMED')}
                    disabled={pending}
                    className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => change(o.id, 'CANCELLED')}
                    disabled={pending}
                    className="inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>

            {/* Expanded detail */}
            {expanded && (
              <div className="border-t border-gray-100 px-4 py-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs tracking-wider text-gray-400">CUSTOMER</p>
                  <p className="text-gray-800">{o.customerName}</p>
                  <p className="text-gray-600">{o.customerPhone}</p>
                  {o.customerEmail && <p className="text-gray-600">{o.customerEmail}</p>}
                  <p className="text-gray-600">
                    {o.shippingAddress}{o.city ? `, ${o.city}` : ''}{o.postalCode ? ` (${o.postalCode})` : ''}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs tracking-wider text-gray-400">PAYMENT</p>
                  <p className="text-gray-800">{o.paymentMethod}</p>
                  {o.paymentRef && <p className="text-gray-600">Txn / sender: <span className="font-medium">{o.paymentRef}</span></p>}
                  {o.notes && <p className="text-gray-500 text-xs">Notes: {o.notes}</p>}
                  <p className="text-xs tracking-wider text-gray-400 pt-2">SET STATUS</p>
                  <select
                    value={o.status}
                    onChange={(e) => change(o.id, e.target.value)}
                    disabled={pending}
                    className="border border-gray-300 px-3 py-1.5 text-sm rounded bg-white"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs tracking-wider text-gray-400 mb-1">ITEMS</p>
                  <ul className="divide-y divide-gray-100">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-3 py-2 text-gray-700">
                        {it.product?.mediaUrls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.product.mediaUrls[0]} alt="" className="w-11 h-11 object-cover rounded border border-gray-200" />
                        ) : (
                          <span className="w-11 h-11 rounded bg-gray-100 border border-gray-200" />
                        )}
                        <span className="flex-1">{it.product?.title ?? 'Product'} × {it.quantity}</span>
                        <span className="tabular-nums">{money(it.unitPrice * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
