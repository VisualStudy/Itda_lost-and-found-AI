import { Suspense } from 'react'
import { Itlyeong } from '@/components/Itlyeong'
import { AuthForm } from '@/components/AuthForm'

export default function RegisterPage() { return <main className="auth-page"><section className="auth-card"><Itlyeong size="md"/><span className="eyebrow">따뜻한 연결의 시작</span><h1>회원가입</h1><p>간단히 가입하고 잃어버린 것과 발견된 것을 이어보세요.</p><Suspense><AuthForm mode="register"/></Suspense></section></main> }
