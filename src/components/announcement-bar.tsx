'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

const FALLBACK_ANNOUNCEMENTS = [
  '🎉 خصم 30% على جميع الإلكترونيات!',
  '🚚 شحن مجاني للطلبات فوق $50',
  '⭐ عروض حصرية - لفترة محدودة فقط!',
]

export function AnnouncementBar() {
  const { data: textsData } = useQuery({
    queryKey: ['site-texts', 'announcement'],
    queryFn: async () => {
      const res = await fetch('/api/site/texts?group=announcement')
      const json = await res.json()
      return json.data?.texts as Record<string, { value: string; valueAr: string }> | undefined
    },
  })

  const announcements = textsData
    ? Object.values(textsData).map((t) => t.valueAr).filter(Boolean)
    : FALLBACK_ANNOUNCEMENTS

  if (announcements.length === 0) return null

  return (
    <div className="bg-gradient-to-l from-orange-500 to-amber-500 text-white text-sm py-1.5 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16"
        >
          {[...announcements, ...announcements, ...announcements].map((text, i) => (
            <span key={i} className="inline-block px-4">
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
