import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { Logo } from './Logo'
import { LogoutButton } from './LogoutButton'

export async function Header() {
  const user = await getSession()
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav aria-label="주요 메뉴">
          <Link href="/found">습득물</Link>
          {user ? (
            <>
              <Link href="/my/reports">내 신고</Link>
              <Link href="/profile" className="user-chip">{user.nickname}</Link>
              <LogoutButton />
            </>
          ) : (
            <><Link href="/login">로그인</Link><Link href="/register" className="button button-small">시작하기</Link></>
          )}
        </nav>
      </div>
    </header>
  )
}
