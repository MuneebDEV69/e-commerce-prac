import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Admin — Muneeb Ki Araish',
  description: 'Back-office admin panel'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-offwhite text-black overflow-x-clip">{children}</body>
    </html>
  )
}
