'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function WelcomeSplash() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show once per session
    const seen = sessionStorage.getItem('wameed-splash-seen')
    if (!seen) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('wameed-splash-seen', '1')
  }

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!show) return
    const timer = setTimeout(handleDismiss, 3500)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cursor-pointer"
          onClick={handleDismiss}
        >
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/40 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                y: [null, Math.random() * -200],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Radial glow */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-orange-500/20 blur-[80px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Content */}
          <div className="flex flex-col items-center text-center z-10">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="وميض ستور"
                  className="w-28 h-28 rounded-2xl object-cover shadow-2xl ring-4 ring-orange-500/30"
                />
                <motion.div
                  className="absolute -inset-2 rounded-2xl ring-2 ring-orange-400/50"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Store Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-white mb-2"
            >
              وميض ستور
            </motion.h1>

            {/* Underline decoration */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-4"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-slate-400 text-lg mb-8"
            >
              متجر إلكتروني • توصيل فوري
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
            >
              <Sparkles className="w-5 h-5" />
              تسوق الآن
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
