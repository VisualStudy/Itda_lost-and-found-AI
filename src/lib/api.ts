import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: '입력 내용을 확인해 주세요.', issues: error.issues },
      { status: 400 },
    )
  }
  console.error(error)
  return NextResponse.json({ error: '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
}
