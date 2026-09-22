import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import sharp from 'sharp'
import { db } from '../src/lib/db'

const userId = '10000000-0000-4000-8000-000000000001'
const reports = [
  { id: '20000000-0000-4000-8000-000000000001', imageId: '30000000-0000-4000-8000-000000000001', title: '검은색 카드지갑', category: 'wallet', location: '학생회관 1층 소파 옆', group: '순천대학교 학생회관', color: '#252925', accent: '#D4A948', description: '소파 옆에서 발견했어요. 앞면에 작은 금색 장식이 있습니다.' },
  { id: '20000000-0000-4000-8000-000000000002', imageId: '30000000-0000-4000-8000-000000000002', title: '베이지색 에코백', category: 'bag', location: '중앙도서관 열람실', group: '순천대학교 중앙도서관', color: '#D7C7A3', accent: '#51715B', description: '의자 등받이에 걸려 있던 천 가방입니다.' },
  { id: '20000000-0000-4000-8000-000000000003', imageId: '30000000-0000-4000-8000-000000000003', title: '은색 무선 이어폰', category: 'electronics', location: '공과대학 1호관', group: '순천대학교 공과대학', color: '#D9DEDC', accent: '#7A8580', description: '계단 근처에서 케이스째 발견했어요.' },
]

async function seed() {
  const passwordHash = await bcrypt.hash('itda1234!', 12)
  db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, nickname) VALUES (?, ?, ?, ?)`)
    .run(userId, 'demo@itda.kr', passwordHash, '다정한습득자')

  const root = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? './data/uploads')
  for (const [index, report] of reports.entries()) {
    if (db.prepare('SELECT 1 FROM found_reports WHERE id = ?').get(report.id)) continue
    const relative = `${userId}/${report.imageId}`
    const directory = path.join(root, relative)
    await fs.mkdir(directory, { recursive: true })
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="1200" height="900" fill="#EEF0E8"/><ellipse cx="600" cy="720" rx="330" ry="70" fill="#CBD2C7"/><rect x="330" y="225" width="540" height="430" rx="70" fill="${report.color}"/><circle cx="710" cy="440" r="36" fill="${report.accent}"/><text x="600" y="805" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#314238">${report.title}</text></svg>`
    await fs.writeFile(path.join(directory, 'original.svg'), svg)
    await sharp(Buffer.from(svg)).webp({ quality: 84 }).toFile(path.join(directory, 'public-clean.webp'))
    await sharp(Buffer.from(svg)).resize(560, 420).webp({ quality: 78 }).toFile(path.join(directory, 'thumbnail.webp'))
    db.transaction(() => {
      db.prepare(`INSERT INTO found_reports (id, user_id, title, description, category, found_at, location_text, location_group, ai_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`)
        .run(report.id, userId, report.title, report.description, report.category, new Date(Date.now() - (index + 1) * 3_600_000).toISOString(), report.location, report.group)
      db.prepare(`INSERT INTO report_images (id, report_type, report_id, owner_user_id, original_storage_key, public_storage_key, thumbnail_storage_key, mime_type, width, height) VALUES (?, 'FOUND', ?, ?, ?, ?, ?, 'image/webp', 1200, 900)`)
        .run(report.imageId, report.id, userId, `${relative}/original.svg`, `${relative}/public-clean.webp`, `${relative}/thumbnail.webp`)
      db.prepare(`INSERT INTO ai_jobs (id, job_type, report_type, report_id) VALUES (?, 'EXTRACT_FEATURES', 'FOUND', ?)`)
        .run(`40000000-0000-4000-8000-00000000000${index + 1}`, report.id)
    })()
  }
  console.log('Seed complete. Demo login: demo@itda.kr / itda1234!')
}

seed()
