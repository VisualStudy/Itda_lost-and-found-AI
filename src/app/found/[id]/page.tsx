import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { AiStatusBadge } from '@/components/AiStatusBadge'
import { getSession } from '@/lib/auth'
import { formatKoreanDate } from '@/lib/dates'
import { categories } from '@/lib/locations'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'

export const dynamic = 'force-dynamic'
export default async function FoundDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params; const query = await searchParams
  const report = foundReportRepository.findById(id); if (!report) notFound()
  const user = await getSession(); const mine = user?.id === report.userId
  return <main className="page-shell detail-page"><Link href="/found" className="back-link"><ArrowLeft size={17}/> 습득물 목록</Link>{query.created === '1' && <div className="success-banner"><ShieldCheck/><div><strong>습득물이 안전하게 등록되었어요.</strong><p>로컬 AI 분석 작업도 대기열에 추가했습니다.</p></div></div>}<div className="detail-layout"><section className="gallery" aria-label="습득물 사진">{report.images.map((image, index) => <img src={image.publicUrl} alt={`${report.title} 습득물 사진 ${index + 1}`} key={image.id}/>)}</section><article className="detail-info"><div className="detail-badges"><span className="status-badge">{report.status === 'OPEN' ? '보관 중' : report.status}</span><AiStatusBadge status={report.aiStatus}/></div><span className="category-label">{categories[report.category] ?? '기타'}</span><h1>{report.title}</h1><p className="detail-description">{report.description}</p><dl className="detail-meta"><div><dt><MapPin/>발견 장소</dt><dd>{report.locationText}<small>{report.locationGroup}</small></dd></div><div><dt><CalendarDays/>발견 시간</dt><dd>{formatKoreanDate(report.foundAt)}<small>{report.timePrecision === 'APPROXIMATE' ? '대략적인 시간' : report.timePrecision === 'UNKNOWN' ? '시간 불확실' : '등록자가 확인한 시간'}</small></dd></div></dl><aside className="safety-card"><ShieldCheck/><div><strong>소유권 확인 전 주의해 주세요</strong><p>연락처나 신분 정보를 공개 댓글에 남기지 마세요. 잇다는 AI 분석으로 소유권을 확정하지 않습니다.</p></div></aside><div className="detail-owner"><span>등록자</span><strong>{report.finderNickname}</strong>{mine && <Link href="/my/reports">내 신고 관리</Link>}</div></article></div></main>
}
