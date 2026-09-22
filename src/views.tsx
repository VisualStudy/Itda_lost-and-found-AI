import type { Child } from 'hono/jsx'
import type { FoundReport, SessionUser } from './types'

export const categoryLabels: Record<string, string> = {
  wallet: '지갑', bag: '가방', electronics: '전자기기', keys: '열쇠', clothing: '의류',
  document: '문서·신분증', accessory: '액세서리', other: '기타',
}

type MagpiePose = 'messenger' | 'searching' | 'found' | 'scanning' | 'idle'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul',
  }).format(new Date(value))
}

export function Magpie({ pose = 'idle', large = false }: { pose?: MagpiePose; large?: boolean }) {
  const found = pose === 'found'
  const searching = pose === 'searching'
  const scanning = pose === 'scanning'
  const flying = pose === 'messenger'
  const label = {
    messenger: '소식을 전하러 날아가는 잇까치', searching: '돋보기로 분실물을 찾는 잇까치',
    found: '물건을 찾아 기뻐하는 잇까치', scanning: '사진을 살펴보는 잇까치', idle: '잇다 마스코트 잇까치',
  }[pose]
  return <svg class={`mascot magpie magpie-${pose} ${large ? 'mascot-lg' : ''}`} viewBox="0 0 220 190" role="img" aria-label={label}>
    <defs>
      <linearGradient id={`navy-${pose}`} x1="0" y1="0" x2="1" y2="1"><stop stop-color="#31405a"/><stop offset="1" stop-color="#1f2c43"/></linearGradient>
      <filter id={`soft-${pose}`}><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#142038" flood-opacity=".16"/></filter>
    </defs>
    {found && <g class="confetti"><path d="M31 36l8 10M42 22l3 12M178 31l-8 10M192 50l-12 5" stroke="#ef7b73" stroke-width="7" stroke-linecap="round"/><path d="M21 72l12 3M188 82l10-7M66 18l6 10M151 14l-5 11" stroke="#f1c75b" stroke-width="7" stroke-linecap="round"/></g>}
    <g filter={`url(#soft-${pose})`} transform={flying ? 'rotate(-8 110 95)' : ''}>
      {flying ? <><path d="M65 92C36 76 21 48 33 38c12-9 29 20 45 26" fill="#26344d" stroke="#172238" stroke-width="4"/><path d="M155 87c29-18 43-45 31-54-12-8-28 20-44 29" fill="#26344d" stroke="#172238" stroke-width="4"/></> : <><path d="M63 91c-29 5-42 27-31 39 9 10 28-2 44-17" fill="#26344d" stroke="#172238" stroke-width="4"/><path d="M157 91c29 5 42 27 31 39-9 10-28-2-44-17" fill="#26344d" stroke="#172238" stroke-width="4"/></>}
      <ellipse cx="110" cy="96" rx="60" ry="71" fill={`url(#navy-${pose})`} stroke="#172238" stroke-width="4"/>
      <path d="M64 97c8 46 28 67 47 67 21 0 40-22 46-67-13 15-29 20-47 17-18 3-33-2-46-17Z" fill="#fffdf7"/>
      <path d="M55 93c-13 6-23 22-22 38 16-1 30-9 39-22" fill="#fffdf7"/>
      <path d="M165 93c13 6 23 22 22 38-16-1-30-9-39-22" fill="#fffdf7"/>
      <ellipse cx="88" cy="72" rx="6" ry="9" fill="#121d30"/><ellipse cx="132" cy="72" rx="6" ry="9" fill="#121d30"/>
      <circle cx="73" cy="90" r="12" fill="#ef7b73" opacity=".92"/><circle cx="147" cy="90" r="12" fill="#ef7b73" opacity=".92"/>
      <path d={found ? 'M96 84l14 12 15-12-15 22Z' : 'M94 83l16-12 17 12-17 7Z'} fill="#f1c75b" stroke="#172238" stroke-width="3" stroke-linejoin="round"/>
      <path d="M76 125c30-18 58-17 78-2" fill="none" stroke="#9ed8bd" stroke-width="9" stroke-linecap="round"/>
      <rect x="145" y="119" width="42" height="32" rx="9" fill="#9ed8bd" stroke="#172238" stroke-width="3" transform="rotate(-5 166 135)"/>
      <circle cx="154" cy="129" r="3" fill="#172238"/>
      <path d="M87 162l-3 14M102 163l3 14M78 177h15M99 177h15" stroke="#e9b943" stroke-width="6" stroke-linecap="round"/>
    </g>
    {searching && <g><circle cx="48" cy="114" r="23" fill="#e9f8f3" fill-opacity=".9" stroke="#172238" stroke-width="6"/><path d="M64 131l18 20" stroke="#172238" stroke-width="8" stroke-linecap="round"/><path d="M17 163h40l-5-24H22Z" fill="#d7b98a" stroke="#172238" stroke-width="3"/><path d="M58 166l10-12 11 12 11-12" fill="none" stroke="#e9b943" stroke-width="5" stroke-linecap="round"/></g>}
    {scanning && <g><rect x="57" y="102" width="106" height="77" rx="13" fill="#f4f8fb" stroke="#172238" stroke-width="5"/><rect x="69" y="113" width="82" height="51" rx="7" fill="#edf5f8"/><circle cx="110" cy="138" r="15" fill="none" stroke="#ef7b73" stroke-width="4"/><path d="M121 149l11 11M83 123h13M83 153h13M124 123h13" stroke="#31405a" stroke-width="4" stroke-linecap="round"/></g>}
    {flying && <g transform="rotate(8 126 92)"><rect x="122" y="78" width="35" height="48" rx="5" fill="#eef7fa" stroke="#172238" stroke-width="4"/><path d="M127 88l13 11 12-11" fill="none" stroke="#78b5ce" stroke-width="3"/></g>}
    {found && <g><path d="M61 119q-18 10-25 29M159 119q18 10 25 29" stroke="#26344d" stroke-width="10" stroke-linecap="round"/><text x="110" y="24" text-anchor="middle" fill="#f1c75b" stroke="#172238" stroke-width="1.5" paint-order="stroke" font-size="25" font-weight="900">찾았다!</text></g>}
  </svg>
}

export function Page({ children, user, title = '잇다 — 분실물 연결 서비스' }: { children: Child; user?: SessionUser | null; title?: string }) {
  return <html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#223049"/><meta name="description" content="잃어버린 물건과 발견된 물건을 빠르게 연결합니다."/><link rel="manifest" href="/manifest.webmanifest"/><link rel="icon" href="/icon.svg"/><link rel="stylesheet" href="/static/styles.css"/><title>{title}</title></head><body>
    <a class="skip-link" href="#main-content">본문 바로가기</a>
    <header class="site-header"><div class="header-inner"><a href="/" class="brand-logo"><Magpie pose="messenger"/><span><strong>잇다</strong><small>잃어버린 것과 발견된 것을 잇다</small></span></a><nav aria-label="주요 메뉴"><a href="/found">습득물</a>{user ? <><a href="/my/reports">내 신고</a><a href="/profile" class="user-chip">{user.nickname}</a><form action="/logout" method="post" class="logout-form"><button class="text-button" type="submit">로그아웃</button></form></> : <><a href="/login">로그인</a><a href="/register" class="button button-small">시작하기</a></>}</nav></div></header>
    {children}<footer class="site-footer"><div class="footer-brand"><Magpie/><div><strong>잇다</strong><p>잃어버린 물건이 다시 주인에게 돌아가는 길을 만듭니다.</p></div></div><small>© 2026 ITDA · 순천대학교에서 시작된 분실물 연결 서비스</small></footer><script src="/static/app.js" defer></script>
  </body></html>
}

export function Landing() {
  return <main id="main-content"><section class="hero-section" id="hero-section"><div class="hero-copy"><span class="eyebrow"><span class="live-dot"></span> 순천대학교 분실물 찾기</span><h1>잃어버린 순간,<br/><em>잇까치가 찾아볼게요.</em></h1><p>기억나는 특징과 장소를 알려주세요. 등록된 습득물 사진과 설명을 살펴보고 확인할 만한 후보를 모아드려요.</p><div class="hero-actions"><a href="/lost/new" class="button button-primary">잃어버렸어요 <span>→</span></a><a href="/found/new" class="button button-coral">주웠어요 <span>＋</span></a></div><div class="trust-row"><span>✓ 사진 위치 정보 제거</span><span>✓ 연락처 비공개</span><span>✓ 무료 이용</span></div></div><div class="hero-visual magpie-stage"><div class="search-ring"></div><div class="mascot-halo"><Magpie pose="searching" large/></div><div class="speech-bubble">어디서 봤는지<br/><strong>꼼꼼히 찾아볼게!</strong></div><article class="floating-card card-lost"><span>찾는 물건</span><strong>검은 카드지갑</strong><small>학생회관 근처</small></article><article class="floating-card card-found"><span>새 습득물</span><strong>검정 지갑</strong><small>방금 등록됨</small></article></div></section>
    <section class="journey-strip" aria-label="서비스 이용 흐름"><div><span>1</span><strong>설명 남기기</strong><small>사진·장소·시간</small></div><i>→</i><div><span>2</span><strong>잇까치가 찾기</strong><small>비슷한 후보 모으기</small></div><i>→</i><div><span>3</span><strong>직접 확인하기</strong><small>안전하게 연결</small></div></section>
    <section class="how-section"><div class="section-heading"><span class="eyebrow">잇까치의 세 가지 약속</span><h2>빠르게 찾고, 안전하게 이어드려요</h2><p>필요한 정보만 받고, 찾는 과정은 한눈에 이해할 수 있게 만들었습니다.</p></div><div class="step-grid character-grid"><article><Magpie pose="messenger"/><small>01</small><h3>새 소식을 바로 전달</h3><p>비슷한 습득물이 등록되면 놓치지 않도록 알려드려요.</p></article><article><Magpie pose="searching"/><small>02</small><h3>여러 단서를 꼼꼼히 확인</h3><p>물건의 모습, 특징, 장소와 시간을 함께 살펴봐요.</p></article><article><Magpie pose="found"/><small>03</small><h3>찾는 순간까지 함께</h3><p>후보의 비슷한 점을 쉽게 비교하고 다음 행동을 안내해요.</p></article></div></section>
    <section class="finder-banner"><Magpie pose="scanning"/><div><span>물건을 주우셨나요?</span><h2>사진 한 장이 누군가의 하루를 되돌려줄 수 있어요.</h2><p>등록은 약 1분이면 충분합니다.</p></div><a href="/found/new" class="button button-light">습득물 등록하기 →</a></section></main>
}

export function AuthPage({ mode, error, next = '/home' }: { mode: 'login' | 'register'; error?: string; next?: string }) {
  const register = mode === 'register'
  return <main class="auth-page" id="main-content"><section class="auth-layout"><aside class="auth-story"><Magpie pose={register ? 'messenger' : 'searching'} large/><span class="eyebrow">{register ? '새로운 연결의 시작' : '다시 만나 반가워요'}</span><h2>{register ? '함께 찾으면 더 빨리 돌아옵니다.' : '등록한 물건과 새 소식을 확인하세요.'}</h2><ul><li>사진 속 위치 정보는 공개 전에 제거해요.</li><li>연락처는 공개 목록에 표시하지 않아요.</li><li>가입부터 물건 등록까지 무료예요.</li></ul></aside><section class="auth-card"><span class="auth-kicker">ITDA ACCOUNT</span><h1>{register ? '회원가입' : '로그인'}</h1><p>{register ? '간단한 정보만 입력하면 바로 시작할 수 있어요.' : '사용하던 계정으로 계속 이용하세요.'}</p><form class="auth-form" action={register ? '/register' : `/login?next=${encodeURIComponent(next)}`} method="post" data-auth-form data-mode={mode}>{register && <label>닉네임<input name="nickname" minlength={2} maxlength={20} autocomplete="nickname" required placeholder="화면에 표시할 이름"/></label>}<label>이메일<input name="email" type="email" autocomplete="email" inputmode="email" required placeholder="name@example.com"/></label><label>비밀번호<span class="password-field"><input name="password" type="password" autocomplete={register ? 'new-password' : 'current-password'} minlength={register ? 8 : 1} required placeholder={register ? '8자 이상 입력해 주세요' : '비밀번호를 입력해 주세요'}/><button type="button" data-password-toggle aria-label="비밀번호 보기">보기</button></span></label>{error && <p class="form-error" role="alert">{error}</p>}<p class="form-error" data-form-error role="alert" hidden></p><button type="submit" class="button button-primary button-full"><span>{register ? '잇다 시작하기' : '로그인'}</span> →</button><p class="auth-switch">{register ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <a href={register ? '/login' : '/register'}>{register ? '로그인' : '회원가입'}</a></p></form></section></section></main>
}

export function ReportCard({ report }: { report: FoundReport }) {
  const image = report.images[0]
  return <a class="report-card detailed" href={`/found/${report.id}`}><div class="report-image-wrap">{image ? <img src={image.thumbnailUrl} alt={`${report.title} 습득물 사진`}/> : <div class="image-placeholder"><Magpie pose="searching"/></div>}<span class="category-chip">{categoryLabels[report.category] ?? '기타'}</span></div><div><StatusBadge status={report.aiStatus}/><h3>{report.title}</h3><p><span aria-hidden="true">⌖</span> {report.locationText}</p><p><span aria-hidden="true">◷</span> {formatDate(report.foundAt)}</p><span class="card-link">자세히 보기 →</span></div></a>
}

export function StatusBadge({ status }: { status: FoundReport['aiStatus'] }) {
  const labels = { PENDING: '특징 확인 대기', PROCESSING: '특징 확인 중', READY: '특징 확인 완료', FAILED: '다시 확인 필요' }
  return <span class={`ai-badge ai-${status.toLowerCase()}`}>{labels[status]}</span>
}

export function ReportsPage({ reports, mine = false }: { reports: FoundReport[]; mine?: boolean }) {
  return <main class="page-shell" id="main-content"><div class="page-heading-row"><div><span class="eyebrow">{mine ? '내 활동' : '새로 들어온 제보'}</span><h1>{mine ? '내 신고' : '등록된 습득물'}</h1><p>{mine ? '내가 등록한 습득물과 확인 상태를 한곳에서 관리하세요.' : '장소와 시간을 확인하고 찾는 물건과 비슷한지 살펴보세요.'}</p></div><a href="/found/new" class="button button-coral">＋ 습득물 등록</a></div>{reports.length ? <div class="report-grid">{reports.map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state"><Magpie pose="searching" large/><h3>아직 등록된 습득물이 없어요</h3><p>첫 번째 제보를 남겨 누군가의 물건을 이어주세요.</p><a href="/found/new" class="button button-primary">첫 습득물 등록하기</a></div>}</main>
}

export function HomePage({ user, reports }: { user: SessionUser; reports: FoundReport[] }) {
  const ready = reports.filter((item) => item.aiStatus === 'READY').length
  return <main class="page-shell dashboard" id="main-content"><section class="welcome-panel"><div><span class="eyebrow">{user.nickname}님, 오늘도 반가워요</span><h1>어떤 도움이 필요하세요?</h1><p>잇까치와 함께 잃어버린 물건의 흔적을 찾아보세요.</p><div class="hero-actions"><a class="button button-primary" href="/lost/new">⌕ 잃어버렸어요</a><a class="button button-coral" href="/found/new">＋ 주웠어요</a></div></div><Magpie pose="messenger" large/></section><section class="dashboard-grid"><article class="status-card"><span class="status-symbol">✓</span><div><strong>특징 확인 완료</strong><p>바로 살펴볼 수 있는 습득물이에요.</p></div><span class="metric">{ready}</span></article><article class="status-card"><span class="status-symbol coral">物</span><div><strong>등록된 습득물</strong><p>최근 들어온 제보를 확인해 보세요.</p></div><span class="metric">{reports.length}</span></article></section><div class="section-title-row"><div><span class="eyebrow">최근 소식</span><h2>새로 등록된 습득물</h2></div><a href="/found">전체 보기 →</a></div>{reports.length ? <div class="report-grid">{reports.slice(0,3).map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state"><Magpie pose="searching" large/><h3>아직 새 소식이 없어요</h3><a href="/found/new" class="button button-primary">습득물 등록하기</a></div>}</main>
}

export function NewFoundPage() {
  return <main class="page-shell" id="main-content"><section class="report-form-shell"><header class="form-heading"><Magpie pose="scanning"/><span class="eyebrow">약 1분이면 완료돼요</span><h1>주운 물건을 알려주세요</h1><p>사진과 발견 장소를 남기면 찾는 사람이 확인할 수 있게 정리해 드려요.</p></header><ol class="form-progress" aria-label="등록 진행 단계"><li class="current"><span>1</span><small>사진</small></li><li><span>2</span><small>장소</small></li><li><span>3</span><small>시간</small></li><li><span>4</span><small>특징</small></li><li><span>5</span><small>확인</small></li></ol><form class="form-panel" data-found-form>
    <section class="form-step" data-step="0"><div class="step-title"><span class="step-icon">▣</span><div><h2>물건 사진을 올려주세요</h2><p>전체 모습과 눈에 띄는 부분을 1~5장 촬영해 주세요.</p></div></div><label class="upload-zone"><input id="found-images" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple/><span class="upload-icon">＋</span><strong>사진 선택 또는 촬영</strong><span>JPG, PNG, WEBP · 장당 최대 10MB</span></label><div class="preview-grid" data-preview></div><aside class="privacy-note">사진에 저장된 위치 정보는 공개 전에 자동으로 제거됩니다.</aside></section>
    <section class="form-step" data-step="1" hidden><div class="step-title"><span class="step-icon">⌖</span><div><h2>어디에서 발견했나요?</h2><p>건물과 층, 주변 시설까지 적으면 찾기 쉬워요.</p></div></div><label class="form-label">장소 그룹<select class="form-control" name="locationGroup"><option>순천대학교 학생회관</option><option>순천대학교 중앙도서관</option><option>순천대학교 공과대학</option><option>기타</option></select></label><label class="form-label">상세 장소<input class="form-control" name="locationText" required minlength={2} maxlength={120} placeholder="예: 학생회관 1층 소파 옆"/></label></section>
    <section class="form-step" data-step="2" hidden><div class="step-title"><span class="step-icon">◷</span><div><h2>언제 발견했나요?</h2><p>정확하지 않아도 괜찮아요. 기억나는 범위를 선택해 주세요.</p></div></div><label class="form-label">발견 날짜와 시간<input class="form-control" name="foundAt" type="datetime-local" required/></label><fieldset class="choice-group"><legend>시간 정확도</legend><label><input type="radio" name="timePrecision" value="EXACT" checked/><span>정확해요</span></label><label><input type="radio" name="timePrecision" value="APPROXIMATE"/><span>대략 이쯤이에요</span></label><label><input type="radio" name="timePrecision" value="UNKNOWN"/><span>잘 모르겠어요</span></label></fieldset></section>
    <section class="form-step" data-step="3" hidden><div class="step-title"><span class="step-icon">✦</span><div><h2>물건의 특징을 적어주세요</h2><p>색상, 재질, 로고나 스티커처럼 눈에 띄는 점이 좋아요.</p></div></div><label class="form-label">물건 종류<select class="form-control" name="category">{Object.entries(categoryLabels).map(([value,label]) => <option value={value}>{label}</option>)}</select></label><label class="form-label">목록에 보일 이름<input class="form-control" name="title" required minlength={2} maxlength={60} placeholder="예: 검은색 카드지갑"/></label><label class="form-label">발견 상황과 특징<textarea class="form-control" name="description" required minlength={2} maxlength={1000} placeholder="예: 소파 옆에서 발견했어요. 앞면에 작은 금색 장식이 있어요."></textarea></label></section>
    <section class="form-step" data-step="4" hidden><div class="mascot-review"><Magpie pose="scanning"/><div><span class="eyebrow">등록 전 마지막 확인</span><h2>잇까치가 보기 좋게 정리했어요</h2><p>내용이 맞는지 확인한 뒤 등록 버튼을 눌러주세요.</p></div></div><div class="review-grid" data-review></div></section><p class="form-error" data-form-error role="alert" hidden></p><footer class="form-actions"><button type="button" class="button button-secondary" data-prev hidden>← 이전</button><button type="button" class="button button-primary" data-next>다음 →</button><button type="submit" class="button button-coral" data-submit hidden>습득물 등록하기 ✓</button></footer>
  </form></section></main>
}

export function DetailPage({ report, mine }: { report: FoundReport; mine: boolean }) {
  return <main class="page-shell detail-page" id="main-content"><a href="/found" class="back-link">← 습득물 목록</a><div class="detail-layout"><section class="gallery">{report.images.map((image, index) => <img src={image.publicUrl} alt={`${report.title} 습득물 사진 ${index + 1}`}/>)}</section><article class="detail-info"><div class="detail-badges"><span class="status-badge">보관 중</span><StatusBadge status={report.aiStatus}/></div><span class="category-label">{categoryLabels[report.category]}</span><h1>{report.title}</h1><p class="detail-description">{report.description}</p><dl class="detail-meta"><div><dt>발견 장소</dt><dd>{report.locationText}<small>{report.locationGroup}</small></dd></div><div><dt>발견 시간</dt><dd>{formatDate(report.foundAt)}<small>{report.timePrecision === 'APPROXIMATE' ? '대략적인 시간' : '등록자가 확인한 시간'}</small></dd></div></dl>{report.aiFeatures && <section class="ai-result"><div class="result-heading"><Magpie pose="found"/><div><span class="eyebrow">사진과 설명에서 확인한 정보</span><h2>이런 특징이 보여요</h2></div></div><div class="tag-row"><span>{categoryLabels[String(report.aiFeatures.detectedAttributes.category)] ?? '기타'}</span>{(report.aiFeatures.detectedAttributes.colors as string[] ?? []).map((color) => <span>{color}</span>)}{(report.aiFeatures.detectedAttributes.features as string[] ?? []).map((feature) => <span>{feature}</span>)}</div></section>}<aside class="safety-card"><strong>안전하게 확인해 주세요</strong><p>연락처나 신분증 번호는 공개 화면에 남기지 말고, 본인만 아는 특징으로 물건을 확인하세요.</p></aside><div class="detail-owner"><span>등록자</span><strong>{report.finderNickname}</strong>{mine && <a href="/my/reports">내 신고 관리</a>}</div></article></div></main>
}

export function ProfilePage({ user }: { user: SessionUser }) {
  return <main class="page-shell narrow-page" id="main-content"><section class="profile-card"><Magpie pose="messenger" large/><span class="eyebrow">내 프로필</span><h1>{user.nickname}</h1><dl><div><dt>닉네임</dt><dd>{user.nickname}</dd></div><div><dt>이메일</dt><dd>{user.email}</dd></div></dl><p>등록한 물건과 새 소식은 내 신고 메뉴에서 확인할 수 있어요.</p></section></main>
}

export function ComingSoon() {
  return <main class="auth-page" id="main-content"><section class="auth-card coming-card"><Magpie pose="searching" large/><span class="eyebrow">곧 열릴 기능</span><h1>분실 신고를 준비하고 있어요</h1><p>기억나는 내용을 편하게 적으면 잇까치가 확인할 후보를 모아드릴 예정입니다.</p><a class="button button-primary" href="/home">홈으로 돌아가기</a></section></main>
}
