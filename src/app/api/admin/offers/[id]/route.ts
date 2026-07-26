import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/offers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { id } = await params;

    const offer = await db.offer.findUnique({ where: { id } });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { offer } });
  } catch (error) {
    console.error("GET /api/admin/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/offers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.offer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "titleAr", "description", "descriptionAr",
      "image", "discountPercent", "badge", "badgeAr",
      "gradient", "ctaText", "ctaTextAr", "link",
      "productId", "active", "startDate", "endDate", "order",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "startDate" || field === "endDate") {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const offer = await db.offer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: { offer } });
  } catch (error) {
    console.error("PATCH /api/admin/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/offers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { id } = await params;

    const existing = await db.offer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    await db.offer.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/admin/offers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
