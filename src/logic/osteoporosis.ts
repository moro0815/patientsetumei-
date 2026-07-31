import type {
  BmdMeasurement,
  FragilityFracture,
  OsteoporosisAssessment,
  OsteoporosisInput,
  PatientBasics,
} from '@/types'

/**
 * 骨粗鬆症の診断・薬物治療開始基準・骨折リスク層別化
 *
 * 典拠
 * - 原発性骨粗鬆症の診断基準（2012年度改訂版、骨粗鬆症の予防と治療ガイドライン2025年版に収載）
 * - 骨粗鬆症の予防と治療ガイドライン2025年版（薬物治療開始基準／初期治療アルゴリズム）
 * - ASBMR/NOF 2024 治療アルゴリズム（骨折リスクに応じた初期治療薬選択）
 *
 * 重要
 * - ここで返す判定は「ガイドラインの基準に機械的に当てはめた参考結果」であり、
 *   最終的な診断・治療方針は必ず医師が総合的に判断する。
 * - 低骨量をきたす他疾患（骨軟化症・原発性副甲状腺機能亢進症・多発性骨髄腫・
 *   ステロイド性骨粗鬆症などの続発性骨粗鬆症）の除外が診断の前提である。
 */

/**
 * YAM(%) と Tスコアの相互換算に用いる変動係数（SD/若年成人平均値）。
 *
 * 腰椎で約12%、大腿骨近位部で約13% とすると
 * 「YAM 70% ≒ Tスコア −2.5」「YAM 80% ≒ Tスコア −1.7」という
 * 国内で慣用されている対応関係と整合する。
 *
 * ただし機種・部位・参照データベースにより差があるため、
 * DXA 報告書にTスコアが記載されている場合は必ずそちらを優先する。
 */
export const YAM_CV = { lumbar: 12, femur: 13 } as const

export function yamToTscore(yam: number, site: 'lumbar' | 'femur'): number {
  return (yam - 100) / YAM_CV[site]
}

export function tscoreToYam(t: number, site: 'lumbar' | 'femur'): number {
  return 100 + t * YAM_CV[site]
}

export interface AdoptedBmd {
  site: 'lumbar' | 'femur' | null
  yam: number | null
  tscore: number | null
  /** YAMから換算したTスコア（またはその逆）である場合 true */
  converted: boolean
}

/**
 * 腰椎と大腿骨近位部の両方を測定した場合は「低い方の値」を採用する。
 * （原発性骨粗鬆症の診断基準）
 */
export function adoptBmd(bmd: BmdMeasurement): AdoptedBmd {
  const toPair = (v: number | null, site: 'lumbar' | 'femur') => {
    if (v === null || Number.isNaN(v)) return null
    if (bmd.unit === 'yam') {
      return { site, yam: v, tscore: yamToTscore(v, site), converted: true }
    }
    return { site, yam: tscoreToYam(v, site), tscore: v, converted: true }
  }

  const candidates = [toPair(bmd.lumbar, 'lumbar'), toPair(bmd.femur, 'femur')].filter(
    (c): c is { site: 'lumbar' | 'femur'; yam: number; tscore: number; converted: boolean } =>
      c !== null,
  )

  if (candidates.length === 0) {
    return { site: null, yam: null, tscore: null, converted: false }
  }

  // 「より低い値」＝ Tスコアが小さい方
  const lowest = candidates.reduce((a, b) => (b.tscore < a.tscore ? b : a))
  return {
    site: lowest.site,
    yam: round1(lowest.yam),
    tscore: round1(lowest.tscore),
    converted: true,
  }
}

const SITE_LABEL: Record<'lumbar' | 'femur', string> = {
  lumbar: '腰椎',
  femur: '大腿骨近位部',
}

const FRACTURE_LABEL: Record<FragilityFracture['site'], string> = {
  vertebra: '椎体骨折',
  proximalFemur: '大腿骨近位部骨折',
  rib: '肋骨骨折',
  pelvis: '骨盤骨折',
  proximalHumerus: '上腕骨近位部骨折',
  distalRadius: '橈骨遠位端骨折',
  lowerLeg: '下腿骨骨折',
}

export function fractureLabel(site: FragilityFracture['site']): string {
  return FRACTURE_LABEL[site]
}

/** 診断基準で「椎体・大腿骨近位部」と「その他の部位」を区別する */
const MAJOR_SITES: FragilityFracture['site'][] = ['vertebra', 'proximalFemur']

export function assessOsteoporosis(
  input: OsteoporosisInput,
  patient: PatientBasics,
): OsteoporosisAssessment {
  const adopted = adoptBmd(input.bmd)
  const diagnosisReasons: string[] = []
  const pharmacotherapyReasons: string[] = []
  const riskTierReasons: string[] = []
  const cautions: string[] = []

  const hasMajorFracture = input.fractures.some((f) => MAJOR_SITES.includes(f.site))
  const otherFractures = input.fractures.filter((f) => !MAJOR_SITES.includes(f.site))
  const hasAnyFracture = input.fractures.length > 0

  // ---------------------------------------------------------------- 診断
  let diagnosis: OsteoporosisAssessment['diagnosis'] = 'insufficientData'

  if (hasMajorFracture) {
    diagnosis = 'osteoporosis'
    const sites = input.fractures
      .filter((f) => MAJOR_SITES.includes(f.site))
      .map((f) => FRACTURE_LABEL[f.site])
      .join('・')
    diagnosisReasons.push(
      `${sites}（脆弱性骨折）があるため、骨密度の値によらず骨粗鬆症と診断されます。`,
    )
  } else if (otherFractures.length > 0 && adopted.yam !== null) {
    if (adopted.yam < 80) {
      diagnosis = 'osteoporosis'
      diagnosisReasons.push(
        `${otherFractures.map((f) => FRACTURE_LABEL[f.site]).join('・')}（その他の部位の脆弱性骨折）があり、` +
          `骨密度が YAM ${adopted.yam}%（80%未満）のため骨粗鬆症と診断されます。`,
      )
    } else {
      diagnosis = 'lowBoneMass'
      diagnosisReasons.push(
        `その他の部位の脆弱性骨折はありますが、骨密度は YAM ${adopted.yam}%（80%以上）です。` +
          `診断基準上は骨粗鬆症に該当しません（骨折の原因の再評価が必要です）。`,
      )
    }
  } else if (adopted.yam !== null && adopted.tscore !== null) {
    if (adopted.yam <= 70 || adopted.tscore <= -2.5) {
      diagnosis = 'osteoporosis'
      diagnosisReasons.push(
        `脆弱性骨折はありませんが、${SITE_LABEL[adopted.site!]}の骨密度が ` +
          `YAM ${adopted.yam}%（Tスコア ${fmtT(adopted.tscore)}）で、` +
          `「YAM 70%以下 または Tスコア −2.5以下」に該当するため骨粗鬆症と診断されます。`,
      )
    } else if (adopted.yam < 80) {
      diagnosis = 'lowBoneMass'
      diagnosisReasons.push(
        `${SITE_LABEL[adopted.site!]}の骨密度は YAM ${adopted.yam}%（Tスコア ${fmtT(adopted.tscore)}）で、` +
          `「骨量減少（骨粗鬆症予備群）」の範囲です。`,
      )
    } else {
      diagnosis = 'normal'
      diagnosisReasons.push(
        `${SITE_LABEL[adopted.site!]}の骨密度は YAM ${adopted.yam}%（Tスコア ${fmtT(adopted.tscore)}）で、` +
          `正常範囲（YAM 80%以上）です。`,
      )
    }
  } else {
    diagnosisReasons.push('骨密度（DXA）の入力がないため、診断基準による判定ができません。')
  }

  if (adopted.site && input.bmd.lumbar !== null && input.bmd.femur !== null) {
    diagnosisReasons.push(
      `腰椎と大腿骨近位部の両方を測定しているため、低い方（${SITE_LABEL[adopted.site]}）の値を採用しました。`,
    )
  }

  // ---------------------------------------------------------------- 薬物治療開始基準
  let pharmacotherapyIndicated: OsteoporosisAssessment['pharmacotherapyIndicated'] = false

  if (hasMajorFracture) {
    pharmacotherapyIndicated = true
    pharmacotherapyReasons.push('椎体骨折または大腿骨近位部骨折があるため、薬物治療の適応です。')
  } else if (otherFractures.length > 0 && adopted.yam !== null && adopted.yam < 80) {
    pharmacotherapyIndicated = true
    pharmacotherapyReasons.push(
      'その他の部位の脆弱性骨折があり、骨密度が YAM 80%未満のため薬物治療の適応です。',
    )
  } else if (adopted.yam !== null && adopted.tscore !== null) {
    if (adopted.yam < 70 || adopted.tscore <= -2.5) {
      pharmacotherapyIndicated = true
      pharmacotherapyReasons.push(
        '骨密度が YAM 70%未満（Tスコア −2.5以下）のため薬物治療の適応です。',
      )
    } else if (adopted.yam < 80) {
      // YAM 70-80% のグレーゾーン
      const subReasons: string[] = []
      if (input.risk.parentHipFracture) {
        subReasons.push('大腿骨近位部骨折の家族歴（両親）がある')
      }
      const frax = input.risk.fraxMajorPercent
      if (frax !== null && frax >= 15) {
        const ageNote =
          patient.age !== null && patient.age >= 75
            ? '（※FRAX®15%以上の基準は75歳未満に適用されます。75歳以上では骨密度・骨折歴で判断してください）'
            : ''
        subReasons.push(`FRAX®の主要骨折10年確率が ${frax}%（15%以上）${ageNote}`)
      }
      if (subReasons.length > 0) {
        pharmacotherapyIndicated = true
        pharmacotherapyReasons.push(
          `骨密度は YAM ${adopted.yam}%（70〜80%）ですが、${subReasons.join('、')}ため薬物治療の適応です。`,
        )
      } else {
        pharmacotherapyIndicated = 'consider'
        pharmacotherapyReasons.push(
          `骨密度は YAM ${adopted.yam}%（70〜80%）です。大腿骨近位部骨折の家族歴、` +
            `または FRAX® 主要骨折10年確率15%以上（75歳未満）があれば薬物治療の適応となります。` +
            `FRAX®が未入力の場合は算出をご検討ください。`,
        )
      }
    } else {
      pharmacotherapyReasons.push(
        '現時点では薬物治療の開始基準を満たしません。食事・運動・転倒予防の指導と、定期的な骨密度測定を行います。',
      )
    }
  } else {
    pharmacotherapyReasons.push('骨密度の測定が必要です。')
  }

  // ステロイド性骨粗鬆症は別の管理指針があることを明示
  if (input.risk.glucocorticoid) {
    cautions.push(
      '経口グルココルチコイド使用中です。ステロイド性骨粗鬆症は「ステロイド性骨粗鬆症の管理と治療ガイドライン」に基づく別の開始基準（スコア）で判断してください。',
    )
  }

  // ---------------------------------------------------------------- 骨折リスク層別化
  // ASBMR/NOF 2024 の考え方（骨粗鬆症GL2025に収載）に沿った参考区分
  const veryHigh: string[] = []
  const high: string[] = []

  const recentFracture = input.fractures.some((f) => f.when === 'within12m')
  const multipleFracture =
    input.fractures.some((f) => f.multiple) || input.fractures.length >= 2

  if (recentFracture) veryHigh.push('直近12か月以内の脆弱性骨折')
  if (multipleFracture) veryHigh.push('複数（2か所以上）の脆弱性骨折')
  if (hasAnyFracture && input.currentTherapy.length > 0) {
    veryHigh.push('骨粗鬆症の治療中に生じた骨折')
  }
  if (adopted.tscore !== null && adopted.tscore <= -3.0) {
    veryHigh.push(`骨密度がきわめて低い（Tスコア ${fmtT(adopted.tscore)}／基準 −3.0以下）`)
  }
  if (input.risk.fallLastYear) veryHigh.push('過去1年の転倒歴（転倒リスクが高い）')
  if (input.risk.glucocorticoid && hasAnyFracture) {
    veryHigh.push('グルココルチコイド使用中の骨折')
  }
  if (input.risk.fraxMajorPercent !== null && input.risk.fraxMajorPercent >= 30) {
    veryHigh.push(`FRAX® 主要骨折10年確率 ${input.risk.fraxMajorPercent}%（30%以上）`)
  }
  if (input.risk.fraxHipPercent !== null && input.risk.fraxHipPercent >= 4.5) {
    veryHigh.push(`FRAX® 大腿骨近位部骨折10年確率 ${input.risk.fraxHipPercent}%（4.5%以上）`)
  }

  if (hasAnyFracture) high.push('脆弱性骨折の既往')
  if (adopted.tscore !== null && adopted.tscore <= -2.5) {
    high.push(`骨密度が低い（Tスコア ${fmtT(adopted.tscore)}／基準 −2.5以下）`)
  }
  if (input.risk.fraxMajorPercent !== null && input.risk.fraxMajorPercent >= 15) {
    high.push(`FRAX® 主要骨折10年確率 ${input.risk.fraxMajorPercent}%（15%以上）`)
  }
  if (input.risk.parentHipFracture) high.push('大腿骨近位部骨折の家族歴')

  let riskTier: OsteoporosisAssessment['riskTier'] = 'unknown'
  if (veryHigh.length > 0) {
    riskTier = 'veryHigh'
    riskTierReasons.push(...veryHigh)
  } else if (high.length > 0) {
    riskTier = 'high'
    riskTierReasons.push(...high)
  } else if (adopted.tscore !== null) {
    if (adopted.tscore <= -1.0) {
      riskTier = 'moderate'
      riskTierReasons.push(`骨量減少（Tスコア ${fmtT(adopted.tscore)}）`)
    } else {
      riskTier = 'low'
      riskTierReasons.push('骨密度は正常範囲で、明らかな骨折危険因子もありません')
    }
  }

  // ---------------------------------------------------------------- 身長低下
  let heightLossCm: number | null = null
  if (patient.heightCm !== null && patient.maxHeightCm !== null) {
    heightLossCm = round1(patient.maxHeightCm - patient.heightCm)
    if (heightLossCm >= 4) {
      cautions.push(
        `若い頃より身長が ${heightLossCm}cm 低下しています（4cm以上）。無症状の椎体骨折の可能性があり、胸腰椎の単純X線撮影を検討してください。`,
      )
    } else if (heightLossCm >= 2) {
      cautions.push(
        `身長が ${heightLossCm}cm 低下しています。椎体骨折のサインになり得るため経過観察が必要です。`,
      )
    }
  }

  // ---------------------------------------------------------------- 除外診断・検査上の注意
  if (diagnosis === 'osteoporosis' || pharmacotherapyIndicated) {
    cautions.push(
      '続発性骨粗鬆症・低骨量をきたす他疾患（骨軟化症、原発性副甲状腺機能亢進症、多発性骨髄腫、甲状腺機能亢進症、慢性腎臓病など）の除外を確認してください。',
    )
  }
  if (input.labs.calcium !== null && input.labs.calcium >= 10.5) {
    cautions.push(
      `血清カルシウムが ${input.labs.calcium} mg/dL と高値です。原発性副甲状腺機能亢進症や悪性腫瘍の除外、およびテリパラチド／PTH製剤の禁忌に注意してください。`,
    )
  }
  if (input.labs.vitD25 !== null && input.labs.vitD25 < 20) {
    cautions.push(
      `25(OH)D が ${input.labs.vitD25} ng/mL とビタミンD不足／欠乏の域です。骨形成促進薬やデノスマブ開始前にカルシウム・ビタミンDの補充を検討してください。`,
    )
  }
  if (input.labs.egfr !== null && input.labs.egfr < 35) {
    cautions.push(
      `eGFR が ${input.labs.egfr} と低下しています。ビスホスホネート（特に注射剤）は腎機能により禁忌・慎重投与となります。`,
    )
  }

  return {
    diagnosis,
    diagnosisReasons,
    adoptedYam: adopted.yam,
    adoptedTscore: adopted.tscore,
    adoptedSite: adopted.site,
    pharmacotherapyIndicated,
    pharmacotherapyReasons,
    riskTier,
    riskTierReasons,
    heightLossCm,
    cautions,
  }
}

// ---------------------------------------------------------------- 初期治療薬の考え方

export interface InitialTherapySuggestion {
  tier: OsteoporosisAssessment['riskTier']
  headline: string
  /** 第一選択として検討する薬剤クラス */
  first: string[]
  /** 次に検討する薬剤クラス */
  second: string[]
  notes: string[]
}

/**
 * 骨折リスク区分に応じた初期治療薬の考え方
 * （骨粗鬆症GL2025に収載された ASBMR/NOF 2024 治療アルゴリズムの趣旨）
 *
 * 実際の薬剤選択は年齢・腎機能・歯科の状況・服薬アドヒアランス・費用・
 * 患者の希望を踏まえて医師が決定する。
 */
export function suggestInitialTherapy(
  tier: OsteoporosisAssessment['riskTier'],
): InitialTherapySuggestion {
  switch (tier) {
    case 'veryHigh':
      return {
        tier,
        headline: '骨折リスクが「きわめて高い」区分です',
        first: ['ロモソズマブ', 'テリパラチド', 'アバロパラチド（骨形成促進薬）'],
        second: ['ゾレドロン酸', 'デノスマブ'],
        notes: [
          '骨形成促進薬を初期治療として開始し、投与期間終了後は必ず骨吸収抑制薬へ切り替える（逐次療法）。',
          'テリパラチドは24か月、ロモソズマブは12か月が投与期間の上限。',
          'ロモソズマブは1年以内の心筋梗塞・脳卒中の既往がある場合は投与を避ける。',
          '骨形成促進薬の中断後に治療を切らすと獲得した骨密度が失われる。次の薬の予約を必ず同時に取る。',
        ],
      }
    case 'high':
      return {
        tier,
        headline: '骨折リスクが「高い」区分です',
        first: ['骨形成促進薬（ロモソズマブ／テリパラチド／アバロパラチド）'],
        second: ['ビスホスホネート（アレンドロン酸・リセドロン酸・ミノドロン酸・ゾレドロン酸）', 'デノスマブ'],
        notes: [
          '2025年版では、高リスク例でも骨形成促進薬を第一選択、ビスホスホネート／デノスマブを第二選択とする方針が示された。',
          '服薬アドヒアランス、腎機能、歯科治療の予定、通院間隔を踏まえて剤形（週1回・月1回・年1回・半年1回注射）を選ぶ。',
        ],
      }
    case 'moderate':
      return {
        tier,
        headline: '骨量減少（骨折リスクは中等度）です',
        first: ['ビスホスホネート', 'SERM（閉経後女性）', '活性型ビタミンD3'],
        second: ['デノスマブ'],
        notes: [
          '薬物治療開始基準を満たすかを個別に確認する（FRAX®、家族歴）。',
          '基準を満たさない場合は、食事・運動・転倒予防・禁煙／節酒の指導と、1〜2年ごとの骨密度測定で経過をみる。',
        ],
      }
    case 'low':
      return {
        tier,
        headline: '現時点で骨折リスクは低い区分です',
        first: ['薬物治療は不要（生活指導が中心）'],
        second: [],
        notes: [
          'カルシウム・ビタミンD・たんぱく質の摂取、荷重運動とバランス訓練、転倒予防の環境調整を指導する。',
          '女性は閉経後、男性は70歳以降に骨密度が下がりやすい。定期的な骨密度測定を勧める。',
        ],
      }
    default:
      return {
        tier,
        headline: '骨折リスクの判定に必要な情報が不足しています',
        first: [],
        second: [],
        notes: ['骨密度（DXA：腰椎・大腿骨近位部）の測定と、骨折歴・危険因子の聴取を行ってください。'],
      }
  }
}

// ---------------------------------------------------------------- 患者説明用の言い換え

/**
 * 骨密度を患者さんに伝えるときの「たとえ」。
 * 数値だけでは実感が持てないため、同年代との比較と骨折リスクの倍率を添える。
 */
export function bmdPlainLanguage(
  yam: number | null,
  tscore: number | null,
): { headline: string; body: string[] } {
  if (yam === null || tscore === null) {
    return { headline: '骨密度の測定がまだです', body: ['まずは骨の量を測ってみましょう。'] }
  }
  const body: string[] = [
    `いまの骨の量は、20〜44歳ごろの平均（もっとも骨が丈夫な時期）を100%としたとき ${Math.round(yam)}% です。`,
  ]
  let headline: string
  if (tscore <= -3.0) {
    headline = '骨がかなり弱くなっています'
    body.push('若い頃の3分の2くらいまで減っています。ちょっとした転倒や、しりもち・重い物を持つだけでも骨折が起こりえます。')
  } else if (tscore <= -2.5) {
    headline = '骨粗鬆症の範囲です'
    body.push('骨がもろくなり、骨折しやすい状態です。まだ痛みがなくても、治療を始めたほうがよい段階です。')
  } else if (tscore <= -1.0) {
    headline = '骨が減りはじめています（骨量減少）'
    body.push('まだ骨粗鬆症ではありませんが、これ以上減らさない対策を始めるのに一番よい時期です。')
  } else {
    headline = '骨の量は保たれています'
    body.push('いまの生活習慣を続けて、骨の量を維持していきましょう。')
  }
  body.push('骨は「量」だけでなく「質」も大切です。骨密度が高めでも、骨折したことがあれば治療の対象になります。')
  return { headline, body }
}

// ---------------------------------------------------------------- ユーティリティ

export function fmtT(t: number | null): string {
  if (t === null) return '—'
  return (t >= 0 ? '+' : '−') + Math.abs(t).toFixed(1)
}

function round1(v: number): number {
  return Math.round(v * 10) / 10
}
