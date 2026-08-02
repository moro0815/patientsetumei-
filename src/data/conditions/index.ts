import type { ConditionKey, DiseaseKey } from '@/types'
import type { ConditionDef } from './types'
import { cervicalRadiculopathy, lumbarDiscHernia, lumbarStenosis, vertebralFracture } from './spine'
import { frozenShoulder, tennisElbow, triggerFinger } from './upperlimb'
import { ankleSprain, hipOA, muscleStrain, plantarFasciitis, shinSplints } from './lowerlimb'

export type { ConditionDef } from './types'
export { emptyConditionInput } from './types'

/**
 * 症状別疾患の登録簿。
 *
 * 疾患を追加するときは、ここに1行足すだけで
 * トップ画面・入力画面・説明スライド・パンフレット・カルテ文のすべてに反映される。
 */
export const CONDITIONS: ConditionDef[] = [
  // 腰・背中
  lumbarStenosis,
  lumbarDiscHernia,
  vertebralFracture,
  // 首・肩・腕
  cervicalRadiculopathy,
  frozenShoulder,
  tennisElbow,
  // 手・指
  triggerFinger,
  // 股・膝
  hipOA,
  // 足
  plantarFasciitis,
  ankleSprain,
  // スポーツ・外傷
  muscleStrain,
  shinSplints,
]

const byKey = new Map<string, ConditionDef>(CONDITIONS.map((c) => [c.key, c]))

/** 症状別疾患かどうか */
export function isConditionKey(key: DiseaseKey): key is ConditionKey {
  return byKey.has(key)
}

/** 疾患モデルを取り出す。症状別疾患でなければ undefined */
export function getCondition(key: DiseaseKey): ConditionDef | undefined {
  return byKey.get(key)
}

/** 部位ごとのまとまり（トップ画面のグルーピング） */
export const CONDITION_REGIONS: ConditionDef['region'][] = [
  '腰・背中',
  '首・肩・腕',
  '手・指',
  '股・膝',
  '足',
  'スポーツ・外傷',
]

export function conditionsByRegion(region: ConditionDef['region']): ConditionDef[] {
  return CONDITIONS.filter((c) => c.region === region)
}

/** 病名・別名からの検索（トップ画面の絞り込み） */
export function searchConditions(query: string): ConditionDef[] {
  const q = query.trim().toLowerCase()
  if (!q) return CONDITIONS
  return CONDITIONS.filter((c) =>
    [c.label, c.subLabel, ...c.aka].some((s) => s.toLowerCase().includes(q)),
  )
}
