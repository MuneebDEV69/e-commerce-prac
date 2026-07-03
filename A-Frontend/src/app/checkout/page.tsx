'use client'

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Copy } from 'lucide-react'
import { useCartStore, cartSubtotal, useCartHydrated } from '@/lib/cart'
import { formatPrice } from '@/lib/products'
import { PAYMENT_OPTIONS, type PaymentMethod } from '@/lib/payment'
import { createClient } from '@/utils/supabase/client'

type Placed = { orderId: string; totalAmount: number; paymentMethod: PaymentMethod }

const initialForm = {
  contact: '',
  country: 'Pakistan',
  firstName: '',
  lastName: '',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  phone: '',
  saveInfo: false,
  billing: 'same' as 'same' | 'different',
  billingAddress: '',
  paymentRef: ''
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const instructions = useCartStore((s) => s.instructions)
  const clear = useCartStore((s) => s.clear)
  const hydrated = useCartHydrated()

  const [form, setForm] = useState(initialForm)
  const [accountEmail, setAccountEmail] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('COD')

  // Ordering requires an account. Enforce it (middleware also gates /checkout) and
  // pre-fill the contact with the signed-in email so order emails reach the buyer.
  useEffect(() => {
    let active = true
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (!active) return
        const user = data.user
        if (!user) {
          window.location.assign('/login?redirect=/checkout')
          return
        }
        if (user.email) {
          setAccountEmail(user.email)
          setForm((f) => (f.contact ? f : { ...f, contact: user.email as string }))
        }
      })
    } catch {
      /* env missing — middleware still gates the route */
    }
    return () => {
      active = false
    }
  }, [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [discount, setDiscount] = useState('')
  const [discountMsg, setDiscountMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [placed, setPlaced] = useState<Placed | null>(null)

  const set =
    (k: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm((f) => ({ ...f, [k]: value }))
      setErrors((prev) => (prev[k] ? { ...prev, [k]: '' } : prev))
    }

  const selectedOption = PAYMENT_OPTIONS.find((o) => o.value === payment)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.contact.trim()) e.contact = 'Enter an email or phone number'
    if (!form.firstName.trim()) e.firstName = 'Enter a first name'
    if (!form.lastName.trim()) e.lastName = 'Enter a last name'
    if (!form.address.trim()) e.address = 'Enter an address'
    if (!form.city.trim()) e.city = 'Enter a city'
    if (!form.phone.trim()) e.phone = 'Enter a phone number'
    if (payment !== 'COD' && !form.paymentRef.trim()) e.paymentRef = 'Enter your transaction ID or sending number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    if (!validate()) return

    // Prefer the signed-in account email so order emails always reach the buyer.
    const email = accountEmail || (form.contact.includes('@') ? form.contact.trim() : '')
    const fullAddress = [form.address.trim(), form.apartment.trim()].filter(Boolean).join(', ')
    const noteParts = [
      instructions.trim(),
      form.billing === 'different' && form.billingAddress.trim()
        ? `Billing address: ${form.billingAddress.trim()}`
        : ''
    ].filter(Boolean)

    const payload = {
      customerName: `${form.firstName} ${form.lastName}`.trim(),
      customerPhone: form.phone,
      customerEmail: email,
      shippingAddress: fullAddress,
      city: form.city,
      postalCode: form.postalCode,
      paymentMethod: payment,
      paymentRef: form.paymentRef,
      notes: noteParts.join(' | '),
      items: items.map((i) => ({ slug: i.slug, quantity: i.qty }))
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Could not place your order. Please try again.')
        return
      }
      setPlaced({ orderId: data.orderId, totalAmount: data.totalAmount, paymentMethod: payment })
      clear()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm tracking-wider text-gray-400">Checkout is loading…</div>
  }

  // ── Confirmation ──
  if (placed) {
    const paidManually = placed.paymentMethod !== 'COD'
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle2 size={48} strokeWidth={1.2} className="mx-auto text-green-600" />
        <h1 className="mt-5 text-2xl tracking-wider text-gray-800">Order placed!</h1>
        <p className="mt-3 text-sm text-gray-600">
          Thank you. Your order <span className="font-medium">#{placed.orderId.slice(-8).toUpperCase()}</span> has
          been received.{' '}
          {paidManually
            ? 'We will verify your payment and confirm your order shortly — you’ll be contacted on your mail.'
            : 'We’ll contact you on your phone number to confirm delivery (Cash on Delivery).'}
        </p>
        <p className="mt-2 text-sm text-gray-800">
          Order total: <span className="font-medium">{formatPrice(placed.totalAmount)}</span>
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

  // ── Empty cart guard ──
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl tracking-wider text-gray-800">Your cart is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-brand text-white text-sm tracking-widest px-10 py-3 hover:bg-brand-dark transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)
  const base = 'w-full rounded px-4 py-3 text-sm outline-none transition-colors'
  const cls = (k: string) =>
    `${base} border ${errors[k] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-brand'}`
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null)

  const applyDiscount = () => setDiscountMsg(discount.trim() ? 'This code isn’t valid.' : null)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
        {/* ══ LEFT: form ══ */}
        <form onSubmit={onSubmit} noValidate className="order-2 lg:order-1 space-y-8">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded">{error}</div>
          )}

          {/* Contact */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg text-gray-900">Contact</h2>
              <Link href="/login?redirect=/checkout" className="text-sm text-brand underline">
                Sign in
              </Link>
            </div>
            <input value={form.contact} onChange={set('contact')} placeholder="Email or mobile phone number" className={cls('contact')} />
            <Err k="contact" />
          </section>

          {/* Delivery */}
          <section>
            <h2 className="text-lg text-gray-900 mb-3">Delivery</h2>
            <div className="space-y-3">
              <select value={form.country} onChange={set('country')} className={`${cls('country')} bg-white`}>
                <option value="Pakistan">Pakistan</option>
              </select>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="First name" className={cls('firstName')} />
                  <Err k="firstName" />
                </div>
                <div>
                  <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" className={cls('lastName')} />
                  <Err k="lastName" />
                </div>
              </div>

              <div>
                <input value={form.address} onChange={set('address')} placeholder="Address" className={cls('address')} />
                <Err k="address" />
              </div>
              <input value={form.apartment} onChange={set('apartment')} placeholder="Apartment, suite, etc. (optional)" className={cls('apartment')} />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <input value={form.city} onChange={set('city')} placeholder="City" className={cls('city')} />
                  <Err k="city" />
                </div>
                <input value={form.postalCode} onChange={set('postalCode')} placeholder="Postal code (optional)" className={cls('postalCode')} />
              </div>

              <div>
                <input value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="Phone" className={cls('phone')} />
                <Err k="phone" />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 pt-1">
                <input type="checkbox" checked={form.saveInfo} onChange={set('saveInfo')} className="accent-brand w-4 h-4" />
                Save this information for next time
              </label>
            </div>
          </section>

          {/* Shipping method */}
          <section>
            <h2 className="text-lg text-gray-900 mb-3">Shipping method</h2>
            <div className="flex items-center justify-between border border-brand bg-brand/5 rounded px-4 py-3.5 text-sm">
              <span className="text-gray-800">Free Shipping</span>
              <span className="font-medium text-gray-800">FREE</span>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-lg text-gray-900 mb-1">Payment</h2>
            <p className="text-xs text-gray-500 mb-3">All transactions are secure and verified by our team.</p>
            <div className="border border-gray-300 rounded divide-y divide-gray-200">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer text-sm ${payment === opt.value ? 'bg-brand/5' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === opt.value}
                    onChange={() => {
                      setPayment(opt.value)
                      setErrors((p) => (p.paymentRef ? { ...p, paymentRef: '' } : p))
                    }}
                    className="accent-brand w-4 h-4"
                  />
                  <span className="flex-1 text-gray-800">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Manual payment account details + transaction id */}
            {selectedOption?.account && (
              <div className="mt-3 border border-gray-200 rounded p-4 bg-offwhite">
                <p className="text-xs text-gray-600 mb-3">{selectedOption.account.note}</p>
                <dl className="space-y-1.5 mb-4">
                  {selectedOption.account.lines.map((l) => (
                    <div key={l.label} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-gray-500">{l.label}</dt>
                      <dd className="flex items-center gap-2 font-medium text-gray-800">
                        {l.value}
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(l.value)}
                          aria-label={`Copy ${l.label}`}
                          className="text-gray-400 hover:text-brand"
                        >
                          <Copy size={14} />
                        </button>
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 text-sm pt-1 border-t border-gray-200 mt-1">
                    <dt className="text-gray-500">Amount to send</dt>
                    <dd className="font-semibold text-brand">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <label className="block text-xs tracking-wider text-gray-600 mb-1.5">
                  TRANSACTION ID / SENDING NUMBER *
                </label>
                <input
                  value={form.paymentRef}
                  onChange={set('paymentRef')}
                  placeholder="e.g. JazzCash TID or the number you sent from"
                  className={cls('paymentRef')}
                />
                <Err k="paymentRef" />
              </div>
            )}
          </section>

          {/* Billing address */}
          <section>
            <h2 className="text-lg text-gray-900 mb-3">Billing address</h2>
            <div className="border border-gray-300 rounded divide-y divide-gray-200">
              {(['same', 'different'] as const).map((b) => (
                <label key={b} className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer text-sm ${form.billing === b ? 'bg-brand/5' : ''}`}>
                  <input type="radio" name="billing" checked={form.billing === b} onChange={() => setForm((f) => ({ ...f, billing: b }))} className="accent-brand w-4 h-4" />
                  <span className="flex-1 text-gray-800">{b === 'same' ? 'Same as shipping address' : 'Use a different billing address'}</span>
                </label>
              ))}
            </div>
            {form.billing === 'different' && (
              <textarea value={form.billingAddress} onChange={set('billingAddress')} rows={3} placeholder="Billing address" className={`${cls('billingAddress')} mt-3 resize-y`} />
            )}
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand text-white text-sm tracking-[0.2em] py-4 rounded hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {submitting ? 'PLACING ORDER…' : 'COMPLETE ORDER'}
          </button>
        </form>

        {/* ══ RIGHT: order summary ══ */}
        <aside className="order-1 lg:order-2 bg-offwhite border border-gray-200 rounded-lg p-6 h-fit lg:sticky lg:top-24">
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0 bg-cream rounded overflow-hidden border border-gray-200">
                  {i.image && <Image src={i.image} alt={i.title} fill sizes="56px" className="object-cover" />}
                  <span className="absolute -top-2 -right-2 grid place-items-center min-w-[20px] h-5 px-1 rounded-full bg-gray-800 text-white text-[10px]">
                    {i.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{i.title}</p>
                  <p className="text-xs text-gray-400 truncate">{[i.size, i.fabric, i.color].filter(Boolean).join(' / ')}</p>
                </div>
                <span className="text-sm text-gray-800 tabular-nums whitespace-nowrap">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount code" className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-sm outline-none focus:border-brand bg-white" />
            <button type="button" onClick={applyDiscount} className="px-5 rounded bg-gray-200 text-gray-600 text-sm hover:bg-gray-300 transition-colors">
              Apply
            </button>
          </div>
          {discountMsg && <p className="mt-2 text-xs text-red-600">{discountMsg}</p>}

          <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 mt-2">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900 tabular-nums">
                <span className="text-xs text-gray-400 mr-1">PKR</span>
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
