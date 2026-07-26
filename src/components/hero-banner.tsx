'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'

interface Offer {
  id: string
  titleAr: string
  descriptionAr: string
  gradient: string
  ctaTextAr: string
  badgeAr: string | null
  discountPercent: number
}

const FALLBACK_SLIDES: Offer[] = [
  {
    id: '1',
    titleAr: 'تخفيضات الإلكترونيات الضخمة',
    descriptionAr: 'خصم يصل إلى 30% على جميع الإلكترونيات هذا الأسبوع!',
    gradient: 'from-red-500 to-orange-600',
    ctaTextAr: 'تسوق الإلكترونيات',
    badgeAr: 'ساخن',
    discountPercent: 30,
  },
  {
    id: '2',
    titleAr: 'عروض أسبوع الموضة',
    descriptionAr: 'وصولات جديدة بخصومات حصرية تصل إلى 40%!',
    gradient: 'from-purple-500 to-pink-600',
    ctaTextAr: 'استكشف الموضة',
    badgeAr: 'جديد',
    discountPercent: 40,
  },
  {
    id: '3',
    titleAr: 'عروض تجديد المنزل',
    descriptionAr: 'حوّل منزلك بتوفير يصل إلى 25% على مستلزمات المنزل!',
    gradient: 'from-emerald-500 to-teal-600',
    ctaTextAr: 'تسوق المنزل',
    badgeAr: 'صفقة',
    discountPercent: 25,
  },
  {
    id: '4',
    titleAr: 'تخفيضات الجمال السريعة',
    descriptionAr: 'عروض جمال لفترة محدودة بخصومات تصل إلى 35%!',
    gradient: 'from-pink-500 to-rose-600',
    ctaTextAr: 'تسوق الجمال',
    badgeAr: 'تخفيض',
    discountPercent: 35,
  },
]

export function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const { setView } = useShopStore()

  const { data: offersData } = useQuery({
    queryKey: ['site-offers'],
    queryFn: async () => {
      const res = await fetch('/api/site/offers')
      const json = await res.json()
      return json.data?.items as Offer[] | undefined
    },
  })

  const slides = offersData && offersData.length > 0 ? offersData : FALLBACK_SLIDES

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative overflow-hidden rounded-xl mx-4 mt-4">
      <div className="relative h-48 sm:h-64 md:h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-l ${slides[current]?.gradient || 'from-orange-500 to-amber-600'} flex items-center justify-center text-white`}
          >
            <div className="text-center px-6 max-w-2xl">
              {slides[current]?.badgeAr && (
                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold mb-3">
                  {slides[current].badgeAr}
                </span>
              )}
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2">
                {slides[current]?.titleAr}
              </h2>
              <p className="text-sm sm:text-lg opacity-90 mb-4">
                {slides[current]?.descriptionAr}
              </p>
              <Button
                onClick={() => setView('home')}
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
              >
                {slides[current]?.ctaTextAr || 'تسوق الآن'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-full bg-white"
          />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
