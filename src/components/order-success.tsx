'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ShoppingBag, MessageCircle } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function OrderSuccess() {
  const { setView } = useShopStore()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">تم إرسال طلبك بنجاح!</h1>
        <p className="text-muted-foreground mb-6">تم توجيهك إلى واتساب لإتمام عملية الطلب. سنقوم بتأكيد طلبك في أقرب وقت عبر الواتساب.</p>

        <Card className="text-right mb-6 border-green-200 dark:border-green-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <span className="text-lg font-bold text-green-600">تم التوجيه إلى واتساب</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ تم إرسال تفاصيل طلبك عبر واتساب</p>
              <p>📱 سيتم التواصل معك لتأكيد الطلب والتوصيل</p>
              <p>🚚 يرجى الاحتفاظ برسالة واتساب المرسلة كمرجع</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => setView('home')}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <ShoppingBag className="h-5 w-5 ml-2" />
          متابعة التسوق
        </Button>
      </motion.div>
    </div>
  )
}
