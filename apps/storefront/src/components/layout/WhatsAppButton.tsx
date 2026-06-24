/**
 * Fixed floating WhatsApp CTA. Clicking opens a chat with the store number.
 * Lucide has no WhatsApp brand glyph, so we use an inline SVG logo.
 */
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923457546228"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.05 31.314l6.144-1.964A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.318 22.594c-.386 1.09-1.92 1.994-3.142 2.258-.836.178-1.928.32-5.604-1.204-4.7-1.948-7.726-6.724-7.962-7.034-.226-.31-1.9-2.53-1.9-4.826 0-2.296 1.166-3.424 1.636-3.904.386-.394.842-.574 1.32-.574.154 0 .294.008.42.014.378.016.568.038.818.636.31.748 1.066 2.62 1.156 2.81.092.19.184.448.06.758-.116.32-.218.45-.428.692-.218.242-.424.428-.642.688-.198.226-.422.47-.17.902.252.424 1.122 1.85 2.41 2.996 1.662 1.476 3.012 1.95 3.49 2.15.356.148.78.112 1.04-.164.33-.354.738-.942 1.154-1.522.296-.414.67-.466 1.062-.318.4.14 2.524 1.19 2.958 1.406.434.216.722.32.828.5.106.182.106 1.04-.28 2.13Z"/>
      </svg>
    </a>
  )
}
