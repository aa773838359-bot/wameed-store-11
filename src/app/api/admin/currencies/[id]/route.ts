import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()

    const allowedFields = ['code', 'name', 'nameAr', 'symbol', 'exchangeRate', 'isDefault', 'active', 'order']
    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    // If setting as default, unset all other defaults
    if (data.isDefault) {
      await db.currency.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const currency = await db.currency.update({
      where: { id },
      data,
    })
    return NextResponse.json({ data: currency })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { id } = await params
    await db.currency.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
