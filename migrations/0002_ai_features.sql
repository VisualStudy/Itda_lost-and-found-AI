CREATE TABLE IF NOT EXISTS ai_features (
  id TEXT PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('LOST', 'FOUND')),
  report_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_version TEXT NOT NULL,
  text_embedding_json TEXT,
  image_embedding_json TEXT,
  ocr_public_json TEXT NOT NULL DEFAULT '[]',
  ocr_private_json TEXT NOT NULL DEFAULT '[]',
  detected_attributes_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_type, report_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_features_report ON ai_features(report_type, report_id);
