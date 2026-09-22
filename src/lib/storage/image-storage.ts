import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const uploadRoot = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.UPLOAD_DIR ?? './data/uploads',
)
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

function sourceExtension(type: string) {
  return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' } as Record<string, string>)[type] ?? 'bin'
}

export async function storeReportImage(file: File, ownerId: string, imageId: string) {
  if (!allowedTypes.has(file.type)) throw new Error('JPG, PNG, WEBP, HEIC 이미지만 올릴 수 있어요.')
  if (file.size > 10 * 1024 * 1024) throw new Error('이미지는 장당 10MB 이하여야 해요.')

  const source = Buffer.from(await file.arrayBuffer())
  const relativeDir = path.join(ownerId, imageId)
  const directory = path.join(/* turbopackIgnore: true */ uploadRoot, relativeDir)
  await fs.mkdir(directory, { recursive: true })

  const originalKey = path.join(relativeDir, `original.${sourceExtension(file.type)}`)
  const publicKey = path.join(relativeDir, 'public-clean.webp')
  const thumbnailKey = path.join(relativeDir, 'thumbnail.webp')

  await fs.writeFile(path.join(uploadRoot, originalKey), source)
  const publicResult = await sharp(source)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(path.join(uploadRoot, publicKey))
  await sharp(source)
    .rotate()
    .resize(560, 420, { fit: 'cover', position: 'attention' })
    .webp({ quality: 78 })
    .toFile(path.join(uploadRoot, thumbnailKey))

  return {
    originalKey: originalKey.split(path.sep).join('/'),
    publicKey: publicKey.split(path.sep).join('/'),
    thumbnailKey: thumbnailKey.split(path.sep).join('/'),
    width: publicResult.width,
    height: publicResult.height,
    mimeType: 'image/webp',
  }
}

export function resolvePublicUpload(key: string) {
  const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '')
  if (!normalized.endsWith('public-clean.webp') && !normalized.endsWith('thumbnail.webp')) return null
  const absolute = path.resolve(/* turbopackIgnore: true */ uploadRoot, normalized)
  if (!absolute.startsWith(uploadRoot + path.sep)) return null
  return absolute
}
