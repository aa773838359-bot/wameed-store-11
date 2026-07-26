import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/texts/[id]
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

    const text = await db.siteText.findUnique({ where: { id } });

    if (!text) {
      return NextResponse.json(
        { error: "Site text not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { text } });
  } catch (error) {
    console.error("GET /api/admin/texts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site text" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/texts/[id]
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

    const existing = await db.siteText.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Site text not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["value", "valueAr", "group"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const text = await db.siteText.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: { text } });
  } catch (error) {
    console.error("PATCH /api/admin/texts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update site text" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/texts/[id]
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

    const existing = await db.siteText.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Site text not found" },
        { status: 404 }
      );
    }

    await db.siteText.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/admin/texts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete site text" },
      { status: 500 }
    );
  }
}
