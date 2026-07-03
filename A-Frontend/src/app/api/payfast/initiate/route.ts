import { NextResponse } from 'next/server'

/** Proxy the PayFast initiate call to the backend (keeps the API URL server-side). */
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  try {
    const res = await fetch(`${API_URL}/v1/payfast/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error('[api/payfast/initiate] proxy failed:', e)
    return NextResponse.json({ error: 'Could not reach the payment service.' }, { status: 502 })
  }
}
