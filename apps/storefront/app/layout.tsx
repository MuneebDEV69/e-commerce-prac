import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Storefront',
  description: 'Araish-inspired storefront prototype'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-black">
        <header className="border-b">
          <div className="bg-brand py-2 text-white text-center text-sm">Enjoy Free Shipping on Orders Above PKR 5,000</div>
          <div className="flex items-center justify-between p-4">
            <div className="w-1/4">☰</div>
            <div className="text-2xl font-serif">Araish‑Like</div>
            <div className="w-1/4 flex justify-end space-x-4">🔍 👤 🛒</div>
          </div>
          <div className="overflow-hidden text-sm text-gray-600 py-2">
            <div className="animate-marquee whitespace-nowrap">Established 1954 — Free Shipping over PKR 5,000 — Premium Luxury Bedding since 2016</div>
          </div>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-offwhite p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Buying Policies</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Shipping</li>
                <li>Exchange</li>
                <li>Privacy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Care</h4>
            </div>
            <div>
              <h4 className="font-semibold mb-2">About Us</h4>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
            </div>
          </div>
        </footer>

        <style>{`
          .animate-marquee { display:inline-block; transform:translateX(0); animation: marquee 18s linear infinite; }
          @keyframes marquee { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }
        `}</style>
      </body>
    </html>
  )
}
