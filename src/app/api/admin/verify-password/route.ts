import { adminLogin, setAdminCookie, getClearAdminCookie, isRateLimited } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'

// Helper to extract client IP from request
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

// POST /api/admin/verify-password - Verify admin password and create session
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request)
    const rateCheck = isRateLimited(clientIp)

    if (rateCheck.limited) {
      const remainingMin = Math.ceil(rateCheck.remainingMs / 60000)
      return NextResponse.json(
        {
          data: { valid: false },
          error: `تم تجاوز عدد المحاولات المسموحة. حاول مرة أخرى بعد ${remainingMin} دقيقة`
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ data: { valid: false } })
    }

    const result = await adminLogin(password, clientIp)

    if (result.success && result.token) {
      const response = NextResponse.json({ data: { valid: true } })
      response.headers.set('Set-Cookie', setAdminCookie(result.token))
      return response
    }

    // Clear cookie on failed attempt
    const response = NextResponse.json({
      data: { valid: false },
      error: 'كلمة المرور غير صحيحة'
    })
    response.headers.set('Set-Cookie', getClearAdminCookie())
    return response
  } catch (error) {
    return NextResponse.json({ data: { valid: false } }, { status: 500 })
  }
}

// DELETE /api/admin/verify-password - Logout (clear session)
export async function DELETE() {
  const response = NextResponse.json({ data: { loggedOut: true } })
  response.headers.set('Set-Cookie', getClearAdminCookie())
  return response
}
