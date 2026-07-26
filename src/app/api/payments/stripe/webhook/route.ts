import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey || !webhookSecret) {
      return NextResponse.json(
        { error: 'إعدادات الدفع غير مكتملة' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey)

    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'توقيع Webhook غير موجود' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'فشل التحقق من توقيع Webhook' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) {
        console.error('No orderId in session metadata')
        return NextResponse.json(
          { error: 'معرّف الطلب غير موجود في بيانات الدفع' },
          { status: 400 }
        )
      }

      // Update the order status to "paid"
      const order = await db.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        console.error(`Order not found: ${orderId}`)
        return NextResponse.json(
          { error: 'الطلب غير موجود' },
          { status: 404 }
        )
      }

      if (order.status !== 'paid') {
        await db.order.update({
          where: { id: orderId },
          data: { status: 'paid' },
        })
      }
    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة Webhook' },
      { status: 500 }
    )
  }
}
