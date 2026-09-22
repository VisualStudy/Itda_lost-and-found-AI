import type { Child } from 'hono/jsx'
import { Itchi, ItchiSays } from './itchi'
import type { CandidateMatch, FoundReport, LostReport, SessionUser } from './types'

export const categoryLabels: Record<string, string> = {
  wallet: '지갑', bag: '가방', electronics: '전자기기', keys: '열쇠', clothing: '의류',
  document: '문서·신분증', accessory: '액세서리', other: '기타',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul',
  }).format(new Date(value))
}

function Brand() {
  return <a href="/" class="brand-logo" aria-label="잇다 홈">
    <span class="brand-mark">잇</span>
    <span><strong>잇다</strong><small>Itda · 잇치가 이어드려요</small></span>
  </a>
}

function MobileNav({ user }: { user?: SessionUser | null }) {
  return <nav class="mobile-nav" aria-label="모바일 메뉴">
    <a href="/home"><span>⌂</span>홈</a>
    <a href="/found"><span>⌕</span>습득물</a>
    <a href="/lost/new"><span>◉</span>분실물</a>
    <a href="/matches"><span>▣</span>매칭</a>
    <a href={user ? '/profile' : '/login'}><span>●</span>{user ? '나' : '로그인'}</a>
  </nav>
}

export function Page({ children, user, title = '잇다 — 분실물 연결 서비스' }: { children: Child; user?: SessionUser | null; title?: string }) {
  return <html lang="ko"><head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="theme-color" content="#262B48"/><meta name="description" content="잃어버린 물건과 발견된 물건을 다시 이어드립니다."/>
    <link rel="manifest" href="/manifest.webmanifest"/><link rel="icon" href="/icon.svg"/><link rel="stylesheet" href="/static/styles.css"/>
    <title>{title}</title>
  </head><body>
    <a class="skip-link" href="#main-content">본문 바로가기</a>
    <header class="site-header"><div class="header-inner"><Brand/><nav class="desktop-nav" aria-label="주요 메뉴">
      <a href="/home">홈</a><a href="/found">주운 물건</a><a href="/lost/new">잃어버린 물건</a>
      {user ? <><a href="/matches">매칭</a><a href="/my/reports">내 신고</a><a href="/profile" class="user-chip">{user.nickname}</a><form action="/logout" method="post" class="logout-form"><button class="text-button" type="submit">로그아웃</button></form></> : <><a href="/login">로그인</a><a href="/register" class="button button-accent button-small">시작하기</a></>}
    </nav></div></header>
    {children}
    <footer class="site-footer"><div class="footer-brand"><Itchi pose="wink" size={70}/><div><strong>잇다 · Itda</strong><p>잃어버린 것과 다시 이어지는 곳</p></div></div><small>© 2026 ITDA · 어디서든 함께 찾는 분실물 연결 서비스</small></footer>
    <MobileNav user={user}/><script src="/static/app.js" defer></script>
  </body></html>
}

export function Landing({ reports = [] }: { reports?: FoundReport[] }) {
  return <main id="main-content">
    <section class="hero-section handoff-hero" id="hero-section">
      <div class="hero-copy">
        <span class="hero-chip">🐦 어디서든 함께 찾는 분실물 서비스</span>
        <h1>잃어버린 마음,<br/><em>잇치</em>가 이어드릴게요</h1>
        <p>사진 한 장, 짧은 설명 한 줄이면 충분해요.<br/>주변에 등록된 물건 중 닮은 후보를 모아 알려드려요.</p>
        <div class="hero-actions"><a href="/lost/new" class="button button-accent button-large">＋ 잃어버렸어요</a><a href="/found/new" class="button button-secondary button-large">주웠어요</a></div>
        <div class="trust-row"><span>✓ 사진 위치 정보 제거</span><span>✓ 연락처 비공개</span><span>✓ 무료 이용</span></div>
      </div>
      <div class="hero-itchi">
        <ItchiSays tone="mint">오늘도 잘 부탁드려요!</ItchiSays>
        <Itchi pose="greet" size={290}/>
      </div>
    </section>

    <section class="how-section handoff-how">
      <div class="section-heading"><span class="eyebrow">이렇게 이어져요</span><h2>말해주면, 잇치가 훑어봐요</h2><p>복잡한 검색 대신 기억나는 것부터 편하게 알려주세요.</p></div>
      <div class="step-grid handoff-steps">
        <article class="step-mint"><div class="step-top"><span class="step-number">1</span><Itchi pose="wink" size={92}/></div><h3>말해주세요</h3><p>“어제 카페에 검정 지갑을 두고 왔어요.” 이렇게만 이야기해도 돼요.</p></article>
        <article class="step-yolk"><div class="step-top"><span class="step-number">2</span><Itchi pose="search" size={92}/></div><h3>잇치가 훑어봐요</h3><p>등록된 물건의 색, 모양, 위치와 시간을 함께 살펴봐요.</p></article>
        <article class="step-coral"><div class="step-top"><span class="step-number">3</span><Itchi pose="found" size={92}/></div><h3>다시 이어져요</h3><p>닮은 후보를 확인하고 실제 주인인지 직접 확인할 수 있어요.</p></article>
      </div>
    </section>

    <section class="recent-section">
      <div class="section-title-row"><div><span class="eyebrow">새로 들어온 제보</span><h2>방금 도착한 습득물</h2></div><a href="/found">전부 보기 →</a></div>
      {reports.length ? <div class="report-grid landing-report-grid">{reports.slice(0, 4).map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state compact"><Itchi pose="sleep" size={110}/><h3>아직 도착한 제보가 없어요</h3><p>주운 물건이 있다면 첫 소식을 남겨주세요.</p><a class="button button-accent" href="/found/new">습득물 등록하기</a></div>}
    </section>
  </main>
}

export function AuthPage({ mode, error, next = '/home' }: { mode: 'login' | 'register'; error?: string; next?: string }) {
  const register = mode === 'register'
  const idleMessage = register ? '함께하게 되어 반가워요!' : '다시 오셨네요!'
  return <main class="auth-page" id="main-content"><section class="auth-layout handoff-auth">
    <aside class="auth-story">
      <Brand/>
      <div class="auth-itchi-states" data-auth-states data-current={error ? 'error' : 'idle'}>
        <div data-auth-state="idle"><Itchi pose="wink" size={250}/><ItchiSays tone="mint">{idleMessage}</ItchiSays></div>
        <div data-auth-state="loading"><Itchi pose="search" size={250}/><ItchiSays tone="mint">잠시만요, 확인하고 있어요...</ItchiSays></div>
        <div data-auth-state="error"><Itchi pose="sad" size={250}/><ItchiSays tone="coral">이메일이나 비밀번호를 다시 봐 주세요</ItchiSays></div>
        <div data-auth-state="success"><Itchi pose="found" size={250}/><ItchiSays tone="yolk">반가워요! 이제 시작해볼까요?</ItchiSays></div>
      </div>
      <div><h2>잃어버린 것과<br/>다시 이어지는 곳</h2><p>잇치가 찾는 과정을 함께할게요.</p></div>
    </aside>
    <section class="auth-card">
      <span class="auth-kicker">ITDA ACCOUNT</span><h1>{register ? '잇다 시작하기' : '로그인'}</h1>
      <p>{register ? '이메일로 금방 준비할 수 있어요.' : '이메일과 비밀번호로 계속하기'}</p>
      <form class="auth-form" action={register ? '/register' : `/login?next=${encodeURIComponent(next)}`} method="post" data-auth-form data-mode={mode}>
        <label>이메일<input name="email" type="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"/></label>
        <label>비밀번호<span class="password-field"><input name="password" type="password" autocomplete={register ? 'new-password' : 'current-password'} minlength={register ? 8 : 1} required placeholder="8자 이상 입력해 주세요"/><button type="button" data-password-toggle aria-label="비밀번호 보기">보기</button></span></label>
        {register && <label>닉네임<input name="nickname" minlength={2} maxlength={20} autocomplete="nickname" required placeholder="다른 사람에게 보여질 이름"/></label>}
        {error && <p class="form-error" role="alert">{error}</p>}<p class="form-error" data-form-error role="alert" hidden></p>
        <button type="submit" class="button button-accent button-large button-full" data-auth-submit><span data-submit-label>{register ? '가입하고 시작하기' : '로그인'}</span><span class="button-spinner" aria-hidden="true"></span></button>
        <p class="auth-switch">{register ? '이미 계정이 있어요' : '아직 계정이 없어요'} <a href={register ? '/login' : '/register'}>{register ? '로그인' : '가입하기'}</a></p>
      </form>
    </section>
  </section></main>
}

export function ReportCard({ report }: { report: FoundReport }) {
  const image = report.images[0]
  return <a class="report-card detailed" href={`/found/${report.id}`}><div class="report-image-wrap">{image ? <img src={image.thumbnailUrl} alt={`${report.title} 습득물 사진`}/> : <div class="image-placeholder"><Itchi pose="search" size={110}/></div>}<span class="category-chip">{categoryLabels[report.category] ?? '기타'}</span></div><div><StatusBadge status={report.aiStatus}/><h3>{report.title}</h3><p><span aria-hidden="true">📍</span> {report.locationText}</p><p><span aria-hidden="true">🕒</span> {formatDate(report.foundAt)}</p><span class="card-link">자세히 보기 →</span></div></a>
}

export function StatusBadge({ status }: { status: FoundReport['aiStatus'] }) {
  const labels = { PENDING: '특징 확인 대기', PROCESSING: '잇치가 살펴보는 중', READY: '특징을 정리해 뒀어요', FAILED: '앗, 다시 살펴볼게요' }
  return <span class={`ai-badge ai-${status.toLowerCase()}`}>{labels[status]}</span>
}

export function ReportsPage({ reports, mine = false }: { reports: FoundReport[]; mine?: boolean }) {
  return <main class="page-shell" id="main-content"><div class="page-heading-row"><div><span class="eyebrow">{mine ? '내 활동' : '새로 들어온 제보'}</span><h1>{mine ? '내 신고' : '주운 물건들'}</h1><p>{mine ? '내가 등록한 물건과 확인 상태를 한곳에서 관리하세요.' : '장소와 시간을 확인하고 찾는 물건과 닮았는지 살펴보세요.'}</p></div><a href="/found/new" class="button button-accent">＋ 습득물 등록</a></div>{reports.length ? <div class="report-grid">{reports.map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state"><Itchi pose="sleep" size={170}/><h3>아직 등록된 습득물이 없어요</h3><p>주운 물건이 있다면 첫 번째 소식을 남겨주세요.</p><a href="/found/new" class="button button-accent">첫 습득물 등록하기</a></div>}</main>
}

export function HomePage({ user, reports }: { user: SessionUser; reports: FoundReport[] }) {
  const ready = reports.filter((item) => item.aiStatus === 'READY').length
  return <main class="page-shell dashboard" id="main-content"><section class="welcome-panel handoff-welcome"><div><span class="hero-chip">{user.nickname}님, 다시 오셨네요!</span><h1>잃어버린 물건,<br/>잇치가 대신 찾아볼게요</h1><p>사진과 설명만 있으면 돼요. 닮은 물건이 들어오면 알려드릴게요.</p><div class="hero-actions"><a class="button button-accent" href="/lost/new">＋ 잃어버렸어요</a><a class="button button-secondary" href="/found/new">주웠어요</a></div></div><div class="welcome-itchi"><ItchiSays tone="mint">오늘은 뭘 도와드릴까요?</ItchiSays><Itchi pose="greet" size={230}/></div></section><section class="dashboard-grid"><article class="status-card"><span class="status-symbol">✓</span><div><strong>특징 정리 완료</strong><p>바로 살펴볼 수 있는 습득물이에요.</p></div><span class="metric">{ready}</span></article><article class="status-card"><span class="status-symbol coral">物</span><div><strong>등록된 습득물</strong><p>최근 들어온 제보를 확인해 보세요.</p></div><span class="metric">{reports.length}</span></article></section><div class="section-title-row"><div><span class="eyebrow">최근 소식</span><h2>방금 도착한 습득물</h2></div><a href="/found">전부 보기 →</a></div>{reports.length ? <div class="report-grid">{reports.slice(0,4).map((report) => <ReportCard report={report}/>)}</div> : <div class="empty-state compact"><Itchi pose="sleep" size={120}/><h3>아직 새 소식이 없어요</h3><a href="/found/new" class="button button-accent">습득물 등록하기</a></div>}</main>
}

export function NewFoundPage() {
  return <main class="page-shell" id="main-content"><section class="report-form-shell"><header class="form-heading"><Itchi pose="point" size={120}/><ItchiSays tone="mint">주운 물건을 알려주세요. 사진 한 장이면 시작할 수 있어요.</ItchiSays><h1>주운 물건 등록</h1><p>사진과 발견 장소를 남기면 찾는 사람이 확인하기 쉽게 정리해 드려요.</p></header><ol class="form-progress" aria-label="등록 진행 단계"><li class="current"><span>1</span><small>사진</small></li><li><span>2</span><small>장소</small></li><li><span>3</span><small>시간</small></li><li><span>4</span><small>설명</small></li><li><span>5</span><small>확인</small></li></ol><form class="form-panel" data-found-form>
    <section class="form-step" data-step="0"><div class="step-title"><span class="step-icon">📷</span><div><h2>물건 사진을 올려주세요</h2><p>전체 모습과 눈에 띄는 부분을 1~5장 촬영해 주세요.</p></div></div><label class="upload-zone"><input id="found-images" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple/><span class="upload-icon">＋</span><strong>사진 선택 또는 촬영</strong><span>JPG, PNG, WEBP · 장당 최대 10MB</span></label><div class="preview-grid" data-preview></div><aside class="privacy-note">사진에 저장된 위치 정보는 공개 전에 자동으로 제거됩니다.</aside></section>
    <section class="form-step" data-step="1" hidden><div class="step-title"><span class="step-icon">📍</span><div><h2>어디에서 발견했나요?</h2><p>장소 종류를 고르고 실제 장소 이름을 적어주세요.</p></div></div><label class="form-label">장소 종류<select class="form-control" name="locationGroup"><option>대중교통</option><option>상점·카페</option><option>학교·교육시설</option><option>공공시설</option><option>회사·업무시설</option><option>주거지역</option><option>공원·야외</option><option>기타</option></select></label><label class="form-label">발견한 장소<input class="form-control" name="locationText" required minlength={2} maxlength={120} placeholder="예: 시청역 2번 출구 앞, OO카페 창가 자리"/></label></section>
    <section class="form-step" data-step="2" hidden><div class="step-title"><span class="step-icon">🕒</span><div><h2>언제 발견했나요?</h2><p>정확하지 않아도 괜찮아요. 기억나는 범위를 선택해 주세요.</p></div></div><label class="form-label">발견 날짜와 시간<input class="form-control" name="foundAt" type="datetime-local" required/></label><fieldset class="choice-group"><legend>시간 정확도</legend><label><input type="radio" name="timePrecision" value="EXACT" checked/><span>거의 정확해요</span></label><label><input type="radio" name="timePrecision" value="APPROXIMATE"/><span>대략 이쯤이에요</span></label><label><input type="radio" name="timePrecision" value="UNKNOWN"/><span>시간대를 잘 모르겠어요</span></label></fieldset></section>
    <section class="form-step" data-step="3" hidden><div class="step-title"><span class="step-icon">✨</span><div><h2>물건의 특징을 적어주세요</h2><p>색상, 브랜드, 흠집이나 스티커처럼 눈에 띄는 점이 좋아요.</p></div></div><label class="form-label">물건 종류<select class="form-control" name="category">{Object.entries(categoryLabels).map(([value,label]) => <option value={value}>{label}</option>)}</select></label><label class="form-label">한 줄 제목<input class="form-control" name="title" required minlength={2} maxlength={60} placeholder="예: 검정 반지갑"/></label><label class="form-label">특징과 발견 상황<textarea class="form-control" name="description" required minlength={2} maxlength={1000} placeholder="예: 왼쪽 아래에 노란 스마일 스티커가 있어요."></textarea></label></section>
    <section class="form-step" data-step="4" hidden><div class="mascot-review"><Itchi pose="point" size={110}/><ItchiSays tone="yolk"><b>거의 다 왔어요!</b><br/>내용을 한 번만 확인해 주세요.</ItchiSays></div><div class="review-grid" data-review></div></section><p class="form-error" data-form-error role="alert" hidden></p><footer class="form-actions"><button type="button" class="button button-secondary" data-prev hidden>이전</button><button type="button" class="button button-accent" data-next>다음</button><button type="submit" class="button button-accent" data-submit hidden>등록하기</button></footer>
  </form></section></main>
}

export function DetailPage({ report, mine }: { report: FoundReport; mine: boolean }) {
  return <main class="page-shell detail-page" id="main-content"><a href="/found" class="back-link">← 주운 물건들</a><div class="detail-layout"><section class="gallery">{report.images.map((image, index) => <img src={image.publicUrl} alt={`${report.title} 습득물 사진 ${index + 1}`}/>)}</section><article class="detail-info"><div class="detail-badges"><span class="status-badge">보관 중</span><StatusBadge status={report.aiStatus}/></div><span class="category-label">{categoryLabels[report.category]}</span><h1>{report.title}</h1><p class="detail-description">{report.description}</p><dl class="detail-meta"><div><dt>발견 장소</dt><dd>{report.locationText}<small>{report.locationGroup}</small></dd></div><div><dt>발견 시간</dt><dd>{formatDate(report.foundAt)}<small>{report.timePrecision === 'APPROXIMATE' ? '대략적인 시간' : '등록자가 확인한 시간'}</small></dd></div></dl>{report.aiFeatures && <section class="ai-result"><div class="result-heading"><Itchi pose="point" size={72}/><div><span class="eyebrow">잇치의 메모</span><h2>특징을 정리해 뒀어요</h2></div></div><div class="tag-row"><span>{categoryLabels[String(report.aiFeatures.detectedAttributes.category)] ?? '기타'}</span>{(report.aiFeatures.detectedAttributes.colors as string[] ?? []).map((color) => <span>{color}</span>)}{(report.aiFeatures.detectedAttributes.features as string[] ?? []).map((feature) => <span>{feature}</span>)}</div></section>}<aside class="safety-card"><strong>실제 주인 여부는 직접 확인해 주세요</strong><p>연락처나 신분증 번호는 공개 화면에 남기지 말고, 본인만 아는 특징으로 물건을 확인하세요.</p></aside><div class="detail-owner"><span>등록자</span><strong>{report.finderNickname}</strong>{mine && <a href="/my/reports">내 신고 관리</a>}</div></article></div></main>
}

export function ProfilePage({ user }: { user: SessionUser }) {
  return <main class="page-shell narrow-page" id="main-content"><section class="profile-card"><Itchi pose="wink" size={190}/><span class="eyebrow">내 프로필</span><h1>{user.nickname}</h1><dl><div><dt>닉네임</dt><dd>{user.nickname}</dd></div><div><dt>이메일</dt><dd>{user.email}</dd></div></dl><p>등록한 물건과 새 소식은 내 신고 메뉴에서 확인할 수 있어요.</p></section></main>
}

export function NewLostPage() {
  return <main class="page-shell" id="main-content"><section class="lost-flow-shell">
    <header class="form-heading"><Itchi pose="greet" size={140}/><ItchiSays tone="mint">기억나는 것부터 편하게 말해 주세요. 제가 하나씩 정리할게요.</ItchiSays><h1>잃어버린 물건 찾기</h1><p>설명을 정리한 뒤 등록된 습득물과 바로 비교해요.</p></header>
    <form class="lost-chat-form" data-lost-form>
      <section class="chat-message itchi-message"><Itchi pose="wink" size={74}/><div><strong>무엇을 잃어버렸나요?</strong><p>색상, 모양, 브랜드, 눈에 띄는 특징을 자유롭게 적어 주세요.</p></div></section>
      <label class="chat-input-label"><span class="sr-only">분실물 설명</span><textarea class="form-control" name="description" required minlength={5} maxlength={1000} placeholder="예: 검은색 카드지갑이고 앞에 작은 금색 로고가 있어요."></textarea></label>
      <button type="button" class="button button-accent button-full" data-lost-interpret>잇치에게 정리 부탁하기</button>
      <section class="lost-interpretation" data-lost-structured hidden>
        <div class="chat-message itchi-message"><Itchi pose="point" size={82}/><div><strong>이렇게 이해했어요</strong><p>다른 부분이 있다면 바로 고쳐 주세요.</p></div></div>
        <div class="structured-grid">
          <label class="form-label">물건 종류<select class="form-control" name="category" required>{Object.entries(categoryLabels).map(([value,label]) => <option value={value}>{label}</option>)}</select></label>
          <label class="form-label">색상<input class="form-control" name="colors" placeholder="예: black, gold"/></label>
          <label class="form-label">재질<input class="form-control" name="material" placeholder="예: leather"/></label>
          <label class="form-label">브랜드<input class="form-control" name="brand" placeholder="알고 있다면 입력"/></label>
          <label class="form-label structured-wide">눈에 띄는 특징<input class="form-control" name="features" placeholder="쉼표로 구분해 주세요"/></label>
        </div>
        <div class="chat-message itchi-message"><Itchi pose="search" size={78}/><div><strong>어디서, 언제 잃어버렸나요?</strong><p>대략적인 정보여도 후보를 찾는 데 도움이 돼요.</p></div></div>
        <div class="structured-grid">
          <label class="form-label">장소 종류<select class="form-control" name="locationGroup" required><option>대중교통</option><option>상점·카페</option><option>학교·교육시설</option><option>공공시설</option><option>회사·업무시설</option><option>주거지역</option><option>공원·야외</option><option>기타</option></select></label>
          <label class="form-label">분실 장소<input class="form-control" name="locationText" required minlength={2} maxlength={120} placeholder="예: 시청역 2번 출구 근처"/></label>
          <label class="form-label">분실 날짜와 시간<input class="form-control" name="lostAt" type="datetime-local" required/></label>
          <label class="form-label">시간 정확도<select class="form-control" name="timePrecision"><option value="EXACT">거의 정확해요</option><option value="APPROXIMATE" selected>대략 이쯤이에요</option><option value="UNKNOWN">정확한 시간을 모르겠어요</option></select></label>
        </div>
        <aside class="privacy-note">연락처·카드번호·식별번호는 설명에서 자동으로 가려요. 실제 주인만 아는 정보는 공개 설명에 적지 마세요.</aside>
        <p class="form-error" data-lost-error role="alert" hidden></p>
        <button type="submit" class="button button-accent button-large button-full" data-lost-submit><span>신고하고 닮은 물건 찾기</span><span class="button-spinner" aria-hidden="true"></span></button>
      </section>
    </form>
  </section></main>
}

function attributeText(report: LostReport, key: 'colors' | 'features') {
  const value = report.attributes[key]
  return Array.isArray(value) && value.length ? value.join(', ') : '입력 정보 없음'
}

export function LostDetailPage({ report, matches }: { report: LostReport; matches: CandidateMatch[] }) {
  return <main class="page-shell" id="main-content"><section class="lost-summary">
    <div><span class="eyebrow">내 분실 신고</span><h1>{categoryLabels[report.category] ?? '분실물'}을 찾고 있어요</h1><p>{report.description}</p></div>
    <Itchi pose={matches.length ? 'found' : 'search'} size={170}/>
  </section>
  <dl class="lost-meta-grid"><div><dt>분실 장소</dt><dd>{report.locationText}<small>{report.locationGroup}</small></dd></div><div><dt>분실 시간</dt><dd>{formatDate(report.lostAt)}<small>{report.timePrecision === 'EXACT' ? '거의 정확한 시간' : '대략적인 시간'}</small></dd></div><div><dt>색상</dt><dd>{attributeText(report, 'colors')}</dd></div><div><dt>특징</dt><dd>{attributeText(report, 'features')}</dd></div></dl>
  <section class="match-results-section"><div class="section-title-row"><div><span class="eyebrow">잇치가 비교한 결과</span><h2>{matches.length ? `닮은 물건 ${matches.length}개` : '아직 가까운 후보가 없어요'}</h2></div><button class="button button-secondary" type="button" data-rematch data-lost-id={report.id}>다시 찾아보기</button></div>
  {matches.length ? <div class="match-grid">{matches.map((match) => <MatchCard match={match}/>)}</div> : <div class="empty-state"><Itchi pose="sad" size={150}/><h3>새 습득물이 들어오면 다시 비교할 수 있어요</h3><p>설명이나 장소를 조금 더 자세히 적으면 후보가 더 잘 보일 수 있어요.</p></div>}
  </section></main>
}

export function MatchCard({ match }: { match: CandidateMatch }) {
  const image = match.foundReport.images[0]
  return <a class="match-card" href={`/matches/${match.id}`}><div class="match-image">{image ? <img src={image.thumbnailUrl} alt={`${match.foundReport.title} 습득물 사진`}/> : <Itchi pose="search" size={120}/>}<span class="match-score">일치도 {match.finalScore}</span></div><div class="match-card-body"><span class="category-label">{categoryLabels[match.foundReport.category] ?? '기타'}</span><h3>{match.foundReport.title}</h3><p>📍 {match.foundReport.locationText}</p><ul>{match.explanations.slice(0,3).map((reason) => <li>✓ {reason}</li>)}</ul><strong>비교해서 보기 →</strong></div></a>
}

export function MatchesOverview({ items }: { items: Array<{ report: LostReport; matches: CandidateMatch[] }> }) {
  return <main class="page-shell" id="main-content"><div class="page-heading-row"><div><span class="eyebrow">내 매칭</span><h1>닮은 물건을 모아봤어요</h1><p>일치도는 확률이 아니라 여러 특징이 비슷한 정도를 나타내요.</p></div><a class="button button-accent" href="/lost/new">＋ 새 분실 신고</a></div>{items.length ? <div class="lost-report-list">{items.map(({ report, matches }) => <article class="lost-report-row"><div><span class="status-badge">{categoryLabels[report.category] ?? '분실물'}</span><h2>{report.description}</h2><p>{report.locationText} · {formatDate(report.lostAt)}</p></div><div class="lost-report-match-count"><strong>{matches.length}</strong><span>후보</span><a href={`/lost/${report.id}`}>확인하기 →</a></div></article>)}</div> : <div class="empty-state"><Itchi pose="search" size={170}/><h3>아직 분실 신고가 없어요</h3><p>기억나는 대로 알려주면 잇치가 닮은 물건을 찾아볼게요.</p><a class="button button-accent" href="/lost/new">분실 신고 시작하기</a></div>}</main>
}

function scoreLabel(value: number) {
  if (value >= 80) return '매우 비슷해요'
  if (value >= 60) return '비슷한 점이 많아요'
  if (value >= 40) return '확인해 볼 만해요'
  return '일부 특징이 비슷해요'
}

export function MatchDetailPage({ match, lost }: { match: CandidateMatch; lost: LostReport }) {
  const found = match.foundReport
  const image = found.images[0]
  const rows = [
    ['설명', lost.description, found.description],
    ['종류', categoryLabels[lost.category] ?? lost.category, categoryLabels[found.category] ?? found.category],
    ['색상', attributeText(lost, 'colors'), Array.isArray(found.attributes.colors) ? found.attributes.colors.join(', ') : '확인 필요'],
    ['장소', lost.locationText, found.locationText],
    ['시간', formatDate(lost.lostAt), formatDate(found.foundAt)],
  ]
  return <main class="page-shell" id="main-content"><a class="back-link" href={`/lost/${lost.id}`}>← 후보 목록으로</a><section class="match-detail-hero"><div><span class="eyebrow">잇치의 비교 결과</span><h1>일치도 {match.finalScore}</h1><p>{scoreLabel(match.finalScore)}. 실제 주인 여부는 직접 확인해 주세요.</p></div><Itchi pose="found" size={180}/></section>
  <section class="comparison-grid"><article><span class="comparison-label">내 신고</span><h2>{categoryLabels[lost.category] ?? '분실물'}</h2><p>{lost.description}</p></article><div class="comparison-vs">VS</div><article><span class="comparison-label found">습득물</span>{image ? <img src={image.publicUrl} alt={`${found.title} 습득물 사진`}/> : <Itchi pose="search" size={150}/>}<h2>{found.title}</h2><p>{found.description}</p></article></section>
  <section class="score-panel"><h2>어떤 점을 비교했나요?</h2><div class="score-bars">{[['설명', match.textScore], ['사진·색상', match.visualScore], ['특징', match.attributeScore], ['장소', match.locationScore], ['시간', match.timeScore], ['글자·브랜드', match.ocrScore]].map(([label,value]) => <div class="score-row"><span>{label}</span><div><i style={`width:${value}%`}></i></div><strong>{value}</strong></div>)}</div><ul class="explanation-list">{match.explanations.map((reason) => <li>✓ {reason}</li>)}</ul></section>
  <aside class="safety-card match-safety"><strong>이 물건이 맞는지 직접 확인해 주세요</strong><p>사진에 보이지 않는 특징이나 안에 있던 물건을 통해 실제 주인인지 확인하는 것이 안전해요.</p></aside><a class="button button-secondary button-full" href={`/found/${found.id}`}>습득물 상세 보기</a></main>
}

export function ComingSoon() {
  return <main class="auth-page" id="main-content"><section class="auth-card coming-card"><Itchi pose="search" size={210}/><ItchiSays tone="mint">기억나는 대로 편하게 이야기해 주세요.</ItchiSays><h1>새 기능을 준비하고 있어요</h1><p>조금만 기다려 주세요.</p><a class="button button-accent" href="/home">홈으로 돌아가기</a></section></main>
}
