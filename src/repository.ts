import { createLocalTextEmbedding } from './ai'
import { calculateMatchScore, MATCHING_CONFIG, type MatchingAttributes, type MatchingInput } from './matching'
import type { Bindings, CandidateMatch, FoundReport, LostReport, ReportImage } from './types'

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

type LostRow = {
  id: string; user_id: string; description: string; category: string; lost_at: string; time_precision: string;
  location_text: string; location_group: string; attributes_json: string; ai_status: LostReport['aiStatus'];
  status: LostReport['status']; created_at: string;
}

type MatchRow = {
  id: string; lost_report_id: string; found_report_id: string; final_score: number; text_score: number;
  visual_score: number; attribute_score: number; location_score: number; time_score: number; ocr_score: number;
  explanation_json: string; created_at: string;
}

type FoundCandidateRow = {
  id: string; category: string; found_at: string; location_text: string; location_group: string;
  attributes_json: string; text_embedding_json: string | null; image_embedding_json: string | null;
  ocr_public_json: string | null; detected_attributes_json: string | null;
}

async function mapLostReport(env: Env, row: LostRow): Promise<LostReport> {
  const feature = await env.DB.prepare(`SELECT provider, model_version, text_embedding_json, image_embedding_json, ocr_public_json, detected_attributes_json FROM ai_features WHERE report_type = 'LOST' AND report_id = ?`).bind(row.id).first<Record<string, string>>()
  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    category: row.category,
    lostAt: row.lost_at,
    timePrecision: row.time_precision,
    locationText: row.location_text,
    locationGroup: row.location_group,
    attributes: parseJson(row.attributes_json, {}),
    aiStatus: row.ai_status,
    status: row.status,
    createdAt: row.created_at,
    aiFeatures: feature ? {
      provider: feature.provider,
      modelVersion: feature.model_version,
      textEmbedding: parseJson(feature.text_embedding_json, []),
      imageEmbedding: parseJson(feature.image_embedding_json, []),
      ocrPublic: parseJson(feature.ocr_public_json, []),
      detectedAttributes: parseJson(feature.detected_attributes_json, {}),
    } : null,
  }
}

export async function findLostReport(env: Env, id: string) {
  const row = await env.DB.prepare(`SELECT * FROM lost_reports WHERE id = ?`).bind(id).first<LostRow>()
  return row ? mapLostReport(env, row) : null
}

export async function listLostReports(env: Env, userId: string, limit = 30) {
  const rows = await env.DB.prepare(`SELECT * FROM lost_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).bind(userId, limit).all<LostRow>()
  return Promise.all(rows.results.map((row) => mapLostReport(env, row)))
}

export async function createLostReport(env: Env, input: {
  id: string; userId: string; description: string; category: string; lostAt: string; timePrecision: string;
  locationText: string; locationGroup: string; attributes: MatchingAttributes;
}) {
  const embedding = createLocalTextEmbedding(`${input.description} ${input.locationText} ${JSON.stringify(input.attributes)}`)
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO lost_reports (id, user_id, description, category, lost_at, time_precision, location_text, location_group, attributes_json, ai_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'READY')`)
      .bind(input.id, input.userId, input.description, input.category, input.lostAt, input.timePrecision, input.locationText, input.locationGroup, JSON.stringify(input.attributes)),
    env.DB.prepare(`INSERT INTO ai_features (id, report_type, report_id, provider, model_version, text_embedding_json, detected_attributes_json) VALUES (?, 'LOST', ?, 'local-text', 'hash-text-v1', ?, ?)`)
      .bind(crypto.randomUUID(), input.id, JSON.stringify(embedding), JSON.stringify(input.attributes)),
  ])
  await rematchLostReport(env, input.id)
  return findLostReport(env, input.id)
}

function toMatchingInput(input: {
  embedding: number[]; imageEmbedding?: number[]; attributes: MatchingAttributes; occurredAt: string;
  locationText: string; locationGroup: string; ocrText?: string[];
}): MatchingInput {
  return {
    textEmbedding: input.embedding,
    imageEmbedding: input.imageEmbedding,
    attributes: input.attributes,
    occurredAt: input.occurredAt,
    locationText: input.locationText,
    locationGroup: input.locationGroup,
    ocrText: input.ocrText,
  }
}

export async function rematchLostReport(env: Env, lostReportId: string) {
  const lost = await findLostReport(env, lostReportId)
  if (!lost?.aiFeatures) throw new Error('LOST_REPORT_NOT_READY')
  const candidates = await env.DB.prepare(`
    SELECT f.id, f.category, f.found_at, f.location_text, f.location_group, f.attributes_json,
           a.text_embedding_json, a.image_embedding_json, a.ocr_public_json, a.detected_attributes_json
    FROM found_reports f
    LEFT JOIN ai_features a ON a.report_type = 'FOUND' AND a.report_id = f.id
    WHERE f.status = 'OPEN'
    ORDER BY CASE WHEN f.category = ? THEN 0 ELSE 1 END, f.created_at DESC
    LIMIT ?
  `).bind(lost.category, MATCHING_CONFIG.candidateLimit).all<FoundCandidateRow>()
  const lostInput = toMatchingInput({
    embedding: lost.aiFeatures.textEmbedding,
    imageEmbedding: lost.aiFeatures.imageEmbedding,
    attributes: lost.attributes as MatchingAttributes,
    occurredAt: lost.lostAt,
    locationText: lost.locationText,
    locationGroup: lost.locationGroup,
    ocrText: lost.aiFeatures.ocrPublic,
  })
  const ranked = candidates.results.map((candidate) => {
    const storedAttributes = parseJson<MatchingAttributes>(candidate.detected_attributes_json || candidate.attributes_json, { category: candidate.category })
    const score = calculateMatchScore(lostInput, toMatchingInput({
      embedding: parseJson(candidate.text_embedding_json, []),
      imageEmbedding: parseJson(candidate.image_embedding_json, []),
      attributes: { ...storedAttributes, category: storedAttributes.category ?? candidate.category },
      occurredAt: candidate.found_at,
      locationText: candidate.location_text,
      locationGroup: candidate.location_group,
      ocrText: parseJson(candidate.ocr_public_json, []),
    }))
    return { candidate, score }
  }).sort((left, right) => right.score.finalScore - left.score.finalScore).slice(0, MATCHING_CONFIG.resultLimit)

  await env.DB.prepare(`DELETE FROM candidate_matches WHERE lost_report_id = ?`).bind(lostReportId).run()
  if (ranked.length) {
    await env.DB.batch(ranked.map(({ candidate, score }) => env.DB.prepare(`
      INSERT INTO candidate_matches (id, lost_report_id, found_report_id, final_score, text_score, visual_score, attribute_score, location_score, time_score, ocr_score, explanation_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), lostReportId, candidate.id, score.finalScore, score.breakdown.semanticText * 100, score.breakdown.visual * 100, score.breakdown.attributes * 100, score.breakdown.location * 100, score.breakdown.time * 100, score.breakdown.ocrBrand * 100, JSON.stringify(score.explanations))))
  }
  return ranked.length
}

export async function listMatches(env: Env, lostReportId: string): Promise<CandidateMatch[]> {
  const rows = await env.DB.prepare(`SELECT * FROM candidate_matches WHERE lost_report_id = ? ORDER BY final_score DESC, created_at DESC`).bind(lostReportId).all<MatchRow>()
  const matches = await Promise.all(rows.results.map(async (row): Promise<CandidateMatch | null> => {
    const foundReport = await findReport(env, row.found_report_id)
    if (!foundReport) return null
    return {
      id: row.id,
      lostReportId: row.lost_report_id,
      foundReportId: row.found_report_id,
      finalScore: Math.round(row.final_score),
      textScore: Math.round(row.text_score),
      visualScore: Math.round(row.visual_score),
      attributeScore: Math.round(row.attribute_score),
      locationScore: Math.round(row.location_score),
      timeScore: Math.round(row.time_score),
      ocrScore: Math.round(row.ocr_score),
      explanations: parseJson<string[]>(row.explanation_json, []),
      foundReport,
      createdAt: row.created_at,
    }
  }))
  return matches.filter((match): match is CandidateMatch => Boolean(match))
}

export async function findMatch(env: Env, id: string) {
  const row = await env.DB.prepare(`SELECT * FROM candidate_matches WHERE id = ?`).bind(id).first<MatchRow>()
  if (!row) return null
  const matches = await listMatches(env, row.lost_report_id)
  return matches.find((match) => match.id === id) ?? null
}

export async function rematchRecentLostReports(env: Env, limit = 5) {
  const rows = await env.DB.prepare(`SELECT id FROM lost_reports WHERE status = 'OPEN' ORDER BY updated_at DESC LIMIT ?`).bind(limit).all<{ id: string }>()
  for (const row of rows.results) await rematchLostReport(env, row.id)
  return rows.results.length
}
