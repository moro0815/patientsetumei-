import type { ReactNode } from 'react'
import type {
  ConditionInput,
  ConditionKey,
  ConditionMetricSpec,
  ConditionOption,
  ConditionStage,
  CoursePhase,
  Session,
  TreatmentStep,
} from '@/types'

/**
 * 症状別疾患の「内容」の宣言的な定義。
 *
 * なぜこの形にしたか
 * - 外来で頻度の高い運動器疾患は、説明の骨格が共通している。
 *   （何が起きているか → なぜ痛いか → どのくらいで治るか → 何をするか → 何に気をつけるか）
 * - 疾患ごとに画面・スライド・パンフレットのコードを書くと、
 *   11疾患で同じ構造のコードが11回並び、修正漏れが必ず起きる。
 * - そこで「臨床の中身」だけをこの型で書き、画面はすべて共通の描画に任せる。
 *   疾患を追加するときに触るのは、この形式のファイル1つだけになる。
 *
 * 執筆時の約束
 * - patient 向けの文章は、中学生が読んで分かる日本語にする。専門用語は必ず言い換えを添える。
 * - doctor 向けの補足（hint / note / talk）は、そのまま研修医への指導に使える粒度にする。
 * - 数値・推奨には必ず sources（data/sources.ts のID）を付ける。
 */
export interface ConditionDef {
  key: ConditionKey
  /** 画面に出す病名（正式名称） */
  label: string
  /** カード等に出す短い説明 */
  subLabel: string
  /** 患者さんがよく使う言い方・別名（検索と読み替えに使う） */
  aka: string[]
  icon: string
  /** トップ画面のカードの配色（Tailwind クラス） */
  accent: string
  /** 部位のまとまり（トップ画面のグルーピング） */
  region: '腰・背中' | '首・肩・腕' | '手・指' | '股・膝' | '足' | 'スポーツ・外傷'
  /** 患者さんへの一行説明（表紙とスライド冒頭に使う） */
  oneLiner: string

  // ------------------------------------------------------------ 入力仕様
  /** 左右の入力を出すか（腰部脊柱管狭窄症のように両側が普通の疾患では任意にする） */
  sideRelevant: boolean
  duration: ConditionOption[]
  symptomOptions: ConditionOption[]
  findingOptions: ConditionOption[]
  redFlagOptions: ConditionOption[]
  priorTreatmentOptions: ConditionOption[]
  stages?: ConditionStage[]
  stagesLabel?: string
  metrics?: ConditionMetricSpec[]

  // ------------------------------------------------------------ 説明の中身
  /** 病態の図（患者さんの入力を反映できる） */
  figure: (c: ConditionInput, session: Session) => ReactNode
  /** 追加の図（治療・経過など） */
  extraFigures?: {
    id: string
    group: '現状' | '病気のしくみ' | '治療' | '運動療法' | '生活' | '見通し'
    title: string
    lead?: string
    node: (c: ConditionInput, session: Session) => ReactNode
    points: string[]
    talk?: string[]
  }[]

  /** 何が起きているのか */
  what: string[]
  /** なぜ痛みやしびれが出るのか */
  whyPain: string[]
  /** 病気のしくみを説明するときの医師用トーク */
  mechanismTalk: string[]

  /** 見通し（自然経過）— 患者さんが最も知りたいところ */
  course: {
    headline: string
    points: string[]
    phases: CoursePhase[]
    talk?: string[]
  }

  /** 治療の段階（下から積み上げる） */
  treatments: TreatmentStep[]
  treatmentTalk?: string[]

  /** 運動療法（当院の中心） */
  exercise: {
    why: string[]
    /** 既定で提案する運動ID（data/exercises.ts） */
    recommendedIds: string[]
    /** 運動を始めるときの注意 */
    cautions: string[]
    talk?: string[]
  }

  /** 生活の工夫 */
  selfCare: string[]
  /** 避けたほうがよいこと */
  avoid: string[]
  /** すぐ受診・連絡が必要なサイン */
  warnSigns: string[]

  /** 画像・検査の考え方（医師向け。過剰検査を避けるための記述を含める） */
  workup: string[]
  /** この疾患で候補になる検査ID（data/fees.ts の LAB_ORDERS） */
  labIds?: string[]
  /** 次回来院の目安 */
  nextVisit: string
  /** 標準的な説明所要時間の目安（分）— 診療の組み立てに使う */
  minutes: number
  sources: string[]
}

/** 疾患モデルの入力が空のときの既定値 */
export function emptyConditionInput(): ConditionInput {
  return {
    side: null,
    painNrs: null,
    duration: null,
    onset: null,
    symptoms: [],
    findings: [],
    redFlags: [],
    stage: null,
    metrics: {},
    priorTreatments: [],
    note: '',
  }
}
