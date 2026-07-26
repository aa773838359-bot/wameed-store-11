import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { validateData, currencySchema, type CurrencyInput } from '@/lib/validation'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const currencies = await db.currency.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ data: { items: currencies } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const validation = validateData(currencySchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const validatedData = validation.data as CurrencyInput
    const currency = await db.currency.create({
      data: {
        code: validatedData.code,
        name: validatedData.name || validatedData.code,
        nameAr: validatedData.nameAr || validatedData.code,
        symbol: validatedData.symbol || validatedData.code,
        exchangeRate: validatedData.exchangeRate || 1,
        isDefault: validatedData.isDefault || false,
        active: validatedData.active !== undefined ? validatedData.active : true,
        order: validatedData.order || 0,
      },
    })
    return NextResponse.json({ data: currency })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
  }
}
