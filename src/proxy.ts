import { NextRequest, NextResponse } from 'next/server'

// Middleware token verification (doesn't need DB access)
const SESSION_COOKIE_NAME = 'zshop_admin_session'
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'zshop-session-secret-change-in-production'
// Must match SESSION_MAX_AGE_MS in src/lib/admin-auth.ts
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Convert a string to ArrayBuffer
 */
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}

/**
 * Convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return arr
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify a signed token using HMAC-SHA256 (Web Crypto API - Edge Runtime compatible)
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return false

    // Sign the encoded payload with the same secret
    const key = await crypto.subtle.importKey(
      'raw',
      stringToBuffer(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const expectedSig = await crypto.subtle.sign('HMAC', key, stringToBuffer(encoded))
    const expectedHex = bufferToHex(expectedSig)

    // Timing-safe comparison: check length first, then compare character by character
    if (signature.length !== expectedHex.length) return false

    // Constant-time comparison
    const sigArr = hexToUint8Array(signature)
    const expectedArr = hexToUint8Array(expectedHex)
    if (sigArr.length !== expectedArr.length) return false

    let diff = 0
    for (let i = 0; i < sigArr.length; i++) {
      diff |= sigArr[i] ^ expectedArr[i]
    }

    if (diff !== 0) return false

    // Decode and check payload
    const payload = atob(encoded)
    if (!payload.startsWith('admin:')) return false

    // Enforce server-side expiry so a copied cookie value can't be replayed
    // forever — the signature alone never expires on its own.
    const issuedAtStr = payload.split(':')[1]
    const issuedAt = Number(issuedAtStr)
    if (!issuedAtStr || Number.isNaN(issuedAt)) return false
    if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false

    return true
  } catch {
    return false
  }
}

/**
 * CSRF Protection: Verify Origin header on mutating requests
 * Rejects requests from different origins
 * Supports reverse proxy scenarios (X-Forwarded-Host)
 */
function isOriginAllowed(request: NextRequest): boolean {
  const method = request.method.toUpperCase()

  // Only check mutating methods (CSRF only applies to state-changing requests)
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true
  }

  // The host the request should have arrived for, honoring a reverse proxy's
  // X-Forwarded-Host (Vercel, Nginx, Caddy, etc. all set this correctly).
  const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host

  const origin = request.headers.get('origin')

  // If no Origin header, check Referer as fallback
  if (!origin) {
    const referer = request.headers.get('referer')
    if (!referer) {
      // No origin or referer - allow for API clients (curl, etc.)
      return true
    }
    try {
      const refererUrl = new URL(referer)
      return refererUrl.host === requestHost
    } catch {
      return false
    }
  }

  // Origin must match the host the request actually arrived for. No
  // exceptions: trusting "any request with X-Forwarded-For" would defeat
  // this check entirely, since that header is present on essentially all
  // production traffic (Vercel/Nginx/Caddy add it to every request,
  // legitimate or not) — it says nothing about whether the request is
  // cross-site.
  try {
    const originUrl = new URL(origin)
    return originUrl.host === requestHost
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSRF check on all mutating admin API requests
  if (pathname.startsWith('/api/admin/')) {
    // CSRF protection - verify Origin header
    if (!isOriginAllowed(request)) {
      return NextResponse.json(
        { error: 'طلب غير مسموح - مصدر غير معروف' },
        { status: 403 }
      )
    }

    // Auth check: Protect all /api/admin/* routes except verify-password
    if (!pathname.includes('verify-password')) {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

      if (!sessionCookie?.value || !(await verifyToken(sessionCookie.value))) {
        return NextResponse.json(
          { error: 'غير مصرح - يجب تسجيل الدخول أولاً' },
          { status: 401 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
