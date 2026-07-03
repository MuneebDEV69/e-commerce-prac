import { z } from 'zod'

/**
 * Shared contracts used by both A-Frontend and A-Backend so the client and API
 * agree on the exact shape of data. Import via `@ecom/shared`.
 */

export const productInputSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.'),
  description: z.string().trim().optional().default(''),
  // Structured detail fields — every product uses the SAME format so they all edit alike.
  material: z.string().trim().optional().default(''),
  care: z.string().trim().optional().default(''),
  // whole PKR (integer) — never floats for currency
  priceFrom: z.number().int('Price must be a whole number.').nonnegative('Price cannot be negative.'),
  stock: z.number().int().nonnegative('Stock cannot be negative.').default(0),
  categoryId: z.string().min(1).nullable().optional(),
  mediaUrls: z.array(z.string().min(1)).default([])
})

export type ProductInput = z.infer<typeof productInputSchema>

export type Role = 'CUSTOMER' | 'ADMIN'

export type ProductDTO = {
  id: string
  title: string
  slug: string
  description: string | null
  material: string | null
  care: string | null
  priceFrom: number
  stock: number
  published: boolean
  mediaUrls: string[]
  categoryId: string | null
  createdAt: string
}

/**
 * Guest checkout order. The client sends only slugs + quantities; the server
 * looks up authoritative prices and computes the total (never trust client prices).
 */
export const orderInputSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your name.'),
  customerPhone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number.')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number can only contain digits.'),
  customerEmail: z.string().trim().email('Please enter a valid email.').optional().or(z.literal('')),
  shippingAddress: z.string().trim().min(5, 'Please enter your full address.'),
  city: z.string().trim().optional().default(''),
  postalCode: z.string().trim().optional().default(''),
  paymentMethod: z.enum(['COD', 'CARD', 'BANK', 'JAZZCASH', 'EASYPAISA']).default('COD'),
  // Transaction id / sender number the customer provides after paying manually.
  paymentRef: z.string().trim().max(120).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive().max(99)
      })
    )
    .min(1, 'Your cart is empty.')
})

export type OrderInput = z.infer<typeof orderInputSchema>

/* ─── Landing page: block-based CMS ─────────────────────────────────────────
 * The landing page is stored as an ordered array of "blocks". Each block has a
 * type and a free-form content object. Admin can add/remove/reorder/edit blocks;
 * the storefront renders each block type with a matching component.
 */
export type LandingBlockType =
  | 'announcement'
  | 'hero'
  | 'curated'
  | 'feature'
  | 'snug'
  | 'dining'
  | 'reels'
  | 'banner'
  | 'instagram'

export type LandingBlock = {
  id: string
  type: LandingBlockType
  // Free-form per block type; validated loosely so the CMS stays flexible.
  content: Record<string, unknown>
}

export const landingBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['announcement', 'hero', 'curated', 'feature', 'snug', 'dining', 'reels', 'banner', 'instagram']),
  content: z.record(z.any())
})
export const landingSectionsSchema = z.array(landingBlockSchema).max(50)

/** Human labels + which content keys each block type exposes (for the builder). */
export const LANDING_BLOCK_META: Record<LandingBlockType, { label: string; description: string }> = {
  announcement: { label: 'Announcement Bar', description: 'Top strip text across the site' },
  hero: { label: 'Hero Slider', description: 'Rotating full-width images' },
  curated: { label: 'Category Carousel', description: 'Scrolling category cards' },
  feature: { label: 'Feature (Bedding & Cushions)', description: 'Two-column editorial with images + text' },
  snug: { label: '3-Column Grid', description: 'Three feature cards' },
  dining: { label: 'Split Banner (Dining)', description: 'Text beside a full-height image' },
  reels: { label: 'Video Reels', description: 'Vertical video carousel' },
  banner: { label: 'Full-Width Banner', description: 'One clickable image' },
  instagram: { label: 'Instagram Strip', description: 'Heading + one wide image' }
}

/** The current storefront page encoded as blocks — the default/fallback content. */
export const DEFAULT_LANDING_SECTIONS: LandingBlock[] = [
  { id: 'announcement', type: 'announcement', content: { text: 'Enjoy Free Shipping on Orders Above PKR 5,000.' } },
  {
    id: 'hero',
    type: 'hero',
    content: {
      images: [
        '/images/hero-1.png',
        '/images/hero-2.png',
        '/images/hero-3.png',
        '/images/hero-4.png',
        '/images/hero-5.png',
        '/images/hero-6.png',
        '/images/hero-7.png'
      ]
    }
  },
  {
    id: 'curated',
    type: 'curated',
    content: {
      heading: 'CURATED FOR YOU',
      items: [
        { image: '/images/cat-new-arrivals.jpg', label: 'NEW ARRIVALS', link: '/shop' },
        { image: '/images/cat-kids.jpg', label: 'KIDS BEDDING', link: '/shop' },
        { image: '/images/cat-wedding.jpg', label: 'THE WEDDING EDIT', link: '/shop' },
        { image: '/images/cat-luxury.jpg', label: 'LUXURY BEDDING', link: '/shop' },
        { image: '/images/cat-throws.jpg', label: 'THROWS', link: '/shop' },
        { image: '/images/cat-signature.jpg', label: 'SIGNATURE BEDDING', link: '/shop' },
        { image: '/images/cat-cushions.jpg', label: 'CUSHIONS', link: '/shop' },
        { image: '/images/cat-basic.jpg', label: 'BASIC BEDDING', link: '/shop' },
        { image: '/images/cat-dining.jpg', label: 'DINING', link: '/shop' },
        { image: '/images/cat-pet.jpg', label: 'PET', link: '/shop' }
      ]
    }
  },
  {
    id: 'feature',
    type: 'feature',
    content: {
      leftImage: '/images/story-bedding.jpg',
      leftTitle: 'LITTLE DETAILS, BIG IMPACT',
      leftText:
        'Cushions that bring comfort and a gentle touch of personality to your space. Made from soft duck cotton and textured jute canvas.',
      leftButton: 'CUSHIONS',
      leftLink: '/shop',
      rightImage: '/images/story-cushions.jpg',
      rightTitle: 'WHERE COMFORT MEETS ELEGANCE',
      rightText:
        'Soft, breathable bedding sets in fresh, beautiful designs, finished with delicate embroidery and thoughtful contrasts. Made from 100% cotton, sateen, and velvet for everyday comfort.',
      rightButton: 'BEDDING',
      rightLink: '/shop'
    }
  },
  {
    id: 'snug',
    type: 'snug',
    content: {
      heading: 'SNUG & STYLISH LIVING',
      items: [
        {
          image: '/images/feature-bedding.jpg',
          title: 'SIGNATURE BEDDING',
          desc: 'Clean, crisp, and refined. Hotel-grade luxury bedding sets crafted from 100% cotton sateen with a 300+ thread count.',
          link: '/shop'
        },
        {
          image: '/images/feature-throw.jpg',
          title: 'THROWS',
          desc: 'Warm, lightweight cotton throws and blankets, ideal for layering on your bed or sofa.',
          link: '/shop'
        },
        {
          image: '/images/feature-kids.jpg',
          title: 'KIDS',
          desc: 'Soft, breathable, and built for little ones. Made from 100% cotton percale — easy to wash.',
          link: '/shop'
        }
      ]
    }
  },
  {
    id: 'dining',
    type: 'dining',
    content: {
      heading: 'DINING',
      text: 'Elegant cotton table linens for every occasion, from everyday meals to formal dining. Tablecloths, runners, and napkins available for 4 to 12-seater tables.',
      button: 'BUY NOW',
      link: '/shop',
      image: '/images/dining-story.jpg'
    }
  },
  {
    id: 'reels',
    type: 'reels',
    content: {
      heading: '#INDULGENCE, THE ARAISH WAY',
      videos: [
        '/videos/reel-1.mp4',
        '/videos/reel-2.mp4',
        '/videos/reel-3.mp4',
        '/videos/reel-4.mp4',
        '/videos/reel-5.mp4',
        '/videos/reel-6.mp4',
        '/videos/reel-7.mp4',
        '/videos/reel-8.mp4'
      ]
    }
  },
  { id: 'banner', type: 'banner', content: { image: '/images/last-chance-bg.jpeg', link: '/shop' } },
  { id: 'instagram', type: 'instagram', content: { heading: '#INSTAGRAM', image: '/images/instagram-section.png' } }
]

/** Collect every media URL referenced anywhere in a sections array (for storage cleanup). */
export function collectLandingMedia(sections: LandingBlock[]): string[] {
  const urls: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      if (v.startsWith('http')) urls.push(v)
    } else if (Array.isArray(v)) {
      v.forEach(walk)
    } else if (v && typeof v === 'object') {
      Object.values(v as Record<string, unknown>).forEach(walk)
    }
  }
  walk(sections)
  return urls
}
