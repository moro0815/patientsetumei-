import type { Session } from '@/types'

/**
 * 問診タブレットシステム（monshin-tablet）との直接連携
 *
 * 相手システム
 *   もろほし整形外科クリニック「整形外科 デジタル問診システム」
 *   server.py / Python標準ライブラリのみ / 既定ポート 8090 / 院内LAN
 *
 * 使うAPI（相手システムに変更を加える必要はありません）
 *   GET /api/intakes?full=1  … 当日の問診一覧（answers 付き）
 *   GET /api/search?q=...    … 過去分の検索（氏名・カナ・患者ID・生年月日・電話）
 *   GET /api/info            … 死活確認とバージョン
 *
 * CORS について
 *   相手のサーバーは CORS ヘッダーを返しません。したがって
 *   「せつめいナビを問診サーバーと同じオリジンから配信する」構成が前提です。
 *     例）monshin-tablet/setsumei/ に dist を置く
 *         → http://192.168.x.x:8090/setsumei/ で開く
 *         → fetch('/api/intakes') は同一オリジンなので許可される
 *   別オリジンから使う場合は、相手サーバーに CORS ヘッダーの追加が必要です
 *   （deploy/monshin-integration/README.md に手順を記載）。
 */

// ---------------------------------------------------------------- 相手システムの型

export interface MonshinIntake {
  id: string
  time: string
  status: string
  name: string
  kana: string
  sex: 'm' | 'f' | ''
  birth: string
  age: number | null
  chief: string
  alerts: { level?: string; label?: string }[]
  stext: string
  patientId: string
  source: string
  /** 'ra' = リウマチ再診問診、'' = 通常の問診 */
  form: string
  answers?: Record<string, unknown>
}

export interface MonshinFetchResult {
  ok: boolean
  intakes: MonshinIntake[]
  error?: string
}

// ---------------------------------------------------------------- 接続

/**
 * 問診サーバーのベースURL。
 * 空文字 = 同一オリジン（問診サーバーの中に配置した場合。推奨）
 */
export function normalizeBase(base: string): string {
  const b = (base || '').trim().replace(/\/+$/, '')
  return b
}

async function getJson(base: string, path: string, timeoutMs = 4000): Promise<unknown> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(`${normalizeBase(base)}${path}`, {
      signal: ctl.signal,
      // 患者情報を扱うため、キャッシュを残さない
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!res.ok) throw new Error(`サーバーが ${res.status} を返しました`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** 問診サーバーに繋がるか確認する */
export async function checkConnection(base: string): Promise<{ ok: boolean; message: string }> {
  try {
    const j = (await getJson(base, '/api/info')) as { ok?: boolean; version?: string; ip?: string; port?: number }
    if (!j?.ok) return { ok: false, message: '問診サーバーが応答しましたが、内容を解釈できませんでした。' }
    return {
      ok: true,
      message: `問診システムに接続できました（バージョン ${j.version ?? '不明'}／${j.ip ?? '?'}:${j.port ?? '?'}）`,
    }
  } catch (e) {
    return { ok: false, message: connectionHint(e, base) }
  }
}

/** 当日の問診一覧を取得する */
export async function fetchTodayIntakes(base: string): Promise<MonshinFetchResult> {
  try {
    const j = (await getJson(base, '/api/intakes?full=1')) as { ok?: boolean; intakes?: MonshinIntake[] }
    if (!j?.ok || !Array.isArray(j.intakes)) {
      return { ok: false, intakes: [], error: '問診一覧の形式が想定と異なります。' }
    }
    return { ok: true, intakes: j.intakes }
  } catch (e) {
    return { ok: false, intakes: [], error: connectionHint(e, base) }
  }
}

/** 過去の問診を検索する（氏名・カナ・診察券番号・生年月日・電話の一部） */
export async function searchIntakes(base: string, q: string): Promise<MonshinFetchResult> {
  if (q.trim().length < 2) return { ok: true, intakes: [] }
  try {
    const j = (await getJson(base, `/api/search?q=${encodeURIComponent(q)}`)) as {
      ok?: boolean
      results?: MonshinIntake[]
    }
    if (!j?.ok || !Array.isArray(j.results)) {
      return { ok: false, intakes: [], error: '検索結果の形式が想定と異なります。' }
    }
    return { ok: true, intakes: j.results }
  } catch (e) {
    return { ok: false, intakes: [], error: connectionHint(e, base) }
  }
}

function connectionHint(e: unknown, base: string): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/abort/i.test(msg)) {
    return '問診サーバーが時間内に応答しませんでした。問診システムが起動しているかご確認ください。'
  }
  const where = base ? `「${base}」` : '同じサーバー（同一オリジン）'
  return (
    `問診システム${where}に接続できませんでした（${msg}）。\n` +
    '・問診システムが起動しているか\n' +
    '・URLとポート（既定 8090）が正しいか\n' +
    '・別のサーバーから開いている場合、問診サーバー側に CORS の設定が必要です' +
    '（せつめいナビを問診サーバーの中に置いて同じアドレスで開くのが最も簡単です）'
  )
}

// ---------------------------------------------------------------- 表示用

const STIFFNESS_LABEL: Record<string, string> = {
  none: 'こわばりはない',
  lt15: '15分くらいまで',
  lt30: '30分くらい',
  lt60: '1時間くらい',
  gt60: '1時間以上つづく',
}

const CHANGE_LABEL: Record<string, string> = {
  better: '良くなっている',
  same: '変わらない',
  worse: '悪くなっている',
}

/** mHAQ 8項目の平均（0〜3）。回答があった項目だけで平均する */
export function calcMhaq(answers: Record<string, unknown> | undefined): { value: number | null; answered: number } {
  if (!answers) return { value: null, answered: 0 }
  const vals: number[] = []
  for (let i = 1; i <= 8; i++) {
    const v = answers[`mhaq${i}`]
    if (v === null || v === undefined || v === '') continue
    const n = Number(v)
    if (Number.isFinite(n)) vals.push(n)
  }
  if (vals.length === 0) return { value: null, answered: 0 }
  const mean = vals.reduce((s, x) => s + x, 0) / vals.length
  return { value: Math.round(mean * 1000) / 1000, answered: vals.length }
}

/** 一覧に出す1行の要約 */
export function intakeSummary(it: MonshinIntake): string {
  const bits: string[] = []
  if (it.time) bits.push(String(it.time).slice(11, 16) || String(it.time))
  bits.push(it.name || '（氏名は受付で確認）')
  if (it.age !== null && it.age !== undefined) bits.push(`${it.age}歳`)
  if (it.sex) bits.push(it.sex === 'f' ? '女性' : '男性')
  if (it.patientId) bits.push(`ID ${it.patientId}`)
  bits.push(it.form === 'ra' ? 'リウマチ再診' : it.chief || '問診')
  return bits.join(' / ')
}

// ---------------------------------------------------------------- セッションへの取り込み

export interface MonshinApplyResult {
  session: Session
  applied: string[]
  notes: string[]
}

/**
 * 問診の回答をセッションへ反映する。
 *
 * 反映するもの
 *   診察券番号・氏名・年齢・性別（患者基本情報）
 *   リウマチ再診（form==='ra'）のとき
 *     患者全般評価VAS（0〜100 → 0〜10cm に換算）
 *     mHAQ 8項目の平均 → HAQ 欄
 *     朝のこわばり・前回比 → 参考情報として保持しカルテ記載に載せる
 *
 * 反映しないもの
 *   関節数・CRP・SDAI などの診察室で入力する値。
 *   これらは問診システムの診察室画面（doctor.html）で入力され、
 *   そちらの「スコアをカルテにコピー」の文字列を貼り付けて取り込みます。
 */
export function applyIntakeToSession(session: Session, it: MonshinIntake): MonshinApplyResult {
  const applied: string[] = []
  const notes: string[] = []
  const a = (it.answers ?? {}) as Record<string, unknown>

  const s: Session = {
    ...session,
    disease: it.form === 'ra' ? 'ra' : session.disease,
    patient: { ...session.patient },
    ra: { ...session.ra, comorbidity: { ...session.ra.comorbidity }, external: { ...session.ra.external } },
    osteo: { ...session.osteo, bmd: { ...session.osteo.bmd }, risk: { ...session.osteo.risk }, labs: { ...session.osteo.labs } },
    knee: { ...session.knee },
    locomo: { ...session.locomo },
  }

  if (it.form === 'ra' && session.disease !== 'ra') applied.push('疾患：関節リウマチ')

  if (it.patientId) {
    s.patient.chartNo = String(it.patientId).slice(0, 32)
    applied.push('診察券番号')
  }
  if (it.name) {
    s.patient.displayName = String(it.name).slice(0, 32)
    applied.push('氏名')
  }
  if (typeof it.age === 'number' && it.age >= 0 && it.age <= 120) {
    s.patient.age = it.age
    applied.push('年齢')
  }
  if (it.sex === 'f' || it.sex === 'm') {
    s.patient.sex = it.sex === 'f' ? 'female' : 'male'
    applied.push('性別')
  }

  // ---- リウマチ再診の回答 ----
  const vg = a.vasGlobal
  if (vg !== null && vg !== undefined && vg !== '') {
    const n = Number(vg)
    if (Number.isFinite(n) && n >= 0 && n <= 100) {
      // 問診は 0〜100mm、SDAI/CDAI は 0〜10cm
      s.ra.patientGlobalVas = Math.round((n / 10) * 10) / 10
      applied.push('患者全般評価VAS（0〜100 → 0〜10に換算）')
    }
  }

  const mhaq = calcMhaq(a)
  if (mhaq.value !== null) {
    s.ra.haq = mhaq.value
    applied.push(`mHAQ ${mhaq.value}${mhaq.answered < 8 ? `（${mhaq.answered}/8項目）` : ''}`)
  }

  const stiff = typeof a.stiffness === 'string' ? a.stiffness : ''
  if (stiff) {
    s.ra.morningStiffness = STIFFNESS_LABEL[stiff] ?? stiff
    applied.push('朝のこわばり')
    if (stiff === 'gt60') notes.push('朝のこわばりが1時間以上つづいています（活動性が高いサインです）。')
  }

  const change = typeof a.raChange === 'string' ? a.raChange : ''
  if (change) {
    s.ra.changeFromLast = CHANGE_LABEL[change] ?? change
    applied.push('前回との比較')
    if (change === 'worse') notes.push('前回より悪化と回答しています。治療強化の検討が必要かご確認ください。')
  }

  const raNote = typeof a.raNote === 'string' ? a.raNote.trim() : ''
  if (raNote) notes.push(`患者さんからの伝言：「${raNote}」`)

  for (const al of it.alerts ?? []) {
    if (al?.label) notes.push(`問診の警告：${al.label}`)
  }

  if (it.form === 'ra') {
    s.ra.external.source = s.ra.external.source || '問診システム（デジタル問診）'
  }

  return { session: s, applied, notes }
}
