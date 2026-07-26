'use client'

import { useQuery } from '@tanstack/react-query'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function WishlistSection() {
  const { wishlist, toggleWishlist } = useShopStore()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist-products', wishlist.join(',')],
    queryFn: async () => {
      if (wishlist.length === 0) return []
      const res = await fetch(`/api/products?ids=${wishlist.join(',')}&limit=50`)
      const json = await res.json()
      return json.data?.items as Array<{
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
      }> | undefined
    },
    enabled: wishlist.length > 0,
  })

  const products = data || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold">المفضلة</h1>
        <span className="text-muted-foreground">({wishlist.length} منتج)</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">المفضلة فارغة</p>
          <p className="text-sm text-muted-foreground mb-4">أضف منتجات للمفضلة للعثور عليها بسهولة</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="w-3/4 h-4 mt-2" />
              <Skeleton className="w-1/2 h-4 mt-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
