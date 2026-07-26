import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, nameAr: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get related products from the same category
    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 8,
      orderBy: { rating: "desc" },
      include: {
        category: {
          select: { nameAr: true },
        },
      },
    });

    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images || "[]"),
      tags: JSON.parse(product.tags || "[]"),
      tagsAr: JSON.parse(product.tagsAr || "[]"),
    };

    const parsedRelated = related.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
      tags: JSON.parse(p.tags || "[]"),
      tagsAr: JSON.parse(p.tagsAr || "[]"),
    }));

    return NextResponse.json({
      data: {
        product: parsedProduct,
        related: parsedRelated,
      },
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
