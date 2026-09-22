import type { Bindings, FoundReport, ReportImage } from './types'

type Env = Bindings

type ReportRow = {
  id: string; user_id: string; nickname: string; title: string; description: string; category: string;
  found_at: string; time_precision: string; location_text: string; location_group: string;
  attributes_json: string; ai_status: FoundReport['aiStatus']; status: FoundReport['status']; created_at: string;
}

type ImageRow = {
  id: string; public_storage_key: string; thumbnail_storage_key: string; width: number; height: number;
  visual_features_json: string | null;
}

function parseJson<T>(value: string | null, fallback: T): T {
  try { return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

async function imagesFor(env: Env, reportId: string): Promise<ReportImage[]> {
  const result = await env.DB.prepare(`SELECT id, public_storage_key, thumbnail_storage_key, width, height, visual_features_json FROM report_images WHERE report_type = 'FOUND' AND report_id = ? ORDER BY sort_order`).bind(reportId).all<ImageRow>()
  return result.results.map((row) => ({
    id: row.id, publicUrl: `/api/files/${row.public_storage_key}`, thumbnailUrl: `/api/files/${row.thumbnail_storage_key}`,
    width: row.width, height: row.height, visualFeatures: parseJson(row.visual_features_json, null),
  }))
}

async function mapReport(env: Env, row: ReportRow): Promise<FoundReport> {
  const feature = await env.DB.prepare(`SELECT provider, model_version, text_embedding_json, image_embedding_json, ocr_public_json, detected_attributes_json FROM ai_features WHERE report_type = 'FOUND' AND report_id = ?`).bind(row.id).first<Record<string, string>>()
  return {
    id: row.id, userId: row.user_id, finderNickname: row.nickname, title: row.title, description: row.description,
    category: row.category, foundAt: row.found_at, timePrecision: row.time_precision, locationText: row.location_text,
    locationGroup: row.location_group, attributes: parseJson(row.attributes_json, {}), aiStatus: row.ai_status,
    status: row.status, createdAt: row.created_at, images: await imagesFor(env, row.id),
    aiFeatures: feature ? { provider: feature.provider, modelVersion: feature.model_version, textEmbedding: parseJson(feature.text_embedding_json, []), imageEmbedding: parseJson(feature.image_embedding_json, []), ocrPublic: parseJson(feature.ocr_public_json, []), detectedAttributes: parseJson(feature.detected_attributes_json, {}) } : null,
  }
}

export async function listReports(env: Env, userId?: string, limit = 30) {
  const query = `SELECT f.*, u.nickname FROM found_reports f JOIN users u ON u.id = f.user_id ${userId ? 'WHERE f.user_id = ?' : ''} ORDER BY f.created_at DESC LIMIT ?`
  const statement = env.DB.prepare(query)
  const rows = userId ? await statement.bind(userId, limit).all<ReportRow>() : await statement.bind(limit).all<ReportRow>()
  return Promise.all(rows.results.map((row) => mapReport(env, row)))
}

export async function findReport(env: Env, id: string) {
  const row = await env.DB.prepare(`SELECT f.*, u.nickname FROM found_reports f JOIN users u ON u.id = f.user_id WHERE f.id = ?`).bind(id).first<ReportRow>()
  return row ? mapReport(env, row) : null
}

export async function createReport(env: Env, input: {
  id: string; userId: string; title: string; description: string; category: string; foundAt: string;
  timePrecision: string; locationText: string; locationGroup: string; imageIds: string[];
}) {
  await env.DB.prepare(`INSERT INTO found_reports (id, user_id, title, description, category, found_at, time_precision, location_text, location_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(input.id, input.userId, input.title, input.description, input.category, input.foundAt, input.timePrecision, input.locationText, input.locationGroup).run()
  for (const [index, imageId] of input.imageIds.entries()) {
    const result = await env.DB.prepare(`UPDATE report_images SET report_id = ?, sort_order = ? WHERE id = ? AND owner_user_id = ? AND report_id IS NULL`).bind(input.id, index, imageId, input.userId).run()
    if (!result.meta.changes) throw new Error('INVALID_IMAGE')
  }
  await env.DB.prepare(`INSERT INTO ai_jobs (id, job_type, report_type, report_id) VALUES (?, 'EXTRACT_FEATURES', 'FOUND', ?)`).bind(crypto.randomUUID(), input.id).run()
  return findReport(env, input.id)
}
