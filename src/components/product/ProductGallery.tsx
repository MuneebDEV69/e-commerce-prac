'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, ImageOff } from 'lucide-react'

/**
 * Product media gallery: a large active image with a zoom toggle (click to switch
 * between contain/cover "zoom") and a horizontal thumbnail strip below.
 */
export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  // No media yet — show a neutral placeholder instead of crashing next/image.
  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full grid place-items-center bg-cream text-gray-300">
        <ImageOff size={40} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <Image
          src={images[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`transition-transform duration-300 ${zoomed ? 'object-cover scale-125' : 'object-cover'}`}
        />
        <button
          onClick={() => setZoomed((z) => !z)}
          aria-label="Zoom image"
          className="absolute top-4 left-4 grid place-items-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:text-black"
        >
          <ZoomIn size={18} strokeWidth={1.5} />
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-none">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => { setActive(i); setZoomed(false) }}
              className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition ${
                i === active ? 'border-brand' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={src} alt={`${title} view ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
