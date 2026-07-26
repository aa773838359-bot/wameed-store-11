import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/cart/items - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, productId, quantity = 1 } = body;

    if (!cartId || !productId) {
      return NextResponse.json(
        { error: "cartId and productId are required" },
        { status: 400 }
      );
    }

    // Check product stock
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Upsert cart item
    const cartItem = await db.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            price: true,
            originalPrice: true,
            image: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json({ data: { item: cartItem } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cart/items error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// PATCH /api/cart/items - Update item quantity
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, productId, quantity } = body;

    if (!cartId || !productId || quantity === undefined) {
      return NextResponse.json(
        { error: "cartId, productId, and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Delete the item if quantity is 0 or less
      await db.cartItem.deleteMany({
        where: { cartId, productId },
      });
      return NextResponse.json({ data: { deleted: true } });
    }

    const cartItem = await db.cartItem.update({
      where: {
        cartId_productId: { cartId, productId },
      },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            price: true,
            originalPrice: true,
            image: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json({ data: { item: cartItem } });
  } catch (error) {
    console.error("PATCH /api/cart/items error:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/items?cartId=xxx&productId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId");
    const productId = searchParams.get("productId");

    if (!cartId || !productId) {
      return NextResponse.json(
        { error: "cartId and productId are required" },
        { status: 400 }
      );
    }

    await db.cartItem.deleteMany({
      where: { cartId, productId },
    });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/cart/items error:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
