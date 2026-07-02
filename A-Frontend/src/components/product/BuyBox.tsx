'use client'

import { useState, type ReactNode } from 'react'
import { Minus, Plus, ChevronDown } from 'lucide-react'
import { type Product, formatPrice } from '../../lib/products'

/** Pill selector — active = solid black, inactive = bordered white. */
function PillGroup({
  label,
  options,
  value,
  onChange
}: {
  label: string
  options: string[]
  value: string
  onChange: (_nextValue: string) => void
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-4 py-2 text-xs sm:text-sm border transition-colors ${
                active
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-sm tracking-wider text-gray-800"
      >
        {title}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>}
    </div>
  )
}

export default function BuyBox({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0] ?? '')
  const [fabric, setFabric] = useState(product.fabrics[0] ?? '')
  const [color, setColor] = useState(product.colors[0] ?? '')
  const [qty, setQty] = useState(1)
  const [addOns, setAddOns] = useState<Set<string>>(new Set())

  const toggleAddOn = (label: string) => {
    setAddOns((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <div className="md:pl-4 lg:pl-10">
      <h1 className="text-xl sm:text-2xl tracking-wider text-brand">{product.title}</h1>
      <p className="mt-2 text-red-600 font-medium">{formatPrice(product.priceFrom)}</p>
      <p className="text-xs text-gray-500 mt-1">Shipping calculated at checkout.</p>

      <p className="mt-5 text-sm text-gray-600 leading-relaxed">{product.description}</p>
      <p className="mt-3 text-xs italic text-gray-400">
        Disclaimer: actual colors may slightly vary due to lighting and screen settings.
      </p>

      {/* Variant selectors — only shown when the product actually has options */}
      {(product.sizes.length > 0 || product.fabrics.length > 0 || product.colors.length > 0) && (
        <div className="mt-6 space-y-5">
          {product.sizes.length > 0 && (
            <PillGroup label="Size" options={product.sizes} value={size} onChange={setSize} />
          )}
          {product.fabrics.length > 0 && (
            <PillGroup label="Fabric" options={product.fabrics} value={fabric} onChange={setFabric} />
          )}
          {product.colors.length > 0 && (
            <PillGroup label="Color" options={product.colors} value={color} onChange={setColor} />
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="mt-6">
        <p className="text-xs text-gray-500 mb-2">Quantity</p>
        <div className="inline-flex items-center border border-gray-300">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-3 py-2 text-gray-700 hover:text-black"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-sm tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="px-3 py-2 text-gray-700 hover:text-black"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Complete your look */}
      {product.addOns.length > 0 && (
        <div className="mt-7">
          <p className="text-sm tracking-wider text-gray-800 mb-3">COMPLETE YOUR LOOK</p>
          <ul className="space-y-2">
            {product.addOns.map((a) => (
              <li key={a.label}>
                <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addOns.has(a.label)}
                    onChange={() => toggleAddOn(a.label)}
                    className="accent-brand w-4 h-4 mt-0.5"
                  />
                  <span>
                    Add-on: {a.label} <span className="text-gray-800">{formatPrice(a.price)}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action row */}
      <button className="mt-7 w-full bg-brand text-white text-sm tracking-widest py-4 hover:bg-brand-dark transition-colors">
        ADD TO CART
      </button>
      <a
        href="https://wa.me/923457546228"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#1c9e4d] text-xs tracking-wider py-3 hover:bg-[#25D366]/10 transition-colors"
      >
        <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.05 31.314l6.144-1.964A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.318 22.594c-.386 1.09-1.92 1.994-3.142 2.258-.836.178-1.928.32-5.604-1.204-4.7-1.948-7.726-6.724-7.962-7.034-.226-.31-1.9-2.53-1.9-4.826 0-2.296 1.166-3.424 1.636-3.904.386-.394.842-.574 1.32-.574.154 0 .294.008.42.014.378.016.568.038.818.636.31.748 1.066 2.62 1.156 2.81.092.19.184.448.06.758-.116.32-.218.45-.428.692-.218.242-.424.428-.642.688-.198.226-.422.47-.17.902.252.424 1.122 1.85 2.41 2.996 1.662 1.476 3.012 1.95 3.49 2.15.356.148.78.112 1.04-.164.33-.354.738-.942 1.154-1.522.296-.414.67-.466 1.062-.318.4.14 2.524 1.19 2.958 1.406.434.216.722.32.828.5.106.182.106 1.04-.28 2.13Z" />
        </svg>
        FOR CUSTOMIZATION CONTACT US ON WHATSAPP
      </a>

      {/* Accordions */}
      <div className="mt-8">
        <Accordion title="PRODUCT DETAILS">
          <p>
            {product.fabric ? `Fabric: ${product.fabric}. ` : ''}
            {product.category ? `Category: ${product.category}. ` : ''}
            {product.description}
          </p>
        </Accordion>
        <Accordion title="CARE INSTRUCTIONS">
          <p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Warm iron if needed.</p>
        </Accordion>
      </div>
    </div>
  )
}
