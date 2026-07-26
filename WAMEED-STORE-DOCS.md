# 🏪 متجر وميض ستور - التوثيق الشامل

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [البنية المعمارية](#2-البنية-المعمارية)
3. [التقنيات المستخدمة](#3-التقنيات-المستخدمة)
4. [مخطط قاعدة البيانات](#4-مخطط-قاعدة-البيانات)
5. [هيكل المجلدات](#5-هيكل-المجلدات)
6. [واجهات برمجة التطبيقات (API)](#6-واجهات-برمجة-التطبيقات)
7. [إدارة الحالة (Zustand Store)](#7-إدارة-الحالة)
8. [المكونات الرئيسية](#8-المكونات-الرئيسية)
9. [نظام المصادقة والإدارة](#9-نظام-المصادقة-والإدارة)
10. [نظام العملات والأسعار](#10-نظام-العملات-والأسعار)
11. [نظام التحقق من البيانات](#11-نظام-التحقق-من-البيانات)
12. [النشر على Vercel](#12-النشر-على-vercel)

---

## 1. نظرة عامة على المشروع

**وميض ستور** (Wameed Store) هو متجر إلكتروني عربي شامل مبني بتقنيات حديثة. يتميز بـ:

- 🛒 واجهة تسوق متكاملة (تصفح، بحث، فلترة، ترتيب)
- 🛍️ سلة مشتريات وإتمام الشراء عبر واتساب
- 💱 نظام عملات متعدد مع أسعار صرف ديناميكية
- 🔐 لوحة تحكم إدارية محمية بكلمة مرور
- 📱 تصميم متجاوب (موبايل أولاً)
- 🌙 دعم الوضع الداكن/الفاتح
- ✨ حركات انتقالية سلسة (Framer Motion)
- 🔍 تحسين محركات البحث (SEO)

---

## 2. البنية المعمارية

```
┌─────────────────────────────────────────────────┐
│                   المستخدم                       │
│              (المتصفح - Client)                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              Next.js 16 (App Router)             │
│  ┌───────────────────────────────────────────┐  │
│  │         الصفحة الرئيسية (page.tsx)         │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐   │  │
│  │  │ Header  │ │ Product │ │  Footer  │   │  │
│  │  │ Cart    │ │ Grid    │ │ Admin    │   │  │
│  │  │ Search  │ │ Detail  │ │ Dashboard│   │  │
│  │  └─────────┘ └─────────┘ └──────────┘   │  │
│  └───────────────────────────────────────────┘  │
│                     │                            │
│  ┌──────────────────▼─────────────────────────┐ │
│  │           API Routes (Backend)              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │ /api/    │ │ /api/    │ │ /api/     │  │ │
│  │  │ products │ │ orders   │ │ admin/*   │  │ │
│  │  │ categories│ │ cart    │ │ site/*    │  │ │
│  │  └──────────┘ └──────────┘ └───────────┘  │ │
│  └──────────────────┬─────────────────────────┘ │
│                     │                            │
│  ┌──────────────────▼─────────────────────────┐ │
│  │          Prisma ORM (db.ts)                 │ │
│  └──────────────────┬─────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   SQLite DB   │
              │  (Prisma)     │
              └───────────────┘
```

### نمط التطبيق: SPA (Single Page Application)

المتجر يعمل كتطبيق صفحة واحدة حيث يتم التنقل بين الأقسام بدون إعادة تحميل الصفحة:

```
الرئيسية ←→ المنتجات ←→ تفاصيل المنتج ←→ إتمام الشراء ←→ تأكيد الطلب
    ↕                                                      ↕
  المفضلة                                             سجل الطلبات
    ↕
  لوحة الإدارة
```

---

## 3. التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **Next.js** | 16.1.3 | إطار العمل الأساسي (App Router) |
| **React** | 19.0.0 | مكتبة واجهة المستخدم |
| **TypeScript** | 5.x | لغة البرمجة |
| **Tailwind CSS** | 4.x | التنسيق والتصميم |
| **shadcn/ui** | New York | مكونات واجهة المستخدم |
| **Prisma** | 6.x | ORM لقاعدة البيانات |
| **SQLite** | - | قاعدة البيانات |
| **Zustand** | 5.x | إدارة الحالة |
| **TanStack Query** | 5.x | إدارة بيانات الخادم |
| **Framer Motion** | 12.x | الحركات والانتقالات |
| **Zod** | 4.x | التحقق من البيانات |
| **next-themes** | 0.4.6 | الوضع الداكن/الفاتح |
| **Sonner** | 2.x | إشعارات Toast |
| **Lucide React** | 0.525 | الأيقونات |
| **Sharp** | 0.34 | معالجة الصور |

---

## 4. مخطط قاعدة البيانات

### مخطط العلاقات (ER Diagram)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Category   │──1:N──│     Product      │──1:N──│   CartItem   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id           │       │ id               │       │ id           │
│ name         │       │ name / nameAr    │       │ cartId  ─────│──┐
│ nameAr       │       │ description/Ar   │       │ productId ───│──│──Product
│ slug (unique)│       │ price            │       │ quantity     │  │
│ icon         │       │ originalPrice    │       └──────────────┘  │
│ image        │       │ image / images   │                          │
│ description  │       │ brand / brandAr  │       ┌──────────────┐  │
│ order        │       │ tags / tagsAr    │       │     Cart     │  │
└──────────────┘       │ rating           │       ├──────────────┤  │
                       │ stock            │       │ id           │  │
                       │ featured         │       │ sessionId    │  │
                       │ categoryId ──────│       │ items ───────│──┘
                       └──────────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────────┐
│    Order     │──1:N──│    OrderItem     │
├──────────────┤       ├──────────────────┤
│ id           │       │ id               │
│ email        │       │ orderId ─────────│──Order
│ firstName    │       │ productId        │
│ lastName     │       │ name             │
│ address      │       │ image            │
│ city         │       │ price            │
│ phone        │       │ quantity         │
│ paymentMethod│       └──────────────────┘
│ subtotal     │
│ tax          │       ┌──────────────────┐
│ shipping     │       │      Offer       │
│ total        │       ├──────────────────┤
│ status       │       │ id               │
└──────────────┘       │ title / titleAr  │
                       │ description/Ar   │
┌──────────────┐       │ image            │
│Advertisement │       │ discountPercent  │
├──────────────┤       │ badge / badgeAr  │
│ id           │       │ gradient         │
│ title/titleAr│       │ ctaText / ctaAr  │
│ description  │       │ active           │
│ image        │       │ startDate        │
│ link         │       │ endDate          │
│ position     │       └──────────────────┘
│ active       │
│ startDate    │       ┌──────────────────┐
│ endDate      │       │    SiteText      │
└──────────────┘       ├──────────────────┤
                       │ id               │
┌──────────────┐       │ key (unique)     │
│   Currency   │       │ value / valueAr  │
├──────────────┤       │ group            │
│ id           │       └──────────────────┘
│ code (unique)│
│ name / nameAr│       ┌──────────────────┐
│ symbol       │       │  StoreSetting    │
│ exchangeRate │       ├──────────────────┤
│ isDefault    │       │ id               │
│ active       │       │ key (unique)     │
│ order        │       │ value            │
└──────────────┘       └──────────────────┘
```

### جدول تفصيلي للنماذج

| النموذج | الحقول | العلاقات | الوصف |
|---------|--------|----------|-------|
| **Category** | 9 | 1:N → Product | تصنيفات المنتجات |
| **Product** | 17 | N:1 → Category, 1:N → CartItem/OrderItem | المنتجات |
| **Cart** | 4 | 1:N → CartItem | سلة التسوق (بالجلسة) |
| **CartItem** | 6 | N:1 → Cart, N:1 → Product | عناصر السلة |
| **Order** | 15 | 1:N → OrderItem | الطلبات |
| **OrderItem** | 7 | N:1 → Order, N:1 → Product | عناصر الطلب |
| **Offer** | 16 | - | العروض الترويجية |
| **SiteText** | 6 | - | نصوص الموقع (ثنائي اللغة) |
| **Advertisement** | 12 | - | الإعلانات |
| **Currency** | 10 | - | العملات وأسعار الصرف |
| **StoreSetting** | 4 | - | إعدادات المتجر (مفتاح-قيمة) |

---

## 5. هيكل المجلدات

```
wameed-store/
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   ├── seed.ts                # بيانات أولية
│   └── seed-footer.ts         # بيانات التذييل
├── public/
│   ├── logo.png               # شعار المتجر
│   ├── logo.svg               # شعار SVG
│   ├── images/products/       # صور المنتجات (30+ صورة)
│   ├── uploads/               # الصور المرفوعة
│   └── robots.txt             # ملف الروبوتات
├── src/
│   ├── app/
│   │   ├── layout.tsx         # التخطيط الرئيسي (RTL + خطوط + SEO)
│   │   ├── page.tsx           # الصفحة الرئيسية (SPA Router)
│   │   ├── globals.css        # أنماط Tailwind + متغيرات الألوان
│   │   ├── error.tsx          # صفحة الخطأ
│   │   ├── not-found.tsx      # صفحة 404
│   │   ├── sitemap.ts         # خريطة الموقع
│   │   └── api/               # واجهات برمجة التطبيقات
│   │       ├── route.ts       # نقطة البداية
│   │       ├── categories/    # API التصنيفات
│   │       ├── products/      # API المنتجات
│   │       ├── cart/          # API السلة
│   │       ├── orders/        # API الطلبات
│   │       ├── site/          # API الموقع العام
│   │       │   ├── settings/  # الإعدادات العامة
│   │       │   ├── ads/       # الإعلانات العامة
│   │       │   ├── offers/    # العروض العامة
│   │       │   ├── currencies/# العملات العامة
│   │       │   └── texts/     # النصوص العامة
│   │       └── admin/         # API الإدارة (محمية)
│   │           ├── verify-password/  # التحقق من كلمة المرور
│   │           ├── products/  # إدارة المنتجات
│   │           ├── categories/# إدارة التصنيفات
│   │           ├── orders/    # إدارة الطلبات
│   │           ├── offers/    # إدارة العروض
│   │           ├── ads/       # إدارة الإعلانات
│   │           ├── texts/     # إدارة النصوص
│   │           ├── currencies/# إدارة العملات
│   │           ├── settings/  # إدارة الإعدادات
│   │           └── stats/     # إحصائيات لوحة التحكم
│   ├── components/
│   │   ├── ui/                # مكونات shadcn/ui (40+ مكون)
│   │   ├── header.tsx         # رأس الصفحة + البحث + السلة
│   │   ├── footer.tsx         # التذييل
│   │   ├── hero-banner.tsx    # بانر العروض المتحرك
│   │   ├── category-bar.tsx   # شريط التصنيفات
│   │   ├── product-card.tsx   # بطاقة المنتج
│   │   ├── product-grid.tsx   # شبكة المنتجات + بحث + فلترة
│   │   ├── product-detail.tsx # تفاصيل المنتج
│   │   ├── product-quick-view.tsx # عرض سريع للمنتج
│   │   ├── cart-drawer.tsx    # درج سلة التسوق
│   │   ├── checkout-form.tsx  # نموذج إتمام الشراء
│   │   ├── order-success.tsx  # تأكيد الطلب
│   │   ├── order-history.tsx  # سجل الطلبات
│   │   ├── wishlist-section.tsx # قسم المفضلة
│   │   ├── admin-dashboard.tsx # لوحة التحكم الإدارية
│   │   ├── announcement-bar.tsx # شريط الإعلانات المتحرك
│   │   ├── breadcrumbs.tsx    # مسار التنقل
│   │   ├── deal-timer.tsx     # عداد التنازلي
│   │   ├── featured-products.tsx # المنتجات المميزة
│   │   ├── recently-viewed.tsx # المنتجات المشاهدة مؤخراً
│   │   ├── welcome-splash.tsx  # شاشة الترحيب
│   │   └── image-upload.tsx   # رفع الصور
│   ├── lib/
│   │   ├── db.ts              # اتصال Prisma
│   │   ├── store.ts           # Zustand Store (إدارة الحالة)
│   │   ├── utils.ts           # أدوات مساعدة
│   │   ├── admin-auth.ts      # نظام المصادقة الإداري
│   │   ├── validation.ts      # مخططات Zod للتحقق
│   │   └── constants.ts       # الثوابت
│   └── hooks/
│       ├── use-mobile.ts      # كشف الموبايل
│       └── use-toast.ts       # إشعارات Toast
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
└── components.json
```

---

## 6. واجهات برمجة التطبيقات (API)

### واجهات عامة (بدون مصادقة)

#### المنتجات
| الطريقة | المسار | الوصف | المعاملات |
|---------|--------|-------|-----------|
| GET | `/api/products` | قائمة المنتجات | `search`, `category`, `sort`, `page`, `limit`, `featured`, `ids` |
| GET | `/api/products/[id]` | تفاصيل منتج | - |

#### التصنيفات
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/categories` | قائمة التصنيفات مع عدد المنتجات |

#### السلة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/cart?sessionId=xxx` | محتويات السلة |
| POST | `/api/cart` | إنشاء سلة |
| POST | `/api/cart/items` | إضافة عنصر |
| PATCH | `/api/cart/items` | تحديث الكمية |
| DELETE | `/api/cart/items` | حذف عنصر |

#### الطلبات
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/orders?email=xxx` | طلبات البريد |
| POST | `/api/orders` | إنشاء طلب |

#### بيانات الموقع
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/api/site/settings` | الإعدادات العامة |
| GET | `/api/site/ads?position=xxx` | الإعلانات النشطة |
| GET | `/api/site/offers` | العروض النشطة |
| GET | `/api/site/currencies` | العملات النشطة |
| GET | `/api/site/texts?group=xxx` | نصوص الموقع |

### واجهات الإدارة (محمية بكلمة مرور)

جميع واجهات الإدارة تتطلب كوكي جلسة صالح (HttpOnly + Secure).

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | `/api/admin/verify-password` | تسجيل دخول المدير |
| DELETE | `/api/admin/verify-password` | تسجيل خروج |
| GET/POST | `/api/admin/products` | إدارة المنتجات |
| PATCH/DELETE | `/api/admin/products` | تحديث/حذف منتج |
| GET/POST | `/api/admin/categories` | إدارة التصنيفات |
| PATCH/DELETE | `/api/admin/categories/[id]` | تحديث/حذف تصنيف |
| GET/PATCH | `/api/admin/orders` | إدارة الطلبات |
| GET/POST | `/api/admin/offers` | إدارة العروض |
| PATCH/DELETE | `/api/admin/offers/[id]` | تحديث/حذف عرض |
| GET/POST | `/api/admin/ads` | إدارة الإعلانات |
| PATCH/DELETE | `/api/admin/ads/[id]` | تحديث/حذف إعلان |
| GET/POST | `/api/admin/texts` | إدارة النصوص |
| PATCH/DELETE | `/api/admin/texts/[id]` | تحديث/حذف نص |
| GET/POST | `/api/admin/currencies` | إدارة العملات |
| PATCH/DELETE | `/api/admin/currencies/[id]` | تحديث/حذف عملة |
| GET/POST | `/api/admin/settings` | إدارة الإعدادات |
| GET | `/api/admin/stats` | إحصائيات لوحة التحكم |

---

## 7. إدارة الحالة (Zustand Store)

### الحالات الرئيسية

```typescript
// العرض الحالي (SPA Navigation)
view: 'home' | 'product' | 'checkout' | 'order-success' | 'orders' | 'wishlist' | 'admin'

// المنتج المحدد
selectedProductId: string | null

// البحث والفلترة
searchQuery: string
selectedCategory: string | null
sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating'
page: number

// السلة
cartOpen: boolean
cartItems: CartItem[]

// المفضلة
wishlist: string[]

// المشاهدات الأخيرة
recentlyViewed: string[]

// العملات
currencies: CurrencyInfo[]
activeCurrencyId: string | null
manualRateEnabled: boolean
manualExchangeRate: number

// الإدارة
adminTab: AdminTab
isAdminAuth: boolean
```

### البيانات المحفوظة (localStorage)

```typescript
partialize: (state) => ({
  cartItems,           // عناصر السلة
  wishlist,           // المفضلة
  recentlyViewed,     // المشاهدات الأخيرة
  activeCurrencyId,   // العملة المختارة
  whatsappNumber,     // رقم واتساب
})
```

---

## 8. المكونات الرئيسية

### 8.1 رأس الصفحة (Header)
- 🔍 شريط بحث مع اقتراحات تلقائية
- 💰 محدد العملة
- 🌙 تبديل الوضع الداكن/الفاتح
- 🛒 زر السلة مع عداد
- ❤️ زر المفضلة
- 📦 زر سجل الطلبات

### 8.2 بانر العروض (HeroBanner)
- عرض شرائح تلقائي (5 ثواني)
- أزرار تنقل يمين/يسار
- نقاط دليلية
- شريط تقدم
- 4 شرائح افتراضية + عروض من قاعدة البيانات

### 8.3 شبكة المنتجات (ProductGrid)
- بحث نصي
- فلترة حسب التصنيف
- ترتيب (الأحدث، السعر، التقييم)
- تصفح الصفحات
- شبكة متجاوبة (2-4 أعمدة)

### 8.4 بطاقة المنتج (ProductCard)
- صورة مع معالجة خطأ
- شارة الخصم
- زر المفضلة
- زر العرض السريع
- تقييم بالنجوم
- السعر الأصلي مشطوب
- مؤشر المخزون المنخفض
- زر إضافة للسلة

### 8.5 لوحة التحكم الإدارية (AdminDashboard)
- **لوحة المعلومات**: إحصائيات (منتجات، طلبات، إيرادات، عروض)
- **العروض**: إنشاء/تعديل/حذف عروض ترويجية
- **النصوص**: إدارة نصوص الموقع + إعدادات التذييل
- **الإعلانات**: إدارة إعلانات البانر
- **التصنيفات**: إنشاء/تعديل/حذف تصنيفات
- **المنتجات**: إدارة شاملة (إضافة/تعديل/حذف/بحث)
- **الطلبات**: عرض الطلبات وتغيير حالتها
- **العملات**: إدارة العملات وأسعار الصرف
- **الإعدادات**: رقم واتساب، العملة الافتراضية، سعر صرف يدوي، تغيير كلمة المرور

---

## 9. نظام المصادقة والإدارة

### آلية المصادقة

```
┌────────────┐     POST /api/admin/verify-password     ┌──────────────┐
│  المستخدم   │ ──────────────────────────────────────→ │    الخادم     │
│  (كلمة مرور)│                                        │              │
└────────────┘                                        │  1. فحص Rate │
                                                      │     Limit    │
                                                      │  2. مقارنة   │
                                                      │     كلمة     │
                                                      │     المرور   │
                                                      │  3. إنشاء    │
                                                      │     Token    │
                                                      │  4. Set      │
                                                      │     Cookie   │
                                                      └──────┬───────┘
                                                             │
                                                      ┌──────▼───────┐
                                                      │  HttpOnly    │
                                                      │  Secure      │
                                                      │  SameSite    │
                                                      │  Cookie      │
                                                      │  (7 أيام)    │
                                                      └──────────────┘
```

### الحماية المطبقة

1. **Rate Limiting**: 5 محاولات كل 15 دقيقة
2. **تشفير كلمة المرور**: scrypt (مشتق مشفر)
3. **رمز الجلسة**: HMAC-SHA256
4. **كوكي آمن**: HttpOnly + Secure + SameSite=Strict
5. **ترقية تلقائية**: تحويل كلمات المرور النصية إلى مشفرة
6. **مقارنة زمنية ثابتة**: timingSafeEqual لمنع هجمات التوقيت

---

## 10. نظام العملات والأسعار

### مخطط تحويل الأسعار

```
السعر الأساسي (USD) ←─── قاعدة البيانات
        │
        ▼
┌───────────────────┐
│ هل يوجد سعر يدوي؟ │
└───────┬───────────┘
    نعم │         │ لا
        ▼         ▼
┌──────────┐ ┌──────────────┐
│ سعر يدوي │ │ سعر الصرف   │
│ manualRate│ │ التلقائي     │
└────┬─────┘ │ exchangeRate │
     │       └──────┬───────┘
     ▼              ▼
   السعر × المعدل = السعر المحول
        │
        ▼
┌───────────────────┐
│ تنسيق العرض       │
│ - معدل ≥ 100:     │
│   أرقام صحيحة    │
│   (مثال: ١٬٢٣٤)  │
│ - معدل < 100:     │
│   عشريين         │
│   (مثال: 45.67)  │
└───────────────────┘
```

---

## 11. نظام التحقق من البيانات

### مخططات Zod

| المخطط | الحقول المطلوبة | الاستخدام |
|--------|-----------------|-----------|
| `loginSchema` | password | تسجيل دخول المدير |
| `productSchema` | name, nameAr, description, descriptionAr, price, image, stock, categoryId | إضافة/تعديل منتج |
| `categorySchema` | name, nameAr, slug, icon | إضافة تصنيف |
| `offerSchema` | title, titleAr, description, descriptionAr | إضافة عرض |
| `orderSchema` | email, firstName, lastName, address, city, phone, items | إنشاء طلب |
| `settingsSchema` | key (enum), value | حفظ إعدادات |
| `currencySchema` | code, name, nameAr, symbol, exchangeRate | إضافة عملة |
| `adSchema` | title, titleAr | إضافة إعلان |
| `textSchema` | key, value, valueAr | إضافة نص |

### رسائل الخطأ العربية

جميع رسائل التحقق باللغة العربية مع نظام fallback ذكي:
- إذا كانت الرسالة تحتوي أحرف عربية ← تُستخدم مباشرة
- غير ذلك ← توليد رسالة عربية حسب نوع الخطأ (invalid_type, too_small, too_big, invalid_format)

---

## 12. النشر على Vercel

### متغيرات البيئة المطلوبة

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `DATABASE_URL` | `file:./dev.db` | رابط قاعدة البيانات |
| `ADMIN_PASSWORD` | `Wameed@2024!Secure` | كلمة مرور المدير |
| `ADMIN_SESSION_SECRET` | (سلسلة عشوائية) | مفتاق تشفير الجلسة |

### ملف vercel.json

```json
{
  "installCommand": "npm install",
  "buildCommand": "npx prisma generate && next build",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### خطوات النشر

1. رفع الكود إلى GitHub
2. ربط المستودع بـ Vercel
3. إضافة متغيرات البيئة
4. النشر التلقائي

---

## 📊 إحصائيات المشروع

| المقياس | القيمة |
|---------|--------|
| ملفات المصدر | 60+ |
| مكونات واجهة المستخدم | 40+ shadcn/ui |
| مكونات الأعمال | 21 |
| نقاط API | 30+ |
| نماذج قاعدة البيانات | 11 |
| خطوط الكود | ~15,000+ |

---

*تم إنشاء هذا التوثيق لمتجر وميض ستور - 2025*
