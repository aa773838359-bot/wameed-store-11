'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  LayoutDashboard,
  Tag,
  Type,
  Megaphone,
  Package,
  ClipboardList,
  LogOut,
  Store,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Layers,
  Star,
  Search,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Save,
  Inbox,
  LayoutTemplate,
  FileText,
  Coins,
  Settings,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/image-upload'

// ─── Empty State Component ──────────────────────────────────────
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  )
}

// ─── Loading Spinner Button ──────────────────────────────────────
function LoadingButton({ children, isLoading, ...props }: React.ComponentProps<typeof Button> & { isLoading?: boolean }) {
  return (
    <Button {...props} disabled={props.disabled || isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

// ─── Login Screen ──────────────────────────────────────────────
function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { setAdminAuth, setView } = useShopStore()

  const handleLogin = async () => {
    setIsVerifying(true)
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (json.data?.valid) {
        setAdminAuth(true)
        toast.success('تم تسجيل الدخول بنجاح')
      } else {
        setError(true)
        setTimeout(() => setError(false), 2000)
      }
    } catch {
      setError(true)
      setTimeout(() => setError(false), 2000)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">لوحة تحكم وميض ستور</h1>
          <p className="text-slate-400 mt-2">أدخل كلمة المرور للوصول</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-slate-300">كلمة المرور</Label>
              <div className="relative mt-1">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-sm text-center"
                >
                  كلمة المرور غير صحيحة
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              onClick={handleLogin}
              disabled={isVerifying}
              className="w-full bg-gradient-to-l from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white h-11"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
              onClick={() => setView('home')}
            >
              العودة إلى المتجر
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Dashboard Tab ──────────────────────────────────────────────
function DashboardTab() {
  const { formatPrice } = useShopStore()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      const json = await res.json()
      return json.data as {
        stats: { products: number; categories: number; orders: number; revenue: number; offers: number; ads: number }
        recentOrders: Array<{
          id: string
          total: number
          status: string
          createdAt: string
          items: Array<{ name: string; quantity: number; price: number }>
        }>
      } | undefined
    },
  })

  const stats = data?.stats
  const recentOrders = data?.recentOrders || []

  const statCards = [
    { label: 'المنتجات', value: stats?.products || 0, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', trend: '+12%', trendUp: true },
    { label: 'الطلبات', value: stats?.orders || 0, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10', trend: '+8%', trendUp: true },
    { label: 'الإيرادات', value: `$${(stats?.revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', trend: '+5%', trendUp: true },
    { label: 'العروض', value: stats?.offers || 0, icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', trend: '+2', trendUp: true },
  ]

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-orange-500" />
        نظرة عامة
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.trend}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            آخر الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="لا توجد طلبات بعد"
              description="ستظهر الطلبات الجديدة هنا بمجرد تقديمها من العملاء"
            />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentOrders.map((order) => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.pending
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="font-mono text-sm font-bold">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                    <span className="font-bold text-orange-500">{formatPrice(order.total)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Offers Tab ──────────────────────────────────────────────
function OffersTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    titleAr: '',
    descriptionAr: '',
    image: '',
    discountPercent: 0,
    badgeAr: '',
    gradient: 'from-orange-500 to-amber-600',
    ctaTextAr: 'تسوق الآن',
    active: true,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/offers')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        titleAr: string
        descriptionAr: string
        discountPercent: number
        badgeAr: string | null
        gradient: string
        ctaTextAr: string
        active: boolean
      }> | undefined
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, title: data.titleAr, description: data.descriptionAr, badge: data.badgeAr, ctaText: data.ctaTextAr }),
      })
      if (!res.ok) throw new Error('فشل في إنشاء العرض')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] })
      queryClient.invalidateQueries({ queryKey: ['site-offers'] })
      setDialogOpen(false)
      resetForm()
      toast.success('تم إنشاء العرض')
    },
    onError: () => {
      toast.error('فشل في إنشاء العرض')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في تحديث العرض')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] })
      queryClient.invalidateQueries({ queryKey: ['site-offers'] })
      toast.success('تم تحديث العرض')
    },
    onError: () => {
      toast.error('فشل في تحديث العرض')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف العرض')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] })
      queryClient.invalidateQueries({ queryKey: ['site-offers'] })
      toast.success('تم حذف العرض')
    },
    onError: () => {
      toast.error('فشل في حذف العرض')
    },
  })

  const resetForm = () => {
    setForm({
      titleAr: '',
      descriptionAr: '',
      image: '',
      discountPercent: 0,
      badgeAr: '',
      gradient: 'from-orange-500 to-amber-600',
      ctaTextAr: 'تسوق الآن',
      active: true,
    })
    setEditId(null)
  }

  const openEdit = (offer: NonNullable<typeof data>[number]) => {
    setForm({
      titleAr: offer.titleAr,
      descriptionAr: offer.descriptionAr,
      image: '',
      discountPercent: offer.discountPercent,
      badgeAr: offer.badgeAr || '',
      gradient: offer.gradient,
      ctaTextAr: offer.ctaTextAr,
      active: offer.active,
    })
    setEditId(offer.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const offers = data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">العروض</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'تعديل العرض' : 'عرض جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>العنوان (عربي)</Label>
                <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
              </div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="صورة العرض (اختياري)"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>نسبة الخصم</Label>
                  <Input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>الشارة (عربي)</Label>
                  <Input value={form.badgeAr} onChange={(e) => setForm({ ...form, badgeAr: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>التدرج اللوني</Label>
                <Select value={form.gradient} onValueChange={(v) => setForm({ ...form, gradient: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-orange-500 to-amber-600">برتقالي</SelectItem>
                    <SelectItem value="from-red-500 to-orange-600">أحمر</SelectItem>
                    <SelectItem value="from-purple-500 to-pink-600">بنفسجي</SelectItem>
                    <SelectItem value="from-emerald-500 to-teal-600">أخضر</SelectItem>
                    <SelectItem value="from-pink-500 to-rose-600">وردي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
                <Label>نشط</Label>
              </div>
              <LoadingButton
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editId ? 'تحديث' : 'إنشاء'}
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="لا توجد عروض"
          description="أضف عروض جديدة لجذب العملاء وزيادة المبيعات"
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={`overflow-hidden ${!offer.active ? 'opacity-60' : ''}`}>
              <div className={`h-24 bg-gradient-to-l ${offer.gradient} p-4 flex items-center justify-between`}>
                <div className="text-white">
                  <h3 className="font-bold">{offer.titleAr}</h3>
                  <p className="text-xs opacity-90">{offer.descriptionAr}</p>
                </div>
                {offer.badgeAr && (
                  <Badge className="bg-white/20 text-white">{offer.badgeAr}</Badge>
                )}
              </div>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={offer.active}
                    onCheckedChange={(c) =>
                      updateMutation.mutate({ id: offer.id, data: { active: c } })
                    }
                  />
                  <span className="text-sm">{offer.active ? 'نشط' : 'معطل'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(offer)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => deleteMutation.mutate(offer.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Texts Tab ──────────────────────────────────────────────
function TextsTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ key: '', value: '', valueAr: '', group: 'general' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValueAr, setEditValueAr] = useState('')

  // Footer settings state
  const [footerForm, setFooterForm] = useState<Record<string, string>>({})
  const [footerInitialized, setFooterInitialized] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-texts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/texts')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        key: string
        value: string
        valueAr: string
        group: string
      }> | undefined
    },
  })

  const texts = data || []

  // Initialize footer form from data
  const footerTexts = useMemo(() => texts.filter(t => t.group === 'footer'), [texts])

  if (!footerInitialized && footerTexts.length > 0) {
    const initial: Record<string, string> = {}
    footerTexts.forEach(t => {
      initial[t.key] = t.valueAr
    })
    setFooterForm(initial)
    setFooterInitialized(true)
  }

  const FOOTER_FIELD_LABELS: Record<string, string> = {
    'footer.phone': 'رقم الهاتف',
    'footer.address': 'العنوان',
    'footer.website': 'الموقع الإلكتروني',
    'footer.about': 'حول المتجر',
    'footer.email': 'البريد الإلكتروني',
    'footer.copyright': 'نص حقوق النشر',
    'footer.facebookUrl': 'رابط فيسبوك',
    'footer.twitterUrl': 'رابط تويتر (X)',
    'footer.instagramUrl': 'رابط انستغرام',
    'footer.categoriesTitle': 'عنوان قسم التصنيفات',
    'footer.linksTitle': 'عنوان الروابط السريعة',
    'footer.newsletterTitle': 'عنوان النشرة البريدية',
    'footer.newsletterText': 'نص النشرة البريدية',
    'footer.returnPolicy': 'محتوى سياسة الإرجاع',
    'footer.termsConditions': 'محتوى الشروط والأحكام',
  }

  const FOOTER_FIELD_ICONS: Record<string, string> = {
    'footer.phone': '📱',
    'footer.address': '📍',
    'footer.website': '🌐',
    'footer.about': 'ℹ️',
    'footer.email': '📧',
    'footer.copyright': '©️',
    'footer.facebookUrl': '📘',
    'footer.twitterUrl': '🐦',
    'footer.instagramUrl': '📷',
    'footer.categoriesTitle': '🏷️',
    'footer.linksTitle': '🔗',
    'footer.newsletterTitle': '✉️',
    'footer.newsletterText': '✉️',
    'footer.returnPolicy': '↩️',
    'footer.termsConditions': '📄',
  }

  // Fields that use a multi-line textarea instead of a single-line input
  const FOOTER_TEXTAREA_FIELDS = new Set([
    'footer.about',
    'footer.returnPolicy',
    'footer.termsConditions',
  ])

  const saveFooterMutation = useMutation({
    mutationFn: async () => {
      const updates = footerTexts.map(t => ({
        id: t.id,
        valueAr: footerForm[t.key] || t.valueAr,
      }))
      const results = await Promise.all(
        updates.map(u =>
          fetch(`/api/admin/texts/${u.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valueAr: u.valueAr }),
          })
        )
      )
      const failed = results.find(r => !r.ok)
      if (failed) throw new Error('فشل في تحديث بعض الحقول')
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-texts'] })
      queryClient.invalidateQueries({ queryKey: ['footer-texts'] })
      toast.success('تم حفظ إعدادات التذييل بنجاح')
    },
    onError: () => {
      toast.error('فشل في حفظ إعدادات التذييل')
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في إنشاء النص')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-texts'] })
      queryClient.invalidateQueries({ queryKey: ['footer-texts'] })
      setDialogOpen(false)
      setForm({ key: '', value: '', valueAr: '', group: 'general' })
      toast.success('تم إنشاء النص')
    },
    onError: () => {
      toast.error('فشل في إنشاء النص')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, valueAr }: { id: string; valueAr: string }) => {
      const res = await fetch(`/api/admin/texts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueAr }),
      })
      if (!res.ok) throw new Error('فشل في تحديث النص')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-texts'] })
      queryClient.invalidateQueries({ queryKey: ['footer-texts'] })
      setFooterInitialized(false)
      setEditingId(null)
      toast.success('تم تحديث النص')
    },
    onError: () => {
      toast.error('فشل في تحديث النص')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/texts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف النص')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-texts'] })
      queryClient.invalidateQueries({ queryKey: ['footer-texts'] })
      setFooterInitialized(false)
      toast.success('تم حذف النص')
    },
    onError: () => {
      toast.error('فشل في حذف النص')
    },
  })

  const grouped = texts.reduce<Record<string, typeof texts>>((acc, t) => {
    const g = t.group || 'general'
    if (!acc[g]) acc[g] = []
    acc[g].push(t)
    return acc
  }, {})

  const GROUP_LABELS: Record<string, string> = {
    general: 'عام',
    announcement: 'إعلانات',
    hero: 'البانر',
    footer: 'التذييل',
  }

  // Non-footer groups for display below
  const nonFooterGroups = Object.entries(grouped).filter(([group]) => group !== 'footer')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">النصوص</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> نص جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>نص جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>المفتاح</Label>
                <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>القيمة (إنجليزي)</Label>
                <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>القيمة (عربي)</Label>
                <Input value={form.valueAr} onChange={(e) => setForm({ ...form, valueAr: e.target.value })} />
              </div>
              <div>
                <Label>المجموعة</Label>
                <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="announcement">إعلانات</SelectItem>
                    <SelectItem value="hero">البانر</SelectItem>
                    <SelectItem value="footer">التذييل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <LoadingButton
                onClick={() => createMutation.mutate(form)}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createMutation.isPending}
              >
                إنشاء
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Footer Settings Card ─── */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : footerTexts.length > 0 ? (
        <Card className="border-orange-200 dark:border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-orange-500" />
              إعدادات التذييل
            </CardTitle>
            <p className="text-sm text-muted-foreground">تحكم في محتوى قسم التذييل في الموقع</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {footerTexts.map((ft) => (
                <div key={ft.id} className={ft.key === 'footer.returnPolicy' || ft.key === 'footer.termsConditions' ? 'sm:col-span-2' : undefined}>
                  <Label className="flex items-center gap-2 mb-1">
                    <span>{FOOTER_FIELD_ICONS[ft.key] || '📝'}</span>
                    {FOOTER_FIELD_LABELS[ft.key] || ft.key}
                  </Label>
                  {FOOTER_TEXTAREA_FIELDS.has(ft.key) ? (
                    <Textarea
                      value={footerForm[ft.key] ?? ft.valueAr}
                      onChange={(e) => setFooterForm({ ...footerForm, [ft.key]: e.target.value })}
                      rows={ft.key === 'footer.about' ? 3 : 4}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      value={footerForm[ft.key] ?? ft.valueAr}
                      onChange={(e) => setFooterForm({ ...footerForm, [ft.key]: e.target.value })}
                      dir={ft.key === 'footer.website' || ft.key === 'footer.email' || ft.key.endsWith('Url') ? 'ltr' : 'rtl'}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <LoadingButton
                onClick={() => saveFooterMutation.mutate()}
                className="bg-orange-500 hover:bg-orange-600"
                isLoading={saveFooterMutation.isPending}
              >
                <Save className="h-4 w-4 ml-1" />
                حفظ إعدادات التذييل
              </LoadingButton>
              {saveFooterMutation.isPending && (
                <span className="text-sm text-muted-foreground">جاري الحفظ...</span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ─── Other Text Groups ─── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : nonFooterGroups.length === 0 && footerTexts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="لا توجد نصوص"
          description="أضف نصوص جديدة لإدارة محتوى الموقع"
        />
      ) : (
        nonFooterGroups.map(([group, items]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {GROUP_LABELS[group] || group}
            </h3>
            <div className="space-y-2">
              {items.map((text) => (
                <div key={text.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{text.key}</p>
                    {editingId === text.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={editValueAr}
                          onChange={(e) => setEditValueAr(e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateMutation.mutate({ id: text.id, valueAr: editValueAr })}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm">{text.valueAr}</p>
                    )}
                  </div>
                  {editingId !== text.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingId(text.id)
                          setEditValueAr(text.valueAr)
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteMutation.mutate(text.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Ads Tab ──────────────────────────────────────────────
function AdsTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    titleAr: '',
    descriptionAr: '',
    image: '',
    link: '',
    position: 'banner',
    active: true,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ads')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        titleAr: string
        descriptionAr: string | null
        image: string
        link: string | null
        position: string
        active: boolean
      }> | undefined
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, title: data.titleAr, description: data.descriptionAr }),
      })
      if (!res.ok) throw new Error('فشل في إنشاء الإعلان')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] })
      setDialogOpen(false)
      setForm({ titleAr: '', descriptionAr: '', image: '', link: '', position: 'banner', active: true })
      toast.success('تم إنشاء الإعلان')
    },
    onError: () => {
      toast.error('فشل في إنشاء الإعلان')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في تحديث الإعلان')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] })
      toast.success('تم تحديث الإعلان')
    },
    onError: () => {
      toast.error('فشل في تحديث الإعلان')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف الإعلان')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] })
      toast.success('تم حذف الإعلان')
    },
    onError: () => {
      toast.error('فشل في حذف الإعلان')
    },
  })

  const ads = data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">الإعلانات</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> إعلان جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إعلان جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>العنوان (عربي)</Label>
                <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
              </div>
              <div>
                <Label>الموضع</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">بانر</SelectItem>
                    <SelectItem value="sidebar">جانبي</SelectItem>
                    <SelectItem value="announcement">إعلان علوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="صورة الإعلان"
              />
              <div>
                <Label>رابط الإعلان (اختياري)</Label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} dir="ltr" placeholder="https://" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
                <Label>نشط</Label>
              </div>
              <LoadingButton
                onClick={() => createMutation.mutate(form)}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createMutation.isPending}
              >
                إنشاء
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="لا توجد إعلانات"
          description="أضف إعلانات جديدة لعرضها على الموقع"
        />
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!ad.active ? 'opacity-60' : ''}`}>
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xl shrink-0">
                📢
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium">{ad.titleAr}</h4>
                <p className="text-xs text-muted-foreground">{ad.position}</p>
              </div>
              <Switch
                checked={ad.active}
                onCheckedChange={(c) => updateMutation.mutate({ id: ad.id, data: { active: c } })}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => deleteMutation.mutate(ad.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Categories Tab ──────────────────────────────────────────────
function CategoriesTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    slug: '',
    icon: 'Tag',
    description: '',
    image: '',
    order: 0,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        name: string
        nameAr: string
        slug: string
        icon: string
        description: string | null
        image: string | null
        order: number
        _count: { products: number }
      }> | undefined
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل في إنشاء التصنيف')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['footer-categories'] })
      setDialogOpen(false)
      resetForm()
      toast.success('تم إنشاء التصنيف')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في تحديث التصنيف')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['footer-categories'] })
      toast.success('تم تحديث التصنيف')
    },
    onError: () => {
      toast.error('فشل في تحديث التصنيف')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف التصنيف')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['footer-categories'] })
      toast.success('تم حذف التصنيف')
    },
    onError: () => {
      toast.error('فشل في حذف التصنيف')
    },
  })

  const resetForm = () => {
    setForm({ name: '', nameAr: '', slug: '', icon: 'Tag', description: '', image: '', order: 0 })
    setEditId(null)
  }

  const openEdit = (cat: NonNullable<typeof data>[number]) => {
    setForm({
      name: cat.name,
      nameAr: cat.nameAr,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description || '',
      image: cat.image || '',
      order: cat.order,
    })
    setEditId(cat.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const categories = data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">التصنيفات</h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> تصنيف جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'تعديل التصنيف' : 'تصنيف جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الاسم (إنجليزي)</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>الاسم (عربي)</Label>
                  <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الرابط (slug)</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>الأيقونة</Label>
                  <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tag">وسم</SelectItem>
                      <SelectItem value="Smartphone">هاتف</SelectItem>
                      <SelectItem value="Shirt">قميص</SelectItem>
                      <SelectItem value="Home">منزل</SelectItem>
                      <SelectItem value="Heart">قلب</SelectItem>
                      <SelectItem value="Dumbbell">رياضة</SelectItem>
                      <SelectItem value="Book">كتاب</SelectItem>
                      <SelectItem value="Car">سيارة</SelectItem>
                      <SelectItem value="Baby">أطفال</SelectItem>
                      <SelectItem value="Utensils">مطبخ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>الوصف</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                    label="صورة التصنيف"
                  />
                </div>
                <div>
                  <Label>الترتيب</Label>
                  <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <LoadingButton
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editId ? 'تحديث' : 'إنشاء'}
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="لا توجد تصنيفات"
          description="أضف تصنيفات لتنظيم المنتجات في المتجر"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <th className="text-right p-3 font-medium">التصنيف</th>
                <th className="text-right p-3 font-medium">الرابط</th>
                <th className="text-right p-3 font-medium">الأيقونة</th>
                <th className="text-right p-3 font-medium">المنتجات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <span className="font-medium">{cat.nameAr}</span>
                      <span className="text-xs text-muted-foreground mr-2">({cat.name})</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                  <td className="p-3 text-muted-foreground">{cat.icon}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{cat._count.products}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Products Tab ──────────────────────────────────────────────
function ProductsTab() {
  const queryClient = useQueryClient()
  const { formatPrice } = useShopStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const [productForm, setProductForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    image: '',
    brand: '',
    brandAr: '',
    stock: '100',
    categoryId: '',
    featured: false,
  })

  const [editProductForm, setEditProductForm] = useState({
    id: '',
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    image: '',
    brand: '',
    brandAr: '',
    stock: '',
    categoryId: '',
    featured: false,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        name: string
        nameAr: string
        description: string
        descriptionAr: string
        price: number
        originalPrice: number | null
        image: string | null
        brand: string | null
        brandAr: string | null
        stock: number
        featured: boolean
        categoryId: string
        category?: { nameAr: string; id: string }
      }> | undefined
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      return json.data?.items as Array<{ id: string; nameAr: string }> | undefined
    },
  })

  const products = data || []
  const categories = categoriesData || []

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        p =>
          p.nameAr.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.brandAr && p.brandAr.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      )
    }
    if (filterCategory !== 'all') {
      result = result.filter(p => p.categoryId === filterCategory)
    }
    return result
  }, [products, searchQuery, filterCategory])

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error('فشل في تحديث المنتج')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setEditingId(null)
      toast.success('تم تحديث المنتج')
    },
    onError: () => {
      toast.error('فشل في تحديث المنتج')
    },
  })

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof productForm) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل في إنشاء المنتج')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setAddDialogOpen(false)
      setProductForm({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        price: '',
        originalPrice: '',
        image: '',
        brand: '',
        brandAr: '',
        stock: '100',
        categoryId: '',
        featured: false,
      })
      toast.success('تم إنشاء المنتج')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const editProductMutation = useMutation({
    mutationFn: async (data: typeof editProductForm) => {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.id,
          name: data.name,
          nameAr: data.nameAr,
          description: data.description,
          descriptionAr: data.descriptionAr,
          price: parseFloat(data.price) || 0,
          originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
          image: data.image,
          brand: data.brand,
          brandAr: data.brandAr,
          stock: parseInt(data.stock) || 0,
          categoryId: data.categoryId,
          featured: data.featured,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل في تحديث المنتج')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setEditDialogOpen(false)
      toast.success('تم تحديث المنتج بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل في حذف المنتج')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setDeleteConfirmId(null)
      toast.success('تم حذف المنتج بنجاح')
    },
    onError: (error: Error) => {
      setDeleteConfirmId(null)
      toast.error(error.message)
    },
  })

  const openEditDialog = (product: NonNullable<typeof data>[number]) => {
    setEditProductForm({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.image || '',
      brand: product.brand || '',
      brandAr: product.brandAr || '',
      stock: String(product.stock),
      categoryId: product.categoryId,
      featured: product.featured,
    })
    setEditDialogOpen(true)
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: '',
      originalPrice: '',
      image: '',
      brand: '',
      brandAr: '',
      stock: '100',
      categoryId: '',
      featured: false,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">المنتجات</h2>
        <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) resetProductForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الاسم (إنجليزي) *</Label>
                  <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>الاسم (عربي) *</Label>
                  <Input value={productForm.nameAr} onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>الوصف (إنجليزي) *</Label>
                <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>الوصف (عربي) *</Label>
                <Textarea value={productForm.descriptionAr} onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>السعر (دولار) *</Label>
                  <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} dir="ltr" placeholder="السعر بالدولار" />
                </div>
                <div>
                  <Label>السعر الأصلي (دولار)</Label>
                  <Input type="number" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} dir="ltr" placeholder="السعر قبل الخصم" />
                </div>
              </div>
              <div>
                <ImageUpload
                  value={productForm.image}
                  onChange={(url) => setProductForm({ ...productForm, image: url })}
                  label="صورة المنتج"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>العلامة التجارية (إنجليزي)</Label>
                  <Input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>العلامة التجارية (عربي)</Label>
                  <Input value={productForm.brandAr} onChange={(e) => setProductForm({ ...productForm, brandAr: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>المخزون</Label>
                  <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>التصنيف *</Label>
                  <Select value={productForm.categoryId} onValueChange={(v) => setProductForm({ ...productForm, categoryId: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر تصنيف" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.featured} onCheckedChange={(c) => setProductForm({ ...productForm, featured: c })} />
                <Label>منتج مميز</Label>
              </div>
              <LoadingButton
                onClick={() => createProductMutation.mutate(productForm)}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createProductMutation.isPending}
              >
                إنشاء المنتج
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Edit Product Dialog ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الاسم (إنجليزي) *</Label>
                <Input value={editProductForm.name} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>الاسم (عربي) *</Label>
                <Input value={editProductForm.nameAr} onChange={(e) => setEditProductForm({ ...editProductForm, nameAr: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>الوصف (إنجليزي)</Label>
              <Textarea value={editProductForm.description} onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })} dir="ltr" />
            </div>
            <div>
              <Label>الوصف (عربي)</Label>
              <Textarea value={editProductForm.descriptionAr} onChange={(e) => setEditProductForm({ ...editProductForm, descriptionAr: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>السعر (دولار) *</Label>
                <Input type="number" value={editProductForm.price} onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })} dir="ltr" placeholder="السعر بالدولار" />
              </div>
              <div>
                <Label>السعر الأصلي (دولار)</Label>
                <Input type="number" value={editProductForm.originalPrice} onChange={(e) => setEditProductForm({ ...editProductForm, originalPrice: e.target.value })} dir="ltr" placeholder="السعر قبل الخصم" />
              </div>
            </div>
            <div>
              <ImageUpload
                value={editProductForm.image}
                onChange={(url) => setEditProductForm({ ...editProductForm, image: url })}
                label="صورة المنتج"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>العلامة التجارية (إنجليزي)</Label>
                <Input value={editProductForm.brand} onChange={(e) => setEditProductForm({ ...editProductForm, brand: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>العلامة التجارية (عربي)</Label>
                <Input value={editProductForm.brandAr} onChange={(e) => setEditProductForm({ ...editProductForm, brandAr: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المخزون</Label>
                <Input type="number" value={editProductForm.stock} onChange={(e) => setEditProductForm({ ...editProductForm, stock: e.target.value })} dir="ltr" />
              </div>
              <div>
                <Label>التصنيف *</Label>
                <Select value={editProductForm.categoryId} onValueChange={(v) => setEditProductForm({ ...editProductForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر تصنيف" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editProductForm.featured} onCheckedChange={(c) => setEditProductForm({ ...editProductForm, featured: c })} />
              <Label>منتج مميز</Label>
            </div>
            <LoadingButton
              onClick={() => editProductMutation.mutate(editProductForm)}
              className="w-full bg-orange-500 hover:bg-orange-600"
              isLoading={editProductMutation.isPending}
            >
              حفظ التعديلات
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(o) => { if (!o) setDeleteConfirmId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              onClick={() => deleteConfirmId && deleteProductMutation.mutate(deleteConfirmId)}
              isLoading={deleteProductMutation.isPending}
            >
              حذف المنتج
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Search & Filter ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── Products Table ─── */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchQuery || filterCategory !== 'all' ? 'لا توجد نتائج' : 'لا توجد منتجات'}
          description={searchQuery || filterCategory !== 'all' ? 'جرب تغيير معايير البحث' : 'أضف منتجات جديدة لعرضها في المتجر'}
        />
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                <th className="text-right p-3 font-medium">الصورة</th>
                <th className="text-right p-3 font-medium">المنتج</th>
                <th className="text-right p-3 font-medium">التصنيف</th>
                <th className="text-right p-3 font-medium">السعر</th>
                <th className="text-right p-3 font-medium">المخزون</th>
                <th className="text-right p-3 font-medium">مميز</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nameAr}
                        className="w-10 h-10 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                          ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{product.nameAr}</p>
                      {product.brandAr && (
                        <p className="text-xs text-muted-foreground">{product.brandAr}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{product.category?.nameAr}</td>
                  <td className="p-3">
                    <div>
                      {editingId === product.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-7 w-20 text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => {
                              updateMutation.mutate({
                                id: product.id,
                                data: { price: parseFloat(editPrice) },
                              })
                            }}
                          >
                            <Check className="h-3 w-3 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(product.id)
                            setEditPrice(String(product.price))
                            setEditStock(String(product.stock))
                          }}
                          className="font-medium hover:text-orange-500 transition-colors"
                        >
                          <span>{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through mr-1">{formatPrice(product.originalPrice)}</span>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {editingId === product.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="h-7 w-20 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            updateMutation.mutate({
                              id: product.id,
                              data: { stock: parseInt(editStock) },
                            })
                          }}
                        >
                          <Check className="h-3 w-3 text-green-500" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product.id)
                          setEditPrice(String(product.price))
                          setEditStock(String(product.stock))
                        }}
                        className={`font-medium transition-colors ${
                          product.stock <= 0
                            ? 'text-red-500 hover:text-red-600'
                            : product.stock <= 10
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'hover:text-orange-500'
                        }`}
                      >
                        {product.stock <= 0 ? (
                          <Badge variant="destructive" className="text-xs">نفذ</Badge>
                        ) : product.stock <= 10 ? (
                          <span className="flex items-center gap-1">{product.stock} <AlertCircle className="h-3 w-3" /></span>
                        ) : (
                          product.stock
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={product.featured}
                      onCheckedChange={(c) =>
                        updateMutation.mutate({ id: product.id, data: { featured: c } })
                      }
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteConfirmId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 text-xs text-muted-foreground text-center border-t bg-slate-50 dark:bg-slate-800/50">
            عرض {filteredProducts.length} من {products.length} منتج
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Orders Tab ──────────────────────────────────────────────
function OrdersTab() {
  const queryClient = useQueryClient()
  const { formatPrice } = useShopStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/orders')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        email: string
        firstName: string
        lastName: string
        total: number
        status: string
        createdAt: string
        items: Array<{ name: string; quantity: number; price: number; image: string }>
      }> | undefined
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('فشل في تحديث حالة الطلب')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('تم تحديث حالة الطلب')
    },
    onError: () => {
      toast.error('فشل في تحديث حالة الطلب')
    },
  })

  const orders = data || []

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'processing', label: 'قيد المعالجة' },
    { value: 'shipped', label: 'تم الشحن' },
    { value: 'delivered', label: 'تم التسليم' },
    { value: 'cancelled', label: 'ملغي' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الطلبات</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="لا توجد طلبات"
          description="ستظهر الطلبات الجديدة هنا بمجرد تقديمها من العملاء"
        />
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                    <Badge className={STATUS_COLORS[order.status] || 'bg-slate-100'}>
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.firstName} {order.lastName} · {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-500">{formatPrice(order.total)}</span>
                  {expandedId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t p-3 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">تغيير الحالة:</span>
                    <Select
                      value={order.status}
                      onValueChange={(v) => updateMutation.mutate({ id: order.id, status: v })}
                    >
                      <SelectTrigger className="w-40 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🛍️</span>
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">×{item.quantity}</span>
                        </div>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Currencies Tab ──────────────────────────────────────────────
function CurrenciesTab() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '',
    name: '',
    nameAr: '',
    symbol: '',
    exchangeRate: 1,
    isDefault: false,
    active: true,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: async () => {
      const res = await fetch('/api/admin/currencies')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        code: string
        name: string
        nameAr: string
        symbol: string
        exchangeRate: number
        isDefault: boolean
        active: boolean
        order: number
      }> | undefined
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/admin/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في إنشاء العملة')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      queryClient.invalidateQueries({ queryKey: ['site-currencies'] })
      setDialogOpen(false)
      resetForm()
      toast.success('تم إنشاء العملة')
    },
    onError: () => toast.error('فشل في إنشاء العملة'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await fetch(`/api/admin/currencies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('فشل في تحديث العملة')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      queryClient.invalidateQueries({ queryKey: ['site-currencies'] })
      toast.success('تم تحديث العملة')
    },
    onError: () => toast.error('فشل في تحديث العملة'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/currencies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف العملة')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      queryClient.invalidateQueries({ queryKey: ['site-currencies'] })
      toast.success('تم حذف العملة')
    },
    onError: () => toast.error('فشل في حذف العملة'),
  })

  const resetForm = () => {
    setForm({ code: '', name: '', nameAr: '', symbol: '', exchangeRate: 1, isDefault: false, active: true })
    setEditId(null)
  }

  const openEdit = (currency: NonNullable<typeof data>[number]) => {
    setForm({
      code: currency.code,
      name: currency.name,
      nameAr: currency.nameAr,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
      isDefault: currency.isDefault,
      active: currency.active,
    })
    setEditId(currency.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editId) {
      updateMutation.mutate({ id: editId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const currencies = data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-orange-500" />
          العملات
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 ml-1" /> عملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'تعديل العملة' : 'عملة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>رمز العملة</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} dir="ltr" placeholder="USD" />
                </div>
                <div>
                  <Label>الرمز</Label>
                  <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="$" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الاسم (إنجليزي)</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <Label>الاسم (عربي)</Label>
                  <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>سعر الصرف (مقابل 1 دولار أمريكي)</Label>
                <Input type="number" step="0.01" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: parseFloat(e.target.value) || 1 })} dir="ltr" />
                <p className="text-xs text-muted-foreground mt-1">1 USD = {form.exchangeRate} {form.code}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isDefault} onCheckedChange={(c) => setForm({ ...form, isDefault: c })} />
                  <Label>العملة الافتراضية</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
                  <Label>نشطة</Label>
                </div>
              </div>
              <LoadingButton
                onClick={handleSubmit}
                className="w-full bg-orange-500 hover:bg-orange-600"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editId ? 'تحديث' : 'إنشاء'}
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : currencies.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="لا توجد عملات"
          description="أضف عملات للسماح بالتسوق بعملات مختلفة"
        />
      ) : (
        <div className="space-y-2">
          {currencies.map((currency) => (
            <div
              key={currency.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${!currency.active ? 'opacity-60' : ''} ${currency.isDefault ? 'border-orange-300 bg-orange-50/50 dark:border-orange-500/30 dark:bg-orange-500/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currency.isDefault ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{currency.code}</span>
                    <span className="text-muted-foreground">({currency.symbol})</span>
                    {currency.isDefault && <Badge className="bg-orange-500 text-white text-xs">افتراضية</Badge>}
                    {!currency.active && <Badge variant="secondary" className="text-xs">معطلة</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{currency.nameAr}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-sm font-medium">سعر الصرف</p>
                  <p className="text-xs text-muted-foreground">1 USD = {currency.exchangeRate} {currency.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={currency.active}
                    onCheckedChange={(c) => updateMutation.mutate({ id: currency.id, data: { active: c } })}
                  />
                  {!currency.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-orange-500"
                      onClick={() => updateMutation.mutate({ id: currency.id, data: { isDefault: true } })}
                    >
                      تعيين كافتراضية
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(currency)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => deleteMutation.mutate(currency.id)}
                    disabled={deleteMutation.isPending || currency.isDefault}
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ──────────────────────────────────────────────
function SettingsTab() {
  const queryClient = useQueryClient()
  const { setCurrencies, setActiveCurrency, currencies } = useShopStore()

  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [displayCurrencyId, setDisplayCurrencyId] = useState('')
  const [manualRateEnabled, setManualRateEnabled] = useState(false)
  const [manualExchangeRate, setManualExchangeRate] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Load currencies for the dropdown
  const { data: currenciesData } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: async () => {
      const res = await fetch('/api/admin/currencies')
      const json = await res.json()
      return json.data?.items as Array<{
        id: string
        code: string
        name: string
        nameAr: string
        symbol: string
        exchangeRate: number
        isDefault: boolean
        active: boolean
      }> | undefined
    },
  })

  // Load current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings')
      const json = await res.json()
      return json.data?.items as Array<{ id: string; key: string; value: string }> | undefined
    },
  })

  // Initialize form from loaded data
  const allCurrencies = currenciesData || []
  const settings = settingsData || []

  if (!initialized && settings.length > 0) {
    const whatsapp = settings.find(s => s.key === 'whatsappNumber')
    const displayCurrency = settings.find(s => s.key === 'displayCurrencyId')
    const rateEnabled = settings.find(s => s.key === 'manualRateEnabled')
    const rateValue = settings.find(s => s.key === 'manualExchangeRate')
    setWhatsappNumber(whatsapp?.value || '')
    setDisplayCurrencyId(displayCurrency?.value || '')
    setManualRateEnabled(rateEnabled?.value === 'true')
    setManualExchangeRate(rateValue?.value || '')
    setInitialized(true)
  }

  // Also initialize when currencies loaded but no settings yet
  if (!initialized && allCurrencies.length > 0 && isLoading === false) {
    const defaultCurrency = allCurrencies.find(c => c.isDefault)
    if (!displayCurrencyId && defaultCurrency) {
      setDisplayCurrencyId(defaultCurrency.id)
    }
    setInitialized(true)
  }

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      setPasswordError('')

      if (!currentPassword) {
        setPasswordError('يجب إدخال كلمة المرور الحالية')
        throw new Error('يجب إدخال كلمة المرور الحالية')
      }
      if (!newPassword || newPassword.length < 4) {
        setPasswordError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل')
        throw new Error('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل')
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('كلمة المرور الجديدة غير متطابقة')
        throw new Error('كلمة المرور الجديدة غير متطابقة')
      }

      // Verify current password
      const verifyRes = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword }),
      })
      const verifyJson = await verifyRes.json()

      if (!verifyJson.data?.valid) {
        setPasswordError('كلمة المرور الحالية غير صحيحة')
        throw new Error('كلمة المرور الحالية غير صحيحة')
      }

      // Save new password
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'adminPassword', value: newPassword },
          ],
        }),
      })
      if (!res.ok) throw new Error('فشل في حفظ كلمة المرور')
      return res.json()
    },
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('تم تغيير كلمة المرور بنجاح')
    },
    onError: () => {
      if (!passwordError) {
        toast.error('فشل في تغيير كلمة المرور')
      }
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allSettings = [
        { key: 'whatsappNumber', value: whatsappNumber },
        { key: 'displayCurrencyId', value: displayCurrencyId },
        { key: 'manualRateEnabled', value: String(manualRateEnabled) },
        { key: 'manualExchangeRate', value: manualExchangeRate },
      ]
      // Only send settings that actually have a value — an empty value (e.g.
      // no currency selected yet, or exchange rate left blank while manual
      // rate is disabled) would otherwise fail server-side validation and
      // block saving the other settings in the same batch.
      const settings = allSettings.filter((s) => s.value !== '' && s.value !== null && s.value !== undefined)

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.error || 'فشل في حفظ الإعدادات')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
      queryClient.invalidateQueries({ queryKey: ['site-currencies'] })

      // Apply currency change immediately in the store
      if (displayCurrencyId) {
        setActiveCurrency(displayCurrencyId)
      }

      // Apply manual exchange rate settings in the store
      const state = useShopStore.getState()
      state.setManualRateEnabled(manualRateEnabled)
      state.setManualExchangeRate(parseFloat(manualExchangeRate) || 0)

      // Update WhatsApp number in store
      const { setWhatsappNumber: setStoreWhatsapp } = useShopStore.getState()
      setStoreWhatsapp(whatsappNumber)

      toast.success('تم حفظ الإعدادات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حفظ الإعدادات')
    },
  })

  const selectedCurrency = allCurrencies.find(c => c.id === displayCurrencyId)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Settings className="h-5 w-5 text-orange-500" />
        إعدادات المتجر
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* WhatsApp Settings */}
          <Card className="border-green-200 dark:border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                إعدادات واتساب
              </CardTitle>
              <p className="text-sm text-muted-foreground">عند إتمام الشراء، سيتم توجيه العميل لإرسال طلبه عبر واتساب إلى هذا الرقم</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <span>📱</span>
                  رقم واتساب لاستقبال الطلبات
                </Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  dir="ltr"
                  placeholder="+966501234567"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  أدخل الرقم بالصيغة الدولية مع رمز الدولة (مثال: +966501234567)
                </p>
              </div>
              {whatsappNumber && (
                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">معاينة الرابط:</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1 dir-ltr text-left" dir="ltr">
                    https://wa.me/{whatsappNumber.replace(/[^0-9]/g, '')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card className="border-orange-200 dark:border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-orange-500" />
                إعدادات العملة والصرف
              </CardTitle>
              <p className="text-sm text-muted-foreground">تحكم في عرض الأسعار وسعر الصرف للعملاء</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <span>💱</span>
                  عملة العرض
                </Label>
                <Select value={displayCurrencyId} onValueChange={setDisplayCurrencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCurrencies.filter(c => c.active).map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        {currency.symbol} {currency.code} - {currency.nameAr}
                        {currency.isDefault ? ' (افتراضية)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">تسعير بسعر صرف مخصص</Label>
                  <p className="text-xs text-muted-foreground mt-1">عند التفعيل، سيتم استخدام سعر الصرف الذي تحدده بدلاً من السعر التلقائي</p>
                </div>
                <Switch
                  checked={manualRateEnabled}
                  onCheckedChange={setManualRateEnabled}
                />
              </div>

              {manualRateEnabled && (
                <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20">
                  <div>
                    <Label className="flex items-center gap-2 mb-1">
                      <span>📊</span>
                      سعر الصرف المخصص
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={manualExchangeRate}
                      onChange={(e) => setManualExchangeRate(e.target.value)}
                      dir="ltr"
                      placeholder="مثال: 530"
                      className="text-left"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      أدخل عدد وحدات العملة المختارة مقابل 1 دولار أمريكي
                    </p>
                  </div>
                  {manualExchangeRate && selectedCurrency && (
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">1 دولار =</span>
                        <span className="font-bold text-orange-600">{manualExchangeRate} {selectedCurrency.code}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">مثال (منتج $29.99):</span>
                        <span className="font-bold text-orange-600">{selectedCurrency.symbol}{(29.99 * parseFloat(manualExchangeRate)).toFixed(2)}</span>
                      </div>
                      {selectedCurrency.exchangeRate !== parseFloat(manualExchangeRate) && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">السعر التلقائي:</span>
                          <span className="text-muted-foreground line-through">1 USD = {selectedCurrency.exchangeRate} {selectedCurrency.code}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!manualRateEnabled && selectedCurrency && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">العملة المختارة:</span>
                    <span className="font-bold">{selectedCurrency.symbol} {selectedCurrency.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">سعر الصرف (تلقائي):</span>
                    <span className="text-sm">1 USD = {selectedCurrency.exchangeRate} {selectedCurrency.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">مثال (منتج $29.99):</span>
                    <span className="font-bold text-orange-600">{selectedCurrency.symbol}{(29.99 * selectedCurrency.exchangeRate).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                يمكنك إضافة عملات جديدة من تبويب &quot;العملات&quot; في القائمة الجانبية
              </p>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-red-200 dark:border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                تغيير كلمة المرور
              </CardTitle>
              <p className="text-sm text-muted-foreground">غيّر كلمة مرور لوحة التحكم لزيادة الأمان</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <span>🔑</span>
                  كلمة المرور الحالية
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="pl-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <span>🆕</span>
                  كلمة المرور الجديدة
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                    placeholder="أدخل كلمة المرور الجديدة (4 أحرف على الأقل)"
                    className="pl-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <span>✅</span>
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
              </div>
              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                </div>
              )}
              <LoadingButton
                onClick={() => changePasswordMutation.mutate()}
                className="bg-red-500 hover:bg-red-600 text-white"
                isLoading={changePasswordMutation.isPending}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                <Lock className="h-4 w-4 ml-1" />
                تغيير كلمة المرور
              </LoadingButton>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <LoadingButton
              onClick={() => saveMutation.mutate()}
              className="bg-orange-500 hover:bg-orange-600"
              isLoading={saveMutation.isPending}
            >
              <Save className="h-4 w-4 ml-1" />
              حفظ الإعدادات
            </LoadingButton>
            {saveMutation.isPending && (
              <span className="text-sm text-muted-foreground">جاري الحفظ...</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Reviews Tab ──────────────────────────────────────────────
function ReviewsTab() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews?limit=50')
      const json = await res.json()
      return json.data as {
        reviews: Array<{
          id: string
          productId: string
          userName: string
          rating: number
          comment: string
          verified: boolean
          createdAt: string
          product: {
            id: string
            nameAr: string
            image: string
          }
        }>
        total: number
        page: number
        totalPages: number
      } | undefined
    },
  })

  const toggleVerifiedMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      if (!res.ok) throw new Error('فشل في تحديث التقييم')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('تم تحديث حالة التوثيق')
    },
    onError: () => {
      toast.error('فشل في تحديث حالة التوثيق')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في حذف التقييم')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('تم حذف التقييم')
    },
    onError: () => {
      toast.error('فشل في حذف التقييم')
    },
  })

  const reviews = data?.reviews || []

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-orange-500" />
        التقييمات
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="لا توجد تقييمات"
          description="ستظهر تقييمات العملاء هنا بمجرد إرسالها"
        />
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                          <ThumbsUp className="h-3 w-3 ml-0.5" />
                          موثّق
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex" dir="ltr">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 text-xs ${review.verified ? 'text-green-600' : 'text-muted-foreground'}`}
                    onClick={() => toggleVerifiedMutation.mutate({ id: review.id, verified: !review.verified })}
                    disabled={toggleVerifiedMutation.isPending}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 ml-1" />
                    {review.verified ? 'إلغاء التوثيق' : 'توثيق'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => deleteMutation.mutate(review.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {review.comment && (
                <p className="text-sm text-muted-foreground leading-6">{review.comment}</p>
              )}

              <div className="flex items-center gap-2 pt-1 border-t">
                <span className="text-xs text-muted-foreground">المنتج:</span>
                <span className="text-xs font-medium">{review.product.nameAr}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Dashboard ──────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: 'dashboard' as const, label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'settings' as const, label: 'الإعدادات', icon: Settings },
  { id: 'offers' as const, label: 'العروض', icon: Tag },
  { id: 'texts' as const, label: 'النصوص', icon: Type },
  { id: 'ads' as const, label: 'الإعلانات', icon: Megaphone },
  { id: 'categories' as const, label: 'التصنيفات', icon: Layers },
  { id: 'currencies' as const, label: 'العملات', icon: Coins },
  { id: 'products' as const, label: 'المنتجات', icon: Package },
  { id: 'orders' as const, label: 'الطلبات', icon: ClipboardList },
  { id: 'reviews' as const, label: 'التقييمات', icon: MessageCircle },
]

export function AdminDashboard() {
  const { isAdminAuth, adminTab, setAdminTab, logoutAdmin, setView, formatPrice } = useShopStore()

  if (!isAdminAuth) {
    return <AdminLogin />
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/verify-password', { method: 'DELETE' })
    } catch {}
    logoutAdmin()
    window.history.pushState({}, '', '/')
  }

  const renderTab = () => {
    switch (adminTab) {
      case 'dashboard':
        return <DashboardTab />
      case 'settings':
        return <SettingsTab />
      case 'offers':
        return <OffersTab />
      case 'texts':
        return <TextsTab />
      case 'ads':
        return <AdsTab />
      case 'categories':
        return <CategoriesTab />
      case 'currencies':
        return <CurrenciesTab />
      case 'products':
        return <ProductsTab />
      case 'orders':
        return <OrdersTab />
      case 'reviews':
        return <ReviewsTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-orange-500">متجر</span>
              <span className="text-lg font-bold">Z</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium">لوحة التحكم</span>
            <Badge variant="secondary">مسؤول</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView('home')}>
              <Store className="h-4 w-4 ml-1" />
              المتجر
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-56 shrink-0 border-l min-h-[calc(100vh-3.5rem)] p-4">
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  adminTab === item.id
                    ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 font-medium'
                    : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <Separator className="my-4" />
          <Button
            variant="ghost"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {renderTab()}
        </main>
      </div>

      {/* Bottom Tabs - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t z-50">
        <div className="flex overflow-x-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-2 text-[10px] transition-colors ${
                adminTab === item.id
                  ? 'text-orange-500'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
