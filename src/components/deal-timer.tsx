'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[3rem] text-center">
        <span className="text-2xl sm:text-3xl font-bold block" suppressHydrationWarning>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs mt-1 opacity-80">{label}</span>
    </div>
  )
}

function calcTimeLeft() {
  // Use a fixed future date based on current day at 23:59:59
  const now = new Date()
  const target = new Date(now)
  target.setHours(23, 59, 59, 999)
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function DealTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 23, minutes: 59, seconds: 59 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag must be set in effect
    setMounted(true)
    setTimeLeft(calcTimeLeft())
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="mx-4 my-4 rounded-xl bg-gradient-to-l from-orange-500 to-amber-500 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">عروض فلاش</h3>
              <p className="text-sm opacity-90">لا تفوّت العروض المحدودة!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <TimeUnit value={0} label="أيام" />
            <span className="text-2xl font-bold self-start mt-2">:</span>
            <TimeUnit value={23} label="ساعات" />
            <span className="text-2xl font-bold self-start mt-2">:</span>
            <TimeUnit value={59} label="دقائق" />
            <span className="text-2xl font-bold self-start mt-2">:</span>
            <TimeUnit value={59} label="ثواني" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 my-4 rounded-xl bg-gradient-to-l from-orange-500 to-amber-500 text-white p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 animate-pulse" />
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">عروض فلاش</h3>
            <p className="text-sm opacity-90">لا تفوّت العروض المحدودة!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <TimeUnit value={timeLeft.days} label="أيام" />
          <span className="text-2xl font-bold self-start mt-2">:</span>
          <TimeUnit value={timeLeft.hours} label="ساعات" />
          <span className="text-2xl font-bold self-start mt-2">:</span>
          <TimeUnit value={timeLeft.minutes} label="دقائق" />
          <span className="text-2xl font-bold self-start mt-2">:</span>
          <TimeUnit value={timeLeft.seconds} label="ثواني" />
        </div>
      </div>
    </div>
  )
}
