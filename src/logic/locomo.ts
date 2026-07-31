import type { KneeInput, LocomoAssessment, LocomoInput, LocomoStage, PatientBasics } from '@/types'

/**
 * ロコモ度判定
 *
 * 典拠：日本整形外科学会「ロコモ度テストの臨床判断値」
 * （2015年にロコモ度1・2、2020年にロコモ度3を追加）
 *
 * 判定は3つのテストそれぞれで行い、
 * 「最も移動機能低下が進行している段階」を最終判定とする。
 *
 *  立ち上がりテスト
 *   ロコモ度1：どちらか一方の片脚で40cmの台から立ち上がれない
 *   ロコモ度2：両脚で20cmの台から立ち上がれない
 *   ロコモ度3：両脚で30cmの台から立ち上がれない
 *  2ステップテスト（2歩幅[cm] ÷ 身長[cm]）
 *   ロコモ度1：1.3未満／ロコモ度2：1.1未満／ロコモ度3：0.9未満
 *  ロコモ25
 *   ロコモ度1：7点以上／ロコモ度2：16点以上／ロコモ度3：24点以上
 */

export function assessLocomo(input: LocomoInput): LocomoAssessment {
  const standUp = judgeStandUp(input)
  const twoStep = judgeTwoStep(input.twoStepValue)
  const locomo25 = judgeLocomo25(input.locomo25)

  const stages = [standUp, twoStep, locomo25].filter((s): s is 0 | 1 | 2 | 3 => s !== null)
  const stage: LocomoStage = stages.length === 0 ? null : (Math.max(...stages) as 0 | 1 | 2 | 3)

  return {
    stage,
    byTest: { standUp, twoStep, locomo25 },
    message: locomoMessage(stage),
    advice: locomoAdvice(stage),
  }
}

/**
 * 立ち上がりテストの判定。
 *
 * standUpOneLegCm / standUpBothLegCm は
 *   数値   … その高さの台から立ち上がれた（立ち上がれた最小の高さ）
 *   'cannot' … 40cmの台からも立ち上がれなかった
 *   null   … 未実施
 * 「立てない（'cannot'）」と「未実施（null）」を混同すると判定が真逆になるため、
 * 両者は明確に区別する。
 *
 * 判定できない組み合わせ（両脚は20cm以下から立てるが片脚が未実施など）では
 * null（このテストでは判定不能）を返し、他のテストの結果に判定を委ねる。
 */
export function judgeStandUp(input: LocomoInput): LocomoStage {
  const { standUpOneLegCm: one, standUpBothLegCm: both } = input
  if (one === null && both === null) return null

  if (both !== null) {
    // 両脚で40cmからも立てない → 最も重い段階
    if (both === 'cannot') return 3
    // 両脚で30cmから立てない（40cmでしか立てない）→ ロコモ度3
    if (both > 30) return 3
    // 両脚で20cmから立てない（30cmなら立てる）→ ロコモ度2
    if (both > 20) return 2
  }

  // ここから先は「両脚では20cm以下から立てる」または「両脚が未実施」の状態
  if (one === null) return null
  // 片脚で40cmから立てない → ロコモ度1
  if (one === 'cannot' || one > 40) return 1
  return 0
}

export function judgeTwoStep(v: number | null): LocomoStage {
  if (v === null) return null
  if (v < 0.9) return 3
  if (v < 1.1) return 2
  if (v < 1.3) return 1
  return 0
}

export function judgeLocomo25(v: number | null): LocomoStage {
  if (v === null) return null
  if (v >= 24) return 3
  if (v >= 16) return 2
  if (v >= 7) return 1
  return 0
}

/** 2ステップ値を計算する（2歩幅 cm ÷ 身長 cm） */
export function calcTwoStepValue(twoStepLengthCm: number | null, heightCm: number | null): number | null {
  if (twoStepLengthCm === null || heightCm === null || heightCm <= 0) return null
  return Math.round((twoStepLengthCm / heightCm) * 100) / 100
}

export function locomoMessage(stage: LocomoStage): string {
  switch (stage) {
    case 0:
      return '移動機能の低下は認められません（ロコモではありません）'
    case 1:
      return 'ロコモ度1：移動機能の低下が始まっています'
    case 2:
      return 'ロコモ度2：移動機能の低下が進行しています'
    case 3:
      return 'ロコモ度3：移動機能の低下が進行し、社会参加に支障が出ています'
    default:
      return 'ロコモ度テストが未実施です'
  }
}

export function locomoAdvice(stage: LocomoStage): string[] {
  switch (stage) {
    case 0:
      return [
        '今の状態を維持するために、片脚立ちとスクワットを毎日の習慣にしましょう。',
        '1年に1回はロコモ度テストで確認しましょう。',
      ]
    case 1:
      return [
        '筋力やバランス能力が落ちてきています。ロコモトレーニング（片脚立ち・スクワット）を始めましょう。',
        'たんぱく質とカルシウムを意識した食事をとりましょう。',
        '運動を始める前に、痛みのある部位を診察で確認します。',
      ]
    case 2:
      return [
        '自分で歩く力を保つために、運動療法を本格的に始める必要があります。',
        '当院の運動器リハビリテーション（理学療法士による個別指導）をお勧めします。',
        '痛みの原因となっている疾患（変形性関節症・脊椎疾患など）の治療も並行して行います。',
      ]
    case 3:
      return [
        '自立した生活が続けられなくなるリスクが高い状態です。',
        '整形外科で原因となっている疾患の診断・治療を受けながら、リハビリテーションを継続しましょう。',
        '介護保険の申請、住環境の整備（手すり・段差解消）も併せて検討します。',
      ]
    default:
      return ['次回、ロコモ度テスト（立ち上がりテスト・2ステップテスト・ロコモ25）を実施しましょう。']
  }
}

// ---------------------------------------------------------------- BMI・減量

export function calcBmi(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function bmiCategory(bmi: number | null): string {
  if (bmi === null) return '—'
  if (bmi < 18.5) return 'やせ（低体重）'
  if (bmi < 25) return '標準'
  if (bmi < 30) return '肥満（1度）'
  if (bmi < 35) return '肥満（2度）'
  return '肥満（3度以上）'
}

/**
 * 膝への負担の目安。
 * 平地歩行では体重の約3倍、階段昇降では約4〜6倍の力が膝関節にかかるとされる。
 * 体重を1kg減らすと、歩行時の膝への負担はおよそ3kg分軽くなる、という説明に使う。
 */
export function kneeLoadReduction(weightLossKg: number): { walk: number; stairs: number } {
  return { walk: Math.round(weightLossKg * 3), stairs: Math.round(weightLossKg * 5) }
}

/** BMI 25 未満を目標にした場合の減量目標（kg） */
export function weightTarget(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg) return null
  const m = heightCm / 100
  const target = 24.9 * m * m
  const diff = weightKg - target
  return diff > 0 ? Math.round(diff * 10) / 10 : 0
}

// ---------------------------------------------------------------- 変形性膝関節症

export const KL_GRADE_LABEL: Record<number, string> = {
  0: 'グレード0：異常なし',
  1: 'グレード1：関節のすき間の狭くなりはじめ・骨のとげ（骨棘）が疑われる',
  2: 'グレード2：はっきりした骨棘があり、関節のすき間が狭くなりはじめている',
  3: 'グレード3：関節のすき間が明らかに狭く、骨の変形が進んでいる',
  4: 'グレード4：関節のすき間がほとんどなく、骨と骨が直接あたっている',
}

export const KL_GRADE_PLAIN: Record<number, string> = {
  0: '膝のクッション（軟骨）はしっかり残っています。',
  1: '軟骨がわずかに薄くなっている可能性があります。',
  2: '軟骨が減りはじめています。運動療法と体重管理を始めるのに最適な段階です。',
  3: '軟骨がかなり減っています。運動療法・装具・薬で痛みを抑えながら、膝の機能を守ります。',
  4: '軟骨がほとんどなくなっています。痛みが強く生活に支障がある場合は手術も選択肢になります。',
}

export function kneeSummary(
  knee: KneeInput,
  patient: PatientBasics,
): { headline: string; body: string[]; suggestions: string[] } {
  const body: string[] = []
  const suggestions: string[] = []
  const grade = knee.klGrade

  const headline =
    grade !== null
      ? `レントゲンでは ${KL_GRADE_LABEL[grade] ?? '—'}`
      : 'レントゲンによる評価がまだです'

  if (grade !== null) body.push(KL_GRADE_PLAIN[grade] ?? '')

  const bmi = calcBmi(patient.heightCm, patient.weightKg)
  if (bmi !== null && bmi >= 25) {
    const target = weightTarget(patient.heightCm, patient.weightKg)
    if (target && target > 0) {
      const red = kneeLoadReduction(target)
      body.push(
        `いまのBMIは ${bmi}（${bmiCategory(bmi)}）です。${target}kg 減らせると、歩くときに膝にかかる力はおよそ ${red.walk}kg 分、階段では ${red.stairs}kg 分軽くなります。`,
      )
      suggestions.push('減量（食事＋有酸素運動）は痛みと機能の改善に最も確実な方法のひとつです。')
    }
  }

  if (knee.effusion) {
    body.push('膝に水がたまっています。炎症が起きているサインです。')
    suggestions.push('炎症が強い時期は無理な負荷を避け、痛みの少ない範囲での運動（椅子に座って行う運動・水中運動）に切り替えます。')
  }
  if (knee.romLimitation) {
    suggestions.push('膝の曲げ伸ばしの範囲を広げる運動（関節可動域訓練）を加えます。')
  }
  if (knee.alignment === 'varus') {
    body.push('脚がO脚気味で、膝の内側に体重が集中しています。')
    suggestions.push('内側の負担を減らす足底板（インソール）や膝装具の併用を検討します。')
  }

  suggestions.push('大腿四頭筋（ももの前の筋肉）を鍛えると、膝のぐらつきが減り痛みが軽くなります。運動療法は膝OAの治療の中心です。')

  return { headline, body: body.filter(Boolean), suggestions }
}
