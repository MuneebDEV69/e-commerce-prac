'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type Notif = { id: string; customerName: string; totalAmount: number; status: string; createdAt: string }

const SEEN_KEY = 'araish-notif-seen' // timestamp (ms) of when the admin last opened the bell
const when = (iso: string) =>
  new Date(iso).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
const money = (n: number) => `Rs.${n.toLocaleString('en-US')}`

/**
 * Admin notifications bell. Polls recent orders every 15s and badges how many are
 * NEW since the admin last opened the bell (any order — COD or online). Opening the
 * bell marks everything seen. Pending orders are flagged "awaiting verification".
 */
export default function NotificationsBell() {
  const router = useRouter()
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<number>(() => Date.now())
  const ref = useRef<HTMLDivElement>(null)

  // Load the "last seen" marker (first ever visit = now, so old orders aren't all "new").
  useEffect(() => {
    const stored = Number(localStorage.getItem(SEEN_KEY) || 0)
    if (stored) setLastSeen(stored)
    else {
      const now = Date.now()
      localStorage.setItem(SEEN_KEY, String(now))
      setLastSeen(now)
    }
  }, [])

  // Poll recent orders every 15s.
  useEffect(() => {
    let active = true
    const load = () =>
      fetch('/api/notifications', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => active && setItems(Array.isArray(d.orders) ? d.orders : []))
        .catch(() => {})
    load()
    const id = setInterval(load, 15_000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const newCount = items.filter((o) => new Date(o.createdAt).getTime() > lastSeen).length

  const toggle = () => {
    setOpen((o) => {
      const next = !o
      if (next) {
        // Opening marks all current orders as seen → badge clears.
        const now = Date.now()
        localStorage.setItem(SEEN_KEY, String(now))
        setLastSeen(now)
      }
      return next
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-2 text-gray-600 hover:text-brand transition-colors"
      >
        <Bell size={20} />
        {newCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-medium leading-none">
            {newCount > 99 ? '99+' : newCount}
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
                      {o.status === 'CONFIRMED' && <span className="ml-1 text-green-600">• confirmed</span>}
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
