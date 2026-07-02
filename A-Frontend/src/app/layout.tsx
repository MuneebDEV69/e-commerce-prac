import '../styles/globals.css'
import React from 'react'
import Header from '../components/layout/Header'
import Marquee from '../components/layout/Marquee'
import Footer from '../components/layout/Footer'
import WhatsAppButton from '../components/layout/WhatsAppButton'

export const metadata = {
  title: 'Araish — Premium Luxury Bedding',
  description: 'Araish-inspired storefront prototype'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-white text-black overflow-x-clip">
        <Header />
        <Marquee />

        <main className="min-h-screen">{children}</main>

        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
