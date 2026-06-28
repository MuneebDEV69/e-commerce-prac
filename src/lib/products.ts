/**
 * Static product catalogue for the prototype storefront.
 * Reuses images already present in /public/images (no new assets).
 *
 * NOTE: prices here are display-only "from" values in whole PKR. Per the project
 * doc, authoritative pricing lives server-side; the cart never stores price.
 */

export type AddOn = { label: string; price: number }

export type Product = {
  slug: string
  title: string
  priceFrom: number
  image: string
  gallery: string[]
  category: string
  fabric: string
  color: string
  description: string
  sizes: string[]
  fabrics: string[]
  colors: string[]
  addOns: AddOn[]
}

const BEDDING_THUMBS = [
  '/images/feature-bedding.jpg',
  '/images/story-bedding.jpg',
  '/images/cat-luxury.jpg',
  '/images/cat-signature.jpg'
]

export const PRODUCTS: Product[] = [
  {
    slug: 'chevron-weave-duvet-set',
    title: 'CHEVRON WEAVE DUVET SET',
    priceFrom: 21150,
    image: '/images/feature-bedding.jpg',
    gallery: ['/images/feature-bedding.jpg', ...BEDDING_THUMBS.slice(1)],
    category: 'Bedding',
    fabric: 'Cotton Sateen',
    color: 'Beige',
    description:
      'Revamp your bedroom with a fresh and stylish look of Chevron Weave from our Hotel collection, featuring a clean white base accentuated by stunning embroidery in beige and white colored chevron patterns.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen'],
    colors: ['Beige'],
    addOns: [
      { label: 'CHEVRON WEAVE Square Cushion Pair (02 Pcs)', price: 1390 },
      { label: 'CHEVRON WEAVE Dec Pillow Pair (02 pcs)', price: 1300 },
      { label: 'CHEVRON WEAVE Euro Sham Pair (02 pcs)', price: 3150 }
    ]
  },
  {
    slug: 'snowflake-duvet-set',
    title: 'SNOWFLAKE DUVET SET',
    priceFrom: 18680,
    image: '/images/story-bedding.jpg',
    gallery: ['/images/story-bedding.jpg', '/images/feature-bedding.jpg', '/images/cat-signature.jpg', '/images/cat-luxury.jpg'],
    category: 'Bedding',
    fabric: 'Cotton Sateen',
    color: 'Ivory',
    description:
      'Soft, breathable bedding finished with delicate embroidery and thoughtful contrasts. Crafted from premium cotton sateen for everyday comfort and an elegant, refined look.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen', 'Cotton Percale'],
    colors: ['Ivory', 'Blue'],
    addOns: [
      { label: 'SNOWFLAKE Square Cushion Pair (02 Pcs)', price: 1390 },
      { label: 'SNOWFLAKE Dec Pillow Pair (02 pcs)', price: 1300 }
    ]
  },
  {
    slug: 'aureate-duvet-set',
    title: 'AUREATE DUVET SET',
    priceFrom: 20530,
    image: '/images/cat-signature.jpg',
    gallery: ['/images/cat-signature.jpg', ...BEDDING_THUMBS.slice(0, 3)],
    category: 'Signature',
    fabric: 'Cotton Sateen',
    color: 'White & Gold',
    description:
      'Hotel-grade luxury bedding crafted from 100% cotton sateen with a 300+ thread count — silky smooth, breathable, and built to last.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen'],
    colors: ['White & Gold', 'White & Brown'],
    addOns: [{ label: 'AUREATE Euro Sham Pair (02 pcs)', price: 3150 }]
  },
  {
    slug: 'bricklane-duvet-set',
    title: 'BRICKLANE DUVET SET',
    priceFrom: 22270,
    image: '/images/cat-luxury.jpg',
    gallery: ['/images/cat-luxury.jpg', ...BEDDING_THUMBS.slice(0, 3)],
    category: 'Luxury',
    fabric: 'Cotton Sateen',
    color: 'White & Brown',
    description:
      'A refined frame border design in rich earthy tones. Premium cotton sateen with a crisp finish that elevates any bedroom.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen'],
    colors: ['White & Brown'],
    addOns: [{ label: 'BRICKLANE Square Cushion Pair (02 Pcs)', price: 1390 }]
  },
  {
    slug: 'dream-bedding-kids-set',
    title: 'DREAM BEDDING FOR LITTLE ONES',
    priceFrom: 14500,
    image: '/images/feature-kids.jpg',
    gallery: ['/images/feature-kids.jpg', '/images/cat-kids.jpg', '/images/story-bedding.jpg'],
    category: 'Kids',
    fabric: 'Cotton Percale',
    color: 'Pink',
    description:
      'Soft, breathable, and built for little ones. Made from 100% cotton percale — easy to wash, comfortable to sleep in, and designed for everyday use.',
    sizes: ['Single', 'Queen'],
    fabrics: ['Cotton Percale'],
    colors: ['Pink', 'Blue'],
    addOns: [{ label: 'KIDS Dec Pillow Pair (02 pcs)', price: 1100 }]
  },
  {
    slug: 'serene-knitted-throw',
    title: 'SERENE KNITTED THROW',
    priceFrom: 6950,
    image: '/images/feature-throw.jpg',
    gallery: ['/images/feature-throw.jpg', '/images/cat-throws.jpg'],
    category: 'Throws',
    fabric: 'Cotton Knit',
    color: 'Rust',
    description:
      'Warm, lightweight cotton throw, ideal for layering on your bed or sofa. Designed for daily comfort without compromising on style.',
    sizes: ['One Size'],
    fabrics: ['Cotton Knit'],
    colors: ['Rust', 'Cream'],
    addOns: []
  },
  {
    slug: 'floral-cushion-pair',
    title: 'FLORAL DUCK COTTON CUSHION PAIR',
    priceFrom: 3390,
    image: '/images/story-cushions.jpg',
    gallery: ['/images/story-cushions.jpg', '/images/cat-cushions.jpg'],
    category: 'Cushions',
    fabric: 'Duck Cotton',
    color: 'Red Floral',
    description:
      'Cushions that bring comfort and a gentle touch of personality to your space. Made from soft duck cotton and textured jute canvas.',
    sizes: ['18" x 18"', '20" x 20"'],
    fabrics: ['Duck Cotton'],
    colors: ['Red Floral'],
    addOns: []
  },
  {
    slug: 'the-wedding-edit-set',
    title: 'THE WEDDING EDIT SET',
    priceFrom: 28900,
    image: '/images/cat-wedding.jpg',
    gallery: ['/images/cat-wedding.jpg', '/images/cat-luxury.jpg', '/images/cat-signature.jpg'],
    category: 'The Wedding Edit',
    fabric: 'Cotton Sateen',
    color: 'Red',
    description:
      'Because your first home together should feel magical. A statement bedding set in rich tones, crafted for the celebration of a lifetime.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen', 'Velvet'],
    colors: ['Red', 'Maroon'],
    addOns: [{ label: 'WEDDING Euro Sham Pair (02 pcs)', price: 3150 }]
  },
  {
    slug: 'basic-cotton-bedding-set',
    title: 'BASIC COTTON BEDDING SET',
    priceFrom: 9990,
    image: '/images/cat-basic.jpg',
    gallery: ['/images/cat-basic.jpg', '/images/story-bedding.jpg'],
    category: 'Basic Bedding',
    fabric: 'Cotton Percale',
    color: 'White',
    description:
      'Everyday essentials in crisp, breathable cotton percale. Clean, versatile, and built for daily comfort.',
    sizes: ['Single', 'Queen', 'King'],
    fabrics: ['Cotton Percale'],
    colors: ['White', 'Grey'],
    addOns: []
  },
  {
    slug: 'earthy-table-linen',
    title: 'EARTHY TONES TABLE LINEN',
    priceFrom: 7450,
    image: '/images/dining-story.jpg',
    gallery: ['/images/dining-story.jpg', '/images/cat-dining.jpg'],
    category: 'Dining',
    fabric: 'Cotton',
    color: 'Earthy',
    description:
      'Elegant cotton table linens for every occasion, from everyday meals to formal dining. Tablecloths, runners, and napkins available for 4 to 12-seater tables.',
    sizes: ['6-Seater', '8-Seater', '12-Seater'],
    fabrics: ['Cotton'],
    colors: ['Earthy'],
    addOns: []
  },
  {
    slug: 'luxe-towel-set',
    title: 'LUXE BATH TOWEL SET',
    priceFrom: 4250,
    image: '/images/bath.jpg',
    gallery: ['/images/bath.jpg', '/images/bedding_accessories.jpg'],
    category: 'Bath',
    fabric: 'Terry Cotton',
    color: 'Sand',
    description:
      'Beautiful colors, premium fabric, and ultimate comfort — towels for every home. Highly absorbent terry cotton with a plush, soft feel.',
    sizes: ['Bath', 'Hand', 'Set of 3'],
    fabrics: ['Terry Cotton'],
    colors: ['Sand', 'White'],
    addOns: []
  },
  {
    slug: 'signature-bedding-set',
    title: 'SIGNATURE BORDER BEDDING SET',
    priceFrom: 23400,
    image: '/images/bedding_accessories.jpg',
    gallery: ['/images/bedding_accessories.jpg', '/images/feature-bedding.jpg', '/images/cat-signature.jpg'],
    category: 'Signature',
    fabric: 'Cotton Sateen',
    color: 'White & Gold',
    description:
      'Clean, crisp, and refined. Our signature border bedding sets are crafted from 100% cotton sateen with a 300+ thread count — silky smooth and built to last.',
    sizes: ['Queen', 'King'],
    fabrics: ['Cotton Sateen'],
    colors: ['White & Gold'],
    addOns: [{ label: 'SIGNATURE Square Cushion Pair (02 Pcs)', price: 1390 }]
  }
]

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function formatPrice(rupees: number): string {
  return `Rs.${rupees.toLocaleString('en-US')}.00`
}
