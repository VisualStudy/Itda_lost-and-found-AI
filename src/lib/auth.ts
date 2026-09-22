import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'itda_session'

function getSecret() {
  const value = process.env.SESSION_SECRET
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be configured in production.')
  }
  return new TextEncoder().encode(value ?? 'local-development-secret-change-before-deploying')
}

export type SessionUser = {
  id: string
  email: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: String(payload.id),
      email: String(payload.email),
      nickname: String(payload.nickname),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
    }
  } catch {
    return null
  }
}
