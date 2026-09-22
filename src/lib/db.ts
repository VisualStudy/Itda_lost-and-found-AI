import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const databasePath = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.DATABASE_PATH ?? './data/itda.db',
)
fs.mkdirSync(path.dirname(databasePath), { recursive: true })

const globalForDb = globalThis as unknown as { itdaDb?: Database.Database }

export const db = globalForDb.itdaDb ?? new Database(databasePath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

if (process.env.NODE_ENV !== 'production') globalForDb.itdaDb = db

export function runMigrations() {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)

  const migrationsDir = path.join(process.cwd(), 'migrations')
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()
  const hasMigration = db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?')
  const recordMigration = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)')

  for (const file of files) {
    if (hasMigration.get(file)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    db.transaction(() => {
      db.exec(sql)
      recordMigration.run(file)
    })()
  }
}

runMigrations()
