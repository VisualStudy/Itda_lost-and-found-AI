CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS found_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  found_at TEXT NOT NULL,
  time_precision TEXT NOT NULL DEFAULT 'EXACT',
  location_text TEXT NOT NULL,
  location_group TEXT NOT NULL,
  attributes_json TEXT NOT NULL DEFAULT '{}',
  ai_status TEXT NOT NULL DEFAULT 'PENDING',
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_found_created ON found_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_found_category ON found_reports(category);
CREATE INDEX IF NOT EXISTS idx_found_location ON found_reports(location_group);

CREATE TABLE IF NOT EXISTS report_images (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('LOST', 'FOUND')),
  report_id TEXT,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_storage_key TEXT NOT NULL,
  public_storage_key TEXT NOT NULL,
  thumbnail_storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  visual_features_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_report ON report_images(report_type, report_id, sort_order);

CREATE TABLE IF NOT EXISTS ai_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('LOST', 'FOUND')),
  report_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status, created_at);
