'use client'

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { AnnouncementBar } from '@/components/announcement-bar'
import { Header } from '@/components/header'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryBar } from '@/components/category-bar'
import { DealTimer } from '@/components/deal-timer'
import { FeaturedProducts } from '@/components/featured-products'
import { RecentlyViewed } from '@/components/recently-viewed'
import { ProductGrid } from '@/components/product-grid'
import { ProductDetail } from '@/components/product-detail'
import { ProductQuickView } from '@/components/product-quick-view'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutForm } from '@/components/checkout-form'
import { OrderSuccess } from '@/components/order-success'
import { OrderHistory } from '@/components/order-history'
import { WishlistSection } from '@/components/wishlist-section'
import { AdminDashboard } from '@/components/admin-dashboard'
import { Footer } from '@/components/footer'
import { WelcomeSplash } from '@/components/welcome-splash'

function AppContent() {
  const { view, setView, setCurrencies, setActiveCurrency, activeCurrencyId, currencies, loadStoreSettings, storeSettingsLoaded, setAdminAuth } = useShopStore()

  // Load currencies from API
  const { data: currenciesData } = useQuery({
    queryKey: ['site-currencies'],
    queryFn: async () => {
      const res = await fetch('/api/site/currencies')
      const json = await res.json()
      return json.data?.items as import('@/lib/store').CurrencyInfo[] | undefined
    },
  })

  // Set currencies when loaded
  useEffect(() => {
    if (currenciesData && currenciesData.length > 0) {
      setCurrencies(currenciesData)
    }
  }, [currenciesData, setCurrencies])

  // Load store settings after currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !storeSettingsLoaded) {
      loadStoreSettings()
    }
  }, [currencies, storeSettingsLoaded, loadStoreSettings])

  // Detect admin URL parameter
  useEffect(() => {
    async function checkAdminUrl() {
      const params = new URLSearchParams(window.location.search)
      const adminParam = params.get('admin')
      if (adminParam) {
        try {
          const res = await fetch('/api/admin/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: adminParam }),
          })
          const json = await res.json()
          if (json.data?.valid) {
            setAdminAuth(true)
            setView('admin')
            // Clean the URL
            window.history.replaceState({}, '', '/')
          }
        } catch {
          // API unavailable - cannot verify
        }
      }
    }
    checkAdminUrl()
    window.addEventListener('popstate', () => checkAdminUrl())
    return () => window.removeEventListener('popstate', () => checkAdminUrl())
  }, [setView])

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <HeroBanner />
            <CategoryBar />
            <DealTimer />
            <FeaturedProducts />
            <RecentlyViewed />
            <ProductGrid />
          </motion.div>
        )
      case 'product':
        return (
          <motion.div key="product" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Breadcrumbs />
            <ProductDetail />
          </motion.div>
        )
      case 'checkout':
        return (
          <motion.div key="checkout" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Breadcrumbs />
            <CheckoutForm />
          </motion.div>
        )
      case 'order-success':
        return (
          <motion.div key="order-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <Breadcrumbs />
            <OrderSuccess />
          </motion.div>
        )
      case 'orders':
        return (
          <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Breadcrumbs />
            <OrderHistory />
          </motion.div>
        )
      case 'wishlist':
        return (
          <motion.div key="wishlist" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
            <Breadcrumbs />
            <WishlistSection />
          </motion.div>
        )
      case 'admin':
        return (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AdminDashboard />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {view === 'admin' ? (
        <main className="flex-1">
          <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
        </main>
      ) : (
        <>
          <AnnouncementBar />
          <Header />
          {view === 'home' && <Breadcrumbs />}
          <main className="flex-1">
            <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
          </main>
          <Footer />
          <CartDrawer />
          <ProductQuickView />
        </>
      )}
    </div>
  )
}

export default function Home() {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false } },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <WelcomeSplash />
      <AppContent />
    </QueryClientProvider>
  )
}
