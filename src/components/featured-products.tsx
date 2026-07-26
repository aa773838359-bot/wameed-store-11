'use client'

import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Star, ImageOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
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
}

export function FeaturedProducts() {
  const { selectProduct, addToCart, formatPrice } = useShopStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await fetch('/api/products?featured=true&limit=10')
      const json = await res.json()
      return json.data?.items as Product[] | undefined
    },
  })

  const products = data || []

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? 300 : -300
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
          <h2 className="text-lg font-bold">المنتجات المميزة</h2>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full" ref={scrollRef}>
        <div className="flex gap-4 pb-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-48">
                  <Skeleton className="w-48 h-48 rounded-xl" />
                  <Skeleton className="w-3/4 h-4 mt-2" />
                  <Skeleton className="w-1/2 h-4 mt-1" />
                </div>
              ))
            : products.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.03 }}
                  className="shrink-0 w-48 bg-card border rounded-xl overflow-hidden shadow-sm cursor-pointer"
                  onClick={() => selectProduct(product.id)}
                >
                  <div className="aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                    {product.image && !imgErrors[product.id] ? (
                      <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover" onError={() => setImgErrors(prev => ({ ...prev, [product.id]: true }))} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{product.brandAr}</p>
                    <h3 className="text-sm font-semibold line-clamp-1">{product.nameAr}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${
                              i < Math.floor(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-orange-500">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
