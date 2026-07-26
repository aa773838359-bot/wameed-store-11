import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/site/offers - Get active offers
export async function GET() {
  try {
    const now = new Date();

    const offers = await db.offer.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: { items: offers } });
  } catch (error) {
    console.error("GET /api/site/offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
