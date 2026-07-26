'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sun,
  Moon,
  ShoppingCart,
  Heart,
  Package,
  X,
  Coins,
  Shield,
} from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'

interface SearchProduct {
  id: string
  nameAr: string
  image: string
  price: number
}

const emptySubscribe = () => () => {}
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function Header() {
  const {
    searchQuery,
    setSearch,
    setView,
    setCartOpen,
    cartCount,
    wishlist,
    selectProduct,
    currencies,
    activeCurrencyId,
    setActiveCurrency,
    formatPrice,
  } = useShopStore()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [showDropdown, setShowDropdown] = useState(false)
  const mounted = useIsMounted()
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: searchResults } = useQuery({
    queryKey: ['search-suggest', localSearch],
    queryFn: async () => {
      if (!localSearch || localSearch.length < 2) return []
      const res = await fetch(`/api/products?search=${encodeURIComponent(localSearch)}&limit=5`)
      const json = await res.json()
      return (json.data?.items || []) as SearchProduct[]
    },
    enabled: localSearch.length >= 2,
  })

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      setShowDropdown(true)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setSearch(value)
      }, 300)
    },
    [setSearch]
  )

  const handleSearchSubmit = () => {
    setSearch(localSearch)
    setShowDropdown(false)
    setView('home')
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const count = cartCount()

  return (
    <header className="sticky top-0 z-50 bg-slate-800 dark:bg-slate-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <button
            onClick={() => {
              setView('home')
              setSearch('')
              setLocalSearch('')
            }}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo.png" alt="وميض ستور" className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-white">وميض ستور</span>
              <span className="text-[10px] text-orange-400">متجر إلكتروني</span>
            </div>
          </button>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="flex w-full">
              <Input
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                onFocus={() => localSearch.length >= 2 && setShowDropdown(true)}
                placeholder="ابحث عن منتجات..."
                className="rounded-l-none bg-white dark:bg-slate-700 text-foreground border-0 focus-visible:ring-orange-500"
              />
              <Button
                onClick={handleSearchSubmit}
                className="rounded-r-none bg-orange-500 hover:bg-orange-600 px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <AnimatePresence>
              {showDropdown && searchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border overflow-hidden z-50"
                >
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        selectProduct(product.id)
                        setShowDropdown(false)
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-600 rounded flex items-center justify-center text-xs">
                        🛍️
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-sm font-medium text-foreground">{product.nameAr}</p>
                        <p className="text-xs text-orange-500 font-bold">{formatPrice(product.price)}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 mr-auto">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-orange-400"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Currency Selector */}
            {currencies.length > 1 && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-orange-400 text-xs font-bold"
                  title="تغيير العملة"
                >
                  <Coins className="h-5 w-5" />
                </Button>
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border overflow-hidden z-50 hidden group-hover:block min-w-[160px]">
                  {currencies.map((currency) => (
                    <button
                      key={currency.id}
                      onClick={() => setActiveCurrency(currency.id)}
                      className={`w-full text-right px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${
                        activeCurrencyId === currency.id ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 font-bold' : 'text-foreground'
                      }`}
                    >
                      <span>{currency.symbol} {currency.code}</span>
                      {currency.isDefault && <span className="text-[10px] text-muted-foreground">افتراضية</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-orange-400"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </Button>

            {/* Orders */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-orange-400"
              onClick={() => setView('orders')}
            >
              <Package className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-orange-400 relative"
              onClick={() => setView('wishlist')}
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlist.length > 0 && (
                <Badge className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-[10px]">
                  {wishlist.length}
                </Badge>
              )}
            </Button>

            {/* Admin Login */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-orange-400"
              onClick={() => setView('admin')}
              title="لوحة التحكم"
            >
              <Shield className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-orange-400 relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && count > 0 && (
                <Badge className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-[10px]">
                  {count}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-2"
            >
              <div className="flex">
                <Input
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="ابحث عن منتجات..."
                  className="rounded-l-none bg-white dark:bg-slate-700 text-foreground border-0"
                  autoFocus
                />
                <Button
                  onClick={handleSearchSubmit}
                  className="rounded-r-none bg-orange-500 hover:bg-orange-600 px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
