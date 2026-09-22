import Link from 'next/link'
import { Itlyeong } from '@/components/Itlyeong'

export default function NotFound() { return <main className="auth-page"><section className="auth-card"><Itlyeong size="lg"/><span className="eyebrow">길을 잠시 잃었어요</span><h1>페이지를 찾을 수 없어요</h1><p>주소를 다시 확인하거나 홈으로 돌아가 주세요.</p><Link className="button button-primary" href="/">홈으로 돌아가기</Link></section></main> }
