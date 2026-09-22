import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'

export const runtime = 'nodejs'

type Context = { params: Promise<{ id: string }> }

export async function GET(_: Request, context: Context) {
  const { id } = await context.params
  const report = foundReportRepository.findById(id)
  return report ? NextResponse.json({ report }) : NextResponse.json({ error: '습득물을 찾을 수 없어요.' }, { status: 404 })
}

export async function PATCH(request: Request, context: Context) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  const { id } = await context.params
  const input = await request.json()
  const allowed = Object.fromEntries(Object.entries(input).filter(([key]) => ['title', 'description', 'category', 'foundAt', 'locationText', 'locationGroup', 'status'].includes(key)))
  const report = foundReportRepository.update(id, user.id, allowed)
  return report ? NextResponse.json({ report }) : NextResponse.json({ error: '수정 권한이 없거나 습득물을 찾을 수 없어요.' }, { status: 404 })
}
