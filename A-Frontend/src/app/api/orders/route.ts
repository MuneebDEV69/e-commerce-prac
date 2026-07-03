import { NextResponse } from 'next/server'

/**
 * Proxy the guest checkout to the A-Backend orders API. Running server-side keeps
 * the backend URL private and sidesteps CORS. The backend re-validates everything
 * and recomputes the price from product slugs, so this layer stays a thin forwarder.
 */
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_URL}/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error('[api/orders] proxy failed:', e)
    return NextResponse.json({ error: 'Could not reach the order service. Please try again.' }, { status: 502 })
  }
}
