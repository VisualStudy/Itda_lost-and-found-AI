import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api'
import { createSession } from '@/lib/auth'
import { userRepository } from '@/lib/repositories/user-repository'
import { registerSchema } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json())
    if (userRepository.findByEmail(input.email)) {
      return NextResponse.json({ error: '이미 가입된 이메일이에요.' }, { status: 409 })
    }
    const user = userRepository.create({
      id: randomUUID(), email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12), nickname: input.nickname,
    })
    await createSession({ id: user.id, email: user.email, nickname: user.nickname, role: user.role })
    return NextResponse.json({ user: { id: user.id, email: user.email, nickname: user.nickname } }, { status: 201 })
  } catch (error) {
    return apiError(error)
  }
}
