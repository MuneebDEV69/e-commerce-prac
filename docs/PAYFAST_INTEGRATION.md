# GoPayFast (PayFast Pakistan) — Card Payment Integration

This guide explains the PayFast card-payment integration that is **already wired into
the code** and how to turn it on. Until you add merchant credentials, card payments
stay **off** and checkout safely falls back to placing a pending order — nothing
breaks.

> ⚠️ I could not open `gopayfast.com/docs` directly (it's behind a Cloudflare
> challenge), so the endpoints and parameter names below follow the standard
> **APPS IPG** flow that GoPayFast uses. Before going live, confirm the four items
> in [§7 Verify against your docs](#7-verify-against-your-account) against your
> merchant dashboard / onboarding email.

---

## 1. How it works (the flow)

```
Customer clicks "Complete order" with "Debit - Credit Card" selected
        │
        ▼
Storefront  POST /api/payfast/initiate      (Next proxy, keeps API URL private)
        │
        ▼
Backend  POST /v1/payfast/initiate
        │  1. re-prices the cart from the DB (never trusts the browser)
        │  2. creates a PENDING order (order.id == PayFast BASKET_ID)
        │  3. calls PayFast GetAccessToken  → TOKEN
        │  4. returns { postUrl, params }
        ▼
Browser auto-submits a hidden form to PayFast's hosted page  (customer pays there)
        │
        ├─ PayFast → your CHECKOUT_URL  (server-to-server IPN)  ← AUTHORITATIVE
        │        Backend marks the order CONFIRMED (err_code '000') or CANCELLED
        │
        └─ PayFast → SUCCESS_URL / FAILURE_URL  (browser redirect)
                 Storefront shows /checkout/result and clears the cart on success
```

**Key rule:** the order's paid/failed status is decided by the **IPN callback**
(`/v1/payfast/callback`), not by the browser redirect. The redirect is only for
showing the customer a friendly result.

---

## 2. Files involved

| File | Purpose |
|------|---------|
| `A-Backend/src/lib/payfast.ts` | Config + `getAccessToken()` |
| `A-Backend/src/routes/payfast.ts` | `POST /initiate` and `POST /callback` (IPN) |
| `A-Backend/src/index.ts` | Registers the route + `express.urlencoded()` for the IPN |
| `A-Frontend/src/app/api/payfast/initiate/route.ts` | Next proxy to the backend |
| `A-Frontend/src/app/checkout/page.tsx` | Redirects to PayFast when card is chosen |
| `A-Frontend/src/app/checkout/result/page.tsx` | Success / failure landing page |
| `A-Backend/.env.example` | The env vars you must fill in |

---

## 3. Get your credentials

1. Sign up / log in at **gopayfast.com** and complete merchant onboarding.
2. From the merchant dashboard, copy your **Merchant ID** and **Secured Key**.
3. You get two environments:
   - **Sandbox** (testing): host `https://ipguat.apps.net.pk`
   - **Production** (live): host `https://ipg1.apps.net.pk`

   The code picks the host automatically from `PAYFAST_MODE` (`sandbox` | `live`).

---

## 4. Configure environment variables

In **`A-Backend/.env`** (local) and in **Render** (production), set:

```env
PAYFAST_MODE="sandbox"          # switch to "live" for production
PAYFAST_MERCHANT_ID="<your merchant id>"
PAYFAST_SECURED_KEY="<your secured key>"
PAYFAST_MERCHANT_NAME="Muneeb Ki Araish"
PAYFAST_STORE_ID=""             # only if your account uses store ids
BACKEND_PUBLIC_URL="https://<your-backend>.onrender.com"   # public URL of the API
FRONTEND_URL="https://<your-store>.vercel.app"             # already used for CORS
```

- `BACKEND_PUBLIC_URL` **must be publicly reachable over HTTPS** in production —
  PayFast calls it server-to-server for the IPN. `localhost` won't receive live
  callbacks (see §5 for local testing).
- The moment `PAYFAST_MERCHANT_ID` **and** `PAYFAST_SECURED_KEY` are both set, card
  payments turn on. Leave either blank to keep them off.

---

## 5. Test in sandbox

1. Set the sandbox env vars above and restart the backend (`npm run dev:backend`).
2. Add a product to the cart → checkout → choose **Debit - Credit Card** →
   **Complete order**.
3. You should be redirected to PayFast's sandbox page. Pay with a **sandbox test
   card** (get the test card numbers from your GoPayFast dashboard/docs).
4. After paying you land on `/checkout/result?status=success` and the cart clears.
5. Confirm the order flipped to **CONFIRMED** in the DB (Supabase table `orders`).

**Local IPN note:** on `localhost`, PayFast can't reach your callback. Either
- expose the backend with a tunnel (`ngrok http 4000`) and set
  `BACKEND_PUBLIC_URL` to the ngrok HTTPS URL, or
- test the full server-to-server callback only on the deployed (Render) backend.

Without a reachable callback the browser still redirects to the result page, but the
order status won't update automatically.

---

## 6. Go live

- [ ] Set `PAYFAST_MODE="live"` and swap in your **production** Merchant ID + Secured Key.
- [ ] `BACKEND_PUBLIC_URL` points to your HTTPS Render URL.
- [ ] In the GoPayFast dashboard, whitelist your production callback URL
      (`https://<backend>/v1/payfast/callback`) and return URLs if required.
- [ ] Do one real low-value transaction end-to-end and confirm the order confirms.

---

## 7. Verify against your account

These four things vary by merchant setup — confirm them in your GoPayFast docs
before going live and tweak the code if needed (all in `A-Backend/src/`):

1. **Base URLs** — `payfast.ts` uses `ipguat`/`ipg1` `.../Ecommerce/api/Transaction/…`.
2. **`SIGNATURE`** — some accounts require a computed signature/checksum; others
   accept the secured key. Currently `payfast.ts` sends `SECURED_KEY`. If your docs
   specify a hash (e.g. of ordered params), implement it in `routes/payfast.ts`
   where `params.SIGNATURE` is set.
3. **Transaction param names** — the `params` object in `routes/payfast.ts`
   (`MERCHANT_ID`, `TOKEN`, `TXNAMT`, `BASKET_ID`, `SUCCESS_URL`, `FAILURE_URL`,
   `CHECKOUT_URL`, …). Adjust any that differ.
4. **Callback field names** — `routes/payfast.ts` reads `basket_id`, `err_code`,
   `transaction_id` (success = `err_code === '000'`). Match these to what PayFast
   actually posts.

---

## 8. Turning it off

Delete/blank `PAYFAST_MERCHANT_ID` or `PAYFAST_SECURED_KEY`. Card checkout then
returns HTTP 503 from `/initiate` and the storefront automatically places a normal
pending order instead — customers are never blocked.
