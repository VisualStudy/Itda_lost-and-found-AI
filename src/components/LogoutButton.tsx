'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  return <button className="text-button" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh() }}>로그아웃</button>
}
