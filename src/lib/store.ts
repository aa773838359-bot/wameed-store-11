'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type View = 'home' | 'product' | 'checkout' | 'order-success' | 'orders' | 'wishlist' | 'admin'
export type AdminTab = 'dashboard' | 'offers' | 'texts' | 'ads' | 'products' | 'orders' | 'categories' | 'currencies' | 'settings' | 'reviews'

export interface CartItemInput {
  productId: string
  name: string
  nameAr: string
  price: number
  originalPrice?: number
  image: string
  quantity?: number
}

export interface CartItem extends CartItemInput {
  quantity: number
}

export interface CurrencyInfo {
  id: string
  code: string
  name: string
  nameAr: string
  symbol: string
  exchangeRate: number
  isDefault: boolean
  order: number
}

interface ShopState {
  view: View
  selectedProductId: string | null
  searchQuery: string
  selectedCategory: string | null
  sortBy: string
  page: number
  cartOpen: boolean
  cartItems: CartItem[]
  wishlist: string[]
  recentlyViewed: string[]
  lastOrderId: string | null
  quickViewProductId: string | null
  adminTab: AdminTab
  isAdminAuth: boolean

  // Currency
  currencies: CurrencyInfo[]
  activeCurrencyId: string | null

  // Manual Exchange Rate
  manualRateEnabled: boolean
  manualExchangeRate: number

  // Store Settings
  whatsappNumber: string
  stripePublicKey: string
  storeSettingsLoaded: boolean

  setView: (view: View) => void
  setQuickViewProduct: (id: string | null) => void
  selectProduct: (id: string) => void
  setSearch: (query: string) => void
  setCategory: (slug: string | null) => void
  setSortBy: (sort: string) => void
  setPage: (page: number) => void
  setCartOpen: (open: boolean) => void
  addToCart: (item: CartItemInput) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: () => number
  cartTotal: () => number
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  addRecentlyViewed: (productId: string) => void
  setLastOrderId: (id: string) => void
  setAdminTab: (tab: AdminTab) => void
  setAdminAuth: (auth: boolean) => void
  logoutAdmin: () => void

  // Currency actions
  setCurrencies: (currencies: CurrencyInfo[]) => void
  setActiveCurrency: (id: string) => void
  getActiveCurrency: () => CurrencyInfo | null
  formatPrice: (usdPrice: number) => string
  convertPrice: (usdPrice: number) => number

  // Manual Exchange Rate actions
  setManualRateEnabled: (enabled: boolean) => void
  setManualExchangeRate: (rate: number) => void

  // Store Settings actions
  setWhatsappNumber: (number: string) => void
  setStripePublicKey: (key: string) => void
  setStoreSettingsLoaded: (loaded: boolean) => void
  loadStoreSettings: () => Promise<void>
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      view: 'home',
      selectedProductId: null,
      searchQuery: '',
      selectedCategory: null,
      sortBy: 'newest',
      page: 1,
      cartOpen: false,
      cartItems: [],
      wishlist: [],
      recentlyViewed: [],
      lastOrderId: null,
      quickViewProductId: null,
      adminTab: 'dashboard',
      isAdminAuth: false,

      // Currency defaults
      currencies: [],
      activeCurrencyId: null,

      // Manual Exchange Rate defaults
      manualRateEnabled: false,
      manualExchangeRate: 0,

      // Store Settings defaults
      whatsappNumber: '',
      stripePublicKey: '',
      storeSettingsLoaded: false,

      setView: (view) => set({ view, page: 1 }),
      setQuickViewProduct: (id) => set({ quickViewProductId: id }),
      selectProduct: (id) => set({ selectedProductId: id, view: 'product' }),
      setSearch: (query) => set({ searchQuery: query, page: 1 }),
      setCategory: (slug) => set({ selectedCategory: slug, page: 1 }),
      setSortBy: (sort) => set({ sortBy: sort, page: 1 }),
      setPage: (page) => set({ page }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setAdminAuth: (auth) => set({ isAdminAuth: auth }),

      addToCart: (item) => {
        const { cartItems } = get()
        const existing = cartItems.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            cartItems: cartItems.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          })
        } else {
          set({ cartItems: [...cartItems, { ...item, quantity: item.quantity || 1 }] })
        }
      },
      removeFromCart: (productId) => {
        set({ cartItems: get().cartItems.filter((i) => i.productId !== productId) })
      },
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })
      },
      clearCart: () => set({ cartItems: [] }),
      cartCount: () => get().cartItems.reduce((sum, i) => sum + i.quantity, 0),
      cartTotal: () => get().cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      toggleWishlist: (productId) => {
        const { wishlist } = get()
        set({
          wishlist: wishlist.includes(productId)
            ? wishlist.filter((id) => id !== productId)
            : [...wishlist, productId],
        })
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),
      addRecentlyViewed: (productId) => {
        const { recentlyViewed } = get()
        // Skip if already at the front
        if (recentlyViewed[0] === productId) return
        const filtered = recentlyViewed.filter((id) => id !== productId)
        set({ recentlyViewed: [productId, ...filtered].slice(0, 10) })
      },
      setLastOrderId: (id) => set({ lastOrderId: id }),
      setAdminTab: (tab) => set({ adminTab: tab }),
      logoutAdmin: () => set({ isAdminAuth: false, view: 'home', adminTab: 'dashboard' }),

      // Currency actions
      setCurrencies: (currencies) => {
        const { activeCurrencyId } = get()
        // If no active currency set, use the default one
        if (!activeCurrencyId) {
          const defaultCurrency = currencies.find(c => c.isDefault)
          set({ currencies, activeCurrencyId: defaultCurrency?.id || currencies[0]?.id || null })
        } else {
          set({ currencies })
        }
      },
      setActiveCurrency: (id) => set({ activeCurrencyId: id }),
      getActiveCurrency: () => {
        const { currencies, activeCurrencyId } = get()
        if (!currencies.length) return null
        return currencies.find(c => c.id === activeCurrencyId) || currencies.find(c => c.isDefault) || currencies[0]
      },
      convertPrice: (usdPrice: number) => {
        const { manualRateEnabled, manualExchangeRate } = get()
        const currency = get().getActiveCurrency()
        if (!currency) return usdPrice
        // Use manual rate if enabled, otherwise use currency's automatic rate
        const rate = manualRateEnabled && manualExchangeRate > 0 ? manualExchangeRate : currency.exchangeRate
        return usdPrice * rate
      },
      formatPrice: (usdPrice: number) => {
        const { manualRateEnabled, manualExchangeRate } = get()
        const currency = get().getActiveCurrency()
        if (!currency) return `$${usdPrice.toFixed(2)}`
        // Use manual rate if enabled, otherwise use currency's automatic rate
        const rate = manualRateEnabled && manualExchangeRate > 0 ? manualExchangeRate : currency.exchangeRate
        const converted = usdPrice * rate
        // Format with appropriate decimal places
        const formatted = rate >= 100
          ? Math.round(converted).toLocaleString('ar-SA')
          : converted.toFixed(2)
        return `${currency.symbol}${formatted}`
      },

      // Manual Exchange Rate actions
      setManualRateEnabled: (enabled) => set({ manualRateEnabled: enabled }),
      setManualExchangeRate: (rate) => set({ manualExchangeRate: rate }),

      // Store Settings actions
      setWhatsappNumber: (number) => set({ whatsappNumber: number }),
      setStripePublicKey: (key) => set({ stripePublicKey: key }),
      setStoreSettingsLoaded: (loaded) => set({ storeSettingsLoaded: loaded }),
      loadStoreSettings: async () => {
        try {
          const res = await fetch('/api/site/settings')
          const json = await res.json()
          const data = json.data as Record<string, string> | undefined
          if (data) {
            if (data.whatsappNumber) {
              set({ whatsappNumber: data.whatsappNumber })
            }
            // If admin set a display currency, use it as active
            if (data.displayCurrencyId) {
              const currencies = get().currencies
              const exists = currencies.find(c => c.id === data.displayCurrencyId)
              if (exists) {
                set({ activeCurrencyId: data.displayCurrencyId })
              }
            }
            // Load manual exchange rate settings
            if (data.manualRateEnabled === 'true') {
              set({ manualRateEnabled: true })
            }
            if (data.manualExchangeRate) {
              set({ manualExchangeRate: parseFloat(data.manualExchangeRate) || 0 })
            }
            // Load Stripe public key from settings or env
            if (data.stripePublicKey) {
              set({ stripePublicKey: data.stripePublicKey })
            } else if (process.env.NEXT_PUBLIC_STRIPE_PK) {
              set({ stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PK })
            }
          }
          set({ storeSettingsLoaded: true })
        } catch (e) {
          set({ storeSettingsLoaded: true })
        }
      },
    }),
    {
      name: 'zshop-storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        activeCurrencyId: state.activeCurrencyId,
        whatsappNumber: state.whatsappNumber,
      }),
    }
  )
)
