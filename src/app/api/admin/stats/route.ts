import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const [
      productCount,
      categoryCount,
      orderCount,
      offerCount,
      adCount,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      db.product.count(),
      db.category.count(),
      db.order.count(),
      db.offer.count(),
      db.advertisement.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: { name: true, quantity: true, price: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        stats: {
          products: productCount,
          categories: categoryCount,
          orders: orderCount,
          revenue: revenueResult._sum.total || 0,
          offers: offerCount,
          ads: adCount,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
