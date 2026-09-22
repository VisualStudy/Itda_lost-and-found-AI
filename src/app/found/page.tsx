import Link from 'next/link'
import { Plus } from 'lucide-react'
import { FoundCard } from '@/components/FoundCard'
import { Itlyeong } from '@/components/Itlyeong'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'

export const dynamic = 'force-dynamic'
export const metadata = { title: '습득물 목록' }
export default function FoundListPage() {
  const reports = foundReportRepository.list()
  return <main className="page-shell"><div className="page-heading-row"><div><span className="eyebrow">따뜻한 제보들</span><h1>등록된 습득물</h1><p>개인정보를 보호하기 위해 공개 가능한 정보만 보여드려요.</p></div><Link href="/found/new" className="button button-primary"><Plus size={18}/> 습득물 등록</Link></div>{reports.length ? <div className="report-grid">{reports.map((report) => <FoundCard report={report} key={report.id}/>)}</div> : <div className="empty-state"><Itlyeong size="md"/><h3>아직 등록된 습득물이 없어요</h3><p>물건을 주우셨다면 안전한 연결을 시작해 주세요.</p><Link href="/found/new" className="button button-primary">첫 습득물 등록하기</Link></div>}</main>
}
