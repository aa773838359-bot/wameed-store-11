'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, ImageOff, ArrowRight } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/product-card'
import { ProductReviews } from '@/components/product-reviews'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface ProductDetailData {
  product: {
    id: string
    nameAr: string
    name: string
    descriptionAr: string
    price: number
    originalPrice: number | null
    image: string
    images: string[]
    brandAr: string
    tagsAr: string[]
    rating: number
    reviewCount: number
    stock: number
    categoryId: string
    category: { id: string; name: string; nameAr: string; slug: string }
  }
  related: Array<{
    id: string
    nameAr: string
    brandAr: string
    price: number
    originalPrice: number | null
    image: string
    rating: number
    reviewCount: number
    stock: number
    category?: { nameAr: string }
  }>
}

export function ProductDetail() {
  const { selectedProductId, addToCart, toggleWishlist, isInWishlist, addRecentlyViewed, setView, formatPrice } =
    useShopStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [prevProductId, setPrevProductId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${selectedProductId}`)
      const json = await res.json()
      return json.data as ProductDetailData | undefined
    },
    enabled: !!selectedProductId,
  })

  const product = data?.product

  // Reset state when product changes (using comparison instead of setState in effect)
  if (selectedProductId !== prevProductId) {
    setPrevProductId(selectedProductId)
    setQuantity(1)
    setSelectedImage(0)
  }

  // Add to recently viewed when product loads
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id)
    }
  }, [product?.id, addRecentlyViewed])

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Build image gallery: always start with main `image` field, then add extra from `images` array
  const mainImage = product.image || ''
  const extraImages = Array.isArray(product.images) ? product.images.filter((img) => img !== mainImage) : []
  const allImages = mainImage ? [mainImage, ...extraImages] : extraImages

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6 group"
      >
        <ArrowRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        العودة للرئيسية
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden"
          >
            {allImages.length > 0 && allImages[selectedImage] ? (
              <img
                src={allImages[selectedImage]}
                alt={product.nameAr}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) {
                    const fallback = parent.querySelector('.img-fallback')
                    if (fallback) (fallback as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div className="img-fallback w-full h-full items-center justify-center" style={{ display: allImages.length === 0 ? 'flex' : 'none' }}>
              <ImageOff className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            </div>
          </motion.div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.brandAr}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.nameAr}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviewCount} تقييم)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-orange-500">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge className="bg-red-500 text-white">-{discount}%</Badge>
              </>
            )}
          </div>

          {/* Stock */}
          {product.stock > 0 ? (
            product.stock <= 10 ? (
              <p className="text-sm text-red-500 font-medium">
                متبقي {product.stock} فقط في المخزون!
              </p>
            ) : (
              <p className="text-sm text-green-600 font-medium">✓ متوفر في المخزون</p>
            )
          ) : (
            <p className="text-sm text-red-500 font-medium">✗ نفذ المخزون</p>
          )}

          <Separator />

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.nameAr,
                  nameAr: product.nameAr,
                  price: product.price,
                  originalPrice: product.originalPrice || undefined,
                  image: product.image,
                  quantity,
                })
                toast.success('تمت الإضافة إلى السلة')
              }}
              disabled={product.stock === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12"
            >
              <ShoppingCart className="h-5 w-5 ml-2" />
              أضف للسلة
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                toggleWishlist(product.id)
                toast.success(wishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة')
              }}
            >
              <Heart
                className={`h-5 w-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">الوصف</TabsTrigger>
              <TabsTrigger value="specs" className="flex-1">المواصفات</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">التقييمات</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground leading-7">{product.descriptionAr}</p>
            </TabsContent>
            <TabsContent value="specs" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {product.tagsAr && product.tagsAr.length > 0 ? (
                  product.tagsAr.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">لا توجد مواصفات</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {data?.related && data.related.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <ChevronLeft className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">منتجات مشابهة</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
