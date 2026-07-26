import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateData, orderSchema, type OrderInput } from "@/lib/validation";
import { sendOrderConfirmation } from "@/lib/email";

// GET /api/orders?email=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    const orders = await db.order.findMany({
      where: { email },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: { items: orders } });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateData(orderSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const validatedData = validation.data as OrderInput;
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state = "",
      zipCode = "",
      phone,
      paymentMethod = "cod",
      items,
    } = validatedData;

    // Calculate subtotal and verify products
    let subtotal = 0;
    const orderItemsData: Array<{ productId: string; name: string; image: string; price: number; quantity: number }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.nameAr}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        name: product.nameAr,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Calculate tax (8%) and shipping
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    // Create order with transaction (deduct stock)
    const order = await db.$transaction(async (tx) => {
      // Deduct stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          email,
          firstName,
          lastName,
          address,
          city,
          state,
          zipCode,
          phone,
          paymentMethod,
          subtotal,
          tax,
          shipping,
          total,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    // Send order confirmation email asynchronously (don't block the response)
    sendOrderConfirmation({
      orderId: order.id,
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      items: order.items.map(item => ({
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      address: order.address,
      city: order.city,
      state: order.state,
      zipCode: order.zipCode,
      phone: order.phone,
      status: order.status,
    }).catch((emailError) => {
      console.error('[Orders] Failed to send confirmation email (non-blocking):', emailError);
    });

    return NextResponse.json({ data: { id: order.id, order } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
