import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'بوابة الدفع غير مُعدة. يرجى التواصل مع إدارة المتجر.' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)

    const body = await request.json()
    const { orderId, lineItems } = body as {
      orderId: string
      lineItems: Array<{
        name: string
        price: number
        quantity: number
        image?: string
      }>
    }

    if (!orderId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة' },
        { status: 400 }
      )
    }

    // Validate that the order exists in DB
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود. يرجى إعادة المحاولة.' },
        { status: 404 }
      )
    }

    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'تم دفع هذا الطلب مسبقاً' },
        { status: 400 }
      )
    }

    // Build Stripe line items
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${origin}/?view=order-success`,
      cancel_url: `${origin}/?view=checkout`,
      metadata: {
        orderId: orderId,
      },
    })

    return NextResponse.json({
      data: { url: session.url },
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء جلسة الدفع'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
