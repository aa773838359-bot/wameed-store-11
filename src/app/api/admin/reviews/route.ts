import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/admin-auth'

// GET /api/admin/reviews - List all reviews with product info, pagination
export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count(),
    ])

    return NextResponse.json({
      data: {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error)
    return NextResponse.json(
      { error: 'فشل في جلب التقييمات' },
      { status: 500 }
    )
  }
}
