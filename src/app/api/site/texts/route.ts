import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/site/texts?group=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const where: Record<string, unknown> = {};

    if (group) {
      where.group = group;
    }

    const texts = await db.siteText.findMany({ where });

    // Convert to key-value map
    const map: Record<string, { value: string; valueAr: string }> = {};
    for (const t of texts) {
      map[t.key] = { value: t.value, valueAr: t.valueAr };
    }

    return NextResponse.json({ data: { texts: map } });
  } catch (error) {
    console.error("GET /api/site/texts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site texts" },
      { status: 500 }
    );
  }
}
