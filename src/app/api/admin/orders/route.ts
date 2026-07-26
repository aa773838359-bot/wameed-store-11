import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from '@/lib/admin-auth';
import { sendOrderStatusUpdate } from '@/lib/email';

// GET /api/admin/orders - List all orders with items
export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ data: { items: orders } });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders - Update order status
export async function PATCH(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    // Send status update email only if status actually changed
    if (existing.status !== status) {
      sendOrderStatusUpdate({
        orderId: order.id,
        email: order.email,
        firstName: order.firstName,
        lastName: order.lastName,
        oldStatus: existing.status,
        newStatus: status,
      }).catch((emailError) => {
        console.error('[Admin Orders] Failed to send status update email (non-blocking):', emailError);
      });
    }

    return NextResponse.json({ data: { order } });
  } catch (error) {
    console.error("PATCH /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
