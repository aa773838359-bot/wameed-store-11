import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateData, offerSchema, type OfferInput } from "@/lib/validation";
import { verifyAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/offers - List all offers
export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const offers = await db.offer.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: { items: offers } });
  } catch (error) {
    console.error("GET /api/admin/offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/offers - Create offer
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const validation = validateData(offerSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data as OfferInput;
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      image = "",
      discountPercent = 0,
      badge,
      badgeAr,
      gradient = "from-orange-500 to-amber-600",
      ctaText = "تسوق الآن",
      ctaTextAr = "تسوق الآن",
      link,
      productId,
      active = true,
      startDate,
      endDate,
      order = 0,
    } = validatedData;

    const offer = await db.offer.create({
      data: {
        title,
        titleAr,
        description,
        descriptionAr,
        image,
        discountPercent,
        badge,
        badgeAr,
        gradient,
        ctaText,
        ctaTextAr,
        link,
        productId,
        active,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        order,
      },
    });

    return NextResponse.json({ data: { offer } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/offers error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
