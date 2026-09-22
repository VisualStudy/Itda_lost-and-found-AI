import Link from 'next/link'
import { Plus } from 'lucide-react'
import { FoundCard } from '@/components/FoundCard'
import { Itlyeong } from '@/components/Itlyeong'
import { getSession } from '@/lib/auth'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'

export const dynamic = 'force-dynamic'
export default async function MyReportsPage() {
  const user = await getSession(); const reports = user ? foundReportRepository.list({ userId: user.id }) : []
  return <main className="page-shell"><div className="page-heading-row"><div><span className="eyebrow">내 활동</span><h1>내 신고</h1><p>내가 등록한 습득물과 처리 상태를 확인하세요.</p></div><Link href="/found/new" className="button button-primary"><Plus size={18}/> 습득물 등록</Link></div>{reports.length ? <div className="report-grid">{reports.map((report) => <FoundCard report={report} key={report.id}/>)}</div> : <div className="empty-state"><Itlyeong size="md"/><h3>등록한 신고가 없어요</h3><p>주운 물건을 등록하면 여기에 표시됩니다.</p><Link href="/found/new" className="button button-primary">습득물 등록하기</Link></div>}</main>
}
