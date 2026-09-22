import { db } from '@/lib/db'

export type UserRecord = {
  id: string
  email: string
  passwordHash: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    nickname: String(row.nickname),
    role: row.role === 'ADMIN' ? 'ADMIN' : 'USER',
  }
}

export const userRepository = {
  findByEmail(email: string): UserRecord | null {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as Record<string, unknown> | undefined
    return row ? mapUser(row) : null
  },

  create(input: { id: string; email: string; passwordHash: string; nickname: string }): UserRecord {
    db.prepare(`INSERT INTO users (id, email, password_hash, nickname) VALUES (?, ?, ?, ?)`)
      .run(input.id, input.email.toLowerCase(), input.passwordHash, input.nickname)
    return this.findByEmail(input.email)!
  },
}
