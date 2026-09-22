import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '@/lib/api'
import { getSession } from '@/lib/auth'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'
import { foundReportSchema } from '@/lib/validation'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const mine = request.nextUrl.searchParams.get('mine') === 'true'
  const user = mine ? await getSession() : null
  if (mine && !user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  return NextResponse.json({ reports: foundReportRepository.list({ userId: user?.id }) })
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  try {
    const input = foundReportSchema.parse(await request.json())
    const report = foundReportRepository.create({ id: randomUUID(), userId: user.id, jobId: randomUUID(), ...input })
    return NextResponse.json({ report }, { status: 201 })
  } catch (error) { return apiError(error) }
}
