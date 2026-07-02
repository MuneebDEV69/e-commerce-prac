import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Seed data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Luxury Bedding', slug: 'luxury-bedding' },
  { name: 'Cushions', slug: 'cushions' },
  { name: 'Dining Linens', slug: 'dining-linens' },
  { name: 'Kids Bedding', slug: 'kids-bedding' }
]

type SeedProduct = {
  title: string
  slug: string
  description: string
  priceFrom: number // whole PKR
  stock: number
  mediaUrls: string[]
  categorySlug: string
}

const PRODUCTS: SeedProduct[] = [
  // ── Luxury Bedding ──
  {
    title: 'Royal Velvet Bridal Set',
    slug: 'royal-velvet-bridal-set',
    description:
      'A regal 8-piece bridal ensemble in plush velvet with intricate hand-guided embroidery. Crafted for the celebration of a lifetime, finished with a 400+ thread count cotton sateen base.',
    priceFrom: 85000,
    stock: 20,
    mediaUrls: ['/images/feature-bedding.jpg', '/images/story-bedding.jpg'],
    categorySlug: 'luxury-bedding'
  },
  {
    title: 'Imperial Gold Duvet Set',
    slug: 'imperial-gold-duvet-set',
    description:
      'Hotel-grade luxury bedding with a refined gold border, woven from 100% long-staple cotton sateen. Silky smooth, breathable, and built to last.',
    priceFrom: 62000,
    stock: 35,
    mediaUrls: ['/images/cat-luxury.jpg', '/images/cat-signature.jpg'],
    categorySlug: 'luxury-bedding'
  },
  {
    title: 'Pearl Sateen Bedding Set',
    slug: 'pearl-sateen-bedding-set',
    description:
      'Understated elegance in a soft pearl-white sateen finish. A timeless set that brings calm, hotel-like comfort to any bedroom.',
    priceFrom: 48000,
    stock: 50,
    mediaUrls: ['/images/story-bedding.jpg', '/images/feature-bedding.jpg'],
    categorySlug: 'luxury-bedding'
  },

  // ── Cushions ──
  {
    title: 'Minimalist Linen Cushion',
    slug: 'minimalist-linen-cushion',
    description:
      'A clean, contemporary cushion in textured pure linen. Soft duck-cotton fill brings a gentle touch of personality to any space.',
    priceFrom: 4500,
    stock: 80,
    mediaUrls: ['/images/story-cushions.jpg'],
    categorySlug: 'cushions'
  },
  {
    title: 'Floral Duck Cotton Cushion Pair',
    slug: 'floral-duck-cotton-cushion-pair',
    description:
      'A pair of statement cushions in a heritage floral print on premium duck cotton, with a textured jute canvas reverse.',
    priceFrom: 6800,
    stock: 60,
    mediaUrls: ['/images/cat-cushions.jpg', '/images/story-cushions.jpg'],
    categorySlug: 'cushions'
  },
  {
    title: 'Embroidered Velvet Cushion',
    slug: 'embroidered-velvet-cushion',
    description:
      'Rich velvet cushion with delicate tonal embroidery — a plush, tactile accent for sofas and beds alike.',
    priceFrom: 7500,
    stock: 45,
    mediaUrls: ['/images/story-cushions.jpg'],
    categorySlug: 'cushions'
  },

  // ── Dining Linens ──
  {
    title: 'Classic Cotton Table Runner',
    slug: 'classic-cotton-table-runner',
    description:
      'An elegant cotton table runner with a subtle woven border. The perfect finishing touch for everyday meals and formal dining alike.',
    priceFrom: 5500,
    stock: 70,
    mediaUrls: ['/images/dining-story.jpg'],
    categorySlug: 'dining-linens'
  },
  {
    title: 'Earthy Tones Table Linen Set',
    slug: 'earthy-tones-table-linen-set',
    description:
      'A coordinated set of tablecloth, runner, and napkins in warm earthy tones. Woven from durable, easy-care cotton for 6 to 8-seater tables.',
    priceFrom: 12000,
    stock: 40,
    mediaUrls: ['/images/dining-story.jpg', '/images/cat-dining.jpg'],
    categorySlug: 'dining-linens'
  },
  {
    title: 'Festive Embroidered Napkin Set',
    slug: 'festive-embroidered-napkin-set',
    description:
      'A set of six finely embroidered cotton napkins, designed to elevate special-occasion table settings.',
    priceFrom: 3800,
    stock: 90,
    mediaUrls: ['/images/cat-dining.jpg'],
    categorySlug: 'dining-linens'
  },

  // ── Kids Bedding ──
  {
    title: 'Butterfly Dreams Kids Set',
    slug: 'butterfly-dreams-kids-set',
    description:
      'A cheerful butterfly-print bedding set built for little ones. Made from 100% cotton percale — soft, breathable, and easy to wash.',
    priceFrom: 14500,
    stock: 50,
    mediaUrls: ['/images/feature-kids.jpg', '/images/cat-kids.jpg'],
    categorySlug: 'kids-bedding'
  },
  {
    title: 'Pastel Cloud Toddler Bedding',
    slug: 'pastel-cloud-toddler-bedding',
    description:
      'Gentle pastel tones and a cloud-soft handle make this toddler set a nursery favourite. Hypoallergenic and machine washable.',
    priceFrom: 11000,
    stock: 55,
    mediaUrls: ['/images/cat-kids.jpg'],
    categorySlug: 'kids-bedding'
  },
  {
    title: 'Adventure Time Bed Sheet Set',
    slug: 'adventure-time-bed-sheet-set',
    description:
      'A playful printed bed sheet set that sparks imagination, crafted from durable everyday cotton for active kids.',
    priceFrom: 9800,
    stock: 65,
    mediaUrls: ['/images/feature-kids.jpg'],
    categorySlug: 'kids-bedding'
  }
]

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...')

  // Upsert categories, keep slug → id map
  const categoryId = new Map<string, string>()
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c
    })
    categoryId.set(c.slug, row.id)
    console.log(`  ✓ category: ${c.name}`)
  }

  // Upsert products (idempotent by slug)
  for (const p of PRODUCTS) {
    const data = {
      title: p.title,
      slug: p.slug,
      description: p.description,
      priceFrom: p.priceFrom,
      stock: p.stock,
      published: true,
      mediaUrls: p.mediaUrls,
      categoryId: categoryId.get(p.categorySlug)!
    }
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data
    })
    console.log(`  ✓ product:  ${p.title} — Rs.${p.priceFrom.toLocaleString('en-US')}`)
  }

  const [cats, prods] = await Promise.all([prisma.category.count(), prisma.product.count()])
  console.log(`\n✅ Done. ${cats} categories, ${prods} products in the database.`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
