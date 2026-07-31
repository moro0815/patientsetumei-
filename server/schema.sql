-- せつめいナビ 院内サーバー スキーマ
--
-- 患者を直接特定できる情報（氏名・生年月日・住所・電話）は保存しません。
-- 受付番号はソルト付き SHA-256 ハッシュ、年齢は5歳刻みの年齢層として保持します。

CREATE TABLE IF NOT EXISTS masters (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,          -- JSON 文字列
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS explanation_records (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  chart_hash     TEXT,               -- 受付番号のハッシュ（同一患者の突合のみに使用）
  visit_date     TEXT,               -- 説明日 YYYY-MM-DD
  disease        TEXT NOT NULL,      -- osteoporosis / ra / kneeOA
  sex            TEXT,               -- female / male
  age_band       TEXT,               -- 例 '75〜79'
  doctor         TEXT,               -- 説明した医師（院内の担当者名）
  risk_tier      TEXT,               -- 骨粗鬆症：骨折リスク区分
  activity_level TEXT,               -- 関節リウマチ：疾患活動性
  locomo_stage   INTEGER,            -- ロコモ度 0-3
  drug_ids       TEXT NOT NULL DEFAULT '[]',
  exercise_ids   TEXT NOT NULL DEFAULT '[]',
  pathways       TEXT NOT NULL DEFAULT '[]',
  shown_slides   TEXT NOT NULL DEFAULT '[]',
  next_visit     TEXT,
  created_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_chart   ON explanation_records (chart_hash);
CREATE INDEX IF NOT EXISTS idx_records_created ON explanation_records (created_at);
CREATE INDEX IF NOT EXISTS idx_records_disease ON explanation_records (disease, created_at);
