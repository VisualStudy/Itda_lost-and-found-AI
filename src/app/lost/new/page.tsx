import Link from 'next/link'
import { Itlyeong } from '@/components/Itlyeong'

export default function LostComingSoonPage() { return <main className="auth-page"><section className="auth-card"><Itlyeong size="lg" mood="searching"/><span className="eyebrow">Phase 4 예정</span><h1>분실 신고를 준비 중이에요</h1><p>자연어 설명을 구조화하고 습득물과 비교하는 흐름이 다음 단계에서 연결됩니다.</p><Link className="button button-primary" href="/home">홈으로 돌아가기</Link></section></main> }
