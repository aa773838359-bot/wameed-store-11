'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Car,
  ShoppingBasket,
  Briefcase,
  Tag,
} from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const ICON_MAP: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="h-4 w-4" />,
  Shirt: <Shirt className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Dumbbell: <Dumbbell className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Gamepad2: <Gamepad2 className="h-4 w-4" />,
  Car: <Car className="h-4 w-4" />,
  ShoppingBasket: <ShoppingBasket className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
}

interface Category {
  id: string
  nameAr: string
  slug: string
  icon: string
  productCount: number
}

export function CategoryBar() {
  const { selectedCategory, setCategory, setView } = useShopStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      const json = await res.json()
      return json.data?.items as Category[] | undefined
    },
  })

  const categories = data || []

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? 200 : -200
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold">التصنيفات</h2>
      </div>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow rounded-full h-8 w-8"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow rounded-full h-8 w-8"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <ScrollArea className="w-full" ref={scrollRef}>
          <div className="flex gap-2 px-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCategory(null)
                setView('home')
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-orange-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              الكل
            </motion.button>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-24 h-10 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                ))
              : categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCategory(cat.slug)
                      setView('home')
                    }}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-orange-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ICON_MAP[cat.icon] || <Tag className="h-4 w-4" />}
                    {cat.nameAr}
                  </motion.button>
                ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}
