import Image from 'next/image'
import { Linkedin, Instagram, Github, Send } from 'lucide-react'

const SOCIALS = [
  { Icon: Linkedin, href: 'https://linkedin.com/in/muneeb-arif-5bbb66374', label: 'LinkedIn' },
  { Icon: Instagram, href: 'https://www.instagram.com/muneeb_arif225', label: 'Instagram' },
  { Icon: Github, href: 'https://github.com/muneeb-codehub', label: 'GitHub' }
]

const LINK_COLUMNS = [
  { title: 'BUYING POLICIES', links: ['Shipping', 'Exchange Policy', 'Payment Method', 'Privacy Policy'] },
  { title: 'CUSTOMER CARE', links: ['Corporate Order', 'FAQs', 'Terms & Conditions'] },
  { title: 'ABOUT US', links: ['The Brand', 'Contact Us', 'Size Guide'] }
]

export default function Footer() {
  return (
    <footer className="bg-offwhite pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
          {/* Newsletter + socials */}
          <div className="lg:col-span-2">
            <h4 className="text-lg text-gray-800 mb-4">Subscribe to our Email Newsletter</h4>
            <div className="flex max-w-sm">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="flex-1 border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="bg-brand text-white px-4 grid place-items-center hover:bg-brand-dark transition-colors"
              >
                <Send size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex gap-3 mt-5">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid place-items-center w-9 h-9 rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  <Icon size={16} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold tracking-wider text-gray-800 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-600 hover:text-brand transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-gray-800 mb-4">CONTACT US</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <a href="tel:+923457546228" className="hover:text-brand transition-colors">
                  +92 345-7546228
                </a>
              </li>
              <li>
                <a href="mailto:muneebarif645@gmail.com" className="hover:text-brand transition-colors">
                  muneebarif645@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + copyright + payment icons */}
        <hr className="my-6 border-gray-200" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 text-center sm:text-left">
            © 2026 Muneeb Ki Araish, Designed &amp; Developed by{' '}
            <a
              href="https://github.com/muneeb-codehub"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand"
            >
              muneeb-codehub
            </a>
          </p>
          <div className="flex items-center gap-3">
            <Image src="/icons/visa.png" alt="Visa" width={40} height={40} className="h-7 w-auto object-contain" />
            <Image src="/icons/debit.png" alt="Debit card" width={40} height={25} className="h-7 w-auto object-contain" />
          </div>
        </div>
      </div>
    </footer>
  )
}
