import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateData, textSchema, type TextInput } from "@/lib/validation";
import { verifyAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/texts - List all texts (optional ?group filter)
export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const where: Record<string, unknown> = {};
    if (group) {
      where.group = group;
    }

    const texts = await db.siteText.findMany({
      where,
      orderBy: { group: "asc" },
    });

    return NextResponse.json({ data: { items: texts } });
  } catch (error) {
    console.error("GET /api/admin/texts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site texts" },
      { status: 500 }
    );
  }
}

// POST /api/admin/texts - Create text
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const validation = validateData(textSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data as TextInput;
    const { key, value, valueAr, group = "general" } = validatedData;

    // Check key uniqueness
    const existing = await db.siteText.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json(
        { error: "A text with this key already exists" },
        { status: 409 }
      );
    }

    const text = await db.siteText.create({
      data: { key, value, valueAr, group },
    });

    return NextResponse.json({ data: { text } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/texts error:", error);
    return NextResponse.json(
      { error: "Failed to create site text" },
      { status: 500 }
    );
  }
}
