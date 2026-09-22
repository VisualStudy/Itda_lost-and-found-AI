import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import type { Bindings, SessionUser } from './types'

const COOKIE = 'itda_session'
const encoder = new TextEncoder()

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((value) => { binary += String.fromCharCode(value) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

function sessionSecret(c: Context<{ Bindings: Bindings }>) {
  if (c.env.SESSION_SECRET) return c.env.SESSION_SECRET
  if (c.env.CF_PAGES === '1') throw new Error('SESSION_SECRET is required in Hosted production.')
  return 'local-development-secret-change-before-production'
}

export async function hashPassword(password: string, salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: base64UrlToBytes(salt), iterations: 100_000 }, key, 256)
  return { salt, hash: bytesToBase64Url(new Uint8Array(bits)) }
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const actual = (await hashPassword(password, salt)).hash
  if (actual.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < actual.length; i++) mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i)
  return mismatch === 0
}

export async function setSession(c: Context<{ Bindings: Bindings }>, user: SessionUser) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 86_400_000 })))
  const signature = await hmac(payload, sessionSecret(c))
  setCookie(c, COOKIE, `${payload}.${signature}`, { httpOnly: true, sameSite: 'Lax', secure: new URL(c.req.url).protocol === 'https:', path: '/', maxAge: 604800 })
}

export async function getSession(c: Context<{ Bindings: Bindings }>): Promise<SessionUser | null> {
  const token = getCookie(c, COOKIE)
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature || await hmac(payload, sessionSecret(c)) !== signature) return null
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as SessionUser & { exp: number }
    if (data.exp < Date.now()) return null
    return { id: data.id, email: data.email, nickname: data.nickname, role: data.role }
  } catch { return null }
}

export function clearSession(c: Context) {
  deleteCookie(c, COOKIE, { path: '/' })
}
