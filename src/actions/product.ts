'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/prisma'
import { isAdmin } from '@/server/auth'
import { deleteMediaByUrls } from '@/server/storage'

const ProductSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.'),
  description: z.string().trim().optional().default(''),
  // whole PKR (integer) — never floats for currency
  priceFrom: z.number().int('Price must be a whole number.').nonnegative('Price cannot be negative.'),
  stock: z.number().int().nonnegative('Stock cannot be negative.').default(0),
  categoryId: z.string().min(1).nullable().optional(),
  mediaUrls: z.array(z.string().min(1)).default([])
})

export type ProductInput = z.infer<typeof ProductSchema>
export type ActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Ensure the generated slug is unique by appending -2, -3, … if needed. */
async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'product'
  let n = 1
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  // 1. Authorize — admin only (Prisma bypasses RLS, so this guard is essential).
  if (!(await isAdmin())) {
    return { ok: false, error: 'Not authorized. Admin access required.' }
  }

  // 2. Validate.
  const parsed = ProductSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid product data.' }
  }
  const data = parsed.data

  // 3. Create.
  try {
    const slug = await uniqueSlug(slugify(data.title))
    await prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        priceFrom: data.priceFrom,
        stock: data.stock,
        published: true,
        mediaUrls: data.mediaUrls,
        categoryId: data.categoryId ?? null
      }
    })

    // 4. Refresh the storefront so the new product appears immediately.
    revalidatePath('/shop')
    revalidatePath('/')

    return { ok: true, slug }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to create product.' }
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Not authorized. Admin access required.' }
  }

  const parsed = ProductSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid product data.' }
  }
  const data = parsed.data

  try {
    // Capture the old media so we can clean up files removed during this edit.
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { slug: true, mediaUrls: true }
    })
    if (!existing) return { ok: false, error: 'Product not found.' }

    await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        priceFrom: data.priceFrom,
        stock: data.stock,
        mediaUrls: data.mediaUrls,
        categoryId: data.categoryId ?? null
      }
    })

    // Slug stays stable on edit (keeps links/SEO intact).
    const removed = existing.mediaUrls.filter((u) => !data.mediaUrls.includes(u))
    if (removed.length > 0) await deleteMediaByUrls(removed)

    revalidatePath('/shop')
    revalidatePath('/')
    revalidatePath(`/product/${existing.slug}`)
    return { ok: true, slug: existing.slug }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to update product.' }
  }
}

/** Quick stock increment/decrement from the admin list (clamped at 0). */
export async function adjustStock(id: string, delta: number): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Not authorized. Admin access required.' }
  }
  try {
    const product = await prisma.product.findUnique({ where: { id }, select: { stock: true, slug: true } })
    if (!product) return { ok: false, error: 'Product not found.' }

    await prisma.product.update({
      where: { id },
      data: { stock: Math.max(0, product.stock + delta) }
    })
    revalidatePath('/shop')
    return { ok: true, slug: product.slug }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to update stock.' }
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Not authorized. Admin access required.' }
  }
  try {
    const product = await prisma.product.delete({
      where: { id },
      select: { slug: true, mediaUrls: true }
    })
    // Remove the product's media files from storage too (no orphans).
    if (product.mediaUrls.length > 0) await deleteMediaByUrls(product.mediaUrls)

    revalidatePath('/shop')
    revalidatePath('/')
    return { ok: true, slug: product.slug }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to delete product.' }
  }
}
