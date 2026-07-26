'use client'

import { motion } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Truck, ImageOff } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartItems, removeFromCart, updateCartQuantity, cartTotal, clearCart, setView, formatPrice } =
    useShopStore()

  const total = cartTotal()
  const freeShippingThreshold = 50
  const freeShippingProgress = Math.min((total / freeShippingThreshold) * 100, 100)
  const isFreeShipping = total >= freeShippingThreshold

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            سلة التسوق ({cartItems.length})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">السلة فارغة</p>
            <p className="text-sm text-muted-foreground mb-4">أضف منتجات للبدء</p>
            <Button
              onClick={() => {
                setCartOpen(false)
                setView('home')
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-1 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-orange-500" />
                {isFreeShipping ? (
                  <span className="text-sm font-medium text-green-600">🎉 شحن مجاني!</span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    أضف {formatPrice(freeShippingThreshold - total)} للشحن المجاني
                  </span>
                )}
              </div>
              <Progress value={freeShippingProgress} className="h-2" />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto max-h-96 space-y-3 py-2">
              {cartItems.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 p-2 border rounded-lg"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium line-clamp-1">{item.nameAr}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-bold text-orange-500">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm text-muted-foreground mr-auto">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className={isFreeShipping ? 'text-green-600' : ''}>
                  {isFreeShipping ? 'مجاني' : formatPrice(5.99)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-orange-500">
                  {formatPrice(total + (isFreeShipping ? 0 : 5.99))}
                </span>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                onClick={() => {
                  setCartOpen(false)
                  setView('checkout')
                }}
              >
                إتمام الشراء
              </Button>

              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  clearCart()
                  toast.success('تم تفريغ السلة')
                }}
              >
                تفريغ السلة
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
