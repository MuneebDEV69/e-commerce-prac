import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  try {
    const res = await fetch(`${API_URL}/v1/auth/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Mail service unreachable.' }, { status: 502 })
  }
}
