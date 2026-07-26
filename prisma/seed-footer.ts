import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const footerTexts = [
    { key: 'footer.phone', value: '+966 50 000 0000', valueAr: '+966 50 000 0000', group: 'footer' },
    { key: 'footer.address', value: 'Riyadh, Saudi Arabia', valueAr: 'الرياض، المملكة العربية السعودية', group: 'footer' },
    { key: 'footer.website', value: 'www.zshop.sa', valueAr: 'www.zshop.sa', group: 'footer' },
    { key: 'footer.about', value: 'Your comprehensive online store. Discover the best products at amazing prices with fast delivery and quality guarantee.', valueAr: 'متجرك الإلكتروني الشامل. اكتشف أفضل المنتجات بأسعار مذهلة مع توصيل سريع وضمان الجودة.', group: 'footer' },
    { key: 'footer.email', value: 'info@zshop.sa', valueAr: 'info@zshop.sa', group: 'footer' },
  ]

  for (const text of footerTexts) {
    await prisma.siteText.upsert({
      where: { key: text.key },
      update: { value: text.value, valueAr: text.valueAr, group: text.group },
      create: text,
    })
  }

  console.log('Footer texts seeded successfully')
}

main().catch(console.error).finally(() => prisma.$disconnect())
