export type Bindings = {
  DB: D1Database
  R2: R2Bucket
  SESSION_SECRET?: string
  CF_PAGES?: string
}

export type SessionUser = {
  id: string
  email: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

export type FoundReport = {
  id: string
  userId: string
  finderNickname: string
  title: string
  description: string
  category: string
  foundAt: string
  timePrecision: string
  locationText: string
  locationGroup: string
  attributes: Record<string, unknown>
  aiStatus: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  status: 'OPEN' | 'CONNECTING' | 'RETURNED' | 'CLOSED'
  createdAt: string
  images: ReportImage[]
  aiFeatures?: AiFeature | null
}

export type LostReport = {
  id: string
  userId: string
  description: string
  category: string
  lostAt: string
  timePrecision: string
  locationText: string
  locationGroup: string
  attributes: Record<string, unknown>
  aiStatus: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  status: 'OPEN' | 'MATCHED' | 'CLOSED'
  createdAt: string
  aiFeatures?: AiFeature | null
}

export type CandidateMatch = {
  id: string
  lostReportId: string
  foundReportId: string
  finalScore: number
  textScore: number
  visualScore: number
  attributeScore: number
  locationScore: number
  timeScore: number
  ocrScore: number
  explanations: string[]
  foundReport: FoundReport
  createdAt: string
}

export type ReportImage = {
  id: string
  publicUrl: string
  thumbnailUrl: string
  width: number
  height: number
  visualFeatures: Record<string, unknown> | null
}

export type AiFeature = {
  provider: string
  modelVersion: string
  detectedAttributes: Record<string, unknown>
  textEmbedding: number[]
  imageEmbedding: number[]
  ocrPublic: string[]
}
