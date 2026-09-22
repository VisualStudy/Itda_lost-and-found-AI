import fs from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { resolvePublicUpload } from '@/lib/storage/image-storage'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const filePath = resolvePublicUpload(path.join('/'))
  if (!filePath) return NextResponse.json({ error: '파일을 찾을 수 없어요.' }, { status: 404 })
  try {
    const data = await fs.readFile(filePath)
    return new NextResponse(data, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } })
  } catch {
    return NextResponse.json({ error: '파일을 찾을 수 없어요.' }, { status: 404 })
  }
}
