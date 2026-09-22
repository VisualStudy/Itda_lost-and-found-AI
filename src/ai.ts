import type { Bindings } from './types'

const categories: Record<string, string[]> = {
  wallet: ['지갑', '카드지갑', 'wallet'], bag: ['가방', '백팩', '에코백', 'bag'],
  electronics: ['이어폰', '휴대폰', '노트북', '전자기기', '에어팟'], keys: ['열쇠', '키링', '차키'],
  clothing: ['옷', '의류', '모자', '신발'], document: ['신분증', '학생증', '카드', '문서'],
  accessory: ['반지', '목걸이', '시계', '액세서리'],
}
const colors: Record<string, string[]> = {
  black: ['검정', '검은', '블랙'], white: ['흰색', '하얀', '화이트'], beige: ['베이지', '아이보리'],
  red: ['빨강', '붉은', '레드'], blue: ['파랑', '푸른', '블루', '남색'], green: ['초록', '녹색', '그린'],
  gray: ['회색', '그레이', '은색'], brown: ['갈색', '브라운'], yellow: ['노랑', '금색', '골드'],
}
const materials: Record<string, string[]> = { leather: ['가죽'], fabric: ['천', '패브릭'], metal: ['금속', '메탈'], plastic: ['플라스틱'], paper: ['종이'] }

function detect(dictionary: Record<string, string[]>, text: string) {
  return Object.entries(dictionary).filter(([, words]) => words.some((word) => text.includes(word))).map(([key]) => key)
}

export function extractAttributes(text: string, fallbackCategory = 'other') {
  const category = detect(categories, text)[0] ?? fallbackCategory
  const detectedColors = detect(colors, text)
  const material = detect(materials, text)[0] ?? null
  const features = ['로고', '장식', '스크래치', '스티커', '무늬', '지퍼', '고리'].filter((word) => text.includes(word))
  return { category, colors: detectedColors, material, features }
}

export function createLocalTextEmbedding(text: string, dimensions = 64) {
  const vector = Array<number>(dimensions).fill(0)
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()
  const grams = [...normalized].flatMap((_, index) => [normalized.slice(index, index + 1), normalized.slice(index, index + 2)]).filter(Boolean)
  for (const gram of grams) {
    let hash = 2166136261
    for (const char of gram) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    const index = Math.abs(hash) % dimensions
    vector[index] += hash & 1 ? 1 : -1
  }
  const norm = Math.hypot(...vector) || 1
  return vector.map((value) => Number((value / norm).toFixed(6)))
}

export async function processNextAiJob(env: Bindings) {
  const job = await env.DB.prepare(`SELECT id, report_id FROM ai_jobs WHERE status = 'PENDING' AND report_type = 'FOUND' ORDER BY created_at LIMIT 1`).first<{ id: string; report_id: string }>()
  if (!job) return false
  await env.DB.prepare(`UPDATE ai_jobs SET status = 'PROCESSING', attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(job.id).run()
  await env.DB.prepare(`UPDATE found_reports SET ai_status = 'PROCESSING' WHERE id = ?`).bind(job.report_id).run()
  try {
    const report = await env.DB.prepare(`SELECT title, description, category FROM found_reports WHERE id = ?`).bind(job.report_id).first<{ title: string; description: string; category: string }>()
    if (!report) throw new Error('REPORT_NOT_FOUND')
    const images = await env.DB.prepare(`SELECT visual_features_json FROM report_images WHERE report_id = ? ORDER BY sort_order`).bind(job.report_id).all<{ visual_features_json: string | null }>()
    const visualFeatures = images.results.map((item) => { try { return JSON.parse(item.visual_features_json || '{}') } catch { return {} } }) as Array<{ embedding?: number[]; dominantColors?: string[] }>
    const imageEmbedding = visualFeatures.find((item) => item.embedding?.length)?.embedding ?? []
    const dominantColors = [...new Set(visualFeatures.flatMap((item) => item.dominantColors ?? []))]
    const attributes = extractAttributes(`${report.title} ${report.description}`, report.category)
    if (!attributes.colors.length && dominantColors.length) attributes.colors = dominantColors
    await env.DB.prepare(`INSERT INTO ai_features (id, report_type, report_id, provider, model_version, text_embedding_json, image_embedding_json, detected_attributes_json) VALUES (?, 'FOUND', ?, 'local-hybrid', 'hash-text-v1+pixel-v1', ?, ?, ?) ON CONFLICT(report_type, report_id) DO UPDATE SET text_embedding_json=excluded.text_embedding_json, image_embedding_json=excluded.image_embedding_json, detected_attributes_json=excluded.detected_attributes_json, updated_at=CURRENT_TIMESTAMP`)
      .bind(crypto.randomUUID(), job.report_id, JSON.stringify(createLocalTextEmbedding(`${report.title} ${report.description}`)), JSON.stringify(imageEmbedding), JSON.stringify(attributes)).run()
    await env.DB.prepare(`UPDATE ai_jobs SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(job.id).run()
    await env.DB.prepare(`UPDATE found_reports SET ai_status = 'READY', attributes_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(JSON.stringify(attributes), job.report_id).run()
    return true
  } catch (error) {
    await env.DB.prepare(`UPDATE ai_jobs SET status = 'FAILED', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(error instanceof Error ? error.message : 'UNKNOWN', job.id).run()
    await env.DB.prepare(`UPDATE found_reports SET ai_status = 'FAILED' WHERE id = ?`).bind(job.report_id).run()
    return false
  }
}
