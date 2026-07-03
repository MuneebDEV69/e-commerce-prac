# JazzCash & EasyPaisa — Automatic Payment Integration (Guide for later)

Right now the store uses a **manual flow**: the customer transfers to your
JazzCash/EasyPaisa/bank account, enters the transaction ID at checkout, and an
admin approves the order in **Admin → Manage Orders**. No API is required for that.

This document explains how to add **automatic** confirmation later (the gateway
tells us the payment succeeded, so no manual approval is needed). Both JazzCash and
EasyPaisa work like PayFast: you redirect the customer to a hosted page, they pay,
and the gateway calls your backend with the result.

> You will need a **merchant account** with each provider. The exact endpoints,
> parameter names and hashing are given in the merchant integration PDF you receive
> on onboarding — confirm them before going live.

---

## A. JazzCash (HTTP redirect / "Page Redirection")

### 1. Credentials (from the JazzCash merchant portal)
- `Merchant ID` (MID)
- `Password`
- `Integrity Salt` (a.k.a. HashKey) — used to sign requests

### 2. Endpoints
- Sandbox: `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`
- Live: `https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/`

### 3. Flow
1. Create a PENDING order (as we already do) → use its id as `pp_TxnRefNo`.
2. Build the parameters and a **Secure Hash**, then auto-submit a form to the
   endpoint (same technique as `redirectToPayFast` in `checkout/page.tsx`).
3. Customer pays on JazzCash's page.
4. JazzCash POSTs the result to your `pp_ReturnURL` → verify the hash and
   `pp_ResponseCode === '000'` → mark the order CONFIRMED.

### 4. Key parameters
```
pp_Version, pp_TxnType, pp_Language=EN, pp_MerchantID, pp_Password,
pp_TxnRefNo,               // your order id
pp_Amount,                 // amount in PAISA (rupees × 100)
pp_TxnCurrency=PKR, pp_TxnDateTime, pp_BillReference,
pp_Description, pp_TxnExpiryDateTime, pp_ReturnURL,
pp_SecureHash,             // HMAC-SHA256, see below
ppmpf_1..ppmpf_5           // optional custom fields
```

### 5. Secure Hash (HMAC-SHA256)
Sort all non-empty `pp_*` values by key, join them with `&`, prefix with the
Integrity Salt, and HMAC-SHA256:
```ts
import crypto from 'crypto'
function jazzcashHash(params: Record<string,string>, salt: string) {
  const sorted = Object.keys(params).filter(k => params[k] !== '')
    .sort().map(k => params[k]).join('&')
  return crypto.createHmac('sha256', salt).update(`${salt}&${sorted}`).digest('hex').toUpperCase()
}
```
(Confirm the exact concatenation order against your JazzCash doc — it changes
occasionally.)

---

## B. EasyPaisa (Easypay Checkout)

### 1. Credentials (from the Easypaisa merchant portal)
- `Store ID`
- `Hash Key` (secret)

### 2. Endpoints
- Sandbox: `https://easypaystg.easypaisa.com.pk/easypay/Index.jsf`
- Live: `https://easypaisa.com.pk/easypay/Index.jsf`
- Confirm (server): `.../easypay/Confirm.jsf`

### 3. Flow
1. Create a PENDING order → use its id as `orderRefNum`.
2. Compute `merchantHashedReq` (AES-128/HMAC over the request params using the Hash
   Key — per your Easypaisa doc), then auto-submit a form to `Index.jsf` with:
   ```
   storeId, amount, postBackURL, orderRefNum, expiryDate, merchantHashedReq,
   autoRedirect=1, paymentMethod=MA_PAYMENT_METHOD (or OTC/CC)
   ```
3. Customer pays via mobile account (MA) or over-the-counter (OTC).
4. Easypaisa redirects to your `postBackURL` with an `auth_token` →
   your backend calls `Confirm.jsf` to finalize → on success mark order CONFIRMED.

---

## C. How it plugs into this codebase

Mirror the PayFast module (`A-Backend/src/lib/payfast.ts` + `routes/payfast.ts`):

1. **`A-Backend/src/lib/jazzcash.ts` / `easypaisa.ts`** — build params + hash.
2. **`A-Backend/src/routes/jazzcash.ts`** —
   - `POST /initiate`: create PENDING order, return `{ postUrl, params }`.
   - `POST /callback` (`ReturnURL` / `postBackURL`): verify hash + response code,
     set order `CONFIRMED` / `CANCELLED`. This is authoritative.
3. **`A-Frontend/src/app/api/jazzcash/initiate/route.ts`** — proxy (like the
   PayFast one).
4. **`checkout/page.tsx`** — when the method is JazzCash/EasyPaisa **and** it's
   configured, call `/initiate` and auto-submit to the returned `postUrl`
   (reuse the existing `redirectToPayFast` helper — it's generic).
5. **Env** (add to `A-Backend/.env`):
   ```env
   JAZZCASH_MERCHANT_ID=""
   JAZZCASH_PASSWORD=""
   JAZZCASH_INTEGRITY_SALT=""
   JAZZCASH_MODE="sandbox"

   EASYPAISA_STORE_ID=""
   EASYPAISA_HASH_KEY=""
   EASYPAISA_MODE="sandbox"
   ```

When these are set, the order is confirmed automatically by the callback; when
they're **not** set, the current manual flow (customer pays → admin verifies in
Manage Orders) keeps working unchanged. You can even keep both: automatic for
wallets that are configured, manual for the rest.

---

## D. Recommendation

Start with the **manual flow that's already live** (zero fees, zero integration).
Add the automatic APIs once your monthly order volume makes the merchant fees and
integration effort worth it. When you're ready, share your sandbox credentials and
this module can be wired up and tested end-to-end.
