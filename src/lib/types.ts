export type AiStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
export type ReportStatus = 'OPEN' | 'CONNECTING' | 'RETURNED' | 'CLOSED'

export type ReportImage = {
  id: string
  publicUrl: string
  thumbnailUrl: string
  width: number
  height: number
  sortOrder: number
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
  aiStatus: AiStatus
  status: ReportStatus
  createdAt: string
  images: ReportImage[]
}
