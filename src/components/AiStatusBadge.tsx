import { CircleCheck, Clock3, RotateCw, TriangleAlert } from 'lucide-react'
import type { AiStatus } from '@/lib/types'

const labels = {
  PENDING: { text: 'AI 분석 대기', Icon: Clock3 },
  PROCESSING: { text: 'AI 분석 중', Icon: RotateCw },
  READY: { text: 'AI 특징 준비됨', Icon: CircleCheck },
  FAILED: { text: 'AI 분석 재시도 필요', Icon: TriangleAlert },
}

export function AiStatusBadge({ status }: { status: AiStatus }) {
  const { text, Icon } = labels[status]
  return <span className={`ai-badge ai-${status.toLowerCase()}`}><Icon size={13}/>{text}</span>
}
