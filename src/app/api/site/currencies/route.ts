import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const currencies = await db.currency.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        nameAr: true,
        symbol: true,
        exchangeRate: true,
        isDefault: true,
        order: true,
      },
    })
    return NextResponse.json({ data: { items: currencies } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}
