import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/admin-auth'

// PATCH /api/admin/reviews/[id] - Update review (toggle verified status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'التقييم غير موجود' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['userName', 'rating', 'comment', 'verified']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const review = await db.review.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ data: { review } })
  } catch (error) {
    console.error('PATCH /api/admin/reviews/[id] error:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث التقييم' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  try {
    const { id } = await params

    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'التقييم غير موجود' },
        { status: 404 }
      )
    }

    const productId = existing.productId

    await db.review.delete({ where: { id } })

    // Update product stats after deletion
    const stats = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await db.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating || 0,
      },
    })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error)
    return NextResponse.json(
      { error: 'فشل في حذف التقييم' },
      { status: 500 }
    )
  }
}
