import type { RaActivityLevel, RaAssessment, RaInput, RaScore } from '@/types'

/**
 * 関節リウマチの疾患活動性評価と T2T（Treat to Target）の判定
 *
 * 典拠
 * - 関節リウマチ診療ガイドライン2024改訂（日本リウマチ学会）
 * - Treating rheumatoid arthritis to target: 2014 update（Ann Rheum Dis 2016;75:3-15）
 * - ACR/EULAR provisional definition of remission in RA（Ann Rheum Dis 2011;70:404-13）
 * - 2010 ACR/EULAR classification criteria for RA（Ann Rheum Dis 2010;69:1580-8）
 *
 * 単位の注意
 * - CRP は日本の検査室表記に合わせて mg/dL で入力する。
 *   DAS28-CRP の原式は CRP を mg/L で用いるため、内部で10倍して計算する。
 * - 患者・医師の全般評価 VAS は 0〜10 cm（=0〜100 mm）で入力する。
 *   DAS28 の原式は 0〜100 mm を用いるため、内部で10倍して計算する。
 */

const EMPTY: RaScore = { value: null, level: 'unknown', missing: [] }

// ---------------------------------------------------------------- DAS28

/** DAS28-ESR = 0.56√TJC28 + 0.28√SJC28 + 0.70 ln(ESR) + 0.014 × GH(0-100mm) */
export function das28esr(input: RaInput): RaScore {
  const missing: string[] = []
  const { tenderJoints28: tjc, swollenJoints28: sjc, esr, patientGlobalVas: gh } = input
  if (tjc === null) missing.push('圧痛関節数')
  if (sjc === null) missing.push('腫脹関節数')
  if (esr === null) missing.push('赤血球沈降速度(ESR)')
  if (gh === null) missing.push('患者全般評価(VAS)')
  if (missing.length > 0) return { ...EMPTY, missing }

  // ln(0) を避けるため ESR の下限を 2 mm/h とする（慣用的な取り扱い）
  const esrSafe = Math.max(esr!, 2)
  const v =
    0.56 * Math.sqrt(tjc!) +
    0.28 * Math.sqrt(sjc!) +
    0.7 * Math.log(esrSafe) +
    0.014 * (gh! * 10)
  const value = round2(v)
  return { value, level: das28esrLevel(value), missing: [] }
}

/** DAS28-CRP = 0.56√TJC28 + 0.28√SJC28 + 0.36 ln(CRP[mg/L]+1) + 0.014 × GH(0-100mm) + 0.96 */
export function das28crp(input: RaInput): RaScore {
  const missing: string[] = []
  const { tenderJoints28: tjc, swollenJoints28: sjc, crp, patientGlobalVas: gh } = input
  if (tjc === null) missing.push('圧痛関節数')
  if (sjc === null) missing.push('腫脹関節数')
  if (crp === null) missing.push('CRP')
  if (gh === null) missing.push('患者全般評価(VAS)')
  if (missing.length > 0) return { ...EMPTY, missing }

  const crpMgL = crp! * 10
  const v =
    0.56 * Math.sqrt(tjc!) +
    0.28 * Math.sqrt(sjc!) +
    0.36 * Math.log(crpMgL + 1) +
    0.014 * (gh! * 10) +
    0.96
  const value = round2(v)
  return { value, level: das28crpLevel(value), missing: [] }
}

/** DAS28-ESR：寛解 <2.6／低 ≦3.2／中 ≦5.1／高 >5.1 */
export function das28esrLevel(v: number): RaActivityLevel {
  if (v < 2.6) return 'remission'
  if (v <= 3.2) return 'low'
  if (v <= 5.1) return 'moderate'
  return 'high'
}

/** DAS28-CRP：寛解 <2.3／低 <2.7／中 ≦4.1／高 >4.1 */
export function das28crpLevel(v: number): RaActivityLevel {
  if (v < 2.3) return 'remission'
  if (v < 2.7) return 'low'
  if (v <= 4.1) return 'moderate'
  return 'high'
}

// ---------------------------------------------------------------- SDAI / CDAI

/** SDAI = SJC28 + TJC28 + 患者VAS(0-10) + 医師VAS(0-10) + CRP(mg/dL) */
export function sdai(input: RaInput): RaScore {
  const missing: string[] = []
  const { tenderJoints28: tjc, swollenJoints28: sjc, patientGlobalVas: pt, physicianGlobalVas: ph, crp } = input
  if (tjc === null) missing.push('圧痛関節数')
  if (sjc === null) missing.push('腫脹関節数')
  if (pt === null) missing.push('患者全般評価(VAS)')
  if (ph === null) missing.push('医師全般評価(VAS)')
  if (crp === null) missing.push('CRP')
  if (missing.length > 0) return { ...EMPTY, missing }

  const value = round2(sjc! + tjc! + pt! + ph! + crp!)
  return { value, level: sdaiLevel(value), missing: [] }
}

/** SDAI：寛解 ≦3.3／低 ≦11／中 ≦26／高 >26 */
export function sdaiLevel(v: number): RaActivityLevel {
  if (v <= 3.3) return 'remission'
  if (v <= 11) return 'low'
  if (v <= 26) return 'moderate'
  return 'high'
}

/** CDAI = SJC28 + TJC28 + 患者VAS(0-10) + 医師VAS(0-10)（CRP不要） */
export function cdai(input: RaInput): RaScore {
  const missing: string[] = []
  const { tenderJoints28: tjc, swollenJoints28: sjc, patientGlobalVas: pt, physicianGlobalVas: ph } = input
  if (tjc === null) missing.push('圧痛関節数')
  if (sjc === null) missing.push('腫脹関節数')
  if (pt === null) missing.push('患者全般評価(VAS)')
  if (ph === null) missing.push('医師全般評価(VAS)')
  if (missing.length > 0) return { ...EMPTY, missing }

  const value = round2(sjc! + tjc! + pt! + ph!)
  return { value, level: cdaiLevel(value), missing: [] }
}

/** CDAI：寛解 ≦2.8／低 ≦10／中 ≦22／高 >22 */
export function cdaiLevel(v: number): RaActivityLevel {
  if (v <= 2.8) return 'remission'
  if (v <= 10) return 'low'
  if (v <= 22) return 'moderate'
  return 'high'
}

// ---------------------------------------------------------------- Boolean 寛解

/** ACR/EULAR 2011 Boolean 寛解：TJC≦1・SJC≦1・CRP≦1mg/dL・患者VAS≦1 をすべて満たす */
export function booleanRemission(input: RaInput): { met: boolean | null; detail: string[] } {
  const { tenderJoints28: tjc, swollenJoints28: sjc, crp, patientGlobalVas: pt } = input
  if (tjc === null || sjc === null || crp === null || pt === null) {
    return { met: null, detail: ['圧痛関節数・腫脹関節数・CRP・患者全般評価のすべてが必要です'] }
  }
  const checks = [
    { label: `圧痛関節数 ${tjc}（≦1）`, ok: tjc <= 1 },
    { label: `腫脹関節数 ${sjc}（≦1）`, ok: sjc <= 1 },
    { label: `CRP ${crp} mg/dL（≦1.0）`, ok: crp <= 1.0 },
    { label: `患者全般評価 ${pt} cm（≦1）`, ok: pt <= 1 },
  ]
  return {
    met: checks.every((c) => c.ok),
    detail: checks.map((c) => `${c.ok ? '○' : '×'} ${c.label}`),
  }
}

// ---------------------------------------------------------------- ACR/EULAR 2010 分類基準

/**
 * ACR/EULAR 2010 分類基準の参考スコア（合計6点以上でRAと分類）
 *
 * 適用の前提：少なくとも1関節に明らかな臨床的滑膜炎（腫脹）があり、
 * その滑膜炎をより妥当に説明できる他疾患がないこと。
 * これは「分類基準」であって診断基準ではない。確定診断は医師が総合的に行う。
 */
export function classification2010(input: RaInput): {
  score: number | null
  breakdown: string[]
  suggestsRa: boolean | null
} {
  const breakdown: string[] = []
  const large = input.largeJointsInvolved
  const small = input.smallJointsInvolved

  if (large === null && small === null) {
    return {
      score: null,
      breakdown: ['A. 罹患関節数（大関節／小関節）の入力が必要です'],
      suggestsRa: null,
    }
  }
  const L = large ?? 0
  const S = small ?? 0
  const total = L + S

  // A. 罹患関節（0-5点）
  // 分類基準の区分は階層的で、当てはまるもののうち最も高い点数を採用する。
  //   大関節1か所                          … 0点
  //   大関節2〜10か所                      … 1点
  //   小関節1〜3か所（大関節の有無を問わない）… 2点
  //   小関節4〜10か所（同上）               … 3点
  //   10か所超（小関節を1か所以上含む）      … 5点
  let a = 0
  let aLabel = ''
  if (total === 0) {
    a = 0
    aLabel = '罹患関節なし'
  } else if (total > 10 && S >= 1) {
    a = 5
    aLabel = `10か所超（小関節を1か所以上含む：計${total}か所）`
  } else if (S >= 4) {
    a = 3
    aLabel = `小関節${S}か所（4〜10）`
  } else if (S >= 1) {
    a = 2
    aLabel = `小関節${S}か所（1〜3）`
  } else if (L >= 2) {
    a = 1
    aLabel = `大関節${L}か所（2か所以上）`
  } else {
    a = 0
    aLabel = '大関節1か所'
  }
  breakdown.push(`A. 罹患関節：${aLabel} → ${a}点`)

  // B. 血清学的検査（0-3点）
  let b = 0
  let bLabel = 'RF・抗CCP抗体ともに陰性'
  const rfHigh = input.rf !== null ? input.rf > 45 : false // 基準上限15 IU/mL の3倍を目安
  const accpHigh = input.accp !== null ? input.accp > 13.5 : false // 基準上限4.5 U/mL の3倍を目安
  const rfPos = input.rfPositive === true || (input.rf !== null && input.rf > 15)
  const accpPos = input.accpPositive === true || (input.accp !== null && input.accp > 4.5)

  if (rfHigh || accpHigh) {
    b = 3
    bLabel = '高値陽性（基準上限の3倍を超える）'
  } else if (rfPos || accpPos) {
    b = 2
    bLabel = '低値陽性'
  }
  breakdown.push(`B. 血清学的検査：${bLabel} → ${b}点`)
  if (input.rf === null && input.accp === null && input.rfPositive === null && input.accpPositive === null) {
    breakdown.push('　（※RF・抗CCP抗体が未入力のため0点として計算しています）')
  }
  if (input.rf !== null || input.accp !== null) {
    breakdown.push('　（※基準値は施設の検査値上限に合わせて確認してください。RF 15 IU/mL・抗CCP 4.5 U/mL を上限として計算）')
  }

  // C. 急性期反応（0-1点）
  let c = 0
  const crpAbn = input.crp !== null && input.crp > 0.3
  const esrAbn = input.esr !== null && input.esr > 20
  if (crpAbn || esrAbn) c = 1
  breakdown.push(`C. 急性期反応物質：${c === 1 ? 'CRPまたはESRが異常' : '正常'} → ${c}点`)

  // D. 症状持続期間（0-1点）
  let d = 0
  if (input.durationMonths !== null && input.durationMonths * 4.3 >= 6) d = 1
  breakdown.push(
    `D. 滑膜炎の持続期間：${d === 1 ? '6週間以上' : '6週間未満（または未入力）'} → ${d}点`,
  )

  const score = a + b + c + d
  return { score, breakdown, suggestsRa: score >= 6 }
}

// ---------------------------------------------------------------- 総合評価

/**
 * 問診システム等から取り込んだスコアの扱い。
 *
 * - 内訳（関節数・VAS・CRP）が揃っていれば本システムの計算値を優先する
 * - 内訳が足りず計算できない場合は、取り込んだ値をそのまま採用する
 * - 両方あって食い違う場合は計算値を採用したうえで警告を出す（転記ミスの検出）
 */
function reconcile(
  computed: RaScore,
  external: number | null,
  levelOf: (v: number) => RaActivityLevel,
  tolerance: number,
  name: string,
  cautions: string[],
): RaScore {
  if (external === null) return { ...computed, source: 'computed' }
  if (computed.value === null) {
    return { value: external, level: levelOf(external), missing: [], source: 'external' }
  }
  if (Math.abs(computed.value - external) > tolerance) {
    cautions.push(
      `${name}：取り込んだ値（${external}）と、入力された内訳から計算した値（${computed.value}）が一致しません。` +
        `表示は計算値を使用しています。転記や単位（CRPは mg/dL、VASは 0〜10cm）をご確認ください。`,
    )
  }
  return { ...computed, source: 'computed' }
}

export function assessRa(input: RaInput): RaAssessment {
  const cautions: string[] = []
  const ext = input.external ?? { sdai: null, cdai: null, das28crp: null, das28esr: null, source: '' }

  const esrScore = reconcile(das28esr(input), ext.das28esr, das28esrLevel, 0.15, 'DAS28-ESR', cautions)
  const crpScore = reconcile(das28crp(input), ext.das28crp, das28crpLevel, 0.15, 'DAS28-CRP', cautions)
  const sdaiScore = reconcile(sdai(input), ext.sdai, sdaiLevel, 0.5, 'SDAI', cautions)
  const cdaiScore = reconcile(cdai(input), ext.cdai, cdaiLevel, 0.5, 'CDAI', cautions)
  const boolRem = booleanRemission(input)
  const cls = classification2010(input)

  // 代表指標：SDAI（CRPを含み国内で広く使われる）→ DAS28-CRP → DAS28-ESR → CDAI の順で採用
  const primary =
    sdaiScore.value !== null
      ? { name: 'SDAI', score: sdaiScore }
      : crpScore.value !== null
        ? { name: 'DAS28-CRP', score: crpScore }
        : esrScore.value !== null
          ? { name: 'DAS28-ESR', score: esrScore }
          : cdaiScore.value !== null
            ? { name: 'CDAI', score: cdaiScore }
            : { name: '—', score: EMPTY }

  const t2tComment: string[] = []
  const level = primary.score.level
  const dur = input.durationMonths

  if (level === 'remission') {
    t2tComment.push('T2Tの第一目標である「臨床的寛解」を達成しています。')
    t2tComment.push('この状態を6か月以上維持できていれば、まずグルココルチコイドの中止、次にbDMARD／JAK阻害薬の減量・間隔延長を検討します。MTXの減量は最後に検討します。')
    t2tComment.push('寛解でも骨破壊が進む例があるため、画像評価は継続します。')
  } else if (level === 'low') {
    t2tComment.push('低疾患活動性です。長期罹患例・高齢者・併存症のある方では、これを現実的な治療目標とすることが認められています。')
    t2tComment.push('寛解を目指せる余地があるかを、副作用・費用・患者の希望と合わせて検討します。')
  } else if (level === 'moderate' || level === 'high') {
    t2tComment.push(
      `${level === 'high' ? '高疾患活動性' : '中疾患活動性'}です。3か月ごとに評価し、6か月で目標（寛解または低疾患活動性）に到達しない場合は治療内容を変更します。`,
    )
    t2tComment.push('MTXの用量・投与経路（経口／皮下注）を最適化した上で、bDMARDまたはJAK阻害薬の追加を検討します（ガイドライン2024ではbDMARDの使用が優先されます）。')
    if (dur !== null && dur <= 24) {
      t2tComment.push('発症から2年以内は骨破壊が最も進みやすい時期（window of opportunity）です。積極的な治療強化のメリットが大きい時期です。')
    }
  } else {
    t2tComment.push('疾患活動性スコアの算出に必要な項目が不足しています。圧痛・腫脹関節数、患者／医師の全般評価、CRPを入力してください。')
  }

  if (primary.score.source === 'external') {
    t2tComment.push(
      `この ${primary.name} は${ext.source || '外部システム'}から取り込んだ値です（本システムでは再計算していません）。`,
    )
  }

  const cm = input.comorbidity
  if (cm.interstitialLungDisease) {
    cautions.push('間質性肺疾患があります。MTXの適否、生物学的製剤の選択（TNF阻害薬・アバタセプトなど）、呼吸器内科との連携を検討してください。')
  }
  if (cm.hepatitisBC) {
    cautions.push('B型／C型肝炎の既往・キャリアです。免疫抑制治療前にHBs抗原・HBc抗体・HBs抗体、HBV-DNAを確認し、de novo B型肝炎に備えた管理計画（核酸アナログ、定期モニタリング）が必要です。')
  }
  if (cm.latentTb) {
    cautions.push('潜在性結核の疑い／既往があります。生物学的製剤・JAK阻害薬の開始前にIGRA・胸部画像評価を行い、必要なら抗結核薬の予防投与を先行させてください。')
  }
  if (cm.ckd) {
    cautions.push('腎機能低下があります。MTXは腎排泄のため減量・中止基準に注意し、NSAIDsの併用は可能な限り避けてください。')
  }
  if (cm.malignancyHistory) {
    cautions.push('悪性腫瘍の既往があります。JAK阻害薬・TNF阻害薬の選択にあたり、腫瘍の種類・治療後の期間を踏まえて個別に判断してください。')
  }
  if (cm.pregnancyPlan) {
    cautions.push('妊娠の希望・可能性があります。MTXは男女とも妊娠前の中止が必要です（ガイドライン2024にライフステージ別のCQがあります）。妊娠中も使用しやすい薬剤（サラゾスルファピリジン、TNF阻害薬の一部など）への切り替えを検討してください。')
  }
  if (cm.elderly75) {
    cautions.push('75歳以上です。MTXの用量、感染症リスク、腎機能、併存疾患、通院・自己注射の実行可能性を踏まえた治療目標の個別化が必要です。')
  }
  if (input.erosion) {
    cautions.push('単純X線で骨破壊（骨びらん）が確認されています。構造的損傷の進行を抑えるため、より積極的な治療強化の適応です。')
  }

  return {
    das28crp: crpScore,
    das28esr: esrScore,
    sdai: sdaiScore,
    cdai: cdaiScore,
    booleanRemission: boolRem,
    classification2010: cls,
    primary,
    t2tComment,
    cautions,
  }
}

// ---------------------------------------------------------------- 表示用

export const ACTIVITY_LABEL: Record<RaActivityLevel, string> = {
  remission: '寛解',
  low: '低疾患活動性',
  moderate: '中疾患活動性',
  high: '高疾患活動性',
  unknown: '判定不能',
}

/** 患者さんへの言い換え */
export const ACTIVITY_PLAIN: Record<RaActivityLevel, string> = {
  remission: '炎症がほぼ静まっている状態です',
  low: '炎症が弱く落ち着いてきている状態です',
  moderate: '炎症がまだ中くらい残っている状態です',
  high: '炎症が強く出ている状態です',
  unknown: '評価に必要な情報が足りません',
}

/** メーター描画のためにスコアを 0-1 に正規化する */
export function activityRatio(name: string, value: number | null): number | null {
  if (value === null) return null
  const max: Record<string, number> = {
    SDAI: 40,
    CDAI: 40,
    'DAS28-CRP': 7,
    'DAS28-ESR': 8,
  }
  const m = max[name] ?? 10
  return Math.min(1, Math.max(0, value / m))
}

/** メーターの区分境界（0-1 に正規化した位置）を返す */
export function activityBands(name: string): { label: string; upto: number }[] {
  switch (name) {
    case 'SDAI':
      return [
        { label: '寛解', upto: 3.3 / 40 },
        { label: '低', upto: 11 / 40 },
        { label: '中', upto: 26 / 40 },
        { label: '高', upto: 1 },
      ]
    case 'CDAI':
      return [
        { label: '寛解', upto: 2.8 / 40 },
        { label: '低', upto: 10 / 40 },
        { label: '中', upto: 22 / 40 },
        { label: '高', upto: 1 },
      ]
    case 'DAS28-CRP':
      return [
        { label: '寛解', upto: 2.3 / 7 },
        { label: '低', upto: 2.7 / 7 },
        { label: '中', upto: 4.1 / 7 },
        { label: '高', upto: 1 },
      ]
    case 'DAS28-ESR':
      return [
        { label: '寛解', upto: 2.6 / 8 },
        { label: '低', upto: 3.2 / 8 },
        { label: '中', upto: 5.1 / 8 },
        { label: '高', upto: 1 },
      ]
    default:
      return [{ label: '—', upto: 1 }]
  }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}
