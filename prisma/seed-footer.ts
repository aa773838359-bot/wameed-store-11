import { PrismaClient } from '@prisma/client'
import { footerTextsData } from './footer-texts-data'
const prisma = new PrismaClient()

async function main() {
  const footerTexts = footerTextsData

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
