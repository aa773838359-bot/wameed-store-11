'use client'

import { ChevronLeft, Home } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'

export function Breadcrumbs() {
  const { view, selectedCategory, selectedProductId } = useShopStore()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      const json = await res.json()
      return json.data?.items as Array<{ slug: string; nameAr: string }> | undefined
    },
  })

  const { data: productData } = useQuery({
    queryKey: ['product-breadcrumb', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null
      const res = await fetch(`/api/products/${selectedProductId}`)
      const json = await res.json()
      return json.data?.product as {
        nameAr: string
        category?: { nameAr: string }
      } | null
    },
    enabled: !!selectedProductId && view === 'product',
  })

  const categoryName = selectedCategory
    ? categories?.find((c) => c.slug === selectedCategory)?.nameAr || selectedCategory
    : null

  const getViewLabel = () => {
    switch (view) {
      case 'home':
        return null
      case 'product':
        return productData?.nameAr || 'تفاصيل المنتج'
      case 'checkout':
        return 'إتمام الشراء'
      case 'order-success':
        return 'تم الطلب'
      case 'orders':
        return 'طلباتي'
      case 'wishlist':
        return 'المفضلة'
      default:
        return null
    }
  }

  const items: Array<{ label: string; active?: boolean }> = [
    { label: 'الرئيسية', active: view === 'home' },
  ]

  if (categoryName && view !== 'home') {
    items.push({ label: categoryName, active: !!selectedCategory })
  }

  const viewLabel = getViewLabel()
  if (viewLabel && view !== 'home') {
    items.push({ label: viewLabel, active: true })
  }

  if (items.length <= 1 && view === 'home') return null

  return (
    <nav className="px-4 py-2" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="h-3 w-3" />}
            {i === 0 && <Home className="h-3 w-3 ml-1" />}
            <span className={item.active ? 'text-foreground font-medium' : ''}>
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
