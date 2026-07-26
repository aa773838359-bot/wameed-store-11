import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/site/settings - Public settings for storefront
export async function GET() {
  try {
    const settings = await db.storeSetting.findMany()
    // Return as key-value map for easy consumption
    // Exclude sensitive settings like adminPassword
    const map: Record<string, string> = {}
    settings.forEach((s) => {
      // Exclude sensitive settings from public endpoint
      if (s.key !== 'adminPassword' && s.key !== 'stripeSecretKey') {
        map[s.key] = s.value
      }
    })
    return NextResponse.json({ data: map })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
