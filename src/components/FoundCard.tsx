import Link from 'next/link'
import { Clock3, MapPin } from 'lucide-react'
import { categories } from '@/lib/locations'
import { formatKoreanDate } from '@/lib/dates'
import type { FoundReport } from '@/lib/types'
import { AiStatusBadge } from './AiStatusBadge'

export function FoundCard({ report }: { report: FoundReport }) {
  return <Link className="report-card detailed" href={`/found/${report.id}`}><div className="report-image-wrap">{report.images[0] ? <img src={report.images[0].thumbnailUrl} alt={`${report.title} 습득물 사진`}/> : <div className="image-placeholder"/>}<span className="category-chip">{categories[report.category] ?? '기타'}</span></div><div><AiStatusBadge status={report.aiStatus}/><h3>{report.title}</h3><p><MapPin size={14}/>{report.locationText}</p><p><Clock3 size={14}/>{formatKoreanDate(report.foundAt)}</p></div></Link>
}
