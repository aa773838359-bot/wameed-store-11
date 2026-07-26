import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateData, productSchema, type ProductInput } from "@/lib/validation";
import { verifyAdminAuth } from '@/lib/admin-auth'

// GET /api/admin/products - List products with category info
export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, nameAr: true, slug: true },
        },
      },
    });

    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
      tags: JSON.parse(p.tags || "[]"),
      tagsAr: JSON.parse(p.tagsAr || "[]"),
    }));

    return NextResponse.json({ data: { items: parsed } });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const validation = validateData(productSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data as ProductInput;
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      originalPrice,
      image,
      images,
      brand,
      brandAr,
      tags,
      tagsAr,
      rating,
      reviewCount,
      stock,
      featured,
      categoryId,
    } = validatedData;

    // Verify category exists
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        price: parseFloat(String(price)),
        originalPrice: originalPrice ? parseFloat(String(originalPrice)) : null,
        image: image || "/images/products/default.jpg",
        images: images ? JSON.stringify(images) : "[]",
        brand: brand || "عام",
        brandAr: brandAr || "عام",
        tags: tags ? JSON.stringify(tags) : "[]",
        tagsAr: tagsAr ? JSON.stringify(tagsAr) : "[]",
        rating: rating ? parseFloat(String(rating)) : 0,
        reviewCount: reviewCount ? parseInt(String(reviewCount)) : 0,
        stock: stock ? parseInt(String(stock)) : 100,
        featured: featured || false,
        categoryId,
      },
      include: {
        category: {
          select: { id: true, name: true, nameAr: true, slug: true },
        },
      },
    });

    const parsed = {
      ...product,
      images: JSON.parse(product.images || "[]"),
      tags: JSON.parse(product.tags || "[]"),
      tagsAr: JSON.parse(product.tagsAr || "[]"),
    };

    return NextResponse.json({ data: { product: parsed } });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products - Update product fields
export async function PATCH(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'nameAr', 'description', 'descriptionAr',
      'price', 'originalPrice', 'image', 'images',
      'brand', 'brandAr', 'tags', 'tagsAr',
      'stock', 'featured', 'categoryId'
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice') {
          updateData[field] = parseFloat(String(updateFields[field]));
        } else if (field === 'stock') {
          updateData[field] = parseInt(String(updateFields[field]));
        } else if (field === 'images' || field === 'tags' || field === 'tagsAr') {
          updateData[field] = JSON.stringify(updateFields[field]);
        } else {
          updateData[field] = updateFields[field];
        }
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, nameAr: true, slug: true },
        },
      },
    });

    const parsed = {
      ...product,
      images: JSON.parse(product.images || "[]"),
      tags: JSON.parse(product.tags || "[]"),
      tagsAr: JSON.parse(product.tagsAr || "[]"),
    };

    return NextResponse.json({ data: { product: parsed } });
  } catch (error) {
    console.error("PATCH /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products - Delete a product
export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("DELETE /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
