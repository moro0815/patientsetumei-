import type { DiseaseKey, Session } from '@/types'
import { createSession } from '@/state/session'

/**
 * URL パラメータによる連携
 *
 * 問診システムや電子カルテ側に「せつめいナビを開く」リンク／ボタンを作れる場合、
 * 患者データを URL に載せて渡せば、入力なしで説明を始められる。
 *
 *   http://192.168.10.20:8080/?d=ra&tjc=6&sjc=4&ptvas=5&phvas=4&crp=1.2&esr=30&age=58&sex=f
 *
 * プライバシー上の配慮
 * - 読み込んだ直後に history.replaceState で URL からパラメータを消す。
 *   ブラウザの履歴・タイトルバーに患者データが残らないようにする。
 * - 氏名は既定で受け付けない（`name` を明示的に渡した場合のみ）。
 * - この方式は URL がアクセスログに残る可能性があるため、
 *   院内サーバー経由で使う場合はログの保存方針を確認すること。
 *   ログに残したくない場合は「貼り付け取り込み」を使う。
 */

export interface UrlImportResult {
  session: Session
  /** 実際に反映された項目のラベル */
  applied: string[]
  /** 無視した項目（値が不正など） */
  ignored: string[]
}

const DISEASE_ALIAS: Record<string, DiseaseKey> = {
  ra: 'ra',
  rheumatoid: 'ra',
  リウマチ: 'ra',
  op: 'osteoporosis',
  osteoporosis: 'osteoporosis',
  骨粗鬆症: 'osteoporosis',
  knee: 'kneeOA',
  kneeoa: 'kneeOA',
  locomo: 'kneeOA',
  膝: 'kneeOA',
}

interface ParamDef {
  keys: string[]
  label: string
  min?: number
  max?: number
  apply: (s: Session, v: number) => void
}

const NUMERIC_PARAMS: ParamDef[] = [
  { keys: ['age'], label: '年齢', min: 0, max: 120, apply: (s, v) => (s.patient.age = v) },
  { keys: ['height', 'ht'], label: '身長', min: 100, max: 220, apply: (s, v) => (s.patient.heightCm = v) },
  { keys: ['weight', 'wt'], label: '体重', min: 20, max: 200, apply: (s, v) => (s.patient.weightKg = v) },
  { keys: ['maxheight', 'maxht'], label: '最大身長', min: 100, max: 220, apply: (s, v) => (s.patient.maxHeightCm = v) },

  // 関節リウマチ
  { keys: ['tjc', 'tjc28'], label: '圧痛関節数', min: 0, max: 28, apply: (s, v) => (s.ra.tenderJoints28 = v) },
  { keys: ['sjc', 'sjc28'], label: '腫脹関節数', min: 0, max: 28, apply: (s, v) => (s.ra.swollenJoints28 = v) },
  { keys: ['ptvas', 'ptga', 'pga'], label: '患者VAS', min: 0, max: 10, apply: (s, v) => (s.ra.patientGlobalVas = v) },
  { keys: ['phvas', 'phga', 'ega'], label: '医師VAS', min: 0, max: 10, apply: (s, v) => (s.ra.physicianGlobalVas = v) },
  { keys: ['crp'], label: 'CRP', min: 0, max: 60, apply: (s, v) => (s.ra.crp = v) },
  { keys: ['esr'], label: 'ESR', min: 0, max: 200, apply: (s, v) => (s.ra.esr = v) },
  { keys: ['rf'], label: 'RF', min: 0, max: 10000, apply: (s, v) => (s.ra.rf = v) },
  { keys: ['accp', 'ccp'], label: '抗CCP抗体', min: 0, max: 10000, apply: (s, v) => (s.ra.accp = v) },
  { keys: ['mmp3'], label: 'MMP-3', min: 0, max: 5000, apply: (s, v) => (s.ra.mmp3 = v) },
  { keys: ['haq'], label: 'HAQ-DI', min: 0, max: 3, apply: (s, v) => (s.ra.haq = v) },
  { keys: ['dur', 'duration'], label: '罹病期間(月)', min: 0, max: 1200, apply: (s, v) => (s.ra.durationMonths = v) },
  { keys: ['sdai'], label: 'SDAI', min: 0, max: 100, apply: (s, v) => (s.ra.external.sdai = v) },
  { keys: ['cdai'], label: 'CDAI', min: 0, max: 100, apply: (s, v) => (s.ra.external.cdai = v) },
  { keys: ['das28crp'], label: 'DAS28-CRP', min: 0, max: 10, apply: (s, v) => (s.ra.external.das28crp = v) },
  { keys: ['das28esr', 'das28'], label: 'DAS28-ESR', min: 0, max: 10, apply: (s, v) => (s.ra.external.das28esr = v) },

  // 骨粗鬆症
  { keys: ['lyam', 'lumbaryam'], label: '腰椎YAM', min: 20, max: 200, apply: (s, v) => (s.osteo.bmd.lumbar = v) },
  { keys: ['fyam', 'femuryam'], label: '大腿骨YAM', min: 20, max: 200, apply: (s, v) => (s.osteo.bmd.femur = v) },
  { keys: ['frax', 'fraxmof'], label: 'FRAX主要骨折', min: 0, max: 100, apply: (s, v) => (s.osteo.risk.fraxMajorPercent = v) },
  { keys: ['fraxhip'], label: 'FRAX大腿骨', min: 0, max: 100, apply: (s, v) => (s.osteo.risk.fraxHipPercent = v) },
  { keys: ['egfr'], label: 'eGFR', min: 0, max: 200, apply: (s, v) => (s.osteo.labs.egfr = v) },
  { keys: ['ca', 'calcium'], label: '血清Ca', min: 4, max: 20, apply: (s, v) => (s.osteo.labs.calcium = v) },
  { keys: ['vitd', 'vitd25'], label: '25(OH)D', min: 0, max: 200, apply: (s, v) => (s.osteo.labs.vitD25 = v) },

  // 膝・ロコモ
  { keys: ['kl', 'klgrade'], label: 'K-L分類', min: 0, max: 4, apply: (s, v) => (s.knee.klGrade = v) },
  { keys: ['nrs', 'pain'], label: '疼痛NRS', min: 0, max: 10, apply: (s, v) => (s.knee.painNrs = v) },
  { keys: ['locomo25'], label: 'ロコモ25', min: 0, max: 100, apply: (s, v) => (s.locomo.locomo25 = v) },
  { keys: ['twostep'], label: '2ステップ値', min: 0, max: 3, apply: (s, v) => (s.locomo.twoStepValue = v) },
]

/** URL の検索文字列からセッションを組み立てる。連携パラメータが無ければ null を返す */
export function sessionFromSearchParams(search: string): UrlImportResult | null {
  const q = new URLSearchParams(search)
  if ([...q.keys()].length === 0) return null

  const lower = new Map<string, string>()
  for (const [k, v] of q.entries()) lower.set(k.toLowerCase(), v)

  const diseaseRaw = (lower.get('d') ?? lower.get('disease') ?? '').toLowerCase()
  const disease = DISEASE_ALIAS[diseaseRaw]

  // 疾患も臨床値も無ければ連携リンクではないと判断する
  const hasClinical = NUMERIC_PARAMS.some((p) => p.keys.some((k) => lower.has(k)))
  const hasIdent = ['chart', 'id', 'age', 'sex', 'name'].some((k) => lower.has(k))
  if (!disease && !hasClinical && !hasIdent) return null

  const session = createSession(disease ?? 'osteoporosis')
  const applied: string[] = []
  const ignored: string[] = []

  if (disease) applied.push(`疾患：${disease}`)

  const chart = lower.get('chart') ?? lower.get('id')
  if (chart) {
    session.patient.chartNo = chart.slice(0, 32)
    applied.push('カルテ番号')
  }
  const name = lower.get('name')
  if (name) {
    session.patient.displayName = name.slice(0, 32)
    applied.push('氏名')
  }
  const sex = lower.get('sex')
  if (sex) {
    const s = sex.toLowerCase()
    if (['f', 'female', '女', '女性', '2'].includes(s)) {
      session.patient.sex = 'female'
      applied.push('性別')
    } else if (['m', 'male', '男', '男性', '1'].includes(s)) {
      session.patient.sex = 'male'
      applied.push('性別')
    } else {
      ignored.push(`性別（${sex}）`)
    }
  }
  const doctor = lower.get('dr') ?? lower.get('doctor')
  if (doctor) {
    session.patient.doctorName = doctor.slice(0, 32)
    applied.push('担当医')
  }

  for (const p of NUMERIC_PARAMS) {
    const key = p.keys.find((k) => lower.has(k))
    if (!key) continue
    const raw = lower.get(key)!
    const v = Number(raw)
    if (!Number.isFinite(v) || (p.min !== undefined && v < p.min) || (p.max !== undefined && v > p.max)) {
      ignored.push(`${p.label}（${raw}）`)
      continue
    }
    p.apply(session, v)
    applied.push(p.label)
  }

  if (session.ra.external.sdai !== null || session.ra.external.das28crp !== null || session.ra.external.das28esr !== null) {
    session.ra.external.source = '外部システム（URL連携）'
  }

  if (applied.length === 0) return null
  return { session, applied, ignored }
}

/**
 * 連携用URLの見本を作る（設定画面で表示し、問診システム側の担当者に渡せるようにする）
 */
export function buildSampleUrl(base: string, disease: DiseaseKey): string {
  const b = base.replace(/\?.*$/, '').replace(/\/$/, '')
  switch (disease) {
    case 'ra':
      return `${b}/?d=ra&chart=012345&age=58&sex=f&tjc=6&sjc=4&ptvas=5&phvas=4&crp=1.2&esr=30&sdai=20.2&dur=8`
    case 'osteoporosis':
      return `${b}/?d=op&chart=012345&age=76&sex=f&height=148&weight=46&lyam=64&fyam=62`
    case 'kneeOA':
      return `${b}/?d=knee&chart=012345&age=70&sex=f&height=158&weight=70&kl=3&nrs=6`
  }
}

/** 対応しているパラメータの一覧（設定画面に表示する） */
export const URL_PARAM_DOC: { param: string; label: string; example: string }[] = [
  { param: 'd', label: '疾患（ra / op / knee）', example: 'd=ra' },
  { param: 'chart', label: 'カルテ番号', example: 'chart=012345' },
  { param: 'age', label: '年齢', example: 'age=58' },
  { param: 'sex', label: '性別（f / m）', example: 'sex=f' },
  { param: 'height / weight', label: '身長・体重', example: 'height=158&weight=54' },
  { param: 'tjc / sjc', label: '圧痛・腫脹関節数', example: 'tjc=6&sjc=4' },
  { param: 'ptvas / phvas', label: '患者・医師VAS（0〜10）', example: 'ptvas=5&phvas=4' },
  { param: 'crp / esr', label: 'CRP（mg/dL）・ESR', example: 'crp=1.2&esr=30' },
  { param: 'sdai / cdai / das28crp', label: '算出済みスコア', example: 'sdai=20.2' },
  { param: 'dur', label: '罹病期間（月）', example: 'dur=8' },
  { param: 'lyam / fyam', label: '腰椎・大腿骨 YAM(%)', example: 'lyam=64&fyam=62' },
  { param: 'frax / fraxhip', label: 'FRAX（%）', example: 'frax=18.5' },
  { param: 'kl / nrs', label: 'K-L分類・疼痛NRS', example: 'kl=3&nrs=6' },
  { param: 'locomo25 / twostep', label: 'ロコモ25・2ステップ値', example: 'locomo25=18&twostep=1.0' },
]
