import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api'
import { createSession } from '@/lib/auth'
import { userRepository } from '@/lib/repositories/user-repository'
import { loginSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json())
    const user = userRepository.findByEmail(input.email)
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' }, { status: 401 })
    }
    await createSession({ id: user.id, email: user.email, nickname: user.nickname, role: user.role })
    return NextResponse.json({ user: { id: user.id, email: user.email, nickname: user.nickname } })
  } catch (error) {
    return apiError(error)
  }
}
