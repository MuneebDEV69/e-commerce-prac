import { NextResponse } from 'next/server'

/** Public landing content for client components (e.g. the header announcement). */
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/v1/landing`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error(String(res.status))
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ sections: [] })
  }
}
