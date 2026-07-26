import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 تهيئة متجر وميض ستور...')

  // إنشاء التصنيفات الافتراضية
  const categories = [
    { name: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', icon: '💻', order: 1 },
    { name: 'Fashion', nameAr: 'أزياء', slug: 'fashion', icon: '👕', order: 2 },
    { name: 'Home', nameAr: 'المنزل', slug: 'home', icon: '🏠', order: 3 },
    { name: 'Beauty', nameAr: 'الجمال', slug: 'beauty', icon: '💄', order: 4 },
    { name: 'Sports', nameAr: 'رياضة', slug: 'sports', icon: '⚽', order: 5 },
    { name: 'Books', nameAr: 'كتب', slug: 'books', icon: '📚', order: 6 },
  ]

  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log(`✅ تم إنشاء ${categories.length} تصنيفات`)

  // إنشاء العملات الافتراضية
  const currencies = [
    { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', exchangeRate: 1, isDefault: true, order: 1 },
    { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: '﷼', exchangeRate: 3.75, isDefault: false, order: 2 },
    { code: 'YER', name: 'Yemeni Rial', nameAr: 'ريال يمني', symbol: '﷼', exchangeRate: 530, isDefault: false, order: 3 },
  ]

  for (const cur of currencies) {
    await db.currency.upsert({
      where: { code: cur.code },
      update: {},
      create: cur,
    })
  }
  console.log(`✅ تم إنشاء ${currencies.length} عملات`)

  // إنشاء إعدادات المتجر
  const settings = [
    { key: 'storeName', value: 'وميض ستور' },
    { key: 'storeNameEn', value: 'Wameed Store' },
    { key: 'storeLogo', value: '/logo.png' },
    { key: 'storeDescription', value: 'متجرك الإلكتروني الشامل - اكتشف أفضل المنتجات بأسعار مazingلة مع توصيل سريع وضمان الجودة' },
    { key: 'whatsappNumber', value: '+966500000000' },
    { key: 'manualRateEnabled', value: 'false' },
    { key: 'manualExchangeRate', value: '0' },
  ]

  for (const s of settings) {
    await db.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log(`✅ تم إنشاء ${settings.length} إعدادات`)

  // إنشاء العروض الافتراضية
  const offers = [
    { title: 'Electronics Sale', titleAr: 'تخفيضات الإلكترونيات', description: 'Up to 30% off', descriptionAr: 'خصم يصل إلى 30% على الإلكترونيات!', gradient: 'from-red-500 to-orange-600', badgeAr: 'ساخن', discountPercent: 30, ctaTextAr: 'تسوق الإلكترونيات', order: 1 },
    { title: 'Fashion Week', titleAr: 'عروض الموضة', description: 'Up to 40% off', descriptionAr: 'وصولات جديدة بخصومات حصرية تصل إلى 40%!', gradient: 'from-purple-500 to-pink-600', badgeAr: 'جديد', discountPercent: 40, ctaTextAr: 'استكشف الموضة', order: 2 },
    { title: 'Home Sale', titleAr: 'عروض المنزل', description: 'Up to 25% off', descriptionAr: 'حوّل منزلك بتوفير يصل إلى 25%!', gradient: 'from-emerald-500 to-teal-600', badgeAr: 'صفقة', discountPercent: 25, ctaTextAr: 'تسوق المنزل', order: 3 },
  ]

  for (const offer of offers) {
    await db.offer.upsert({
      where: { id: offer.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: offer.title.toLowerCase().replace(/\s+/g, '-'), ...offer },
    })
  }
  console.log(`✅ تم إنشاء ${offers.length} عروض`)

  console.log('\n🎉 تمت تهيئة المتجر بنجاح!')
  console.log('📋 كلمة مرور المدير: Wameed@2024!Secure')
  console.log('🔗 دخول لوحة التحكم: https://your-domain.com/?admin=Wameed@2024!Secure')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في التهيئة:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
