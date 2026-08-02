import { getCondition } from '@/data/conditions'
import type { ConditionAssessment, ConditionInput, DiseaseKey, Session } from '@/types'
import type { ConditionDef } from '@/data/conditions/types'

/**
 * 症状別疾患の判定
 *
 * 方針
 * - ここでやるのは「見落としてはいけないものを拾う」ことと「治療の段を提案する」ことの2つだけ。
 *   診断そのものは医師が行う。
 * - レッドフラッグは、疾患モデル側に「患者さんに通じる言葉」で書いてある選択肢を
 *   そのまま拾い上げる。ロジックに病名を埋め込まない（疾患を増やしても壊れない）。
 * - 治療の段は「下から積み上げる」原則に沿い、
 *   すでに試した治療・痛みの強さ・レッドフラッグから、次に検討する段を提案する。
 */

/** 治療の段の提案に使う、これまでの治療と段の対応 */
const PRIOR_TO_STEP: Record<string, number> = {
  // 段1（運動・生活）に相当
  rehab: 1,
  stretch: 1,
  corset: 1,
  collar: 1,
  brace: 1,
  cast: 1,
  rice: 1,
  splint: 1,
  insole: 1,
  cane: 1,
  band: 1,
  traction: 1,
  // 段2（薬）に相当
  nsaid: 2,
  topical: 2,
  osteoDrug: 2,
  limaprost: 2,
  // 段3（注射・特殊治療）に相当
  injection: 3,
  block: 3,
  espwt: 3,
  hydro: 3,
  // 段4（手術）に相当
  surgery: 4,
  bkp: 4,
}

export function painBandOf(nrs: number | null): ConditionAssessment['painBand'] {
  if (nrs === null) return 'unknown'
  if (nrs === 0) return 'none'
  if (nrs <= 3) return 'mild'
  if (nrs <= 6) return 'moderate'
  return 'severe'
}

export const PAIN_BAND_LABEL: Record<ConditionAssessment['painBand'], string> = {
  none: '痛みなし',
  mild: '軽い痛み',
  moderate: '中くらいの痛み',
  severe: '強い痛み',
  unknown: '未評価',
}

/**
 * 「長引いている」と判断する期間ID。
 * 疾患モデルの duration は疾患ごとに刻みが違うため、IDの命名規則で判定する。
 */
export function isProlonged(durationId: string | null): boolean {
  if (!durationId) return false
  return ['>3m', '>6m', '>1y', '>5y', '>12w', '2-5y', '6m-2y', '6-12m'].includes(durationId)
}

export function assessCondition(input: ConditionInput, def: ConditionDef | undefined): ConditionAssessment {
  const out: ConditionAssessment = {
    redFlags: [],
    actions: [],
    referralSuggested: false,
    suggestedStep: 1,
    suggestedStepReasons: [],
    painBand: painBandOf(input.painNrs),
    positiveFindings: [],
    cautions: [],
  }
  if (!def) return out

  // ------------------------------------------------------------ レッドフラッグ
  for (const id of input.redFlags) {
    const opt = def.redFlagOptions.find((o) => o.id === id)
    if (!opt) continue
    out.redFlags.push(opt.label)
    if (opt.hint) out.cautions.push(`${opt.label} → ${opt.hint}`)
  }
  if (out.redFlags.length > 0) {
    out.referralSuggested = true
    out.actions.push('緊急性のある所見があります。画像評価と専門医への紹介を今日のうちに検討してください。')
  }

  // 所見のうち、hint に「要注意」「緊急」を含むものは、選ばれていれば注意として上げる
  for (const id of input.findings) {
    const opt = def.findingOptions.find((o) => o.id === id)
    if (!opt) continue
    out.positiveFindings.push(opt.label)
    if (opt.hint && /要注意|要精査|緊急|除外/.test(opt.hint)) {
      out.cautions.push(`${opt.label}：${opt.hint}`)
    }
  }
  // 症状側にも見落としたくない項目がある（脊髄症のサインなど）
  for (const id of input.symptoms) {
    const opt = def.symptomOptions.find((o) => o.id === id)
    if (!opt?.hint) continue
    if (/要注意|緊急|可能性/.test(opt.hint)) {
      out.cautions.push(`${opt.label}：${opt.hint}`)
    }
  }

  // ------------------------------------------------------------ 治療の段の提案
  const maxSteps = def.treatments.length
  let step = 1
  const reasons: string[] = []

  // すでに試した治療のうち、いちばん上の段の「次」を提案する
  const tried = input.priorTreatments.map((id) => PRIOR_TO_STEP[id] ?? 0)
  const maxTried = tried.length > 0 ? Math.max(...tried) : 0
  if (maxTried > 0) {
    step = Math.min(maxTried + 1, maxSteps)
    const triedLabels = input.priorTreatments
      .map((id) => def.priorTreatmentOptions.find((o) => o.id === id)?.label)
      .filter(Boolean)
    reasons.push(`すでに ${triedLabels.join('・')} を実施`)
  }

  // 長引いている場合は、土台だけで様子を見る段階ではない
  if (isProlonged(input.duration) && step < 2) {
    step = 2
    reasons.push('症状が長引いている')
  }

  // 痛みが強くて運動ができない状態なら、まず痛みを下げる段へ
  if (out.painBand === 'severe' && step < 2) {
    step = 2
    reasons.push('痛みが強く、運動療法を始められる状態ではない')
  }

  // レッドフラッグがあれば、段の提案より紹介が優先
  if (out.redFlags.length > 0) {
    reasons.unshift('緊急性のある所見あり（段の提案より精査・紹介を優先）')
  }

  out.suggestedStep = step
  out.suggestedStepReasons =
    reasons.length > 0
      ? reasons
      : [`まだ治療を始めていないため、土台の「${def.treatments[0]?.title ?? '運動療法と生活の工夫'}」から始めます`]

  // ------------------------------------------------------------ そのほかの助言
  if (input.painNrs === null) {
    out.actions.push('痛みの強さ（NRS）を記録しておくと、次回の効果判定がしやすくなります。')
  }
  if (def.metrics && def.metrics.length > 0) {
    const missing = def.metrics.filter((m) => input.metrics[m.key] == null)
    if (missing.length > 0) {
      out.actions.push(`経過の指標（${missing.map((m) => m.label).join('・')}）を測っておくと比較できます。`)
    }
  }
  if (def.stages && def.stages.length > 0 && !input.stage) {
    out.actions.push(`${def.stagesLabel ?? '病期'}を選ぶと、その時期に合った説明と運動が表示されます。`)
  }
  if (!input.side && def.sideRelevant) {
    out.actions.push('左右を選ぶと、図が患側に合わせて表示されます。')
  }

  return out
}

/** セッションから直接判定する（画面はこちらを使う） */
export function assessSessionCondition(session: Session): {
  def: ConditionDef | undefined
  assessment: ConditionAssessment
} {
  const def = getCondition(session.disease)
  return { def, assessment: assessCondition(session.condition, def) }
}

/** 表示用：選択肢IDをラベルに変換する */
export function labelsOf(ids: string[], options: { id: string; label: string }[]): string[] {
  return ids.map((id) => options.find((o) => o.id === id)?.label).filter((s): s is string => Boolean(s))
}

/** カルテ記載向けの1行サマリ */
export function conditionSummaryLine(session: Session): string {
  const def = getCondition(session.disease)
  if (!def) return ''
  const c = session.condition
  const parts: string[] = []
  if (c.side) parts.push(sideLabel(c.side))
  if (c.painNrs !== null) parts.push(`NRS ${c.painNrs}/10`)
  if (c.duration) {
    const d = def.duration.find((x) => x.id === c.duration)
    if (d) parts.push(d.label)
  }
  if (c.stage && def.stages) {
    const st = def.stages.find((x) => x.id === c.stage)
    if (st) parts.push(st.label)
  }
  return parts.join('／')
}

export function sideLabel(side: ConditionInput['side']): string {
  return side === 'both' ? '両側' : side === 'left' ? '左' : side === 'right' ? '右' : ''
}

/**
 * 疾患モデルの経過フェーズのうち、いまどこにいるかを推定する。
 * 期間の選択肢の並び順を、そのままフェーズの並び順に対応させる。
 */
export function currentPhaseIndex(input: ConditionInput, def: ConditionDef | undefined): number | null {
  if (!def || !input.duration) return null
  const di = def.duration.findIndex((d) => d.id === input.duration)
  if (di < 0) return null
  const n = def.course.phases.length
  if (n === 0) return null
  // 期間の刻み数とフェーズ数が違うことがあるため、比率で対応づける
  const ratio = def.duration.length <= 1 ? 0 : di / (def.duration.length - 1)
  return Math.min(n - 1, Math.round(ratio * (n - 1)))
}

/** 疾患キーが症状別疾患かどうか（logic 側からも使えるように再輸出） */
export function isCondition(disease: DiseaseKey): boolean {
  return getCondition(disease) !== undefined
}
