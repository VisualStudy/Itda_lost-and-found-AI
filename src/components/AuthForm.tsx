'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter(); const search = useSearchParams()
  const [show, setShow] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const isRegister = mode === 'register'
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true)
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? '요청을 처리하지 못했어요.')
      router.push(search.get('next') || '/home'); router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : '다시 시도해 주세요.') } finally { setLoading(false) }
  }
  return <form className="auth-form" onSubmit={submit}>
    {isRegister && <label>닉네임<input name="nickname" autoComplete="nickname" minLength={2} maxLength={20} required placeholder="잇다에서 사용할 이름"/></label>}
    <label>이메일<input name="email" type="email" autoComplete="email" required placeholder="name@example.com"/></label>
    <label>비밀번호<span className="password-field"><input name="password" type={show ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : 1} required placeholder={isRegister ? '8자 이상 입력해 주세요' : '비밀번호를 입력해 주세요'}/><button type="button" aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShow(!show)}>{show ? <EyeOff/> : <Eye/>}</button></span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary button-full" disabled={loading}>{loading ? '잠시만요…' : isRegister ? '잇다 시작하기' : '로그인'} <ArrowRight size={18}/></button>
    <p className="auth-switch">{isRegister ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <Link href={isRegister ? '/login' : '/register'}>{isRegister ? '로그인' : '회원가입'}</Link></p>
  </form>
}
