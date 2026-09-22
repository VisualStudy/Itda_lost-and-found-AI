export const MATCHING_CONFIG = {
  candidateLimit: 100,
  resultLimit: 20,
  weights: {
    semanticText: 0.30,
    visual: 0.30,
    attributes: 0.15,
    location: 0.10,
    time: 0.10,
    ocrBrand: 0.05,
  },
} as const

export type MatchingAttributes = {
  category?: string | null
  colors?: string[]
  material?: string | null
  brand?: string | null
  features?: string[]
}

export type MatchingInput = {
  textEmbedding: number[]
  imageEmbedding?: number[]
  attributes: MatchingAttributes
  occurredAt: string
  locationText: string
  locationGroup?: string
  ocrText?: string[]
}

export type ScoreBreakdown = {
  semanticText: number
  visual: number
  attributes: number
  location: number
  time: number
  ocrBrand: number
}

export type MatchScore = {
  finalScore: number
  breakdown: ScoreBreakdown
  explanations: string[]
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
const unique = (values: Array<string | null | undefined>) => [...new Set(values.filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase().trim()))]

export function cosineSimilarity(left: number[], right: number[]) {
  if (!left.length || left.length !== right.length) return 0
  let dot = 0
  let leftNorm = 0
  let rightNorm = 0
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index]
    leftNorm += left[index] ** 2
    rightNorm += right[index] ** 2
  }
  if (!leftNorm || !rightNorm) return 0
  return clamp01(dot / Math.sqrt(leftNorm * rightNorm))
}

export function normalizeLocation(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/(대한민국|특별시|광역시|특별자치시|특별자치도)/g, '')
    .replace(/(근처|부근|인근|앞|뒤|옆|내부|안쪽)/g, ' ')
    .replace(/\b(지하|지상)?\s*\d+\s*층\b/g, ' ')
    .replace(/\s+/g, '')
    .replace(/[^0-9a-z가-힣]/g, '')
}

function tokenSet(value: string) {
  return new Set(value.toLowerCase().normalize('NFKC').split(/[^0-9a-z가-힣]+/).filter((token) => token.length > 1))
}

export function locationSimilarity(lostText: string, foundText: string, lostGroup = '', foundGroup = '') {
  const lost = normalizeLocation(lostText)
  const found = normalizeLocation(foundText)
  if (!lost || !found) return lostGroup && foundGroup && lostGroup === foundGroup ? 0.35 : 0
  if (lost === found) return 1
  if (lost.includes(found) || found.includes(lost)) return 0.9
  const left = tokenSet(lostText)
  const right = tokenSet(foundText)
  const overlap = [...left].filter((token) => right.has(token)).length
  const union = new Set([...left, ...right]).size
  const tokenScore = union ? overlap / union : 0
  const groupScore = lostGroup && foundGroup && lostGroup === foundGroup ? 0.45 : 0
  return clamp01(Math.max(tokenScore, groupScore))
}

export function timeSimilarity(lostAt: string, foundAt: string) {
  const deltaHours = (Date.parse(foundAt) - Date.parse(lostAt)) / 3_600_000
  if (!Number.isFinite(deltaHours)) return 0
  if (deltaHours < -2) return 0
  if (deltaHours < 0) return 0.35
  if (deltaHours <= 2) return 1
  if (deltaHours <= 6) return 0.9
  if (deltaHours <= 24) return 0.75
  if (deltaHours <= 72) return 0.5
  if (deltaHours <= 168) return 0.25
  return 0.05
}

export function attributeSimilarity(lost: MatchingAttributes, found: MatchingAttributes) {
  const category = lost.category && found.category ? (lost.category === found.category ? 1 : 0) : 0.35
  const lostColors = unique(lost.colors ?? [])
  const foundColors = unique(found.colors ?? [])
  const color = lostColors.length && foundColors.length ? unique(lostColors.filter((item) => foundColors.includes(item))).length / Math.max(lostColors.length, foundColors.length) : 0.35
  const material = lost.material && found.material ? (lost.material === found.material ? 1 : 0) : 0.35
  const lostFeatures = unique(lost.features ?? [])
  const foundFeatures = unique(found.features ?? [])
  const feature = lostFeatures.length && foundFeatures.length ? unique(lostFeatures.filter((item) => foundFeatures.some((candidate) => candidate.includes(item) || item.includes(candidate)))).length / Math.max(lostFeatures.length, foundFeatures.length) : 0.35
  return clamp01(category * 0.45 + color * 0.30 + material * 0.10 + feature * 0.15)
}

export function visualSimilarity(lost: MatchingInput, found: MatchingInput) {
  if (lost.imageEmbedding?.length && found.imageEmbedding?.length && lost.imageEmbedding.length === found.imageEmbedding.length) {
    return cosineSimilarity(lost.imageEmbedding, found.imageEmbedding)
  }
  const lostColors = unique(lost.attributes.colors ?? [])
  const foundColors = unique(found.attributes.colors ?? [])
  const colorOverlap = lostColors.length && foundColors.length ? lostColors.filter((color) => foundColors.includes(color)).length / Math.max(lostColors.length, foundColors.length) : 0
  const categoryMatch = lost.attributes.category && lost.attributes.category === found.attributes.category ? 1 : 0
  return clamp01(colorOverlap * 0.65 + categoryMatch * 0.35)
}

function ocrBrandSimilarity(lost: MatchingAttributes, foundOcr: string[]) {
  const needles = unique([lost.brand, ...(lost.features ?? [])])
  if (!needles.length || !foundOcr.length) return 0
  const haystack = foundOcr.join(' ').toLowerCase()
  return clamp01(needles.filter((needle) => haystack.includes(needle)).length / needles.length)
}

function buildExplanations(lost: MatchingInput, found: MatchingInput, scores: ScoreBreakdown) {
  const explanations: string[] = []
  if (lost.attributes.category && lost.attributes.category === found.attributes.category) explanations.push('물건 종류가 같아요.')
  const colors = unique((lost.attributes.colors ?? []).filter((color) => (found.attributes.colors ?? []).includes(color)))
  if (colors.length) explanations.push(`${colors.join(', ')} 색상 계열이 일치해요.`)
  const features = unique((lost.attributes.features ?? []).filter((feature) => (found.attributes.features ?? []).some((candidate) => candidate.includes(feature) || feature.includes(candidate))))
  if (features.length) explanations.push(`${features.slice(0, 2).join(', ')} 특징이 비슷해요.`)
  if (scores.location >= 0.8) explanations.push('분실 위치와 발견 위치가 매우 가까워 보여요.')
  else if (scores.location >= 0.4) explanations.push('장소 범주가 비슷해요.')
  const deltaMinutes = Math.round((Date.parse(found.occurredAt) - Date.parse(lost.occurredAt)) / 60_000)
  if (deltaMinutes >= 0 && deltaMinutes <= 180) explanations.push(`분실 후 약 ${deltaMinutes}분 안에 발견됐어요.`)
  else if (scores.time >= 0.5) explanations.push('분실 시각과 발견 시각의 흐름이 자연스러워요.')
  if (scores.semanticText >= 0.55) explanations.push('설명에 담긴 단어와 특징이 비슷해요.')
  return explanations.slice(0, 5)
}

export function calculateMatchScore(lost: MatchingInput, found: MatchingInput): MatchScore {
  const breakdown: ScoreBreakdown = {
    semanticText: cosineSimilarity(lost.textEmbedding, found.textEmbedding),
    visual: visualSimilarity(lost, found),
    attributes: attributeSimilarity(lost.attributes, found.attributes),
    location: locationSimilarity(lost.locationText, found.locationText, lost.locationGroup, found.locationGroup),
    time: timeSimilarity(lost.occurredAt, found.occurredAt),
    ocrBrand: ocrBrandSimilarity(lost.attributes, found.ocrText ?? []),
  }
  const weighted = Object.entries(MATCHING_CONFIG.weights).reduce((sum, [key, weight]) => sum + breakdown[key as keyof ScoreBreakdown] * weight, 0)
  return {
    finalScore: Math.round(clamp01(weighted) * 100),
    breakdown,
    explanations: buildExplanations(lost, found, breakdown),
  }
}
