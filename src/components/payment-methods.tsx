'use client'

import { CreditCard, Truck, MessageCircle, ShieldCheck } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface PaymentMethodsProps {
  value: 'cod' | 'stripe'
  onChange: (value: 'cod' | 'stripe') => void
  whatsappNumber: string
}

export function PaymentMethods({ value, onChange, whatsappNumber }: PaymentMethodsProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as 'cod' | 'stripe')}
      className="space-y-3"
    >
      {/* Cash on Delivery */}
      <div
        className={`flex items-center space-x-reverse space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
          value === 'cod'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
            : 'hover:border-muted-foreground/30'
        }`}
        onClick={() => onChange('cod')}
      >
        <RadioGroupItem value="cod" id="payment-cod" />
        <Label htmlFor="payment-cod" className="cursor-pointer flex-1">
          <span className="font-medium">الدفع عند الاستلام</span>
          <p className="text-xs text-muted-foreground mt-1">ادفع نقداً عند التسليم</p>
          {value === 'cod' && whatsappNumber && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>سيتم التواصل معك عبر واتساب لإتمام الطلب</span>
            </div>
          )}
        </Label>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20">
          <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Stripe Credit Card */}
      <div
        className={`flex items-center space-x-reverse space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
          value === 'stripe'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
            : 'hover:border-muted-foreground/30'
        }`}
        onClick={() => onChange('stripe')}
      >
        <RadioGroupItem value="stripe" id="payment-stripe" />
        <Label htmlFor="payment-stripe" className="cursor-pointer flex-1">
          <span className="font-medium">بطاقة ائتمان</span>
          <p className="text-xs text-muted-foreground mt-1">فيزا، ماستركارد، وأكثر</p>
          {value === 'stripe' && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>دفع آمن ومشفر عبر Stripe</span>
            </div>
          )}
        </Label>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20">
          <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    </RadioGroup>
  )
}
