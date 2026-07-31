import type { Session } from '@/types'

/**
 * 外部システムからのデータ取り込み
 *
 * 背景
 * - 関節リウマチの疾患活動性（SDAI・関節数・VAS）は問診システムで既に入力されている
 * - 骨密度（YAM）は電子カルテに記載されている
 * - 電子カルテとの直接連携はできない
 *
 * そこで「画面に出ている文字を貼り付けるだけ」で取り込めるようにする。
 * 相手のシステムを問わず、出力形式が変わっても壊れにくいことを最優先にしている。
 *
 * 対応する形式
 *   圧痛関節数：6              ラベル＋区切り＋数値
 *   圧痛関節数 6/28            分母付き
 *   TJC28  6                   英語略号・空白区切り
 *   腫脹関節数<TAB>4           Excel/CSVからの貼り付け
 *   SDAI 20.2                  算出済みスコア
 *   ＣＲＰ　１．２             全角
 *   患者VAS 50mm               mm表記（cmに換算し警告を出す）
 */

// ---------------------------------------------------------------- 取り込み結果の型

export type ImportKey =
  // 患者基本
  | 'chartNo' | 'displayName' | 'age' | 'sex' | 'heightCm' | 'weightKg' | 'maxHeightCm'
  // 関節リウマチ
  | 'tenderJoints28' | 'swollenJoints28' | 'patientGlobalVas' | 'physicianGlobalVas'
  | 'crp' | 'esr' | 'rf' | 'accp' | 'mmp3' | 'haq' | 'durationMonths'
  | 'sdai' | 'cdai' | 'das28crp' | 'das28esr'
  // 骨粗鬆症
  | 'lumbarYam' | 'femurYam' | 'lumbarT' | 'femurT'
  | 'fraxMajorPercent' | 'fraxHipPercent'
  | 'calcium' | 'vitD25' | 'tracp5b' | 'p1np' | 'egfr'
  // 膝・ロコモ
  | 'klGrade' | 'painNrs' | 'locomo25' | 'twoStepValue'

export interface ParsedField {
  key: ImportKey
  label: string
  value: number | string
  /** 元の文字列（確認画面で「どこから読んだか」を示す） */
  raw: string
  /** 単位換算などを行った場合の注記 */
  note?: string
  /** 取り込むかどうか（確認画面でチェックを外せる） */
  selected: boolean
}

export interface ParseResult {
  fields: ParsedField[]
  warnings: string[]
}

// ---------------------------------------------------------------- 正規化

/** 全角英数字・記号を半角にし、区切りを揃える */
export function normalizeText(input: string): string {
  return input
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ')
    .replace(/[，､、]/g, ',')
    .replace(/[：]/g, ':')
    .replace(/[−–—ー]/g, '-')
    .replace(/\r\n?/g, '\n')
}

// ---------------------------------------------------------------- 項目の定義

interface FieldDef {
  key: ImportKey
  label: string
  /** ラベルの別名。長い（＝specificな）ものから順に並べる */
  aliases: string[]
  kind: 'number' | 'text' | 'sex'
  /** 妥当な範囲。外れたら取り込まず警告する */
  min?: number
  max?: number
  /** ラベル単独では誤検出しやすい（前後の境界を厳密にする） */
  strict?: boolean
  /** 値を読んだあとの補正（単位換算など） */
  adjust?: (v: number) => { value: number; note?: string } | null
}

/**
 * 定義の順序＝マッチの優先順位。
 * 「DAS28-CRP」を「CRP」より先に置かないと、CRPとして誤読してしまう。
 * 一度マッチした文字範囲は消費済みにして、後続の定義が再マッチしないようにしている。
 */
const FIELDS: FieldDef[] = [
  // ---- 算出済みスコア（先に処理する） ----
  { key: 'das28crp', label: 'DAS28-CRP', aliases: ['DAS28-CRP', 'DAS28(CRP)', 'DAS28CRP', 'DAS28 CRP'], kind: 'number', min: 0, max: 10 },
  { key: 'das28esr', label: 'DAS28-ESR', aliases: ['DAS28-ESR', 'DAS28(ESR)', 'DAS28ESR', 'DAS28 ESR', 'DAS28'], kind: 'number', min: 0, max: 10 },
  { key: 'sdai', label: 'SDAI', aliases: ['SDAI'], kind: 'number', min: 0, max: 100 },
  { key: 'cdai', label: 'CDAI', aliases: ['CDAI'], kind: 'number', min: 0, max: 100 },

  // ---- 関節所見 ----
  {
    key: 'tenderJoints28',
    label: '圧痛関節数',
    aliases: ['圧痛関節数', '疼痛関節数', '圧痛関節', '圧痛', 'TJC28', 'TJC', '触診で痛い関節'],
    kind: 'number',
    min: 0,
    max: 28,
  },
  {
    key: 'swollenJoints28',
    label: '腫脹関節数',
    aliases: ['腫脹関節数', '腫脹関節', '腫脹', 'SJC28', 'SJC', '腫れている関節'],
    kind: 'number',
    min: 0,
    max: 28,
  },
  {
    key: 'patientGlobalVas',
    label: '患者全般評価(VAS)',
    aliases: ['患者による全般評価', '患者全般評価', '患者の全般評価', '患者VAS', '患者評価', 'PtGA', 'PGA'],
    kind: 'number',
    min: 0,
    max: 100,
    adjust: vasToCm,
  },
  {
    key: 'physicianGlobalVas',
    label: '医師全般評価(VAS)',
    aliases: ['医師による全般評価', '医師全般評価', '評価者全般評価', '医師VAS', '評価者VAS', '医師評価', 'PhGA', 'EGA'],
    kind: 'number',
    min: 0,
    max: 100,
    adjust: vasToCm,
  },

  // ---- 血液検査 ----
  {
    key: 'crp',
    label: 'CRP',
    aliases: ['CRP定量', 'CRP', 'C反応性蛋白'],
    kind: 'number',
    min: 0,
    max: 60,
    strict: true,
  },
  { key: 'esr', label: 'ESR', aliases: ['赤血球沈降速度', 'ESR', '血沈', '赤沈'], kind: 'number', min: 0, max: 200, strict: true },
  { key: 'mmp3', label: 'MMP-3', aliases: ['MMP-3', 'MMP3'], kind: 'number', min: 0, max: 5000 },
  { key: 'accp', label: '抗CCP抗体', aliases: ['抗CCP抗体', '抗CCP', 'ACPA', 'CCP'], kind: 'number', min: 0, max: 10000, strict: true },
  { key: 'rf', label: 'RF', aliases: ['リウマトイド因子', 'リウマチ因子', 'RF定量', 'RF'], kind: 'number', min: 0, max: 10000, strict: true },
  // mHAQ（modified HAQ）は問診システムが出力する形式。HAQ-DI と同じ 0〜3 の機能指標として扱う
  { key: 'haq', label: 'HAQ-DI／mHAQ', aliases: ['HAQ-DI', 'mHAQ', 'HAQ'], kind: 'number', min: 0, max: 3 },
  { key: 'durationMonths', label: '罹病期間(月)', aliases: ['罹病期間', '発症からの期間', '発症後'], kind: 'number', min: 0, max: 1200 },

  // ---- 骨密度 ----
  {
    key: 'lumbarYam',
    label: '腰椎 YAM(%)',
    aliases: ['腰椎YAM', '腰椎 YAM', '腰椎(L2-4)YAM', '腰椎骨密度YAM', 'L2-4 YAM', 'L1-4 YAM', 'LS YAM'],
    kind: 'number',
    min: 20,
    max: 200,
  },
  {
    key: 'femurYam',
    label: '大腿骨 YAM(%)',
    aliases: ['大腿骨近位部YAM', '大腿骨頸部YAM', '大腿骨YAM', '大腿骨 YAM', 'FN YAM', 'TH YAM'],
    kind: 'number',
    min: 20,
    max: 200,
  },
  {
    key: 'lumbarT',
    label: '腰椎 Tスコア',
    aliases: ['腰椎Tスコア', '腰椎T-score', '腰椎Tscore', '腰椎 T値', 'L2-4 T', 'LS T-score'],
    kind: 'number',
    min: -8,
    max: 6,
  },
  {
    key: 'femurT',
    label: '大腿骨 Tスコア',
    aliases: ['大腿骨近位部Tスコア', '大腿骨Tスコア', '大腿骨T-score', '大腿骨Tscore', '大腿骨 T値', 'FN T-score'],
    kind: 'number',
    min: -8,
    max: 6,
  },
  {
    key: 'fraxMajorPercent',
    label: 'FRAX 主要骨折(%)',
    aliases: ['FRAX主要骨折', 'FRAX(主要)', '主要骨折確率', '主要骨粗鬆症性骨折', 'MOF'],
    kind: 'number',
    min: 0,
    max: 100,
  },
  {
    key: 'fraxHipPercent',
    label: 'FRAX 大腿骨近位部(%)',
    aliases: ['FRAX大腿骨', '大腿骨近位部骨折確率', 'FRAX(股関節)', 'Hip fracture'],
    kind: 'number',
    min: 0,
    max: 100,
  },
  { key: 'tracp5b', label: 'TRACP-5b', aliases: ['TRACP-5b', 'TRACP5b', 'TRAcP-5b'], kind: 'number', min: 0, max: 5000 },
  { key: 'p1np', label: 'P1NP', aliases: ['total P1NP', 'Intact P1NP', 'P1NP'], kind: 'number', min: 0, max: 2000 },
  { key: 'vitD25', label: '25(OH)D', aliases: ['25(OH)D', '25-OH-D', '25OHD', 'ビタミンD'], kind: 'number', min: 0, max: 200 },
  { key: 'egfr', label: 'eGFR', aliases: ['eGFR', 'GFR'], kind: 'number', min: 0, max: 200, strict: true },
  { key: 'calcium', label: '血清カルシウム', aliases: ['血清カルシウム', '血清Ca', 'カルシウム', 'Ca'], kind: 'number', min: 4, max: 20, strict: true },

  // ---- 膝・ロコモ ----
  { key: 'klGrade', label: 'K-L分類', aliases: ['Kellgren-Lawrence', 'K-L分類', 'KL分類', 'K-Lグレード', 'K-L'], kind: 'number', min: 0, max: 4 },
  { key: 'painNrs', label: '疼痛NRS', aliases: ['疼痛NRS', '痛みのNRS', 'NRS', '疼痛スケール'], kind: 'number', min: 0, max: 10 },
  { key: 'locomo25', label: 'ロコモ25', aliases: ['ロコモ25', 'ロコモ 25'], kind: 'number', min: 0, max: 100 },
  { key: 'twoStepValue', label: '2ステップ値', aliases: ['2ステップ値', '二ステップ値', 'ツーステップ値'], kind: 'number', min: 0, max: 3 },

  // ---- 患者基本情報 ----
  { key: 'maxHeightCm', label: '最大身長', aliases: ['最大身長', '若い頃の身長', '20歳頃の身長', '若年時身長'], kind: 'number', min: 100, max: 220 },
  { key: 'heightCm', label: '身長', aliases: ['身長'], kind: 'number', min: 100, max: 220 },
  { key: 'weightKg', label: '体重', aliases: ['体重'], kind: 'number', min: 20, max: 200 },
  { key: 'age', label: '年齢', aliases: ['年齢', '歳'], kind: 'number', min: 0, max: 120 },
  { key: 'sex', label: '性別', aliases: ['性別'], kind: 'sex' },
  { key: 'chartNo', label: 'カルテ番号', aliases: ['カルテ番号', '診察券番号', '受付番号', '患者番号', '患者ID'], kind: 'text' },
  { key: 'displayName', label: '氏名', aliases: ['患者氏名', '氏名', 'お名前'], kind: 'text' },
]

/** VAS が 0〜100 mm で入力されている場合に 0〜10 cm へ換算する */
function vasToCm(v: number): { value: number; note?: string } {
  if (v > 10) return { value: Math.round((v / 10) * 10) / 10, note: 'mm表記とみなして cm に換算しました' }
  return { value: v }
}

// ---------------------------------------------------------------- 解析

const NUM = '(-?\\d+(?:\\.\\d+)?)'
/** 区切り記号（コロン・タブ・スラッシュなど） */
const PUNCT = '[\\s\\t:=／|,]*'
/**
 * ラベルと値のあいだに入る「かっこ書き」。
 * 「患者全般評価（VAS）：5.0」「CRP (mg/dL): 1.2」「圧痛関節数 [0-28] 6」のように、
 * 単位や補足がかっこで挟まる書き方は実際の帳票でよくあるため、読み飛ばせるようにする。
 */
const BRACKET = '(?:[(\\[][^)\\]\\n]{0,16}[)\\]])?'
const SEP = `${PUNCT}${BRACKET}${PUNCT}`

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** ラベルの前後に別の文字が続かないことを確認する（CRP が DAS28-CRP に埋もれるのを防ぐ） */
function boundary(alias: string, strict: boolean): { pre: string; post: string } {
  const startsAlnum = /^[A-Za-z0-9]/.test(alias)
  const endsAlnum = /[A-Za-z0-9)]$/.test(alias)
  return {
    pre: startsAlnum || strict ? '(?<![A-Za-z0-9\\-])' : '',
    post: endsAlnum || strict ? '(?![A-Za-z0-9])' : '',
  }
}

export function parseClinicalText(input: string): ParseResult {
  const text = normalizeText(input)
  const warnings: string[] = []
  const fields: ParsedField[] = []
  const found = new Set<ImportKey>()
  // 使用済みの文字範囲。後続の定義が同じ場所を読まないようにする
  const consumed: Array<[number, number]> = []

  const overlaps = (s: number, e: number) => consumed.some(([cs, ce]) => s < ce && e > cs)

  for (const def of FIELDS) {
    if (found.has(def.key)) continue

    for (const alias of def.aliases) {
      if (found.has(def.key)) break
      const { pre, post } = boundary(alias, def.strict ?? false)
      const valuePattern =
        def.kind === 'sex' ? '(男性|女性|男|女|M|F)' : def.kind === 'text' ? '([^\\s\\t:=,\\n]{1,32})' : NUM
      const re = new RegExp(`${pre}${escapeRegExp(alias)}${post}${SEP}${valuePattern}`, 'gi')

      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        const start = m.index
        const end = m.index + m[0].length
        if (overlaps(start, end)) continue

        const rawValue = m[1]

        if (def.kind === 'sex') {
          const v = /女/.test(rawValue) || /^F$/i.test(rawValue) ? 'female' : 'male'
          fields.push({ key: def.key, label: def.label, value: v, raw: m[0].trim(), selected: true })
          consumed.push([start, end])
          found.add(def.key)
          break
        }

        if (def.kind === 'text') {
          // 数値だけのラベル（「氏名 123」など）は誤読の可能性が高いので取り込まない
          if (def.key === 'displayName' && /^\d+$/.test(rawValue)) continue
          fields.push({ key: def.key, label: def.label, value: rawValue, raw: m[0].trim(), selected: true })
          consumed.push([start, end])
          found.add(def.key)
          break
        }

        let num = Number(rawValue)
        if (!Number.isFinite(num)) continue

        // 「6/28」のような分母付き表記は分子を採用する
        const after = text.slice(end, end + 6)
        if (/^\s*\/\s*28\b/.test(after)) {
          consumed.push([start, end + after.indexOf('28') + 2])
        }

        let note: string | undefined
        if (def.adjust) {
          const adjusted = def.adjust(num)
          if (!adjusted) continue
          if (adjusted.value !== num) note = adjusted.note
          num = adjusted.value
        }

        if ((def.min !== undefined && num < def.min) || (def.max !== undefined && num > def.max)) {
          warnings.push(
            `「${m[0].trim()}」は ${def.label} として想定範囲（${def.min ?? '—'}〜${def.max ?? '—'}）を外れているため取り込みませんでした。`,
          )
          consumed.push([start, end])
          continue
        }

        fields.push({ key: def.key, label: def.label, value: num, raw: m[0].trim(), note, selected: true })
        consumed.push([start, end])
        found.add(def.key)
        break
      }
    }
  }

  // ---- 読み取り後の整合性チェック ----
  const get = (k: ImportKey) => fields.find((f) => f.key === k)?.value as number | undefined

  const crp = get('crp')
  if (crp !== undefined && crp > 20) {
    warnings.push(
      `CRP が ${crp} と高値です。mg/L で記載されている可能性があります（本システムは mg/dL で扱います）。単位をご確認ください。`,
    )
  }

  const tjc = get('tenderJoints28')
  const sjc = get('swollenJoints28')
  const pt = get('patientGlobalVas')
  const ph = get('physicianGlobalVas')
  const sdaiExt = get('sdai')
  if (sdaiExt !== undefined && tjc !== undefined && sjc !== undefined && pt !== undefined && ph !== undefined && crp !== undefined) {
    const calc = tjc + sjc + pt + ph + crp
    if (Math.abs(calc - sdaiExt) > 0.5) {
      warnings.push(
        `取り込んだ SDAI（${sdaiExt}）と、内訳から計算した値（${Math.round(calc * 10) / 10}）が一致しません。転記ミスや単位の違いがないかご確認ください。`,
      )
    }
  }

  if (fields.length === 0) {
    warnings.push(
      '読み取れる項目が見つかりませんでした。「圧痛関節数：6」のように「項目名」と「数値」が同じ行にある形式でお試しください。',
    )
  }

  return { fields, warnings }
}

// ---------------------------------------------------------------- セッションへの反映

/** 取り込んだ項目をセッションに反映した新しいセッションを返す */
export function applyParsedFields(session: Session, fields: ParsedField[]): Session {
  const s: Session = {
    ...session,
    patient: { ...session.patient },
    osteo: { ...session.osteo, bmd: { ...session.osteo.bmd }, risk: { ...session.osteo.risk }, labs: { ...session.osteo.labs } },
    ra: { ...session.ra, comorbidity: { ...session.ra.comorbidity }, external: { ...session.ra.external } },
    knee: { ...session.knee },
    locomo: { ...session.locomo },
  }

  // Tスコアが含まれていれば、骨密度の入力単位をTスコアに切り替える
  const hasT = fields.some((f) => f.selected && (f.key === 'lumbarT' || f.key === 'femurT'))
  const hasYam = fields.some((f) => f.selected && (f.key === 'lumbarYam' || f.key === 'femurYam'))
  if (hasT && !hasYam) s.osteo.bmd.unit = 'tscore'
  if (hasYam) s.osteo.bmd.unit = 'yam'

  for (const f of fields) {
    if (!f.selected) continue
    const n = typeof f.value === 'number' ? f.value : null
    const t = typeof f.value === 'string' ? f.value : ''

    switch (f.key) {
      // 患者基本
      case 'chartNo': s.patient.chartNo = t; break
      case 'displayName': s.patient.displayName = t; break
      case 'age': s.patient.age = n; break
      case 'sex': s.patient.sex = t === 'female' ? 'female' : 'male'; break
      case 'heightCm': s.patient.heightCm = n; break
      case 'weightKg': s.patient.weightKg = n; break
      case 'maxHeightCm': s.patient.maxHeightCm = n; break

      // 関節リウマチ
      case 'tenderJoints28': s.ra.tenderJoints28 = n; break
      case 'swollenJoints28': s.ra.swollenJoints28 = n; break
      case 'patientGlobalVas': s.ra.patientGlobalVas = n; break
      case 'physicianGlobalVas': s.ra.physicianGlobalVas = n; break
      case 'crp': s.ra.crp = n; break
      case 'esr': s.ra.esr = n; break
      case 'rf': s.ra.rf = n; break
      case 'accp': s.ra.accp = n; break
      case 'mmp3': s.ra.mmp3 = n; break
      case 'haq': s.ra.haq = n; break
      case 'durationMonths': s.ra.durationMonths = n; break
      case 'sdai': s.ra.external.sdai = n; break
      case 'cdai': s.ra.external.cdai = n; break
      case 'das28crp': s.ra.external.das28crp = n; break
      case 'das28esr': s.ra.external.das28esr = n; break

      // 骨粗鬆症
      case 'lumbarYam': s.osteo.bmd.lumbar = n; break
      case 'femurYam': s.osteo.bmd.femur = n; break
      case 'lumbarT': if (s.osteo.bmd.unit === 'tscore') s.osteo.bmd.lumbar = n; break
      case 'femurT': if (s.osteo.bmd.unit === 'tscore') s.osteo.bmd.femur = n; break
      case 'fraxMajorPercent': s.osteo.risk.fraxMajorPercent = n; break
      case 'fraxHipPercent': s.osteo.risk.fraxHipPercent = n; break
      case 'calcium': s.osteo.labs.calcium = n; break
      case 'vitD25': s.osteo.labs.vitD25 = n; break
      case 'tracp5b': s.osteo.labs.tracp5b = n; break
      case 'p1np': s.osteo.labs.p1np = n; break
      case 'egfr': s.osteo.labs.egfr = n; break

      // 膝・ロコモ
      case 'klGrade': s.knee.klGrade = n; break
      case 'painNrs': s.knee.painNrs = n; break
      case 'locomo25': s.locomo.locomo25 = n; break
      case 'twoStepValue': s.locomo.twoStepValue = n; break
    }
  }

  // 取り込み元を記録に残す
  if (fields.some((f) => f.selected && ['sdai', 'cdai', 'das28crp', 'das28esr'].includes(f.key))) {
    s.ra.external.source = s.ra.external.source || '問診システム等からの取り込み'
  }

  return s
}

/** その疾患の画面で意味のある項目だけに絞る（確認画面の見通しをよくする） */
export function fieldsForDisease(fields: ParsedField[], disease: Session['disease']): ParsedField[] {
  const common: ImportKey[] = ['chartNo', 'displayName', 'age', 'sex', 'heightCm', 'weightKg']
  const byDisease: Record<Session['disease'], ImportKey[]> = {
    osteoporosis: [
      ...common, 'maxHeightCm', 'lumbarYam', 'femurYam', 'lumbarT', 'femurT',
      'fraxMajorPercent', 'fraxHipPercent', 'calcium', 'vitD25', 'tracp5b', 'p1np', 'egfr',
    ],
    ra: [
      ...common, 'tenderJoints28', 'swollenJoints28', 'patientGlobalVas', 'physicianGlobalVas',
      'crp', 'esr', 'rf', 'accp', 'mmp3', 'haq', 'durationMonths', 'sdai', 'cdai', 'das28crp', 'das28esr',
    ],
    kneeOA: [...common, 'klGrade', 'painNrs', 'locomo25', 'twoStepValue'],
  }
  const allowed = new Set(byDisease[disease])
  return fields.filter((f) => allowed.has(f.key))
}
