import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Default admin password (server-only, never exposed to client)
// In production, set ADMIN_PASSWORD env variable and change this default
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zshop2024'

// Session configuration
const SESSION_COOKIE_NAME = 'zshop_admin_session'
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'zshop-session-secret-change-in-production'
// Server-side session lifetime — must match the cookie's Max-Age below so a
// copied/stolen cookie value can't be replayed indefinitely.
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Rate limiting configuration
const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// In-memory rate limiter (resets on server restart, which is acceptable)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()

/**
 * Check if the IP is rate limited
 */
export function isRateLimited(ip: string): { limited: boolean; remainingMs: number } {
  // Lazy cleanup: remove expired entries on each check
  const now = Date.now()
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      loginAttempts.delete(key)
    }
  }

  const entry = loginAttempts.get(ip)

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    // No entry or window expired - reset
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return { limited: false, remainingMs: 0 }
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - entry.firstAttempt)
    return { limited: true, remainingMs }
  }

  entry.count++
  return { limited: false, remainingMs: 0 }
}

/**
 * Reset rate limit for an IP (on successful login)
 */
function resetRateLimit(ip: string) {
  loginAttempts.delete(ip)
}

/**
 * Hash a password using scrypt (cryptographically secure)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, storedKey] = hash.split(':')
    if (!salt || !storedKey) return false
    const derivedKey = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(derivedKey, Buffer.from(storedKey, 'hex'))
  } catch {
    return false
  }
}

/**
 * Check if a stored password is hashed (hashed passwords contain a colon separator)
 */
function isHashed(value: string): boolean {
  // Hashed format: salt:derivedKey (64-char hex each, separated by colon)
  const parts = value.split(':')
  return parts.length === 2 && parts[0].length === 32 && parts[1].length === 128
}

/**
 * Sign a token using HMAC-SHA256 (cryptographically secure)
 */
function signToken(payload: string): string {
  const encoded = Buffer.from(payload).toString('base64')
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex')
  return `${encoded}.${signature}`
}

/**
 * Verify a signed token
 */
function verifyToken(token: string): string | null {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return null

    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) return null
    const sigBuf = Buffer.from(signature, 'hex')
    const expectedBuf = Buffer.from(expectedSignature, 'hex')
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null

    const payload = Buffer.from(encoded, 'base64').toString()

    // Enforce server-side expiry so a copied cookie value can't be replayed
    // forever — the signature alone never expires on its own.
    const issuedAtStr = payload.split(':')[1]
    const issuedAt = Number(issuedAtStr)
    if (!issuedAtStr || Number.isNaN(issuedAt)) return null
    if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) return null

    return payload
  } catch {
    return null
  }
}

/**
 * Verify admin password and create a session cookie
 */
export async function adminLogin(password: string, clientIp?: string): Promise<{ success: boolean; token?: string }> {
  // Get the stored password from database
  let storedValue: string | null = null

  try {
    const setting = await db.storeSetting.findUnique({
      where: { key: 'adminPassword' },
    })
    if (setting?.value) {
      storedValue = setting.value
    }
  } catch {
    // DB not available
  }

  // If no password set in DB, use default
  if (!storedValue) {
    storedValue = DEFAULT_ADMIN_PASSWORD
  }

  // Verify password
  let isValid = false

  if (isHashed(storedValue)) {
    // Stored password is hashed - verify against hash
    isValid = verifyPassword(password, storedValue)
  } else {
    // Stored password is plaintext - direct comparison
    isValid = password === storedValue

    // Auto-upgrade: hash the plaintext password and save it
    if (isValid) {
      try {
        const hashed = hashPassword(password)
        await db.storeSetting.upsert({
          where: { key: 'adminPassword' },
          update: { value: hashed },
          create: { key: 'adminPassword', value: hashed },
        })
      } catch {
        // Failed to upgrade - non-critical, continue
      }
    }
  }

  if (isValid) {
    // Reset rate limit on successful login
    if (clientIp) resetRateLimit(clientIp)

    const token = signToken(`admin:${Date.now()}`)
    return { success: true, token }
  }

  return { success: false }
}

/**
 * Set the admin session cookie in the response
 */
export function setAdminCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`
}

/**
 * Clear the admin session cookie
 */
export function getClearAdminCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

/**
 * Verify admin session from the current request cookies
 * Returns true if the admin is authenticated
 */
export async function verifyAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) return false

    const payload = verifyToken(sessionCookie.value)
    if (!payload || !payload.startsWith('admin:')) return false

    return true
  } catch {
    return false
  }
}
