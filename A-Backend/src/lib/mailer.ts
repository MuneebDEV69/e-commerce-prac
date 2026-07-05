import nodemailer from 'nodemailer'

/**
 * Email sender with two transports:
 *   1. Resend (HTTP API) — used if RESEND_API_KEY is set. HTTP works on hosts that
 *      block outbound SMTP ports (Render's free tier blocks 25/465/587 — this is
 *      the usual reason Gmail SMTP "works locally but not live").
 *   2. Gmail SMTP (nodemailer) — fallback, for hosts that allow SMTP.
 * If neither is configured we log and no-op so a missing config never breaks a request.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const SMTP_USER = process.env.SMTP_USER ?? ''
const SMTP_PASS = process.env.SMTP_PASS ?? ''
const MAIL_FROM = process.env.MAIL_FROM ?? `Muneeb Ki Araish <${SMTP_USER || 'onboarding@resend.dev'}>`
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? SMTP_USER
const STORE_NAME = 'Muneeb Ki Araish'

export const mailProvider: 'resend' | 'smtp' | 'none' = RESEND_API_KEY ? 'resend' : SMTP_USER && SMTP_PASS ? 'smtp' : 'none'

const transporter =
  mailProvider === 'smtp'
    ? nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: SMTP_USER, pass: SMTP_PASS } })
    : null

/** Low-level send that RETURNS the result (used by the /health test endpoint). */
export async function sendMailRaw(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!to) return { ok: false, error: 'No recipient.' }
  try {
    if (mailProvider === 'resend') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html })
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` }
      }
      return { ok: true }
    }
    if (transporter) {
      await transporter.sendMail({ from: MAIL_FROM, to, subject, html })
      return { ok: true }
    }
    return { ok: false, error: 'No mail provider configured (set RESEND_API_KEY or SMTP_USER/SMTP_PASS).' }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Fire-and-forget send. Never throws — email failure must not fail the request. */
export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const r = await sendMailRaw(to, subject, html)
  if (r.ok) console.log(`[mailer:${mailProvider}] sent "${subject}" → ${to}`)
  else console.error(`[mailer:${mailProvider}] failed "${subject}" → ${to}: ${r.error}`)
}

const money = (n: number) => `Rs.${n.toLocaleString('en-US')}`

/** Shared branded wrapper. */
function layout(title: string, body: string): string {
  return `
  <div style="background:#f6f3ee;padding:24px 0;font-family:Arial,Helvetica,sans-serif;color:#333">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee">
      <div style="background:#7a5c2e;padding:20px;text-align:center">
        <span style="color:#fff;font-size:18px;letter-spacing:3px">${STORE_NAME.toUpperCase()}</span>
      </div>
      <div style="padding:28px 26px">
        <h1 style="font-size:18px;color:#7a5c2e;margin:0 0 14px">${title}</h1>
        ${body}
      </div>
      <div style="padding:16px 26px;border-top:1px solid #eee;color:#999;font-size:12px;text-align:center">
        ${STORE_NAME} · This is an automated message.
      </div>
    </div>
  </div>`
}

type OrderLike = {
  id: string
  customerName: string
  customerEmail?: string | null
  totalAmount: number
  paymentMethod: string
  paymentRef?: string | null
  createdAt?: Date | string
  items: { quantity: number; unitPrice: number; product?: { title: string; mediaUrls?: string[] } | null }[]
}

const orderNo = (id: string) => `#${id.slice(-8).toUpperCase()}`

const orderDate = (o: OrderLike) =>
  o.createdAt
    ? new Date(o.createdAt).toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Karachi'
      })
    : ''

function itemsTable(o: OrderLike): string {
  const rows = o.items
    .map((it) => {
      const img = it.product?.mediaUrls?.[0]
      const thumb = img
        ? `<img src="${img}" width="46" height="46" alt="" style="width:46px;height:46px;object-fit:cover;border-radius:6px;border:1px solid #eee" />`
        : ''
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;width:56px">${thumb}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${it.product?.title ?? 'Product'} × ${it.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">${money(it.unitPrice * it.quantity)}</td>
      </tr>`
    })
    .join('')
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
    ${rows}
    <tr><td colspan="2" style="padding:8px 0;font-weight:bold">Total</td>
    <td style="padding:8px 0;text-align:right;font-weight:bold">${money(o.totalAmount)}</td></tr>
  </table>`
}

const dateLine = (o: OrderLike) =>
  orderDate(o) ? `<p style="color:#999;font-size:12px;margin:0 0 8px">Order placed: ${orderDate(o)}</p>` : ''

// ── Order lifecycle emails ──

export function orderPendingCustomer(o: OrderLike) {
  return sendMail(
    o.customerEmail ?? '',
    `Order ${orderNo(o.id)} received — pending approval`,
    layout(
      `Thank you, ${o.customerName}!`,
      `<p>We've received your order <b>${orderNo(o.id)}</b>. It is <b>pending approval</b>.</p>
       ${dateLine(o)}
       ${itemsTable(o)}
       <p>Payment method: <b>${o.paymentMethod}</b></p>
       <p>We will verify your details${o.paymentMethod !== 'COD' ? ' and payment' : ''} and send you the
       <b>order confirmed</b> email shortly. Thank you for shopping with us!</p>`
    )
  )
}

export function orderPlacedAdmin(o: OrderLike) {
  return sendMail(
    ADMIN_EMAIL,
    `New order ${orderNo(o.id)} — ${o.customerName}`,
    layout(
      `New order placed`,
      `<p><b>${o.customerName}</b> placed order <b>${orderNo(o.id)}</b>.</p>
       ${itemsTable(o)}
       <p>Payment: <b>${o.paymentMethod}</b>${o.paymentRef ? ` · Txn/Sender: <b>${o.paymentRef}</b>` : ''}</p>
       <p>${o.paymentMethod === 'COD' ? 'Cash on Delivery.' : '<b>Confirm whether the payment has been received</b>, then approve the order in the admin panel.'}</p>`
    )
  )
}

export function orderApprovedAdmin(o: OrderLike) {
  return sendMail(
    ADMIN_EMAIL,
    `You approved order ${orderNo(o.id)}`,
    layout(
      `Order approved`,
      `<p>You approved order <b>${orderNo(o.id)}</b> for <b>${o.customerName}</b>.</p>
       ${itemsTable(o)}
       <p>The customer has been notified that their order is confirmed.</p>`
    )
  )
}

export function orderConfirmedCustomer(o: OrderLike) {
  return sendMail(
    o.customerEmail ?? '',
    `Your order ${orderNo(o.id)} is confirmed!`,
    layout(
      `Your order is confirmed 🎉`,
      `<p>Great news, ${o.customerName}! Your order <b>${orderNo(o.id)}</b> is <b>confirmed</b>${
        o.paymentMethod !== 'COD' ? ' and your payment transaction was successful' : ''
      }.</p>
       ${dateLine(o)}
       ${itemsTable(o)}
       <p>You will receive your order soon. Thank you for shopping with ${STORE_NAME}!</p>`
    )
  )
}

// ── Account emails ──

export function welcomeEmail(email: string, password?: string) {
  return sendMail(
    email,
    `Welcome to ${STORE_NAME}!`,
    layout(
      `Thank you for registering!`,
      `<p>Welcome to <b>${STORE_NAME}</b> — we're delighted to have you.</p>
       <p>Here are your account details for this website:</p>
       <table style="font-size:14px;margin:12px 0">
         <tr><td style="padding:4px 12px 4px 0;color:#999">Username</td><td><b>${email}</b></td></tr>
         ${password ? `<tr><td style="padding:4px 12px 4px 0;color:#999">Password</td><td><b>${password}</b></td></tr>` : ''}
       </table>
       <p style="color:#999;font-size:12px">Please keep these details private. We recommend changing your password after your first login.</p>`
    )
  )
}

export function otpEmail(email: string, code: string, minutes: number) {
  return sendMail(
    email,
    `Your ${STORE_NAME} login code: ${code}`,
    layout(
      `Your verification code`,
      `<p>Use this code to finish signing in:</p>
       <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#7a5c2e;margin:16px 0">${code}</p>
       <p>This code expires in <b>${minutes} minutes</b>. If you didn't try to sign in, you can ignore this email.</p>`
    )
  )
}
