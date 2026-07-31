/**
 * せつめいナビ 院内サーバー（任意機能）
 *
 * 役割
 *  1. ビルド済みフロントエンド（../dist）の静的配信
 *  2. 院内マスタ（医療機関設定・運動メニュー上書き・診療報酬）の共有
 *  3. 説明実施記録の保存と集計（OLS/FLS の実績管理、次回への引き継ぎ）
 *
 * 設計上の約束
 *  - 患者氏名は受け取らない。受付番号は SHA-256 のハッシュとして受け取り、平文では保存しない。
 *  - 依存は better-sqlite3 のみ。Node 標準の http/crypto で実装し、監査しやすくする。
 *  - すべての API は共有トークン（Bearer）で保護する。院内LANのみでの利用を前提とする。
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------- 設定

const PORT = Number(process.env.PORT ?? 8080)
const HOST = process.env.HOST ?? '0.0.0.0'
const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, 'data')
const TOKEN = process.env.SETSUMEI_TOKEN ?? ''
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? '*'
const RETENTION_DAYS = Number(process.env.RECORD_RETENTION_DAYS ?? 1825)
const STATIC_DIR = path.join(__dirname, '..', 'dist')

if (!TOKEN || TOKEN === 'change-me') {
  console.error(
    '[起動中止] 環境変数 SETSUMEI_TOKEN が未設定、または初期値のままです。\n' +
      '           .env.example をコピーして、推測されにくい値に必ず変更してください。',
  )
  process.exit(1)
}

fs.mkdirSync(DATA_DIR, { recursive: true })

// ---------------------------------------------------------------- データベース

const db = new Database(path.join(DATA_DIR, 'setsumei.sqlite'))
db.pragma('journal_mode = WAL')
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

// 保持期間を過ぎた記録を起動時に削除する（不要な個人関連情報を持ち続けない）
const purged = db
  .prepare(`DELETE FROM explanation_records WHERE created_at < datetime('now', ?)`)
  .run(`-${RETENTION_DAYS} days`)
if (purged.changes > 0) {
  console.log(`[起動時整理] 保持期間（${RETENTION_DAYS}日）を過ぎた記録 ${purged.changes} 件を削除しました`)
}

// ---------------------------------------------------------------- ユーティリティ

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

function send(res, status, body, headers = {}) {
  const base = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
  }
  res.writeHead(status, { ...base, ...headers })
  res.end(body)
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  })
}

function authorized(req) {
  const h = req.headers.authorization ?? ''
  const m = /^Bearer\s+(.+)$/.exec(h)
  if (!m) return false
  const given = Buffer.from(m[1])
  const expected = Buffer.from(TOKEN)
  // 長さが違うと timingSafeEqual が例外を投げるため、先にハッシュ化して固定長にする
  const gh = crypto.createHash('sha256').update(given).digest()
  const eh = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(gh, eh)
}

async function readJson(req, limitBytes = 512 * 1024) {
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > limitBytes) throw new Error('リクエストが大きすぎます')
    chunks.push(c)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * 受付番号を保存可能な形に変える。
 * 送信側でハッシュ化されている場合はそのまま使い、平文が来た場合はサーバー側で
 * ソルト付きハッシュに変換して、平文を残さない。
 */
const HASH_SALT = crypto
  .createHash('sha256')
  .update(TOKEN + '|setsumei-navi-chart-salt')
  .digest('hex')

function chartHash(value) {
  if (!value) return null
  const s = String(value).trim()
  if (!s) return null
  if (/^[0-9a-f]{64}$/i.test(s)) return s.toLowerCase() // すでにハッシュ
  return crypto.createHash('sha256').update(HASH_SALT + s).digest('hex')
}

/** 年齢は5歳刻みの年齢層にして保存する（個人の特定可能性を下げる） */
function ageBand(age) {
  if (age === null || age === undefined || Number.isNaN(Number(age))) return null
  const a = Number(age)
  if (a < 20) return '〜19'
  if (a >= 95) return '95〜'
  const lo = Math.floor(a / 5) * 5
  return `${lo}〜${lo + 4}`
}

// ---------------------------------------------------------------- 静的配信

function serveStatic(req, res, urlPath) {
  const rel = urlPath === '/' ? 'index.html' : decodeURIComponent(urlPath.replace(/^\/+/, ''))
  const target = path.resolve(STATIC_DIR, rel)
  // ディレクトリトラバーサルの防止
  if (!target.startsWith(path.resolve(STATIC_DIR))) {
    return send(res, 403, 'Forbidden')
  }
  fs.stat(target, (err, st) => {
    if (err || !st.isFile()) {
      // SPA なので、見つからないパスは index.html を返す
      const index = path.join(STATIC_DIR, 'index.html')
      if (fs.existsSync(index)) {
        return send(res, 200, fs.readFileSync(index), { 'Content-Type': MIME['.html'] })
      }
      return send(res, 404, 'Not Found（dist/ がまだビルドされていません。npm run build を実行してください）')
    }
    const ext = path.extname(target).toLowerCase()
    const cache = ext === '.html' ? 'no-store' : 'public, max-age=86400'
    send(res, 200, fs.readFileSync(target), {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': cache,
    })
  })
}

// ---------------------------------------------------------------- API

const routes = {
  'GET /api/health': (_req, res) => {
    sendJson(res, 200, { ok: true, time: new Date().toISOString(), retentionDays: RETENTION_DAYS })
  },

  'GET /api/masters': (_req, res) => {
    const rows = db.prepare('SELECT key, value, updated_at FROM masters').all()
    const out = {}
    for (const r of rows) {
      try {
        out[r.key] = { value: JSON.parse(r.value), updatedAt: r.updated_at }
      } catch {
        out[r.key] = { value: null, updatedAt: r.updated_at }
      }
    }
    sendJson(res, 200, out)
  },

  'PUT /api/masters': async (req, res) => {
    const body = await readJson(req)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, 400, { error: 'オブジェクト形式で送信してください' })
    }
    const stmt = db.prepare(`
      INSERT INTO masters (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `)
    const tx = db.transaction((entries) => {
      for (const [k, v] of entries) stmt.run(k, JSON.stringify(v))
    })
    tx(Object.entries(body))
    sendJson(res, 200, { ok: true, keys: Object.keys(body) })
  },

  'POST /api/records': async (req, res) => {
    const b = await readJson(req)
    const disease = String(b.disease ?? '')
    if (!['osteoporosis', 'ra', 'kneeOA'].includes(disease)) {
      return sendJson(res, 400, { error: 'disease は osteoporosis / ra / kneeOA のいずれかです' })
    }
    // 保存するのは集計と継続管理に必要な最小限のみ。氏名は受け取らない。
    const row = {
      chart_hash: chartHash(b.chartNo ?? b.chartHash),
      visit_date: typeof b.visitDate === 'string' ? b.visitDate.slice(0, 10) : null,
      disease,
      sex: b.sex === 'male' || b.sex === 'female' ? b.sex : null,
      age_band: ageBand(b.age),
      doctor: typeof b.doctorName === 'string' ? b.doctorName.slice(0, 64) : null,
      risk_tier: typeof b.riskTier === 'string' ? b.riskTier.slice(0, 16) : null,
      activity_level: typeof b.activityLevel === 'string' ? b.activityLevel.slice(0, 16) : null,
      locomo_stage: Number.isInteger(b.locomoStage) ? b.locomoStage : null,
      drug_ids: JSON.stringify(Array.isArray(b.drugIds) ? b.drugIds.slice(0, 20) : []),
      exercise_ids: JSON.stringify(Array.isArray(b.exerciseIds) ? b.exerciseIds.slice(0, 30) : []),
      pathways: JSON.stringify(Array.isArray(b.exercisePathway) ? b.exercisePathway.slice(0, 10) : []),
      shown_slides: JSON.stringify(Array.isArray(b.shownSlideIds) ? b.shownSlideIds.slice(0, 60) : []),
      next_visit: typeof b.nextVisit === 'string' ? b.nextVisit.slice(0, 120) : null,
    }
    const info = db
      .prepare(
        `INSERT INTO explanation_records
         (chart_hash, visit_date, disease, sex, age_band, doctor, risk_tier, activity_level,
          locomo_stage, drug_ids, exercise_ids, pathways, shown_slides, next_visit, created_at)
         VALUES (@chart_hash, @visit_date, @disease, @sex, @age_band, @doctor, @risk_tier,
                 @activity_level, @locomo_stage, @drug_ids, @exercise_ids, @pathways,
                 @shown_slides, @next_visit, datetime('now'))`,
      )
      .run(row)
    sendJson(res, 201, { ok: true, id: info.lastInsertRowid })
  },

  'GET /api/records/summary': (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const from = url.searchParams.get('from') ?? '1900-01-01'
    const to = url.searchParams.get('to') ?? '2999-12-31'
    const byDisease = db
      .prepare(
        `SELECT disease, COUNT(*) AS n FROM explanation_records
         WHERE date(created_at) BETWEEN ? AND ? GROUP BY disease`,
      )
      .all(from, to)
    const byRisk = db
      .prepare(
        `SELECT disease, risk_tier, COUNT(*) AS n FROM explanation_records
         WHERE date(created_at) BETWEEN ? AND ? AND risk_tier IS NOT NULL
         GROUP BY disease, risk_tier`,
      )
      .all(from, to)
    const byPathway = db
      .prepare(
        `SELECT pathways, COUNT(*) AS n FROM explanation_records
         WHERE date(created_at) BETWEEN ? AND ? GROUP BY pathways`,
      )
      .all(from, to)
    const total = db
      .prepare(`SELECT COUNT(*) AS n FROM explanation_records WHERE date(created_at) BETWEEN ? AND ?`)
      .get(from, to)
    sendJson(res, 200, { from, to, total: total.n, byDisease, byRisk, byPathway })
  },

  'GET /api/records/recent': (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const hash = chartHash(url.searchParams.get('hash') ?? url.searchParams.get('chartNo'))
    if (!hash) return sendJson(res, 400, { error: 'hash（または chartNo）を指定してください' })
    const rows = db
      .prepare(
        `SELECT id, visit_date, disease, risk_tier, activity_level, locomo_stage,
                drug_ids, exercise_ids, pathways, next_visit, created_at
         FROM explanation_records WHERE chart_hash = ?
         ORDER BY created_at DESC LIMIT 5`,
      )
      .all(hash)
    sendJson(
      res,
      200,
      rows.map((r) => ({
        ...r,
        drug_ids: JSON.parse(r.drug_ids ?? '[]'),
        exercise_ids: JSON.parse(r.exercise_ids ?? '[]'),
        pathways: JSON.parse(r.pathways ?? '[]'),
      })),
    )
  },
}

// ---------------------------------------------------------------- サーバー

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const key = `${req.method} ${url.pathname}`

  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Origin': ALLOW_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '600',
    })
  }

  if (url.pathname.startsWith('/api/')) {
    if (url.pathname !== '/api/health' && !authorized(req)) {
      return sendJson(res, 401, { error: '認証が必要です（Authorization: Bearer <SETSUMEI_TOKEN>）' })
    }
    const handler = routes[key]
    if (!handler) return sendJson(res, 404, { error: `未定義のエンドポイント: ${key}` })
    try {
      await handler(req, res)
    } catch (e) {
      console.error('[APIエラー]', key, e)
      sendJson(res, 500, { error: '内部エラーが発生しました' })
    }
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed')
  }
  serveStatic(req, res, url.pathname)
})

server.listen(PORT, HOST, () => {
  console.log(`せつめいナビ 院内サーバー: http://${HOST}:${PORT}`)
  console.log(`  静的配信: ${STATIC_DIR}`)
  console.log(`  データ:   ${path.join(DATA_DIR, 'setsumei.sqlite')}`)
  console.log(`  記録保持: ${RETENTION_DAYS} 日`)
})

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(`\n${sig} を受信しました。終了します。`)
    server.close(() => {
      db.close()
      process.exit(0)
    })
  })
}
