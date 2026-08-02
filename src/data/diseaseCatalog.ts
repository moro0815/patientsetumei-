import type { DiseaseKey } from '@/types'
import { CONDITIONS } from './conditions'

/**
 * トップ画面に並べる疾患の一覧。
 *
 * なぜ疾患モデル（data/conditions）と分けているか
 * - 骨粗鬆症・関節リウマチ・変形性膝関節症は専用の判定ロジックを持つため、
 *   宣言的な疾患モデルには載っていない。
 * - しかし「どの部位のグループに置くか」「どんな別名で検索できるか」は
 *   14疾患すべてに共通で必要になる。
 * - そこで画面に出すための情報だけをこの表に集め、
 *   症状別疾患のぶんは疾患モデルから自動で引き込む。
 *
 * 並べ方の考え方
 * - **骨粗鬆症と関節リウマチだけを最上段**に置く。
 *   この2つは「痛みを主訴に来た患者さん」ではなく「継続して管理していく患者さん」が対象で、
 *   検査値をもとに判定する点でも、ほかの疾患と性質が違う。
 * - 残りはすべて**部位から探す**。診察室では「膝が痛い」「腰が痛い」から入るため、
 *   変形性膝関節症も股関節症と同じ「股・膝」に置くほうが迷わない。
 */

export type DiseaseRegion = '腰・背中' | '首・肩・腕' | '手・指' | '股・膝' | '足' | 'スポーツ・外傷'

export interface DiseaseCard {
  key: DiseaseKey
  label: string
  subLabel: string
  /** 患者さんがよく使う言い方（検索に使う） */
  aka: string[]
  icon: string
  accent: string
  /** 部位。'main' は最上段（継続して管理する疾患） */
  region: DiseaseRegion | 'main'
  /** 説明の目安時間（分） */
  minutes: number
}

/** 部位の並び順（トップ画面の見出しの順序） */
export const DISEASE_REGIONS: DiseaseRegion[] = [
  '腰・背中',
  '首・肩・腕',
  '手・指',
  '股・膝',
  '足',
  'スポーツ・外傷',
]

/** 専用の判定ロジックを持つ疾患（疾患モデルに載っていないもの） */
const CORE_CARDS: DiseaseCard[] = [
  {
    key: 'osteoporosis',
    label: '骨粗鬆症',
    subLabel: '骨密度・骨折リスク・骨を強くする治療',
    aka: ['骨粗鬆症', 'こつそしょうしょう', '骨密度', '骨が弱い'],
    icon: '🦴',
    accent: 'from-bone-100 to-bone-200 border-bone-400',
    region: 'main',
    minutes: 4,
  },
  {
    key: 'ra',
    label: '関節リウマチ',
    subLabel: '関節の炎症・T2T・抗リウマチ薬',
    aka: ['関節リウマチ', 'リウマチ', 'RA'],
    icon: '🖐️',
    accent: 'from-pink-50 to-pink-100 border-pink-300',
    region: 'main',
    minutes: 5,
  },
  {
    key: 'kneeOA',
    label: '変形性膝関節症・ロコモ',
    subLabel: '膝の痛み・歩く力・運動療法',
    aka: ['変形性膝関節症', '膝関節症', 'ひざ', '膝', 'ロコモ', 'ロコモティブシンドローム'],
    icon: '🦵',
    accent: 'from-brand-50 to-brand-100 border-brand-300',
    // 診察室では「膝が痛い」から入るため、股関節症と同じ部位のまとまりに置く
    region: '股・膝',
    minutes: 5,
  },
]

/** 症状別疾患を疾患モデルから引き込む */
const CONDITION_CARDS: DiseaseCard[] = CONDITIONS.map((c) => ({
  key: c.key,
  label: c.label,
  subLabel: c.subLabel,
  aka: c.aka,
  icon: c.icon,
  accent: c.accent,
  region: c.region,
  minutes: c.minutes,
}))

export const DISEASE_CARDS: DiseaseCard[] = [...CORE_CARDS, ...CONDITION_CARDS]

/** 最上段に出す疾患（継続して管理していくもの） */
export const MAIN_CARDS: DiseaseCard[] = DISEASE_CARDS.filter((c) => c.region === 'main')

export function cardsByRegion(region: DiseaseRegion): DiseaseCard[] {
  return DISEASE_CARDS.filter((c) => c.region === region)
}

/**
 * 病名・別名からの検索。
 * 診察室で「五十肩」「ばね指」「ぎっくり」のように、
 * 患者さんの言い方からたどり着けるようにする。
 */
export function searchDiseases(query: string): DiseaseCard[] {
  const q = query.trim().toLowerCase()
  if (!q) return DISEASE_CARDS
  return DISEASE_CARDS.filter((c) =>
    [c.label, c.subLabel, ...c.aka].some((s) => s.toLowerCase().includes(q)),
  )
}
