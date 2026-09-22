import { Suspense } from 'react'
import { Itlyeong } from '@/components/Itlyeong'
import { AuthForm } from '@/components/AuthForm'

export default function LoginPage() { return <main className="auth-page"><section className="auth-card"><Itlyeong size="md" mood="happy"/><span className="eyebrow">다시 만나 반가워요</span><h1>로그인</h1><p>등록한 신고와 새로운 후보를 확인해 보세요.</p><Suspense><AuthForm mode="login"/></Suspense></section></main> }
