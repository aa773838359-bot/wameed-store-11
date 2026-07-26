import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { validateData, categorySchema, type CategoryInput } from "@/lib/validation"
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ data: { items: categories } })
  } catch (error) {
    console.error("GET /api/admin/categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const validation = validateData(categorySchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const validatedData = validation.data as CategoryInput
    const { name, nameAr, slug, icon, description, image, order } = validatedData

    const category = await db.category.create({
      data: {
        name,
        nameAr,
        slug,
        icon: icon || "Tag",
        description: description || "",
        image: image || null,
        order: order || 0,
      },
    })

    return NextResponse.json({ data: { category } })
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      )
    }
    console.error("POST /api/admin/categories error:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
