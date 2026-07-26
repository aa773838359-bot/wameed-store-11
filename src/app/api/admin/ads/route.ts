import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateData, adSchema, type AdInput } from "@/lib/validation";
import { verifyAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/ads - List all ads (optional ?position filter)
export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    const where: Record<string, unknown> = {};
    if (position) {
      where.position = position;
    }

    const ads = await db.advertisement.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: { items: ads } });
  } catch (error) {
    console.error("GET /api/admin/ads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}

// POST /api/admin/ads - Create ad
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const validation = validateData(adSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data as AdInput;
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      image = "",
      link,
      position = "banner",
      active = true,
      startDate,
      endDate,
      order = 0,
    } = validatedData;

    const ad = await db.advertisement.create({
      data: {
        title,
        titleAr,
        description,
        descriptionAr,
        image,
        link,
        position,
        active,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        order,
      },
    });

    return NextResponse.json({ data: { ad } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/ads error:", error);
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    );
  }
}
