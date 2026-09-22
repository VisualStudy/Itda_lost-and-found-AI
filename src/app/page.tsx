import Link from 'next/link'
import { ArrowRight, Camera, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Itlyeong } from '@/components/Itlyeong'

export default function LandingPage() {
  return <main>
    <section className="hero-section" id="hero-section">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={16}/> 사진·글·장소·시간을 함께 살펴봐요</span><h1>잃어버린 마음까지<br/><em>다시 이어지도록.</em></h1><p>물건의 특징을 기억나는 대로 알려주세요. 잇령이가 등록된 습득물 중 비슷한 후보를 차분히 찾아드려요.</p><div className="hero-actions"><Link href="/register" className="button button-primary">무료로 시작하기 <ArrowRight size={18}/></Link><Link href="/found" className="button button-secondary">등록된 습득물 보기</Link></div><div className="trust-row"><ShieldCheck size={18}/><span>외부 유료 AI 없이 · 개인정보는 안전하게 · AI는 후보만 제안</span></div></div>
      <div className="hero-visual"><div className="thread thread-one"/><div className="mascot-halo"><Itlyeong size="lg" mood="happy"/></div><div className="speech-bubble">비슷한 물건을<br/><strong>함께 찾아볼게요!</strong></div><article className="floating-card card-lost"><span>잃어버린 물건</span><strong>검은 카드지갑</strong><small><MapPin size={13}/> 학생회관 근처</small></article><article className="floating-card card-found"><span>발견된 물건</span><strong>검정 지갑</strong><small><Camera size={13}/> 사진 2장</small></article></div>
    </section>
    <section className="how-section" aria-labelledby="how-title"><div className="section-heading"><span className="eyebrow">간단한 3단계</span><h2 id="how-title">설명하면, 잇령이가 이어드려요</h2><p>확정하지 않고, 확인할 만한 후보와 그 이유를 투명하게 보여드려요.</p></div><div className="step-grid"><article><span className="step-icon"><Search/></span><small>01</small><h3>기억나는 만큼 설명</h3><p>색상, 모양, 장소와 시간을 자연스럽게 적어요.</p></article><article><span className="step-icon"><Sparkles/></span><small>02</small><h3>여러 단서를 함께 비교</h3><p>사진과 글, 장소, 시간을 종합해 비슷한 후보를 찾아요.</p></article><article><span className="step-icon"><ShieldCheck/></span><small>03</small><h3>직접 확인하고 연결</h3><p>일치 이유를 보고 소유권 확인 요청을 보낼 수 있어요.</p></article></div></section>
    <section className="finder-banner"><div><Itlyeong size="md"/></div><div><span>물건을 주우셨나요?</span><h2>작은 등록이 누군가의 하루를 되돌려줘요.</h2></div><Link href="/found/new" className="button button-light">습득물 등록하기 <ArrowRight size={18}/></Link></section>
  </main>
}
