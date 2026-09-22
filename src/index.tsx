import { Hono, type Context } from 'hono'
import { clearSession, getSession, hashPassword, setSession, verifyPassword } from './auth'
import { interpretLostDescription, processNextAiJob, redactSensitiveText } from './ai'
import { createLostReport, createReport, findLostReport, findMatch, findReport, listLostReports, listMatches, listReports, rematchLostReport, rematchRecentLostReports } from './repository'
import type { Bindings, SessionUser } from './types'
import { AuthPage, DetailPage, HomePage, Landing, LostDetailPage, MatchDetailPage, MatchesOverview, NewFoundPage, NewLostPage, Page, ProfilePage, ReportsPage } from './views'
import { Itchi } from './itchi'

const app = new Hono<{ Bindings: Bindings }>()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const categories = new Set(['wallet', 'bag', 'electronics', 'keys', 'clothing', 'document', 'accessory', 'other'])
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

app.use('*', async (c, next) => {
  if (c.req.method === 'GET' && !c.req.path.startsWith('/api/files/')) {
    c.executionCtx.waitUntil((async () => {
      const processedReportId = await processNextAiJob(c.env)
      if (processedReportId) await rematchRecentLostReports(c.env)
    })().catch(() => undefined))
  }
  await next()
})

async function requireUser(c: Parameters<typeof getSession>[0]) {
  return getSession(c)
}

function jsonError(c: Parameters<typeof getSession>[0], message: string, status: 400 | 401 | 403 | 404 | 409 | 500 = 400) {
  return c.json({ error: message }, status)
}

type AppContext = Context<{ Bindings: Bindings }>
type AuthInput = { email: string; password: string; nickname: string }

async function readAuthInput(c: AppContext): Promise<AuthInput> {
  if (c.req.header('content-type')?.includes('application/json')) {
    const body = await c.req.json<Partial<AuthInput>>()
    return { email: String(body.email ?? ''), password: String(body.password ?? ''), nickname: String(body.nickname ?? '') }
  }
  const body = await c.req.parseBody()
  return { email: String(body.email ?? ''), password: String(body.password ?? ''), nickname: String(body.nickname ?? '') }
}

function authFailure(c: AppContext, mode: 'login' | 'register', message: string, html: boolean, status: 400 | 401 | 409 | 500 = 400) {
  return html ? c.redirect(`/${mode}?error=${encodeURIComponent(message)}`, 303) : jsonError(c, message, status)
}

function stringList(value: unknown, limit = 10) {
  const values = Array.isArray(value) ? value : String(value ?? '').split(',')
  return [...new Set(values.map((item) => String(item).trim().toLowerCase()).filter(Boolean))].slice(0, limit).map((item) => item.slice(0, 40))
}

async function registerAccount(c: AppContext, html = false) {
  try {
    const body = await readAuthInput(c)
    const email = body.email.trim().toLowerCase()
    const nickname = body.nickname.trim()
    if (!emailPattern.test(email)) return authFailure(c, 'register', '올바른 이메일을 입력해 주세요.', html)
    if (body.password.length < 8 || body.password.length > 72) return authFailure(c, 'register', '비밀번호는 8~72자로 입력해 주세요.', html)
    if (nickname.length < 2 || nickname.length > 20) return authFailure(c, 'register', '닉네임은 2~20자로 입력해 주세요.', html)
    if (await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) return authFailure(c, 'register', '이미 가입된 이메일이에요.', html, 409)
    const password = await hashPassword(body.password)
    const user: SessionUser = { id: crypto.randomUUID(), email, nickname, role: 'USER' }
    await c.env.DB.prepare(`INSERT INTO users (id, email, password_hash, password_salt, nickname, role) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(user.id, user.email, password.hash, password.salt, user.nickname, user.role).run()
    await setSession(c, user)
    return html ? c.redirect('/home', 303) : c.json({ user }, 201)
  } catch (error) {
    console.error(error)
    return authFailure(c, 'register', '회원가입을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.', html, 500)
  }
}

async function loginAccount(c: AppContext, html = false) {
  try {
    const body = await readAuthInput(c)
    const email = body.email.trim().toLowerCase()
    const user = await c.env.DB.prepare(`SELECT id, email, password_hash, password_salt, nickname, role FROM users WHERE email = ?`).bind(email).first<{ id: string; email: string; password_hash: string; password_salt: string; nickname: string; role: 'USER' | 'ADMIN' }>()
    if (!user || !body.password || !(await verifyPassword(body.password, user.password_salt, user.password_hash))) return authFailure(c, 'login', '이메일 또는 비밀번호가 올바르지 않아요.', html, 401)
    const session = { id: user.id, email: user.email, nickname: user.nickname, role: user.role }
    await setSession(c, session)
    const requestedNext = c.req.query('next')
    const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/home'
    return html ? c.redirect(next, 303) : c.json({ user: session })
  } catch (error) {
    console.error(error)
    return authFailure(c, 'login', '로그인을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.', html, 500)
  }
}

app.get('/', async (c) => c.html(<Page user={await getSession(c)}><Landing/></Page>))
app.get('/login', async (c) => {
  if (await getSession(c)) return c.redirect('/home')
  const requestedNext = c.req.query('next')
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/home'
  return c.html(<Page><AuthPage mode="login" error={c.req.query('error')} next={next}/></Page>)
})
app.get('/register', async (c) => (await getSession(c)) ? c.redirect('/home') : c.html(<Page><AuthPage mode="register" error={c.req.query('error')}/></Page>))
app.get('/home', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/home')
  return c.html(<Page user={user} title="홈 | 잇다"><HomePage user={user} reports={await listReports(c.env, undefined, 6)}/></Page>)
})
app.get('/found', async (c) => c.html(<Page user={await getSession(c)} title="습득물 목록 | 잇다"><ReportsPage reports={await listReports(c.env)}/></Page>))
app.get('/found/new', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/found/new')
  return c.html(<Page user={user} title="습득물 등록 | 잇다"><NewFoundPage/></Page>)
})
app.get('/found/:id', async (c) => {
  const report = await findReport(c.env, c.req.param('id')); if (!report) return c.notFound()
  const user = await getSession(c)
  return c.html(<Page user={user} title={`${report.title} | 잇다`}><DetailPage report={report} mine={user?.id === report.userId}/></Page>)
})
app.get('/my/reports', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/my/reports')
  return c.html(<Page user={user} title="내 신고 | 잇다"><ReportsPage reports={await listReports(c.env, user.id)} mine/></Page>)
})
app.get('/profile', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/profile')
  return c.html(<Page user={user} title="프로필 | 잇다"><ProfilePage user={user}/></Page>)
})
app.get('/lost/new', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/lost/new')
  return c.html(<Page user={user} title="분실 신고 | 잇다"><NewLostPage/></Page>)
})
app.get('/lost/:id', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect(`/login?next=${encodeURIComponent(c.req.path)}`)
  const report = await findLostReport(c.env, c.req.param('id'))
  if (!report) return c.notFound()
  if (report.userId !== user.id) return c.text('이 신고를 볼 권한이 없어요.', 403)
  return c.html(<Page user={user} title="분실 신고 | 잇다"><LostDetailPage report={report} matches={await listMatches(c.env, report.id)}/></Page>)
})
app.get('/matches', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect('/login?next=/matches')
  const reports = await listLostReports(c.env, user.id)
  const items = await Promise.all(reports.map(async (report) => ({ report, matches: await listMatches(c.env, report.id) })))
  return c.html(<Page user={user} title="매칭 결과 | 잇다"><MatchesOverview items={items}/></Page>)
})
app.get('/matches/:id', async (c) => {
  const user = await getSession(c); if (!user) return c.redirect(`/login?next=${encodeURIComponent(c.req.path)}`)
  const match = await findMatch(c.env, c.req.param('id')); if (!match) return c.notFound()
  const lost = await findLostReport(c.env, match.lostReportId); if (!lost) return c.notFound()
  if (lost.userId !== user.id) return c.text('이 후보를 볼 권한이 없어요.', 403)
  return c.html(<Page user={user} title="후보 비교 | 잇다"><MatchDetailPage match={match} lost={lost}/></Page>)
})

app.post('/register', (c) => registerAccount(c, true))
app.post('/login', (c) => loginAccount(c, true))
app.post('/logout', (c) => { clearSession(c); return c.redirect('/', 303) })
app.post('/api/auth/register', (c) => registerAccount(c))
app.post('/api/auth/login', (c) => loginAccount(c))
app.post('/api/auth/logout', (c) => { clearSession(c); return c.json({ ok: true }) })
app.get('/api/auth/me', async (c) => {
  const user = await getSession(c); return user ? c.json({ user }) : jsonError(c, '로그인이 필요해요.', 401)
})

app.post('/api/uploads/images', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  try {
    const form = await c.req.formData()
    const original = form.get('original'); const publicImage = form.get('public'); const thumbnail = form.get('thumbnail')
    if (!(original instanceof File) || !(publicImage instanceof File) || !(thumbnail instanceof File)) return jsonError(c, '이미지 데이터가 올바르지 않아요.')
    if (!allowedImageTypes.has(original.type) || original.size > 10 * 1024 * 1024) return jsonError(c, 'JPG, PNG, WEBP 10MB 이하 이미지만 올릴 수 있어요.')
    if (publicImage.type !== 'image/webp' || thumbnail.type !== 'image/webp') return jsonError(c, '공개 이미지는 WebP 형식이어야 해요.')
    const id = crypto.randomUUID(); const base = `${user.id}/${id}`
    const originalKey = `private/${base}/original`; const publicKey = `public/${base}/public-clean.webp`; const thumbnailKey = `thumb/${base}/thumbnail.webp`
    await Promise.all([
      c.env.R2.put(originalKey, original.stream(), { httpMetadata: { contentType: original.type } }),
      c.env.R2.put(publicKey, publicImage.stream(), { httpMetadata: { contentType: 'image/webp' } }),
      c.env.R2.put(thumbnailKey, thumbnail.stream(), { httpMetadata: { contentType: 'image/webp' } }),
    ])
    const width = Number(form.get('width')) || 1; const height = Number(form.get('height')) || 1
    const visualFeatures = String(form.get('features') || '{}')
    await c.env.DB.prepare(`INSERT INTO report_images (id, report_type, owner_user_id, original_storage_key, public_storage_key, thumbnail_storage_key, mime_type, width, height, visual_features_json) VALUES (?, 'FOUND', ?, ?, ?, ?, 'image/webp', ?, ?, ?)`)
      .bind(id, user.id, originalKey, publicKey, thumbnailKey, width, height, visualFeatures).run()
    return c.json({ image: { id, publicUrl: `/api/files/${publicKey}`, thumbnailUrl: `/api/files/${thumbnailKey}`, width, height } }, 201)
  } catch (error) { console.error(error); return jsonError(c, '이미지를 처리하지 못했어요.', 500) }
})

app.get('/api/files/*', async (c) => {
  const key = c.req.path.replace('/api/files/', '')
  if (!key.startsWith('public/') && !key.startsWith('thumb/')) return c.notFound()
  const object = await c.env.R2.get(key); if (!object) return c.notFound()
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set('etag', object.httpEtag); headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
})

app.get('/api/found-reports', async (c) => {
  const mine = c.req.query('mine') === 'true'; const user = mine ? await getSession(c) : null
  if (mine && !user) return jsonError(c, '로그인이 필요해요.', 401)
  return c.json({ reports: await listReports(c.env, user?.id) })
})
app.post('/api/found-reports', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  try {
    const body = await c.req.json<Record<string, unknown>>()
    const title = String(body.title ?? '').trim(); const description = String(body.description ?? '').trim(); const category = String(body.category ?? '')
    const locationText = String(body.locationText ?? '').trim(); const locationGroup = String(body.locationGroup ?? '').trim(); const foundAt = String(body.foundAt ?? '')
    const imageIds = Array.isArray(body.imageIds) ? body.imageIds.map(String) : []
    if (title.length < 2 || title.length > 60 || description.length < 2 || description.length > 1000) return jsonError(c, '제목과 설명을 확인해 주세요.')
    if (!categories.has(category) || locationText.length < 2 || !locationGroup || Number.isNaN(Date.parse(foundAt))) return jsonError(c, '물건 종류, 장소, 시간을 확인해 주세요.')
    if (imageIds.length < 1 || imageIds.length > 5) return jsonError(c, '사진을 1~5장 등록해 주세요.')
    const available = await c.env.DB.prepare(`SELECT id FROM report_images WHERE owner_user_id = ? AND report_id IS NULL`).bind(user.id).all<{ id: string }>()
    if (imageIds.some((id) => !available.results.some((item) => item.id === id))) return jsonError(c, '유효하지 않은 이미지가 포함되어 있어요.')
    const report = await createReport(c.env, { id: crypto.randomUUID(), userId: user.id, title, description, category, foundAt, timePrecision: String(body.timePrecision ?? 'EXACT'), locationText, locationGroup, imageIds })
    return c.json({ report }, 201)
  } catch (error) { console.error(error); return jsonError(c, '습득물을 등록하지 못했어요.', 500) }
})
app.get('/api/found-reports/:id', async (c) => {
  const report = await findReport(c.env, c.req.param('id')); return report ? c.json({ report }) : jsonError(c, '습득물을 찾을 수 없어요.', 404)
})
app.post('/api/found-reports/:id/reprocess', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  const report = await c.env.DB.prepare('SELECT user_id FROM found_reports WHERE id = ?').bind(c.req.param('id')).first<{ user_id: string }>()
  if (!report) return jsonError(c, '습득물을 찾을 수 없어요.', 404)
  if (report.user_id !== user.id) return jsonError(c, '재처리 권한이 없어요.', 403)
  await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE found_reports SET ai_status = 'PENDING' WHERE id = ?`).bind(c.req.param('id')),
    c.env.DB.prepare(`INSERT INTO ai_jobs (id, job_type, report_type, report_id) VALUES (?, 'EXTRACT_FEATURES', 'FOUND', ?)`).bind(crypto.randomUUID(), c.req.param('id')),
  ])
  return c.json({ ok: true })
})

app.post('/api/lost-reports/interpret', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  try {
    const body = await c.req.json<{ description?: unknown }>()
    const description = String(body.description ?? '').trim()
    if (description.length < 5 || description.length > 1000) return jsonError(c, '설명을 5~1000자로 입력해 주세요.')
    return c.json(interpretLostDescription(description))
  } catch { return jsonError(c, '설명을 확인해 주세요.') }
})

app.post('/api/lost-reports', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  try {
    const body = await c.req.json<Record<string, unknown>>()
    const description = redactSensitiveText(String(body.description ?? '')).slice(0, 1000)
    const category = String(body.category ?? '')
    const lostAt = String(body.lostAt ?? '')
    const locationText = String(body.locationText ?? '').trim().slice(0, 120)
    const locationGroup = String(body.locationGroup ?? '').trim().slice(0, 40)
    const timePrecision = String(body.timePrecision ?? 'APPROXIMATE')
    if (description.length < 5 || !categories.has(category)) return jsonError(c, '분실물 설명과 종류를 확인해 주세요.')
    if (locationText.length < 2 || !locationGroup || Number.isNaN(Date.parse(lostAt))) return jsonError(c, '분실 장소와 시간을 확인해 주세요.')
    if (!['EXACT', 'APPROXIMATE', 'UNKNOWN'].includes(timePrecision)) return jsonError(c, '시간 정확도를 확인해 주세요.')
    const extracted = interpretLostDescription(description).attributes
    const attributes = {
      category,
      colors: stringList(body.colors).length ? stringList(body.colors) : extracted.colors,
      material: String(body.material ?? extracted.material ?? '').trim().toLowerCase().slice(0, 40) || null,
      brand: String(body.brand ?? extracted.brand ?? '').trim().slice(0, 60) || null,
      features: stringList(body.features).length ? stringList(body.features) : extracted.features,
    }
    const report = await createLostReport(c.env, { id: crypto.randomUUID(), userId: user.id, description, category, lostAt: new Date(lostAt).toISOString(), timePrecision, locationText, locationGroup, attributes })
    return c.json({ report, matches: report ? await listMatches(c.env, report.id) : [] }, 201)
  } catch (error) { console.error(error); return jsonError(c, '분실 신고를 등록하지 못했어요.', 500) }
})

app.get('/api/lost-reports/:id', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  const report = await findLostReport(c.env, c.req.param('id')); if (!report) return jsonError(c, '분실 신고를 찾을 수 없어요.', 404)
  if (report.userId !== user.id) return jsonError(c, '이 신고를 볼 권한이 없어요.', 403)
  return c.json({ report })
})

app.get('/api/lost-reports/:id/matches', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  const report = await findLostReport(c.env, c.req.param('id')); if (!report) return jsonError(c, '분실 신고를 찾을 수 없어요.', 404)
  if (report.userId !== user.id) return jsonError(c, '이 후보를 볼 권한이 없어요.', 403)
  return c.json({ matches: await listMatches(c.env, report.id) })
})

app.post('/api/lost-reports/:id/rematch', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  const report = await findLostReport(c.env, c.req.param('id')); if (!report) return jsonError(c, '분실 신고를 찾을 수 없어요.', 404)
  if (report.userId !== user.id) return jsonError(c, '다시 찾을 권한이 없어요.', 403)
  try {
    const count = await rematchLostReport(c.env, report.id)
    return c.json({ ok: true, count, matches: await listMatches(c.env, report.id) })
  } catch (error) { console.error(error); return jsonError(c, '후보를 다시 찾지 못했어요.', 500) }
})

app.get('/api/matches/:id', async (c) => {
  const user = await requireUser(c); if (!user) return jsonError(c, '로그인이 필요해요.', 401)
  const match = await findMatch(c.env, c.req.param('id')); if (!match) return jsonError(c, '후보를 찾을 수 없어요.', 404)
  const lost = await findLostReport(c.env, match.lostReportId)
  if (!lost || lost.userId !== user.id) return jsonError(c, '이 후보를 볼 권한이 없어요.', 403)
  return c.json({ match, lost })
})

app.notFound(async (c) => c.html(<Page user={await getSession(c)}><main class="auth-page"><section class="auth-card coming-card"><Itchi pose="search" size={220}/><h1>페이지를 찾을 수 없어요</h1><p>주소를 다시 확인하거나 홈으로 돌아가 주세요.</p><a class="button button-primary" href="/">홈으로 돌아가기</a></section></main></Page>, 404))
app.onError((error, c) => { console.error(error); return c.json({ error: '요청을 처리하지 못했어요.' }, 500) })

export default app
