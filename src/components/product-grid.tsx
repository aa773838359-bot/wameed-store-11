'use client'

import { useQuery } from '@tanstack/react-query'
import { useShopStore } from '@/lib/store'
import { ProductCard } from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PackageSearch } from 'lucide-react'

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

export function ProductGrid() {
  const { searchQuery, selectedCategory, sortBy, page, setSortBy, setPage } = useShopStore()

  const { data, isLoading } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      params.set('sort', sortBy)
      params.set('page', String(page))
      params.set('limit', '12')
      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      return json.data as { items: Product[]; total: number; totalPages: number } | undefined
    },
  })

  const products = data?.items || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold">
            {searchQuery
              ? `نتائج البحث عن "${searchQuery}"`
              : selectedCategory
              ? 'منتجات التصنيف'
              : 'جميع المنتجات'}
          </h2>
          {data && (
            <span className="text-sm text-muted-foreground">({data.total} منتج)</span>
          )}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">أحدث</SelectItem>
            <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
            <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
            <SelectItem value="rating">التقييم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="w-3/4 h-4 mt-2" />
              <Skeleton className="w-1/2 h-4 mt-1" />
              <Skeleton className="w-1/3 h-4 mt-1" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <PackageSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">لا توجد منتجات</p>
          <p className="text-sm text-muted-foreground">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  )
}
