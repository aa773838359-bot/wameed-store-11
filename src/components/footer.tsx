'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { toast } from 'sonner'

interface FooterTexts {
  'footer.phone'?: { value: string; valueAr: string }
  'footer.address'?: { value: string; valueAr: string }
  'footer.website'?: { value: string; valueAr: string }
  'footer.about'?: { value: string; valueAr: string }
  'footer.email'?: { value: string; valueAr: string }
}

export function Footer() {
  const { setView, setCategory } = useShopStore()
  const [email, setEmail] = useState('')

  const { data: categoriesData } = useQuery({
    queryKey: ['footer-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      const json = await res.json()
      return json.data?.items as Array<{ nameAr: string; slug: string }> | undefined
    },
  })

  const { data: footerTexts } = useQuery({
    queryKey: ['footer-texts'],
    queryFn: async () => {
      const res = await fetch('/api/site/texts?group=footer')
      const json = await res.json()
      return json.data?.texts as FooterTexts | undefined
    },
  })

  const categories = categoriesData?.slice(0, 5) || []
  const phone = footerTexts?.['footer.phone']?.valueAr || '+966 50 000 0000'
  const address = footerTexts?.['footer.address']?.valueAr || 'الرياض، المملكة العربية السعودية'
  const website = footerTexts?.['footer.website']?.valueAr || 'www.wameedstore.com'
  const about = footerTexts?.['footer.about']?.valueAr || 'متجرك الإلكتروني الشامل. اكتشف أفضل المنتجات بأسعار مذهلة مع توصيل سريع وضمان الجودة.'
  const footerEmail = footerTexts?.['footer.email']?.valueAr || 'info@wameedstore.com'

  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="وميض ستور" className="h-9 w-9 rounded-full object-cover ring-2 ring-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-white">وميض ستور</span>
                <span className="text-[10px] text-orange-400">متجر إلكتروني</span>
              </div>
            </div>
            <p className="text-sm leading-6">{about}</p>
            <div className="flex items-center gap-3 mt-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">التصنيفات</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => { setCategory(cat.slug); setView('home') }}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {cat.nameAr}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setView('orders')} className="text-sm hover:text-orange-400 transition-colors">تتبع الطلب</button></li>
              <li><button onClick={() => setView('wishlist')} className="text-sm hover:text-orange-400 transition-colors">المفضلة</button></li>
              <li><button className="text-sm hover:text-orange-400 transition-colors">سياسة الإرجاع</button></li>
              <li><button className="text-sm hover:text-orange-400 transition-colors">الشروط والأحكام</button></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">النشرة البريدية</h3>
            <p className="text-sm mb-3">اشترك ليصلك أحدث العروض والخصومات</p>
            <div className="flex gap-2">
              <Input
                placeholder="بريدك الإلكتروني"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                dir="ltr"
              />
              <Button
                onClick={() => { if (email) { toast.success('تم الاشتراك في النشرة البريدية!'); setEmail('') } }}
                className="bg-orange-500 hover:bg-orange-600 shrink-0"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                <span dir="ltr">{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-orange-500 shrink-0" />
                <span dir="ltr">{website}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                <span dir="ltr">{footerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        <div className="text-center text-sm text-slate-500">
          © 2025 وميض ستور. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  )
}
