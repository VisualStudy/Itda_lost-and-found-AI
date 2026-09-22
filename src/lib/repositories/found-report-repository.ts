import { db } from '@/lib/db'
import type { FoundReport, ReportImage } from '@/lib/types'

function imageFromRow(row: Record<string, unknown>): ReportImage {
  return {
    id: String(row.id),
    publicUrl: `/api/uploads/${String(row.public_storage_key)}`,
    thumbnailUrl: `/api/uploads/${String(row.thumbnail_storage_key)}`,
    width: Number(row.width),
    height: Number(row.height),
    sortOrder: Number(row.sort_order),
  }
}

function reportFromRow(row: Record<string, unknown>, images: ReportImage[]): FoundReport {
  return {
    id: String(row.id), userId: String(row.user_id), finderNickname: String(row.nickname),
    title: String(row.title), description: String(row.description), category: String(row.category),
    foundAt: String(row.found_at), timePrecision: String(row.time_precision),
    locationText: String(row.location_text), locationGroup: String(row.location_group),
    aiStatus: row.ai_status as FoundReport['aiStatus'], status: row.status as FoundReport['status'],
    createdAt: String(row.created_at), images,
  }
}

function getImages(reportId: string): ReportImage[] {
  const rows = db.prepare(`SELECT * FROM report_images WHERE report_type = 'FOUND' AND report_id = ? ORDER BY sort_order`)
    .all(reportId) as Record<string, unknown>[]
  return rows.map(imageFromRow)
}

export const foundReportRepository = {
  list(input: { userId?: string; limit?: number } = {}): FoundReport[] {
    const limit = Math.min(input.limit ?? 24, 100)
    const rows = input.userId
      ? db.prepare(`SELECT f.*, u.nickname FROM found_reports f JOIN users u ON u.id = f.user_id WHERE f.user_id = ? ORDER BY f.created_at DESC LIMIT ?`).all(input.userId, limit)
      : db.prepare(`SELECT f.*, u.nickname FROM found_reports f JOIN users u ON u.id = f.user_id ORDER BY f.created_at DESC LIMIT ?`).all(limit)
    return (rows as Record<string, unknown>[]).map((row) => reportFromRow(row, getImages(String(row.id))))
  },

  findById(id: string): FoundReport | null {
    const row = db.prepare(`SELECT f.*, u.nickname FROM found_reports f JOIN users u ON u.id = f.user_id WHERE f.id = ?`).get(id) as Record<string, unknown> | undefined
    return row ? reportFromRow(row, getImages(id)) : null
  },

  create(input: {
    id: string; userId: string; title: string; description: string; category: string;
    foundAt: string; timePrecision: string; locationText: string; locationGroup: string;
    imageIds: string[]; jobId: string;
  }): FoundReport {
    db.transaction(() => {
      db.prepare(`INSERT INTO found_reports (
        id, user_id, title, description, category, found_at, time_precision, location_text, location_group
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        input.id, input.userId, input.title, input.description, input.category,
        input.foundAt, input.timePrecision, input.locationText, input.locationGroup,
      )

      const attach = db.prepare(`UPDATE report_images SET report_id = ?, sort_order = ?
        WHERE id = ? AND owner_user_id = ? AND report_id IS NULL AND report_type = 'FOUND'`)
      input.imageIds.forEach((imageId, index) => {
        const result = attach.run(input.id, index, imageId, input.userId)
        if (result.changes !== 1) throw new Error('유효하지 않은 이미지가 포함되어 있습니다.')
      })

      db.prepare(`INSERT INTO ai_jobs (id, job_type, report_type, report_id) VALUES (?, 'EXTRACT_FEATURES', 'FOUND', ?)`)
        .run(input.jobId, input.id)
    })()
    return this.findById(input.id)!
  },

  update(id: string, userId: string, input: Partial<Pick<FoundReport, 'title' | 'description' | 'category' | 'foundAt' | 'locationText' | 'locationGroup' | 'status'>>): FoundReport | null {
    const current = this.findById(id)
    if (!current || current.userId !== userId) return null
    const next = { ...current, ...input }
    db.prepare(`UPDATE found_reports SET title = ?, description = ?, category = ?, found_at = ?, location_text = ?, location_group = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`)
      .run(next.title, next.description, next.category, next.foundAt, next.locationText, next.locationGroup, next.status, id, userId)
    return this.findById(id)
  },
}
