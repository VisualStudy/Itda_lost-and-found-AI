import { db } from '@/lib/db'

export const imageRepository = {
  create(input: {
    id: string; ownerUserId: string; originalKey: string; publicKey: string; thumbnailKey: string;
    mimeType: string; width: number; height: number;
  }) {
    db.prepare(`INSERT INTO report_images (
      id, report_type, owner_user_id, original_storage_key, public_storage_key,
      thumbnail_storage_key, mime_type, width, height
    ) VALUES (?, 'FOUND', ?, ?, ?, ?, ?, ?, ?)`).run(
      input.id, input.ownerUserId, input.originalKey, input.publicKey, input.thumbnailKey,
      input.mimeType, input.width, input.height,
    )
    return {
      id: input.id,
      publicUrl: `/api/uploads/${input.publicKey}`,
      thumbnailUrl: `/api/uploads/${input.thumbnailKey}`,
      width: input.width,
      height: input.height,
    }
  },
}
