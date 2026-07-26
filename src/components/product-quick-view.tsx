'use client'

import { useQuery } from '@tanstack/react-query'
import { useShopStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, ShoppingCart, Heart, ImageOff } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'

export function ProductQuickView() {
  const { quickViewProductId, setQuickViewProduct, selectProduct, addToCart, toggleWishlist, isInWishlist, formatPrice } =
    useShopStore()

  const { data, isLoading } = useQuery({
    queryKey: ['product-quick', quickViewProductId],
    queryFn: async () => {
      if (!quickViewProductId) return null
      const res = await fetch(`/api/products/${quickViewProductId}`)
      const json = await res.json()
      return json.data?.product as {
        id: string
        nameAr: string
        price: number
        originalPrice: number | null
        image: string
        rating: number
        reviewCount: number
        stock: number
        descriptionAr: string
        brandAr: string
      } | null
    },
    enabled: !!quickViewProductId,
  })

  const product = data
  const wishlisted = quickViewProductId ? isInWishlist(quickViewProductId) : false
  const [imgError, setImgError] = useState(false)

  return (
    <Dialog
      open={!!quickViewProductId}
      onOpenChange={(open) => !open && setQuickViewProduct(null)}
    >
      <DialogContent className="sm:max-w-lg">
        {isLoading || !product ? (
          <div className="flex gap-4 p-4">
            <Skeleton className="w-40 h-40 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{product.nameAr}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                {product.image && !imgError ? (
                  <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">{product.brandAr}</p>
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
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-500">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.descriptionAr}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => {
                      addToCart({
                        productId: product.id,
                        name: product.nameAr,
                        nameAr: product.nameAr,
                        price: product.price,
                        originalPrice: product.originalPrice || undefined,
                        image: product.image,
                      })
                      toast.success('تمت الإضافة إلى السلة')
                    }}
                    disabled={product.stock === 0}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <ShoppingCart className="h-4 w-4 ml-1" />
                    أضف للسلة
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      toggleWishlist(product.id)
                      toast.success(wishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة')
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>
                <Button
                  variant="link"
                  className="text-orange-500 p-0"
                  onClick={() => {
                    setQuickViewProduct(null)
                    selectProduct(product.id)
                  }}
                >
                  عرض التفاصيل الكاملة ←
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
