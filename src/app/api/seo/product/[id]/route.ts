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
          select: { name: true, nameAr: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wameedstore.com";
    const productUrl = `${baseUrl}/?product=${product.id}`;

    // Build JSON-LD structured data for the product (Schema.org Product type)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: {
        ar: product.nameAr,
        en: product.name,
      },
      description: {
        ar: product.descriptionAr,
        en: product.description,
      },
      image: product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`,
      brand: {
        "@type": "Brand",
        name: {
          ar: product.brandAr,
          en: product.brand,
        },
      },
      category: {
        "@type": "Thing",
        name: {
          ar: product.category.nameAr,
          en: product.category.name,
        },
      },
      url: productUrl,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: product.price,
        priceValidUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Wameed Store",
        },
      },
      aggregateRating:
        product.reviewCount > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
    };

    // Also return Open Graph meta tags for social sharing
    const openGraph = {
      "og:title": product.nameAr,
      "og:description": product.descriptionAr,
      "og:image": product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`,
      "og:url": productUrl,
      "og:type": "product",
      "og:locale": "ar_SA",
      "og:site_name": "وميض ستور",
      "twitter:card": "summary_large_image",
      "twitter:title": product.nameAr,
      "twitter:description": product.descriptionAr,
      "twitter:image": product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`,
      "product:price:amount": product.price,
      "product:price:currency": "USD",
    };

    return NextResponse.json({
      jsonLd,
      openGraph,
      product: {
        id: product.id,
        name: product.name,
        nameAr: product.nameAr,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category,
      },
    });
  } catch (error) {
    console.error("GET /api/seo/product/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to generate product SEO data" },
      { status: 500 }
    );
  }
}
