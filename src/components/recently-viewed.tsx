'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, ImageOff } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Star } from 'lucide-react'

export function RecentlyViewed() {
  const { recentlyViewed, selectProduct, formatPrice } = useShopStore()

  const { data } = useQuery({
    queryKey: ['recently-viewed', recentlyViewed.join(',')],
    queryFn: async () => {
      if (recentlyViewed.length === 0) return []
      const res = await fetch(`/api/products?ids=${recentlyViewed.join(',')}&limit=10`)
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        nameAr: string
        price: number
        originalPrice: number | null
        image: string
        rating: number
      }> | undefined
    },
    enabled: recentlyViewed.length > 0,
  })

  const products = data || []

  if (products.length === 0) return null

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold">شوهد مؤخراً</h2>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-2">
          {products.map((product) => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => selectProduct(product.id)}
              className="shrink-0 w-36 bg-card border rounded-xl overflow-hidden shadow-sm text-right"
            >
              <div className="aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-xs font-medium line-clamp-1">{product.nameAr}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm font-bold text-orange-500">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
