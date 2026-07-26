import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateData, reviewSchema, type ReviewInput } from '@/lib/validation'

// GET /api/reviews?productId=xxx&page=1&limit=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'معرّف المنتج مطلوب' },
        { status: 400 }
      )
    }

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where: { productId } }),
    ])

    // Calculate average rating
    const avgResult = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    return NextResponse.json({
      data: {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        averageRating: avgResult._avg.rating || 0,
        reviewCount: avgResult._count.rating || 0,
      },
    })
  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json(
      { error: 'فشل في جلب التقييمات' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateData(reviewSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const validatedData = validation.data as ReviewInput
    const { productId, userName, rating, comment } = validatedData

    // Check that product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    const review = await db.review.create({
      data: {
        productId,
        userName,
        rating,
        comment: comment || '',
      },
    })

    // Update product's rating and reviewCount
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

    return NextResponse.json({ data: { review } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال التقييم' },
      { status: 500 }
    )
  }
}
