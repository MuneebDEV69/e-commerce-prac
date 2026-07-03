'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type Notif = { id: string; customerName: string; totalAmount: number; status: string; createdAt: string }

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
const money = (n: number) => `Rs.${n.toLocaleString('en-US')}`

/**
 * Admin notifications bell: polls recent orders and shows "New order placed" with
 * date & time. The badge counts orders still awaiting verification (PENDING).
 */
export default function NotificationsBell() {
  const router = useRouter()
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const load = () =>
      fetch('/api/notifications', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => active && setItems(d.orders ?? []))
        .catch(() => {})
    load()
    const id = setInterval(load, 30_000) // refresh every 30s
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const pendingCount = items.filter((o) => o.status === 'PENDING').length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-2 text-gray-600 hover:text-brand transition-colors"
      >
        <Bell size={20} />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium leading-none">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-100 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-800">
            Notifications
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {items.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => {
                      setOpen(false)
                      router.push('/orders')
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-cream transition-colors"
                  >
                    <p className="text-sm text-gray-800">
                      New order placed · <span className="font-medium">#{o.id.slice(-8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {o.customerName} · {money(o.totalAmount)}
                      {o.status === 'PENDING' && <span className="ml-1 text-amber-600">• awaiting verification</span>}
                    </p>
                    <p className="text-xs text-gray-400">{when(o.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
