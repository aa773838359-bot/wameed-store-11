import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword, isRateLimited, verifyAdminAuth } from '@/lib/admin-auth'
import { validateData, settingsSchema, type SettingsInput } from '@/lib/validation'
import type { NextRequest } from 'next/server'

// Allowed setting keys (prevent arbitrary key injection)
const ALLOWED_SETTING_KEYS = [
  'whatsappNumber',
  'displayCurrencyId',
  'manualRateEnabled',
  'manualExchangeRate',
  'adminPassword',
  'stripePublicKey',
  'stripeSecretKey',
]

// GET /api/admin/settings
export async function GET() {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const settings = await db.storeSetting.findMany()
    // Exclude sensitive settings like adminPassword from the list
    const safeSettings = settings.filter(s => s.key !== 'adminPassword')
    return NextResponse.json({ data: { items: safeSettings } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST /api/admin/settings - Upsert multiple settings at once
export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminAuth()
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول أولاً' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { settings }: { settings: Array<{ key: string; value: string }> } = body

    // Validate settings array with Zod
    const validation = validateData(settingsSchema, settings)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const validatedSettings = validation.data as SettingsInput

    // Filter to only allowed keys (redundant with Zod enum, but kept as safety net)
    const filteredSettings = validatedSettings.filter(s => ALLOWED_SETTING_KEYS.includes(s.key))

    if (filteredSettings.length === 0) {
      return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
    }

    // Hash the admin password before saving
    const processedSettings = await Promise.all(
      filteredSettings.map(async (s) => {
        if (s.key === 'adminPassword') {
          // Validate minimum password length
          if (!s.value || s.value.length < 4) {
            throw new Error('كلمة المرور يجب أن تكون 4 أحرف على الأقل')
          }
          // Hash the password before storing
          return { key: s.key, value: hashPassword(s.value) }
        }
        return s
      })
    )

    const results = await Promise.all(
      processedSettings.map((s) =>
        db.storeSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        })
      )
    )

    return NextResponse.json({ data: { items: results } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
