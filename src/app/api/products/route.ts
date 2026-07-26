import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured");
    const ids = searchParams.get("ids");

    const where: Record<string, unknown> = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { descriptionAr: { contains: search } },
        { brand: { contains: search } },
        { brandAr: { contains: search } },
      ];
    }

    // Category filter
    if (category) {
      where.category = { slug: category };
    }

    // Featured filter
    if (featured === "true") {
      where.featured = true;
    }

    // IDs filter
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      where.id = { in: idList };
    }

    // Sort
    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "rating":
        orderBy.rating = "desc";
        break;
      case "newest":
      default:
        orderBy.createdAt = "desc";
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { nameAr: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    // Parse JSON fields
    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
      tags: JSON.parse(p.tags || "[]"),
      tagsAr: JSON.parse(p.tagsAr || "[]"),
    }));

    return NextResponse.json({
      data: {
        items: parsed,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
