/**
 * Grey infinite ticker (Layer 3).
 * Seamless loop technique: the same set of phrases is rendered twice inside a flex
 * track, and the track animates from 0 to -50%. When it has scrolled exactly one
 * copy's width, the second copy sits where the first started — so the reset is invisible.
 */
const PHRASES = [
  'Backed By A Textile Legacy Established In 1954 With 70+ Years Of Global Excellence.',
  'Enjoy Free Shipping On Orders Above PKR 5,000.',
  'Premium Luxury Bedding In Pakistan Since 2016.'
]

export default function Marquee() {
  return (
    <div className="bg-gray-100 border-b border-gray-200 overflow-hidden">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {PHRASES.map((phrase, i) => (
              <span
                key={i}
                className="mx-8 text-[11px] sm:text-xs uppercase tracking-wider font-medium text-gray-800"
              >
                {phrase}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
