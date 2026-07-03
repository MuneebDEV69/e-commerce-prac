import { Router } from 'express'
import { orderInputSchema } from '@ecom/shared'
import { prisma } from '../lib/prisma'
import { PAYFAST, getAccessToken } from '../lib/payfast'

const router = Router()

const STOREFRONT_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000'
// Public URL of THIS backend, used for PayFast's server-to-server IPN callback.
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:4000'

/**
 * Step 1 (initiate): validate the cart, create a PENDING order, get a PayFast
 * access token, and return the hosted-checkout POST url + params for the browser
 * to auto-submit. The order id doubles as the PayFast BASKET_ID so the callback
 * can find it later.
 */
router.post('/initiate', async (req, res) => {
  if (!PAYFAST.enabled) {
    return res.status(503).json({ error: 'Card payment is not configured yet.' })
  }

  const parsed = orderInputSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message })
  const data = parsed.data

  // Authoritative price lookup (never trust client prices).
  const products = await prisma.product.findMany({
    where: { slug: { in: data.items.map((i) => i.slug) }, published: true },
    select: { id: true, slug: true, priceFrom: true }
  })
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  if (data.items.some((i) => !bySlug.has(i.slug))) {
    return res.status(400).json({ error: 'Some items are no longer available.' })
  }
  const orderItems = data.items.map((i) => {
    const p = bySlug.get(i.slug)!
    return { productId: p.id, quantity: i.quantity, unitPrice: p.priceFrom }
  })
  const totalAmount = orderItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0)

  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      shippingAddress: data.shippingAddress,
      city: data.city || null,
      postalCode: data.postalCode || null,
      paymentMethod: 'CARD',
      notes: data.notes || null,
      status: 'PENDING',
      totalAmount,
      items: { create: orderItems }
    },
    select: { id: true, totalAmount: true }
  })

  let token: string
  try {
    token = await getAccessToken(order.id, order.totalAmount)
  } catch (e) {
    console.error('[payfast] token error:', e)
    return res.status(502).json({ error: (e as Error).message })
  }

  const now = new Date()
  const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`

  // Params the browser will POST to PayFast's hosted checkout page.
  const params: Record<string, string> = {
    CURRENCY_CODE: 'PKR',
    MERCHANT_ID: PAYFAST.merchantId,
    MERCHANT_NAME: PAYFAST.merchantName,
    TOKEN: token,
    PROCCODE: '00',
    TXNAMT: String(order.totalAmount),
    CUSTOMER_MOBILE_NO: data.customerPhone,
    CUSTOMER_EMAIL_ADDRESS: data.customerEmail || '',
    SIGNATURE: PAYFAST.securedKey, // some accounts require a computed signature — confirm in docs
    VERSION: 'MUNEEB-KI-ARAISH-1.0',
    TXNDESC: `Order ${order.id}`,
    SUCCESS_URL: `${STOREFRONT_URL}/checkout/result?status=success&order=${order.id}`,
    FAILURE_URL: `${STOREFRONT_URL}/checkout/result?status=failure&order=${order.id}`,
    CHECKOUT_URL: `${BACKEND_PUBLIC_URL}/v1/payfast/callback`,
    ORDER_DATE: orderDate,
    BASKET_ID: order.id,
    STORE_ID: PAYFAST.storeId,
    TRAN_TYPE: 'ECOMM_PURCHASE'
  }

  res.json({ ok: true, orderId: order.id, postUrl: PAYFAST.postUrl, params })
})

/**
 * Step 3 (IPN callback): PayFast POSTs the transaction result here server-to-server.
 * We mark the order CONFIRMED when err_code === '000', else CANCELLED. This is the
 * AUTHORITATIVE payment status (the browser redirect is only for user feedback).
 */
router.post('/callback', async (req, res) => {
  const body = req.body ?? {}
  const basketId: string | undefined = body.basket_id || body.BASKET_ID
  const errCode: string | undefined = body.err_code || body.ERR_CODE
  const txnId: string | undefined = body.transaction_id || body.TRANSACTION_ID

  if (!basketId) return res.status(400).send('Missing basket_id')

  const paid = errCode === '000'
  try {
    await prisma.order.update({
      where: { id: basketId },
      data: {
        status: paid ? 'CONFIRMED' : 'CANCELLED',
        notes: txnId ? `PayFast txn: ${txnId} (err_code ${errCode})` : `PayFast err_code ${errCode}`
      }
    })
  } catch (e) {
    console.error('[payfast] callback update failed:', e)
  }

  // PayFast just needs a 200 to consider the IPN delivered.
  res.status(200).send('OK')
})

export default router
