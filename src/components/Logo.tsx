import Link from 'next/link'
import { Itlyeong } from './Itlyeong'

export function Logo() {
  return (
    <Link href="/" className="brand-logo" aria-label="잇다 홈">
      <Itlyeong size="sm" />
      <span><strong>잇다</strong><small>잃어버린 것과 발견된 것을 잇다</small></span>
    </Link>
  )
}
