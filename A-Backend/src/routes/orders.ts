import { Router } from 'express'
import { orderInputSchema } from '@ecom/shared'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middleware/requireAdmin'
import { orderPendingCustomer, orderConfirmedCustomer } from '../lib/mailer'

const router = Router()

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

// ── Admin: list all orders (newest first) with their items ──
router.get('/', requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { select: { title: true, slug: true, mediaUrls: true } } } } }
  })
  res.json(orders)
})

// ── Admin: update an order's status (approve/reject/fulfil) ──
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const status = String(req.body?.status ?? '')
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return res.status(400).json({ error: 'Invalid status.' })
  }
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: status as (typeof ORDER_STATUSES)[number] },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        paymentMethod: true,
        paymentRef: true,
        items: {
          select: { quantity: true, unitPrice: true, product: { select: { title: true, mediaUrls: true } } }
        }
      }
    })

    // On approval, notify the customer (confirmed). Admin gets no email.
    if (order.status === 'CONFIRMED') {
      void orderConfirmedCustomer(order)
    }

    res.json({ ok: true, id: order.id, status: order.status })
  } catch {
    res.status(404).json({ error: 'Order not found.' })
  }
})

/**
 * Public: place a guest order (COD-style — no account required).
 *
 * SECURITY: the client only sends product slugs + quantities. We look up the
 * authoritative price from the DB and compute the total server-side, so a
 * tampered client can never change what an item costs.
 */
router.post('/', async (req, res) => {
  const parsed = orderInputSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message })
  const data = parsed.data

  // Fetch the real products behind the requested slugs.
  const slugs = data.items.map((i) => i.slug)
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, published: true },
    select: { id: true, slug: true, priceFrom: true, title: true }
  })
  const bySlug = new Map(products.map((p) => [p.slug, p]))

  // Every requested slug must resolve to a real, published product.
  const missing = data.items.filter((i) => !bySlug.has(i.slug))
  if (missing.length > 0) {
    return res.status(400).json({ error: `Some items are no longer available: ${missing.map((m) => m.slug).join(', ')}` })
  }

  const orderItems = data.items.map((i) => {
    const p = bySlug.get(i.slug)!
    return { productId: p.id, quantity: i.quantity, unitPrice: p.priceFrom }
  })
  const totalAmount = orderItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)

  // COD needs no payment verification → confirm immediately. Online methods
  // (CARD / JAZZCASH / EASYPAISA) start PENDING and require admin approval.
  const isCOD = data.paymentMethod === 'COD'

  // Create the order AND decrement product stock atomically.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        shippingAddress: data.shippingAddress,
        city: data.city || null,
        postalCode: data.postalCode || null,
        paymentMethod: data.paymentMethod,
        paymentRef: data.paymentRef || null,
        notes: data.notes || null,
        status: isCOD ? 'CONFIRMED' : 'PENDING',
        totalAmount,
        items: { create: orderItems }
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        paymentMethod: true,
        paymentRef: true,
        items: {
          select: { quantity: true, unitPrice: true, product: { select: { title: true, mediaUrls: true } } }
        }
      }
    })

    // Reduce stock for every purchased product (never below 0).
    for (const item of data.items) {
      const p = bySlug.get(item.slug)!
      await tx.product.update({
        where: { id: p.id },
        data: { stock: { decrement: item.quantity } }
      })
    }
    // Clamp any product that went negative back to 0.
    await tx.product.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } })

    return created
  })

  // Email the customer: COD → straight "order confirmed"; online → "pending
  // approval" (admin verifies the payment, then approves to send the confirmed
  // email). Admin is notified in-dashboard (bell), not by email. Fire-and-forget.
  if (isCOD) void orderConfirmedCustomer(order)
  else void orderPendingCustomer(order)

  res.status(201).json({ ok: true, orderId: order.id, totalAmount: order.totalAmount })
})

export default router
