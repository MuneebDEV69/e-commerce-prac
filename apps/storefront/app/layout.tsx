import '../styles/globals.css'
import React from 'react'
import Header from '../components/layout/Header'
import Marquee from '../components/layout/Marquee'

export const metadata = {
  title: 'Araish — Premium Luxury Bedding',
  description: 'Araish-inspired storefront prototype'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-black">
        <Header />
        <Marquee />

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
      </body>
    </html>
  )
}
