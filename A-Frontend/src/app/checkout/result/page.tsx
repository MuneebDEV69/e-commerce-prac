'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useCartStore } from '@/lib/cart'

/**
 * Landing page PayFast redirects the customer to after a card payment.
 * The AUTHORITATIVE payment status is set by the server-to-server IPN callback;
 * this page just shows friendly feedback and clears the cart on success.
 */
export default function CheckoutResultPage() {
  const clear = useCartStore((s) => s.clear)
  const [status, setStatus] = useState<'success' | 'failure' | null>(null)
  const [order, setOrder] = useState<string>('')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const s = q.get('status') === 'success' ? 'success' : 'failure'
    setStatus(s)
    setOrder(q.get('order') ?? '')
    if (s === 'success') clear()
  }, [clear])

  if (!status)
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-sm tracking-wider text-gray-400">Confirming your payment…</div>

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto text-green-600" />
        <h1 className="mt-5 text-2xl tracking-wider text-gray-800">Payment successful!</h1>
        <p className="mt-3 text-sm text-gray-600">
          Thank you. Your order{order ? ` #${order.slice(-8).toUpperCase()}` : ''} has been confirmed and paid.
          We&apos;ll be in touch about delivery.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-brand text-white text-sm tracking-widest px-10 py-3 hover:bg-brand-dark transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <XCircle size={48} strokeWidth={1.2} className="mx-auto text-red-500" />
      <h1 className="mt-5 text-2xl tracking-wider text-gray-800">Payment not completed</h1>
      <p className="mt-3 text-sm text-gray-600">
        Your payment didn&apos;t go through and you have not been charged. Your cart is still saved — you can try
        again or choose Cash on Delivery.
      </p>
      <Link
        href="/checkout"
        className="mt-8 inline-block bg-brand text-white text-sm tracking-widest px-10 py-3 hover:bg-brand-dark transition-colors"
      >
        BACK TO CHECKOUT
      </Link>
    </div>
  )
}
