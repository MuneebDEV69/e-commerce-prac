import { z } from 'zod'

/**
 * Shared contracts used by both A-Frontend and A-Backend so the client and API
 * agree on the exact shape of data. Import via `@ecom/shared`.
 */

export const productInputSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.'),
  description: z.string().trim().optional().default(''),
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
  priceFrom: number
  stock: number
  published: boolean
  mediaUrls: string[]
  categoryId: string | null
  createdAt: string
}
