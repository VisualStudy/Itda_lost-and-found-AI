CREATE TABLE IF NOT EXISTS lost_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  lost_at TEXT NOT NULL,
  time_precision TEXT NOT NULL DEFAULT 'APPROXIMATE',
  location_text TEXT NOT NULL,
  location_group TEXT NOT NULL,
  attributes_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHED', 'CLOSED')),
  ai_status TEXT NOT NULL DEFAULT 'READY' CHECK (ai_status IN ('PENDING', 'PROCESSING', 'READY', 'FAILED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lost_user_created ON lost_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_category ON lost_reports(category);
CREATE INDEX IF NOT EXISTS idx_lost_location ON lost_reports(location_group);

CREATE TABLE IF NOT EXISTS candidate_matches (
  id TEXT PRIMARY KEY,
  lost_report_id TEXT NOT NULL REFERENCES lost_reports(id) ON DELETE CASCADE,
  found_report_id TEXT NOT NULL REFERENCES found_reports(id) ON DELETE CASCADE,
  final_score REAL NOT NULL,
  text_score REAL NOT NULL DEFAULT 0,
  visual_score REAL NOT NULL DEFAULT 0,
  attribute_score REAL NOT NULL DEFAULT 0,
  location_score REAL NOT NULL DEFAULT 0,
  time_score REAL NOT NULL DEFAULT 0,
  ocr_score REAL NOT NULL DEFAULT 0,
  explanation_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lost_report_id, found_report_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_lost_score ON candidate_matches(lost_report_id, final_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_found ON candidate_matches(found_report_id);
