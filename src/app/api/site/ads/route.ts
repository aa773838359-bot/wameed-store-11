import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/site/ads?position=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const now = new Date();

    const where: Record<string, unknown> = {
      active: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    };

    if (position) {
      where.position = position;
    }

    const ads = await db.advertisement.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: { items: ads } });
  } catch (error) {
    console.error("GET /api/site/ads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}
