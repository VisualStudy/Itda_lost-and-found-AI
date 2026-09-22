import Link from 'next/link'
import { ArrowRight, Bell, PackageOpen, Search } from 'lucide-react'
import { Itlyeong } from '@/components/Itlyeong'
import { getSession } from '@/lib/auth'
import { foundReportRepository } from '@/lib/repositories/found-report-repository'

export default async function HomePage() {
  const user = await getSession(); const recent = foundReportRepository.list({ limit: 3 })
  return <main className="page-shell dashboard"><section className="welcome-panel"><div><span className="eyebrow">{user?.nickname}님, 안녕하세요</span><h1>무엇을 찾고 계신가요?</h1><p>잇령이가 기억의 조각들을 이어볼게요.</p><div className="hero-actions"><Link className="button button-primary" href="/lost/new"><Search size={19}/> 잃어버렸어요</Link><Link className="button button-secondary" href="/found/new"><PackageOpen size={19}/> 주웠어요</Link></div></div><Itlyeong size="lg" mood="happy"/></section><section className="dashboard-grid"><article className="status-card"><Bell/><div><strong>새로운 후보</strong><p>분실 신고 기능은 Phase 4에서 연결됩니다.</p></div><span className="metric">0</span></article><article className="status-card"><PackageOpen/><div><strong>등록된 습득물</strong><p>최근 등록된 물건을 살펴보세요.</p></div><span className="metric">{recent.length}</span></article></section><div className="section-title-row"><div><span className="eyebrow">최근 소식</span><h2>새로 등록된 습득물</h2></div><Link href="/found">전체 보기 <ArrowRight size={16}/></Link></div>{recent.length ? <div className="report-grid">{recent.map((item) => <Link className="report-card" href={`/found/${item.id}`} key={item.id}>{item.images[0] && <img src={item.images[0].thumbnailUrl} alt=""/>}<div><span className="status-badge">보관 중</span><h3>{item.title}</h3><p>{item.locationText}</p></div></Link>)}</div> : <div className="empty-state"><Itlyeong size="md"/><h3>아직 등록된 습득물이 없어요</h3><p>첫 번째 따뜻한 연결을 시작해 주세요.</p><Link href="/found/new" className="button button-primary">습득물 등록하기</Link></div>}</main>
}
