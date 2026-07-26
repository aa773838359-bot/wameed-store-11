'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, ShoppingCart, Eye, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { toast } from 'sonner'

interface ProductCardProps {
  product: {
    id: string
    nameAr: string
    brandAr: string
    price: number
    originalPrice?: number | null
    image: string
    rating: number
    reviewCount: number
    stock: number
    category?: { nameAr: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectProduct, addToCart, toggleWishlist, isInWishlist, setQuickViewProduct, formatPrice } =
    useShopStore()
  const [imgError, setImgError] = useState(false)

  const wishlisted = isInWishlist(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const outOfStock = product.stock === 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow relative"
    >
      {/* Image */}
      <div
        className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden cursor-pointer"
        onClick={() => selectProduct(product.id)}
      >
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.nameAr}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
            -{discount}%
          </Badge>
        )}

        {/* Out of Stock */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              نفذ المخزون
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              toggleWishlist(product.id)
              toast.success(wishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة')
            }}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              setQuickViewProduct(product.id)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <button
          onClick={() => selectProduct(product.id)}
          className="text-right w-full"
        >
          <p className="text-xs text-muted-foreground mb-1">{product.brandAr}</p>
          <h3 className="text-sm font-semibold line-clamp-2 leading-5 mb-2 hover:text-orange-500 transition-colors">
            {product.nameAr}
          </h3>
        </button>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-red-500 mb-2">متبقي {product.stock} فقط!</p>
        )}

        {/* Add to Cart */}
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
          disabled={outOfStock}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm h-9"
        >
          <ShoppingCart className="h-4 w-4 ml-1" />
          أضف للسلة
        </Button>
      </div>
    </motion.div>
  )
}
