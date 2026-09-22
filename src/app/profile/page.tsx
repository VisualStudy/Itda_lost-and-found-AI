import { Mail, UserRound } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { Itlyeong } from '@/components/Itlyeong'

export default async function ProfilePage() {
  const user = await getSession()
  return <main className="page-shell narrow-page"><div className="profile-card"><Itlyeong size="md" mood="happy"/><span className="eyebrow">내 프로필</span><h1>{user?.nickname}</h1><dl><div><dt><UserRound/>닉네임</dt><dd>{user?.nickname}</dd></div><div><dt><Mail/>이메일</dt><dd>{user?.email}</dd></div></dl><p>프로필 수정과 알림 설정은 후속 Phase에서 제공할 예정이에요.</p></div></main>
}
