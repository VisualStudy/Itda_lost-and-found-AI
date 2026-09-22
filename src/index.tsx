import { Hono } from 'hono'
import { clearSession, getSession, hashPassword, setSession, verifyPassword } from './auth'
import { processNextAiJob } from './ai'
import { createReport, findReport, listReports } from './repository'
import type { Bindings, SessionUser } from './types'
import { AuthPage, ComingSoon, DetailPage, HomePage, Landing, NewFoundPage, Page, ProfilePage, ReportsPage } from './views'

const app = new Hono<{ Bindings: Bindings }>()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const categories = new Set(['wallet', 'bag', 'electronics', 'keys', 'clothing', 'document', 'accessory', 'other'])
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

app.use('*', async (c, next) => {
  if (c.req.method === 'GET' && !c.req.path.startsWith('/api/files/')) {
    c.executionCtx.waitUntil(processNextAiJob(c.env).catch(() => false))
  }
  await next()
})

async function requireUser(c: Parameters<typeof getSession>[0]) {
  return getSession(c)
}

function jsonError(c: Parameters<typeof getSession>[0], message: string, status: 400 | 401 | 403 | 404 | 409 | 500 = 400) {
  return c.json({ error: message }, status)
}

app.get('/', async (c) => c.html(<Page user={await getSession(c)}><Landing/></Page>))
app.get('/login', async (c) => (await getSession(c)) ? c.redirect('/home') : c.html(<Page><AuthPage mode="login"/></Page>))
app.get('/register', async (c) => (await getSession(c)) ? c.redirect('/home') : c.html(<Page><AuthPage mode="register"/></Page>))
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
  return c.html(<Page user={user} title="분실 신고 | 잇다"><ComingSoon/></Page>)
})

app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string; nickname?: string }>()
    const email = body.email?.trim().toLowerCase() ?? ''
    const nickname = body.nickname?.trim() ?? ''
    if (!emailPattern.test(email)) return jsonError(c, '올바른 이메일을 입력해 주세요.')
    if (!body.password || body.password.length < 8 || body.password.length > 72) return jsonError(c, '비밀번호는 8~72자로 입력해 주세요.')
    if (nickname.length < 2 || nickname.length > 20) return jsonError(c, '닉네임은 2~20자로 입력해 주세요.')
    if (await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) return jsonError(c, '이미 가입된 이메일이에요.', 409)
    const password = await hashPassword(body.password)
    const user: SessionUser = { id: crypto.randomUUID(), email, nickname, role: 'USER' }
    await c.env.DB.prepare(`INSERT INTO users (id, email, password_hash, password_salt, nickname, role) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(user.id, user.email, password.hash, password.salt, user.nickname, user.role).run()
    await setSession(c, user)
    return c.json({ user }, 201)
  } catch (error) {
    console.error(error); return jsonError(c, '회원가입을 처리하지 못했어요.', 500)
  }
})

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string }>()
    const email = body.email?.trim().toLowerCase() ?? ''
    const user = await c.env.DB.prepare(`SELECT id, email, password_hash, password_salt, nickname, role FROM users WHERE email = ?`).bind(email).first<{ id: string; email: string; password_hash: string; password_salt: string; nickname: string; role: 'USER' | 'ADMIN' }>()
    if (!user || !body.password || !(await verifyPassword(body.password, user.password_salt, user.password_hash))) return jsonError(c, '이메일 또는 비밀번호가 올바르지 않아요.', 401)
    const session = { id: user.id, email: user.email, nickname: user.nickname, role: user.role }
    await setSession(c, session)
    return c.json({ user: session })
  } catch (error) { console.error(error); return jsonError(c, '로그인을 처리하지 못했어요.', 500) }
})
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

app.notFound(async (c) => c.html(<Page user={await getSession(c)}><main class="auth-page"><section class="auth-card"><MascotFallback/><h1>페이지를 찾을 수 없어요</h1><a class="button button-primary" href="/">홈으로 돌아가기</a></section></main></Page>, 404))
app.onError((error, c) => { console.error(error); return c.json({ error: '요청을 처리하지 못했어요.' }, 500) })

function MascotFallback() { return <div class="mascot-fallback" aria-label="잇령이">잇령이</div> }

export default app
