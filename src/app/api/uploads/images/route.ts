import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { imageRepository } from '@/lib/repositories/image-repository'
import { storeReportImage } from '@/lib/storage/image-storage'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
  try {
    const data = await request.formData()
    const file = data.get('image')
    if (!(file instanceof File)) return NextResponse.json({ error: '이미지를 선택해 주세요.' }, { status: 400 })
    const id = randomUUID()
    const stored = await storeReportImage(file, user.id, id)
    const image = imageRepository.create({ id, ownerUserId: user.id, ...stored })
    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '이미지를 처리하지 못했어요.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
