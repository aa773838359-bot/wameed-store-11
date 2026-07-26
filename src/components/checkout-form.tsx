'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Truck, Loader2, MessageCircle, ShieldCheck } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { PaymentMethods } from '@/components/payment-methods'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  address: z.string().min(5, 'العنوان مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  phone: z.string().min(8, 'رقم الهاتف مطلوب'),
  paymentMethod: z.enum(['cod', 'stripe']),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export function CheckoutForm() {
  const { cartItems, cartTotal, clearCart, setView, setLastOrderId, formatPrice, whatsappNumber, convertPrice, getActiveCurrency, stripePublicKey } = useShopStore()
  const total = cartTotal()
  const isFreeShipping = total >= 50
  const shipping = isFreeShipping ? 0 : 5.99
  const tax = Math.round(total * 0.08 * 100) / 100
  const grandTotal = Math.round((total + tax + shipping) * 100) / 100

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cod',
    },
  })

  const paymentMethod = watch('paymentMethod')
  const [isSending, setIsSending] = useState(false)

  const buildWhatsAppMessage = (data: CheckoutForm) => {
    const currency = getActiveCurrency()
    const currencyCode = currency?.code || 'USD'
    const currencySymbol = currency?.symbol || '$'

    let message = `🛒 *طلب جديد من وميض ستور*\n\n`
    message += `👤 *معلومات العميل:*\n`
    message += `الاسم: ${data.firstName} ${data.lastName}\n`
    message += `الهاتف: ${data.phone}\n`
    message += `العنوان: ${data.address}\n`
    message += `المدينة: ${data.city}\n`
    message += `طريقة الدفع: ${data.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}\n\n`

    message += `📦 *تفاصيل الطلب:*\n`
    message += `─────────────────\n`

    cartItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity
      const convertedTotal = convertPrice(itemTotal)
      const formattedTotal = currency?.exchangeRate && currency.exchangeRate >= 100
        ? Math.round(convertedTotal).toLocaleString('ar-SA')
        : convertedTotal.toFixed(2)

      message += `${index + 1}. ${item.nameAr}\n`
      message += `   الكمية: ${item.quantity} × ${currencySymbol}${convertPrice(item.price).toFixed(2)} = ${currencySymbol}${formattedTotal}\n`
    })

    message += `─────────────────\n\n`
    message += `💰 *ملخص الفاتورة:*\n`

    const formatAmount = (amount: number) => {
      const converted = convertPrice(amount)
      return currency?.exchangeRate && currency.exchangeRate >= 100
        ? `${currencySymbol}${Math.round(converted).toLocaleString('ar-SA')}`
        : `${currencySymbol}${converted.toFixed(2)}`
    }

    message += `المجموع الفرعي: ${formatAmount(total)}\n`
    message += `الشحن: ${isFreeShipping ? 'مجاني ✅' : formatAmount(shipping)}\n`
    message += `الضريبة (8%): ${formatAmount(tax)}\n`
    message += `*الإجمالي: ${formatAmount(grandTotal)}* 💵\n`

    return message
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsSending(true)

    try {
      // 1. Save order to database first
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${data.phone}@wameed.customer`, // Generate email from phone since email field doesn't exist
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
          subtotal: total,
          tax: tax,
          shipping: shipping,
          total: grandTotal,
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.nameAr,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      if (!orderRes.ok) {
        toast.error('حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.')
        setIsSending(false)
        return
      }

      const orderJson = await orderRes.json()
      const orderId = orderJson.data?.id

      if (data.paymentMethod === 'stripe') {
        // Stripe payment flow
        try {
          const stripeRes = await fetch('/api/payments/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              lineItems: cartItems.map(item => ({
                name: item.nameAr,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
              })),
            }),
          })

          const stripeJson = await stripeRes.json()

          if (!stripeRes.ok || !stripeJson.data?.url) {
            toast.error(stripeJson.error || 'حدث خطأ أثناء إنشاء جلسة الدفع')
            setIsSending(false)
            return
          }

          // Clear cart and set order ID before redirect
          clearCart()
          if (orderId) {
            setLastOrderId(orderId)
          }

          // Redirect to Stripe Checkout
          window.location.href = stripeJson.data.url
        } catch (stripeError) {
          toast.error('حدث خطأ أثناء الاتصال ببوابة الدفع')
          setIsSending(false)
          return
        }
      } else {
        // COD flow - WhatsApp
        const message = buildWhatsAppMessage(data)
        const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')

        // Clear cart and show success
        clearCart()
        if (orderId) {
          setLastOrderId(orderId)
        }
        setView('order-success')

        // Open WhatsApp in a new tab (after order is saved)
        if (cleanNumber) {
          const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
          window.open(whatsappUrl, '_blank')
          toast.success('تم حفظ طلبك وتوجيهك إلى واتساب لإتمام الطلب!')
        } else {
          toast.success('تم حفظ طلبك بنجاح! سيتم التواصل معك قريباً.')
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب')
    } finally {
      setIsSending(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground mb-4">السلة فارغة</p>
        <Button onClick={() => setView('home')} className="bg-orange-500 hover:bg-orange-600">
          تصفح المنتجات
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-orange-500" />
        إتمام الشراء
      </h1>

      {paymentMethod === 'cod' && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            سيتم إرسال تفاصيل طلبك عبر واتساب لإتمام عملية الشراء
          </p>
        </div>
      )}

      {paymentMethod === 'stripe' && (
        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            سيتم توجيهك إلى صفحة دفع آمنة لإتمام العملية ببطاقتك الائتمانية
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+966 5XX XXX XXXX"
                    dir="ltr"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  عنوان الشحن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">الاسم الأول</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">الاسم الأخير</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  طريقة الدفع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethods
                  value={paymentMethod}
                  onChange={(value) => setValue('paymentMethod', value)}
                  whatsappNumber={whatsappNumber}
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="line-clamp-1 flex-1">{item.nameAr} × {item.quantity}</span>
                    <span className="shrink-0 mr-2">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className={isFreeShipping ? 'text-green-600' : ''}>
                    {isFreeShipping ? 'مجاني' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الضريبة (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span className="text-orange-500">{formatPrice(grandTotal)}</span>
                </div>

                <Button
                  type="submit"
                  className={`w-full text-white h-12 ${
                    paymentMethod === 'stripe'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                      {paymentMethod === 'stripe' ? 'جاري التوجيه للدفع...' : 'جاري التوجيه...'}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'stripe' ? (
                        <>
                          <CreditCard className="h-5 w-5 ml-2" />
                          الدفع ببطاقة ائتمان
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5 ml-2" />
                          إرسال الطلب عبر واتساب
                        </>
                      )}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
