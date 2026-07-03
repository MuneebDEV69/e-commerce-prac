/**
 * GoPayFast (PayFast Pakistan / APPS IPG) helper.
 *
 * Two-step hosted-checkout flow:
 *   1. getAccessToken() — server-to-server call with MERCHANT_ID + SECURED_KEY to
 *      obtain a short-lived TOKEN scoped to this basket + amount.
 *   2. The browser is redirected (auto-submitted form) to POST_TRANSACTION_URL with
 *      that TOKEN and the order params; the customer pays on PayFast's hosted page.
 *   3. PayFast calls our CHECKOUT_URL (server-to-server) and redirects the browser to
 *      SUCCESS_URL / FAILURE_URL. We mark the order paid when err_code === '000'.
 *
 * ⚠️ CONFIRM in your GoPayFast merchant docs/dashboard: the exact base URLs, the
 * parameter names below, and how (if) SIGNATURE must be computed. They are set here
 * to the documented APPS IPG defaults; adjust if your account differs.
 */

const IS_LIVE = process.env.PAYFAST_MODE === 'live'

// Sandbox vs production hosts (APPS IPG). Verify against your onboarding email.
const BASE = IS_LIVE ? 'https://ipg1.apps.net.pk' : 'https://ipguat.apps.net.pk'

export const PAYFAST = {
  enabled: Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY),
  merchantId: process.env.PAYFAST_MERCHANT_ID ?? '',
  securedKey: process.env.PAYFAST_SECURED_KEY ?? '',
  merchantName: process.env.PAYFAST_MERCHANT_NAME ?? 'Muneeb Ki Araish',
  storeId: process.env.PAYFAST_STORE_ID ?? '',
  tokenUrl: `${BASE}/Ecommerce/api/Transaction/GetAccessToken`,
  postUrl: `${BASE}/Ecommerce/api/Transaction/PostTransaction`
}

/**
 * Step 1 — fetch a one-time ACCESS_TOKEN for this basket + amount.
 * Returns the token string, or throws with the gateway's message.
 */
export async function getAccessToken(basketId: string, amount: number): Promise<string> {
  const body = new URLSearchParams({
    MERCHANT_ID: PAYFAST.merchantId,
    SECURED_KEY: PAYFAST.securedKey,
    BASKET_ID: basketId,
    TXNAMT: String(amount)
  })

  const res = await fetch(PAYFAST.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })

  const data = (await res.json().catch(() => ({}))) as { ACCESS_TOKEN?: string; message?: string; code?: string }
  if (!res.ok || !data.ACCESS_TOKEN) {
    throw new Error(data.message || `PayFast token request failed (${res.status}).`)
  }
  return data.ACCESS_TOKEN
}
