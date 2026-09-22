import type { Child } from 'hono/jsx'
import type { FoundReport, SessionUser } from './types'

export const categoryLabels: Record<string, string> = {
  wallet: '지갑', bag: '가방', electronics: '전자기기', keys: '열쇠', clothing: '의류',
  document: '문서·신분증', accessory: '액세서리', other: '기타',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date(value))
}

export function Mascot({ large = false, searching = false }: { large?: boolean; searching?: boolean }) {
  return <svg class={`mascot ${large ? 'mascot-lg' : ''}`} viewBox="0 0 160 160" role="img" aria-label="산신령 AI 마스코트 잇령이">
    <defs><linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#436A4A"/><stop offset="1" stop-color="#234B37"/></linearGradient></defs>
    <path d="M27 124c15-28 30-40 53-40s40 13 53 40c-11 15-29 24-53 24s-42-9-53-24Z" fill="url(#robe)"/><circle cx="80" cy="67" r="42" fill="#FFF7E8" stroke="#244C37" stroke-width="3"/>
    <path d="M54 36c2-17 23-26 38-15 9 7 14 16 14 27-14-10-37-10-52-2Z" fill="#315A41"/><path d="M91 23c8-12 18-15 27-10-3 10-10 18-22 20" fill="#6F8D58" stroke="#244C37" stroke-width="2"/>
    <ellipse cx="66" cy="64" rx="4" ry="4" fill="#26372C"/><ellipse cx="95" cy="64" rx="4" ry="4" fill="#26372C"/><path d="M71 76q9 9 18 0" fill="none" stroke="#9B6650" stroke-width="3" stroke-linecap="round"/>
    <path d="M53 77c0 28 14 38 27 42 15-5 28-16 28-42-8 10-17 11-27 3-10 8-20 7-28-3Z" fill="#F4F2E9" stroke="#D9D9CE" stroke-width="2"/><path d="M110 105c19-3 28 0 32 9-9 2-16 7-21 14" fill="none" stroke="#FFD26A" stroke-width="4" stroke-linecap="round"/>
    {searching && <path d="M24 55q-14 13 0 26M136 55q14 13 0 26" fill="none" stroke="#89A879" stroke-width="3" stroke-linecap="round"/>}
  </svg>
}

export function Page({ children, user, title = '잇다 — AI 분실물 매칭' }: { children: Child; user?: SessionUser | null; title?: string }) {
  return <html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#274d37"/><meta name="description" content="잃어버린 것과 발견된 것을 AI로 잇다."/><link rel="manifest" href="/manifest.webmanifest"/><link rel="icon" href="/icon.svg"/><link rel="stylesheet" href="/static/styles.css"/><title>{title}</title></head><body>
    <header class="site-header"><div class="header-inner"><a href="/" class="brand-logo"><Mascot/><span><strong>잇다</strong><small>잃어버린 것과 발견된 것을 잇다</small></span></a><nav aria-label="주요 메뉴"><a href="/found">습득물</a>{user ? <><a href="/my/reports">내 신고</a><a href="/profile" class="user-chip">{user.nickname}</a><button class="text-button" data-logout>로그아웃</button></> : <><a href="/login">로그인</a><a href="/register" class="button button-small">시작하기</a></>}</nav></div></header>
    {children}<footer class="site-footer"><p>잃어버린 것과 발견된 것을 따뜻하게 잇습니다.</p><small>© 2026 Itda. AI는 소유권을 판단하지 않아요.</small></footer><script src="/static/app.js" defer></script>
  </body></html>
}

export function Landing() {
  return <main><section class="hero-section" id="hero-section"><div class="hero-copy"><span class="eyebrow">사진·글·장소·시간을 함께 살펴봐요</span><h1>잃어버린 마음까지<br/><em>다시 이어지도록.</em></h1><p>물건의 특징을 기억나는 대로 알려주세요. 잇령이가 등록된 습득물 중 비슷한 후보를 차분히 찾아드려요.</p><div class="hero-actions"><a href="/register" class="button button-primary">무료로 시작하기 →</a><a href="/found" class="button button-secondary">등록된 습득물 보기</a></div><div class="trust-row">✓ 외부 유료 AI 없이 · 개인정보는 안전하게 · AI는 후보만 제안</div></div><div class="hero-visual"><div class="mascot-halo"><Mascot large/></div><div class="speech-bubble">비슷한 물건을<br/><strong>함께 찾아볼게요!</strong></div><article class="floating-card card-lost"><span>잃어버린 물건</span><strong>검은 카드지갑</strong><small>학생회관 근처</small></article><article class="floating-card card-found"><span>발견된 물건</span><strong>검정 지갑</strong><small>사진 2장</small></article></div></section><section class="how-section"><div class="section-heading"><span class="eyebrow">간단한 3단계</span><h2>설명하면, 잇령이가 이어드려요</h2><p>확정하지 않고 확인할 만한 후보와 그 이유를 투명하게 보여드려요.</p></div><div class="step-grid"><article><span class="step-icon">1</span><h3>기억나는 만큼 설명</h3><p>색상, 모양, 장소와 시간을 자연스럽게 적어요.</p></article><article><span class="step-icon">2</span><h3>여러 단서를 함께 비교</h3><p>사진과 글, 장소, 시간을 종합해 비슷한 후보를 찾아요.</p></article><article><span class="step-icon">3</span><h3>직접 확인하고 연결</h3><p>일치 이유를 보고 소유권 확인 요청을 보낼 수 있어요.</p></article></div></section><section class="finder-banner"><Mascot/><div><span>물건을 주우셨나요?</span><h2>작은 등록이 누군가의 하루를 되돌려줘요.</h2></div><a href="/found/new" class="button button-light">습득물 등록하기 →</a></section></main>
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register'
  return <main class="auth-page"><section class="auth-card"><Mascot/><span class="eyebrow">{register ? '따뜻한 연결의 시작' : '다시 만나 반가워요'}</span><h1>{register ? '회원가입' : '로그인'}</h1><p>{register ? '간단히 가입하고 잃어버린 것과 발견된 것을 이어보세요.' : '등록한 신고와 새로운 후보를 확인해 보세요.'}</p><form class="auth-form" data-auth-form data-mode={mode}>{register && <label>닉네임<input name="nickname" minlength={2} maxlength={20} required placeholder="잇다에서 사용할 이름"/></label>}<label>이메일<input name="email" type="email" autocomplete="email" required placeholder="name@example.com"/></label><label>비밀번호<input name="password" type="password" autocomplete={register ? 'new-password' : 'current-password'} minlength={register ? 8 : 1} required placeholder={register ? '8자 이상 입력해 주세요' : '비밀번호를 입력해 주세요'}/></label><p class="form-error" data-form-error hidden></p><button class="button button-primary button-full">{register ? '잇다 시작하기' : '로그인'} →</button><p class="auth-switch">{register ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <a href={register ? '/login' : '/register'}>{register ? '로그인' : '회원가입'}</a></p></form></section></main>
}

export function ReportCard({ report }: { report: FoundReport }) {
  const image = report.images[0]
  return <a class="report-card detailed" href={`/found/${report.id}`}><div class="report-image-wrap">{image ? <img src={image.thumbnailUrl} alt={`${report.title} 습득물 사진`}/> : <div class="image-placeholder"/>}<span class="category-chip">{categoryLabels[report.category] ?? '기타'}</span></div><div><AiBadge status={report.aiStatus}/><h3>{report.title}</h3><p>⌖ {report.locationText}</p><p>◷ {formatDate(report.foundAt)}</p></div></a>
}

export function AiBadge({ status }: { status: FoundReport['aiStatus'] }) {
  const labels = { PENDING: 'AI 분석 대기', PROCESSING: 'AI 분석 중', READY: 'AI 특징 준비됨', FAILED: 'AI 분석 재시도 필요' }
  return <span class={`ai-badge ai-${status.toLowerCase()}`}>{labels[status]}</span>
}

export function ReportsPage({ reports, mine = false }: { reports: FoundReport[]; mine?: boolean }) {
  return <main class="page-shell"><div class="page-heading-row"><div><span class="eyebrow">{mine ? '내 활동' : '따뜻한 제보들'}</span><h1>{mine ? '내 신고' : '등록된 습득물'}</h1><p>{mine ? '내가 등록한 습득물과 AI 처리 상태를 확인하세요.' : '개인정보를 보호하기 위해 공개 가능한 정보만 보여드려요.'}</p></div><a href="/found/new" class="button button-primary">＋ 습득물 등록</a></div>{reports.length ? <div class="report-grid">{reports.map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state"><Mascot/><h3>아직 등록된 습득물이 없어요</h3><p>물건을 주우셨다면 안전한 연결을 시작해 주세요.</p><a href="/found/new" class="button button-primary">첫 습득물 등록하기</a></div>}</main>
}

export function HomePage({ user, reports }: { user: SessionUser; reports: FoundReport[] }) {
  return <main class="page-shell dashboard"><section class="welcome-panel"><div><span class="eyebrow">{user.nickname}님, 안녕하세요</span><h1>무엇을 찾고 계신가요?</h1><p>잇령이가 기억의 조각들을 이어볼게요.</p><div class="hero-actions"><a class="button button-primary" href="/lost/new">⌕ 잃어버렸어요</a><a class="button button-secondary" href="/found/new">▣ 주웠어요</a></div></div><Mascot large/></section><section class="dashboard-grid"><article class="status-card"><span class="step-icon">AI</span><div><strong>AI 분석 준비</strong><p>브라우저 로컬 특징 추출과 D1 작업 처리가 동작해요.</p></div><span class="metric">{reports.filter((item) => item.aiStatus === 'READY').length}</span></article><article class="status-card"><span class="step-icon">物</span><div><strong>등록된 습득물</strong><p>최근 등록된 물건을 살펴보세요.</p></div><span class="metric">{reports.length}</span></article></section><div class="section-title-row"><div><span class="eyebrow">최근 소식</span><h2>새로 등록된 습득물</h2></div><a href="/found">전체 보기 →</a></div>{reports.length ? <div class="report-grid">{reports.slice(0,3).map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state"><Mascot/><h3>아직 등록된 습득물이 없어요</h3><a href="/found/new" class="button button-primary">습득물 등록하기</a></div>}</main>
}

export function NewFoundPage() {
  return <main class="page-shell"><section class="report-form-shell"><header class="form-heading"><span class="eyebrow">습득물 등록</span><h1>주운 물건을 알려주세요</h1><p>사진은 기기에서 개인정보를 제거하고 특징을 추출한 뒤 안전하게 전송해요.</p></header><ol class="form-progress"><li class="current"><span>1</span><small>사진</small></li><li><span>2</span><small>장소</small></li><li><span>3</span><small>시간</small></li><li><span>4</span><small>설명</small></li><li><span>5</span><small>확인</small></li></ol><form class="form-panel" data-found-form>
    <section class="form-step" data-step="0"><div class="step-title"><span class="step-icon">▣</span><div><h2>물건 사진을 올려주세요</h2><p>전체 모습과 특징이 잘 보이도록 1~5장을 올려주세요.</p></div></div><label class="upload-zone"><input id="found-images" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple/><strong>사진 선택 또는 촬영</strong><span>JPG, PNG, WEBP · 장당 최대 10MB</span></label><div class="preview-grid" data-preview></div><aside class="privacy-note">공개본은 브라우저에서 새 이미지로 재생성하여 EXIF와 GPS를 제거합니다.</aside></section>
    <section class="form-step" data-step="1" hidden><div class="step-title"><span class="step-icon">⌖</span><div><h2>어디에서 발견했나요?</h2><p>건물과 층, 주변 시설까지 적어주세요.</p></div></div><label class="form-label">장소 그룹<select class="form-control" name="locationGroup"><option>순천대학교 학생회관</option><option>순천대학교 중앙도서관</option><option>순천대학교 공과대학</option><option>기타</option></select></label><label class="form-label">상세 장소<input class="form-control" name="locationText" required minlength={2} maxlength={120} placeholder="예: 학생회관 1층 소파 옆"/></label></section>
    <section class="form-step" data-step="2" hidden><div class="step-title"><span class="step-icon">◷</span><div><h2>언제 발견했나요?</h2><p>정확하지 않아도 괜찮아요.</p></div></div><label class="form-label">발견 날짜와 시간<input class="form-control" name="foundAt" type="datetime-local" required/></label><fieldset class="choice-group"><legend>시간 정확도</legend><label><input type="radio" name="timePrecision" value="EXACT" checked/><span>정확해요</span></label><label><input type="radio" name="timePrecision" value="APPROXIMATE"/><span>대략 이쯤이에요</span></label><label><input type="radio" name="timePrecision" value="UNKNOWN"/><span>잘 모르겠어요</span></label></fieldset></section>
    <section class="form-step" data-step="3" hidden><div class="step-title"><span class="step-icon">AI</span><div><h2>물건의 특징을 적어주세요</h2><p>종류, 색상, 재질, 눈에 띄는 장식을 알려주세요.</p></div></div><label class="form-label">물건 종류<select class="form-control" name="category">{Object.entries(categoryLabels).map(([value,label]) => <option value={value}>{label}</option>)}</select></label><label class="form-label">목록에 보일 이름<input class="form-control" name="title" required minlength={2} maxlength={60} placeholder="예: 검은색 카드지갑"/></label><label class="form-label">발견 상황과 특징<textarea class="form-control" name="description" required minlength={2} maxlength={1000} placeholder="예: 소파 옆에서 발견했어요. 앞면에 작은 금색 장식이 있어요."></textarea></label></section>
    <section class="form-step" data-step="4" hidden><div class="mascot-review"><Mascot searching/><div><span class="eyebrow">등록 전 확인</span><h2>잇령이가 분석할 준비를 마쳤어요</h2><p>외부 AI API 없이 브라우저 시각 특징과 규칙 기반 텍스트 특징을 저장합니다.</p></div></div><div class="review-grid" data-review></div></section><p class="form-error" data-form-error hidden></p><footer class="form-actions"><button type="button" class="button button-secondary" data-prev hidden>← 이전</button><button type="button" class="button button-primary" data-next>다음 →</button><button type="submit" class="button button-primary" data-submit hidden>습득물 등록하기 ✓</button></footer>
  </form></section></main>
}

export function DetailPage({ report, mine }: { report: FoundReport; mine: boolean }) {
  return <main class="page-shell detail-page"><a href="/found" class="back-link">← 습득물 목록</a><div class="detail-layout"><section class="gallery">{report.images.map((image, index) => <img src={image.publicUrl} alt={`${report.title} 습득물 사진 ${index + 1}`}/>)}</section><article class="detail-info"><div class="detail-badges"><span class="status-badge">보관 중</span><AiBadge status={report.aiStatus}/></div><span class="category-label">{categoryLabels[report.category]}</span><h1>{report.title}</h1><p class="detail-description">{report.description}</p><dl class="detail-meta"><div><dt>발견 장소</dt><dd>{report.locationText}<small>{report.locationGroup}</small></dd></div><div><dt>발견 시간</dt><dd>{formatDate(report.foundAt)}<small>{report.timePrecision === 'APPROXIMATE' ? '대략적인 시간' : '등록자가 확인한 시간'}</small></dd></div></dl>{report.aiFeatures && <section class="ai-result"><span class="eyebrow">로컬 AI 분석</span><h2>잇령이가 찾은 특징</h2><div class="tag-row"><span>{categoryLabels[String(report.aiFeatures.detectedAttributes.category)] ?? '기타'}</span>{(report.aiFeatures.detectedAttributes.colors as string[] ?? []).map((color) => <span>{color}</span>)}{(report.aiFeatures.detectedAttributes.features as string[] ?? []).map((feature) => <span>{feature}</span>)}</div><small>{report.aiFeatures.modelVersion}</small></section>}<aside class="safety-card"><strong>소유권 확인 전 주의해 주세요</strong><p>연락처나 신분 정보를 공개하지 마세요. 잇다는 AI 분석으로 소유권을 확정하지 않습니다.</p></aside><div class="detail-owner"><span>등록자</span><strong>{report.finderNickname}</strong>{mine && <a href="/my/reports">내 신고 관리</a>}</div></article></div></main>
}

export function ProfilePage({ user }: { user: SessionUser }) {
  return <main class="page-shell narrow-page"><section class="profile-card"><Mascot/><span class="eyebrow">내 프로필</span><h1>{user.nickname}</h1><dl><div><dt>닉네임</dt><dd>{user.nickname}</dd></div><div><dt>이메일</dt><dd>{user.email}</dd></div></dl><p>Genspark Hosted D1에 안전하게 저장된 계정입니다.</p></section></main>
}

export function ComingSoon() { return <main class="auth-page"><section class="auth-card"><Mascot large searching/><span class="eyebrow">다음 Vertical Slice</span><h1>분실 신고를 준비 중이에요</h1><p>자연어 설명을 구조화하고 습득물과 비교하는 흐름이 다음 단계에서 연결됩니다.</p><a class="button button-primary" href="/home">홈으로 돌아가기</a></section></main> }
