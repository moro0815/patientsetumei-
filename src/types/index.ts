/**
 * せつめいナビ 型定義
 *
 * 設計方針
 * - 患者個人を特定する情報は「必要最小限」しか型に持たせない。
 *   氏名フルネームは任意項目、既定では受付番号（カルテ番号）とイニシャルのみで運用できる。
 * - 臨床判断のロジックは logic/ 配下に置き、この型は「入力」と「導出結果」の境界を明示する。
 */

// ---------------------------------------------------------------- 共通

export type DiseaseKey = 'osteoporosis' | 'ra' | 'kneeOA'

export type Sex = 'female' | 'male'

/** ガイドライン等の出典。画面と印刷物の両方で必ず提示する */
export interface SourceRef {
  id: string
  /** 略称（画面に出す短いラベル） */
  short: string
  /** 正式名称 */
  title: string
  publisher: string
  /** 発行年・改訂年 */
  year: string
  url?: string
  note?: string
}

/** 院内で編集できるマスタに共通のメタ情報 */
export interface MasterMeta {
  /** この値を最後に確認した時点（診療報酬など改定で変わるものに必須） */
  verifiedAt: string
  /** 施設で必ず再確認すべき項目か */
  needsLocalCheck: boolean
}

// ---------------------------------------------------------------- 患者

export interface PatientBasics {
  /** カルテ番号・受付番号（院内ID）。氏名の代わりに使うことを推奨 */
  chartNo: string
  /** 表示名。イニシャルや「〇〇 様」など。空でも動作する */
  displayName: string
  age: number | null
  sex: Sex
  heightCm: number | null
  weightKg: number | null
  /** 20歳頃の身長（cm）。身長低下は椎体骨折のサイン */
  maxHeightCm: number | null
  /** 説明の担当医 */
  doctorName: string
  /** 説明日（YYYY-MM-DD） */
  visitDate: string
}

// ---------------------------------------------------------------- 骨粗鬆症

export type BmdUnit = 'yam' | 'tscore'

export interface BmdMeasurement {
  /** 入力単位（YAM% または Tスコア） */
  unit: BmdUnit
  /** 腰椎（L1-L4 または L2-L4） */
  lumbar: number | null
  /** 大腿骨近位部（total hip または femoral neck） */
  femur: number | null
  /** 測定日 */
  measuredAt: string
  /** 測定機種・部位のメモ */
  note: string
}

/** 脆弱性骨折の部位分類（診断基準上の扱いが異なる） */
export type FragilityFractureSite =
  | 'vertebra' // 椎体
  | 'proximalFemur' // 大腿骨近位部
  | 'rib' // 肋骨
  | 'pelvis' // 骨盤
  | 'proximalHumerus' // 上腕骨近位部
  | 'distalRadius' // 橈骨遠位端
  | 'lowerLeg' // 下腿骨

export interface FragilityFracture {
  site: FragilityFractureSite
  /** 発生時期（分かる範囲で）。直近12か月以内は骨折リスクが特に高い */
  when: 'within12m' | 'over12m' | 'unknown'
  /** 多発（2か所以上）か */
  multiple: boolean
}

/** FRAX の入力に対応する危険因子（本システムはFRAX本体を再実装しない） */
export interface OsteoporosisRiskFactors
  extends Record<
    | 'parentHipFracture'
    | 'currentSmoking'
    | 'alcohol3Units'
    | 'glucocorticoid'
    | 'rheumatoidArthritis'
    | 'secondaryOsteoporosis'
    | 'fallLastYear'
    | 'diabetesT2'
    | 'ckd'
    | 'lowBodyWeight',
    boolean
  > {
  /** FRAX®（外部サイト／DXA装置で算出）の主要骨折10年確率(%) */
  fraxMajorPercent: number | null
  /** FRAX® 大腿骨近位部骨折10年確率(%) */
  fraxHipPercent: number | null
}

export interface OsteoporosisInput {
  bmd: BmdMeasurement
  fractures: FragilityFracture[]
  risk: OsteoporosisRiskFactors
  /** 骨代謝マーカー等（説明の材料。任意） */
  labs: {
    /** 血清カルシウム mg/dL */
    calcium: number | null
    /** 25(OH)D ng/mL */
    vitD25: number | null
    /** TRACP-5b mU/dL（骨吸収マーカー） */
    tracp5b: number | null
    /** P1NP μg/L（骨形成マーカー） */
    p1np: number | null
    /** eGFR mL/min/1.73m2 */
    egfr: number | null
  }
  /** 現在の骨粗鬆症治療（既治療） */
  currentTherapy: string[]
}

/** 診断・治療開始判定の導出結果 */
export interface OsteoporosisAssessment {
  /** 原発性骨粗鬆症の診断基準を満たすか */
  diagnosis: 'osteoporosis' | 'lowBoneMass' | 'normal' | 'insufficientData'
  diagnosisReasons: string[]
  /** 採用した骨密度値（低い方）をYAM%とTスコアの両方で */
  adoptedYam: number | null
  adoptedTscore: number | null
  adoptedSite: 'lumbar' | 'femur' | null
  /** 薬物治療開始基準を満たすか */
  pharmacotherapyIndicated: boolean | 'consider'
  pharmacotherapyReasons: string[]
  /** 骨折リスク区分 */
  riskTier: 'veryHigh' | 'high' | 'moderate' | 'low' | 'unknown'
  riskTierReasons: string[]
  /** 身長低下（cm）— 4cm以上は椎体骨折を疑う */
  heightLossCm: number | null
  /** 医師が確認すべき除外診断・注意事項 */
  cautions: string[]
}

// ---------------------------------------------------------------- 関節リウマチ

export interface RaInput {
  /** 発症からの期間（月） */
  durationMonths: number | null
  /** 28関節の圧痛関節数 */
  tenderJoints28: number | null
  /** 28関節の腫脹関節数 */
  swollenJoints28: number | null
  /** 患者全般評価 VAS 0-10 cm */
  patientGlobalVas: number | null
  /** 医師全般評価 VAS 0-10 cm */
  physicianGlobalVas: number | null
  /** CRP mg/dL */
  crp: number | null
  /** ESR mm/h */
  esr: number | null
  /** RF（IU/mL）。定性のみの場合は positive を使う */
  rf: number | null
  rfPositive: boolean | null
  /** 抗CCP抗体（U/mL） */
  accp: number | null
  accpPositive: boolean | null
  /** MMP-3 ng/mL */
  mmp3: number | null
  /** 単純X線での骨破壊（骨びらん）の有無 */
  erosion: boolean
  /** 罹患関節の分布（説明図に反映） */
  affectedRegions: RaJointRegion[]
  /**
   * ACR/EULAR 2010 分類基準のための関節数。
   * 大関節＝肩・肘・股・膝・足関節、小関節＝MCP・PIP・第2〜5MTP・母指IP・手関節。
   * DAS28の28関節とは対象が異なるため、分類基準用に別入力とする。
   */
  largeJointsInvolved: number | null
  smallJointsInvolved: number | null
  /** HAQ-DI 0-3 */
  haq: number | null
  /**
   * 問診システム等で既に算出済みのスコア。
   * 関節数などの内訳が取り込めない場合でも、このスコアで説明を進められるようにする。
   * 内訳と両方ある場合は本システムの計算値を優先し、乖離があれば警告を出す。
   */
  external: {
    sdai: number | null
    cdai: number | null
    das28crp: number | null
    das28esr: number | null
    /** 取り込み元の名称（記録に残す） */
    source: string
  }
  /** 現在の治療 */
  currentTherapy: string[]
  /** 併存症・注意事項 */
  comorbidity: {
    interstitialLungDisease: boolean
    hepatitisBC: boolean
    latentTb: boolean
    ckd: boolean
    malignancyHistory: boolean
    pregnancyPlan: boolean
    elderly75: boolean
  }
}

export type RaJointRegion =
  | 'shoulderL' | 'shoulderR'
  | 'elbowL' | 'elbowR'
  | 'wristL' | 'wristR'
  | 'mcpL' | 'mcpR'
  | 'pipL' | 'pipR'
  | 'kneeL' | 'kneeR'
  | 'ankleL' | 'ankleR'
  | 'mtpL' | 'mtpR'
  | 'cervical'
  | 'hipL' | 'hipR'

export type RaActivityLevel = 'remission' | 'low' | 'moderate' | 'high' | 'unknown'

export interface RaScore {
  value: number | null
  level: RaActivityLevel
  /** 計算に使えなかった欠損項目 */
  missing: string[]
  /**
   * 値の出どころ。
   * 'computed' = 本システムが関節数などから計算した
   * 'external' = 問診システム等から取り込んだ値をそのまま使った
   */
  source?: 'computed' | 'external'
}

export interface RaAssessment {
  das28crp: RaScore
  das28esr: RaScore
  sdai: RaScore
  cdai: RaScore
  /** ACR/EULAR 2011 Boolean 寛解基準 */
  booleanRemission: { met: boolean | null; detail: string[] }
  /** ACR/EULAR 2010 分類基準の参考スコア（診断の補助。確定診断は医師が行う） */
  classification2010: { score: number | null; breakdown: string[]; suggestsRa: boolean | null }
  /** 代表指標（入力できたもののうち優先度の高いもの） */
  primary: { name: string; score: RaScore }
  /** T2Tの目標に対する評価コメント */
  t2tComment: string[]
  cautions: string[]
}

// ---------------------------------------------------------------- 変形性膝関節症／ロコモ

export interface KneeInput {
  side: 'left' | 'right' | 'both' | null
  /** Kellgren-Lawrence 分類 0-4 */
  klGrade: number | null
  /** 痛みのNRS 0-10 */
  painNrs: number | null
  /** 大腿脛骨角などのメモ */
  alignment: 'varus' | 'valgus' | 'neutral' | null
  /** 主な訴え */
  complaints: string[]
  /** 可動域制限 */
  romLimitation: boolean
  /** 関節液貯留 */
  effusion: boolean
}

/**
 * 立ち上がりテストの結果。
 * 数値 = その高さの台から立ち上がれた（最小の高さ）
 * 'cannot' = 最も高い40cmの台からも立ち上がれなかった
 * null = 未実施
 * 「立てない」と「未実施」は判定が全く違うため、必ず区別する。
 */
export type StandUpResult = number | 'cannot' | null

export interface LocomoInput {
  /** 立ち上がりテスト：片脚で立てた最小の台の高さ(cm) */
  standUpOneLegCm: StandUpResult
  /** 立ち上がりテスト：両脚で立てた最小の台の高さ(cm) */
  standUpBothLegCm: StandUpResult
  /** 2ステップ値（2歩幅cm ÷ 身長cm） */
  twoStepValue: number | null
  /** ロコモ25 合計点（0-100） */
  locomo25: number | null
}

export type LocomoStage = 0 | 1 | 2 | 3 | null

export interface LocomoAssessment {
  stage: LocomoStage
  byTest: { standUp: LocomoStage; twoStep: LocomoStage; locomo25: LocomoStage }
  message: string
  advice: string[]
}

// ---------------------------------------------------------------- 薬剤マスタ

export type DrugClass =
  | 'bisphosphonate'
  | 'denosumab'
  | 'serm'
  | 'teriparatide'
  | 'abaloparatide'
  | 'romosozumab'
  | 'activeVitD'
  | 'vitaminK2'
  | 'calcium'
  | 'csdmard'
  | 'bdmard'
  | 'jak'
  | 'glucocorticoid'
  | 'nsaid'
  | 'acetaminophen'
  | 'duloxetine'
  | 'ha-injection'
  | 'other'

export interface DrugInfo {
  id: string
  /** 一般名 */
  generic: string
  /** 代表的な商品名（院内で採用しているものに置き換えて使う） */
  brands: string[]
  cls: DrugClass
  disease: DiseaseKey[]
  /** 剤形・投与経路 */
  route: string
  /** 患者向けの一言説明（やさしい日本語） */
  plain: string
  /** どう効くのか（患者向け） */
  howItWorks: string
  /** 投与間隔・のみ方（患者向け） */
  schedule: string
  /** 主な注意点（患者向け・生活上の注意を優先） */
  cautions: string[]
  /** 医師向けメモ（用量・禁忌・モニタリング） */
  clinicalNote: string
  /** 投与期間の上限など */
  durationLimit?: string
  /** 費用の目安（3割負担・月額の概算） */
  costHint?: string
  /** 出典ID */
  sources: string[]
}

// ---------------------------------------------------------------- 運動療法マスタ

export type ExerciseCategory =
  | 'balance' // バランス（転倒予防）
  | 'strength' // 筋力
  | 'weightBearing' // 荷重運動
  | 'backExtensor' // 背筋
  | 'aerobic' // 有酸素
  | 'rom' // 関節可動域
  | 'jointProtection' // 関節保護・ADL指導
  | 'aquatic' // 水中運動

export interface ExerciseItem {
  id: string
  name: string
  /** 患者向けのふりがな付きの短い名前 */
  shortName: string
  category: ExerciseCategory
  disease: DiseaseKey[]
  /** 想定される機能レベル */
  level: 'sitting' | 'standing-support' | 'standing' | 'active'
  /** 手順（患者向け・1文ずつ） */
  steps: string[]
  /** 既定の処方量 */
  dose: { reps: string; sets: string; frequency: string }
  /** やってはいけない・中止基準（患者向け） */
  stopRules: string[]
  /** 図のキー（figures/ExerciseFigure が描画する） */
  figure: ExerciseFigureKey
  /** 医師・PT向けメモ */
  clinicalNote?: string
  sources: string[]
}

export type ExerciseFigureKey =
  | 'oneLegStand'
  | 'squat'
  | 'heelRaise'
  | 'backExtension'
  | 'quadSetting'
  | 'straightLegRaise'
  | 'sideLegRaise'
  | 'chairStand'
  | 'walking'
  | 'ankleRom'
  | 'gripBall'
  | 'wristRom'
  | 'shoulderPulley'
  | 'jointProtect'
  | 'aquatic'

/** 実際に患者へ渡す運動処方 */
export interface ExercisePrescriptionItem {
  exerciseId: string
  reps: string
  sets: string
  frequency: string
  memo: string
}

// ---------------------------------------------------------------- 治療方針

export interface TreatmentPlan {
  /** 選択した薬剤ID */
  drugIds: string[]
  /** 運動療法の導入経路 */
  exercisePathway: ExercisePathway[]
  prescription: ExercisePrescriptionItem[]
  /** 生活指導のチェック項目ID */
  lifestyleIds: string[]
  /** 次回来院の目安 */
  nextVisit: string
  /** 次回までに行う検査 */
  nextTests: string[]
  /** 医師が患者に伝えた追加のひとこと（パンフレットに印字） */
  doctorMessage: string
}

export type ExercisePathway =
  | 'undoukiRehab' // 運動器リハビリテーション（理学療法士による個別）
  | 'clinicClass' // 当院の運動教室（集団）
  | 'homeExercise' // 自主トレーニング
  | 'homeVisitRehab' // 訪問リハビリ
  | 'referral' // 他施設紹介

// ---------------------------------------------------------------- セッション

export interface Session {
  id: string
  createdAt: string
  disease: DiseaseKey
  patient: PatientBasics
  osteo: OsteoporosisInput
  ra: RaInput
  knee: KneeInput
  locomo: LocomoInput
  plan: TreatmentPlan
  /** 説明モードで実際に見せたスライドID（記録用） */
  shownSlideIds: string[]
  /** パンフレットに載せるページの選択 */
  pamphletSections: string[]
  /** 表示設定 */
  view: ViewSettings
}

export interface ViewSettings {
  /** 患者説明画面の文字倍率 */
  patientScale: number
  /** ふりがな表示 */
  ruby: boolean
  /** 医師用メモを説明画面に出すか */
  showDoctorNote: boolean
  /** パンフレットの文字サイズ */
  pamphletScale: 'normal' | 'large'
}

// ---------------------------------------------------------------- 算定・記録

export interface FeeItem {
  id: string
  /** 区分番号（例: H002） */
  code: string
  name: string
  /** 点数。改定で変わるため必ず院内で確認する */
  points: number | null
  unit: string
  /** 算定要件の要約 */
  requirement: string
  /** 施設基準の要否 */
  facilityStandard: string
  disease: DiseaseKey[]
  meta: MasterMeta
  sources: string[]
}

export interface LabOrderItem {
  id: string
  name: string
  purpose: string
  interval: string
  disease: DiseaseKey[]
  /** どの薬剤を使うときに必要か */
  requiredFor?: DrugClass[]
}
