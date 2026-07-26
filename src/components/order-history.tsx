'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  id: string
  total: number
  subtotal: number
  status: string
  createdAt: string
  items: OrderItem[]
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
}

export function OrderHistory() {
  const [email, setEmail] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const { formatPrice } = useShopStore()

  const { data, isLoading } = useQuery({
    queryKey: ['orders', searchEmail],
    queryFn: async () => {
      if (!searchEmail) return null
      const res = await fetch(`/api/orders?email=${encodeURIComponent(searchEmail)}`)
      const json = await res.json()
      return json.data?.items as Order[] | undefined
    },
    enabled: !!searchEmail,
  })

  const orders = data || []
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">طلباتي</h1>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <Input
          type="email"
          placeholder="أدخل بريدك الإلكتروني للبحث عن الطلبات"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearchEmail(email)}
          dir="ltr"
        />
        <Button
          onClick={() => setSearchEmail(email)}
          className="bg-orange-500 hover:bg-orange-600 shrink-0"
        >
          <Search className="h-4 w-4 ml-1" />
          بحث
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && searchEmail && orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات</p>
          <p className="text-sm text-muted-foreground">لم نجد طلبات مرتبطة بهذا البريد</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.pending
            const isExpanded = expandedOrder === order.id

            return (
              <Card key={order.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full text-right p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-orange-500">{formatPrice(order.total)}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="border-t pt-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xl shrink-0">
                            🛍️
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
