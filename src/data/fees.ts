import { FEE_ITEMS_CONDITION, LAB_ORDERS_CONDITION } from './fees2'
import type { DiseaseKey, FeeItem, LabOrderItem } from '@/types'

/**
 * 診療報酬・算定候補マスタ
 *
 * ⚠️ 重要 ⚠️
 * 点数・算定要件は診療報酬改定（2年ごと）で変わります。
 * 令和8年度改定は令和8年3月5日告示、薬価は令和8年4月1日、本体は令和8年6月1日施行です。
 * 本マスタの点数は「編集前提の初期値」であり、そのまま算定根拠には使えません。
 * 必ず最新の医科診療報酬点数表・地方厚生（支）局の通知・疑義解釈で確認し、
 * 設定画面（マスタ編集）から院内の値に更新してください。
 *
 * points を null にすると画面には「要確認」と表示されます。
 */

/** マスタ全体の最終確認日。設定画面から更新する */
export const FEE_MASTER_VERIFIED_AT = '2026-07-31'

const meta = { verifiedAt: FEE_MASTER_VERIFIED_AT, needsLocalCheck: true }

export const FEE_ITEMS: FeeItem[] = [
  // ---------------------------------------------------------------- リハビリテーション
  {
    id: 'undouki-reha-1',
    code: 'H002',
    name: '運動器リハビリテーション料（Ⅰ）',
    points: 185,
    unit: '1単位（20分）',
    requirement:
      '運動器リハビリテーションを要する状態で、専任の常勤医師の指導監督の下、理学療法士等が個別に20分以上行った場合に算定。発症・手術・急性増悪または最初に診断された日から150日を限度（厚生労働大臣が定める患者・場合は150日超も算定可）。',
    facilityStandard: '必要（施設基準の届出。専任常勤医師、PT・OTの人員、専用施設面積等）',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'undouki-reha-2',
    code: 'H002',
    name: '運動器リハビリテーション料（Ⅱ）',
    points: 170,
    unit: '1単位（20分）',
    requirement: '（Ⅰ）と同様の内容。施設基準の区分による違い。',
    facilityStandard: '必要',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'undouki-reha-3',
    code: 'H002',
    name: '運動器リハビリテーション料（Ⅲ）',
    points: 85,
    unit: '1単位（20分）',
    requirement: '（Ⅰ）（Ⅱ）と同様の内容。施設基準の区分による違い。',
    facilityStandard: '必要',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'reha-over150',
    code: 'H002 注',
    name: '算定日数上限（150日）を超える場合',
    points: null,
    unit: '1月13単位まで',
    requirement:
      '治療を継続することにより状態の改善が期待できると医学的に判断される場合等は150日を超えて算定できるが、原則として1月13単位が上限。要介護被保険者等の取扱いにも注意。',
    facilityStandard: '—',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'reha-plan',
    code: 'H003-2',
    name: 'リハビリテーション総合計画評価料 ／ リハビリテーション実施計画書',
    points: null,
    unit: '月1回',
    requirement:
      '医師・PT・OT等の多職種が共同してリハビリテーション計画を策定・評価し、患者に説明して交付した場合。計画書の交付・説明の記録が必須。',
    facilityStandard: '要確認',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },

  // ---------------------------------------------------------------- 骨粗鬆症
  {
    id: 'secondary-fracture-3',
    code: 'B001・34',
    name: '二次性骨折予防継続管理料3（外来）',
    points: 500,
    unit: '1月1回・1年を限度',
    requirement:
      '「二次性骨折予防継続管理料1」を算定していた患者に対し、外来で継続的に骨粗鬆症の評価および治療等を実施した場合に、初回算定月から1年を限度に月1回算定。1を算定していない患者には算定できない点に注意。',
    facilityStandard: '必要（施設基準の届出）',
    disease: ['osteoporosis'],
    meta,
    sources: ['mhlw-fee-r8', 'fls-standard'],
  },
  {
    id: 'secondary-fracture-1',
    code: 'B001・34',
    name: '二次性骨折予防継続管理料1（入院・手術を担う一般病棟）',
    points: 1000,
    unit: '入院中1回',
    requirement:
      '大腿骨近位部骨折を発症し手術治療を担う保険医療機関の一般病棟に入院している患者に対し、骨粗鬆症の有無に関する評価および必要な治療等を実施した場合。',
    facilityStandard: '必要',
    disease: ['osteoporosis'],
    meta,
    sources: ['mhlw-fee-r8', 'fls-standard'],
  },
  {
    id: 'secondary-fracture-2',
    code: 'B001・34',
    name: '二次性骨折予防継続管理料2（入院・リハビリ等を担う病棟）',
    points: 750,
    unit: '入院中1回',
    requirement: 'リハビリテーション等を担う病棟に入院している患者に対して実施した場合。',
    facilityStandard: '必要',
    disease: ['osteoporosis'],
    meta,
    sources: ['mhlw-fee-r8', 'fls-standard'],
  },
  {
    id: 'bmd-dxa',
    code: 'E100 等',
    name: '骨塩定量検査（DXA法）',
    points: null,
    unit: '4月に1回を限度',
    requirement:
      '骨粗鬆症の診断・経過観察のために実施。原則として4か月に1回を限度に算定（詳細は点数表を確認）。腰椎・大腿骨近位部の両方を測定することが望ましい。',
    facilityStandard: '—',
    disease: ['osteoporosis'],
    meta,
    sources: ['mhlw-fee-r8', 'op-gl-2025'],
  },

  // ---------------------------------------------------------------- 管理料・指導料
  {
    id: 'seikatsu-shukan',
    code: 'B001-3 等',
    name: '生活習慣病管理料 ／ 特定疾患療養管理料 等',
    points: null,
    unit: '月1回等',
    requirement:
      '対象疾患・算定要件が改定で大きく変わっている領域です。骨粗鬆症・関節リウマチが対象になるか、他の管理料と併算定できるかを必ず最新の点数表で確認してください。',
    facilityStandard: '要確認',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'joint-injection',
    code: 'G010',
    name: '関節腔内注射',
    points: null,
    unit: '1回',
    requirement: '関節腔内への薬剤注入。使用薬剤は別途算定。',
    facilityStandard: '—',
    disease: ['kneeOA', 'ra'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'shoyaku-shido',
    code: 'B001-2-3 等',
    name: '薬剤情報提供料 ／ 服薬管理・指導関連',
    points: null,
    unit: '—',
    requirement: '処方内容の文書による情報提供。本システムのパンフレットを併用する場合も、算定要件の充足は別途確認が必要です。',
    facilityStandard: '—',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'shinryo-joho',
    code: 'B009',
    name: '診療情報提供料（Ⅰ）',
    points: null,
    unit: '月1回',
    requirement:
      '他の保険医療機関等へ患者を紹介し、診療状況を示す文書を添えて情報提供した場合。骨吸収抑制薬開始前の歯科への情報提供、リウマチ専門医への紹介などで用いる。',
    facilityStandard: '—',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    meta,
    sources: ['mhlw-fee-r8', 'mronj-2023'],
  },
  {
    id: 'biologic-intro',
    code: '—',
    name: '生物学的製剤・JAK阻害薬に関連する管理（在宅自己注射指導管理料 等）',
    points: null,
    unit: '月1回等',
    requirement:
      '自己注射を導入する場合の指導管理料・注入器加算等。対象薬剤と算定要件を必ず最新の点数表で確認してください。',
    facilityStandard: '要確認',
    disease: ['ra'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
]

/** 3疾患と症状別疾患をまとめた算定候補マスタ */
export const ALL_FEE_ITEMS: FeeItem[] = [...FEE_ITEMS, ...FEE_ITEMS_CONDITION]

export function feesForDisease(disease: DiseaseKey): FeeItem[] {
  return ALL_FEE_ITEMS.filter((f) => f.disease.includes(disease))
}

// ================================================================ 検査オーダー

export const LAB_ORDERS: LabOrderItem[] = [
  // 骨粗鬆症
  {
    id: 'dxa',
    name: '骨密度測定（DXA：腰椎＋大腿骨近位部）',
    purpose: '診断と治療効果の判定。両部位を測定し低い方の値を採用する。',
    interval: '治療開始後は6〜12か月ごと（保険上は原則4か月に1回まで）',
    disease: ['osteoporosis'],
  },
  {
    id: 'spine-xray',
    name: '胸腰椎 単純X線（側面）',
    purpose: '無症候性の椎体骨折の検出。身長低下4cm以上、背中の丸まり、腰背部痛があれば必須。',
    interval: '初回評価時、身長低下や新規の腰背部痛が生じたとき',
    disease: ['osteoporosis'],
  },
  {
    id: 'bone-markers',
    name: '骨代謝マーカー（TRACP-5b、P1NP、BAP など）',
    purpose:
      '治療開始前の骨代謝回転の把握と、開始3〜6か月後の効果判定（服薬アドヒアランスの確認にも有用）。',
    interval: '開始前・開始3〜6か月後（保険上の算定回数に注意）',
    disease: ['osteoporosis'],
  },
  {
    id: 'op-blood',
    name: '一般血液検査（Ca、P、ALP、Alb、Cr/eGFR、肝機能、血算）',
    purpose: '続発性骨粗鬆症・他疾患の除外、薬剤選択のための腎機能評価。',
    interval: '初回、以後6〜12か月ごと',
    disease: ['osteoporosis'],
  },
  {
    id: 'vitd-level',
    name: '血清 25(OH)D',
    purpose: 'ビタミンD不足・欠乏の評価。骨形成促進薬・デノスマブ開始前に確認する。',
    interval: '初回評価時',
    disease: ['osteoporosis'],
  },
  {
    id: 'pth-intact',
    name: 'intact PTH、TSH/FT4、蛋白分画（必要時）',
    purpose: '原発性副甲状腺機能亢進症、甲状腺機能亢進症、多発性骨髄腫の除外。',
    interval: '除外診断が必要なとき',
    disease: ['osteoporosis'],
  },

  // 関節リウマチ
  {
    id: 'ra-initial',
    name: 'RF、抗CCP抗体、MMP-3、CRP、ESR、血算、肝腎機能',
    purpose: '診断・活動性評価・治療開始前の基礎データ。',
    interval: '初回。以後CRP/ESR/血算/肝腎機能は1〜3か月ごと',
    disease: ['ra'],
  },
  {
    id: 'ra-pretreat-screen',
    name: 'HBs抗原・HBs抗体・HBc抗体、HCV抗体、IGRA（T-SPOT/QFT）、胸部X線（±HRCT）、β-Dグルカン',
    purpose:
      'MTX・生物学的製剤・JAK阻害薬の開始前スクリーニング。B型肝炎再活性化、潜在性結核、間質性肺疾患、ニューモシスチス肺炎リスクの評価。',
    interval: '治療開始前（必須）。以後は薬剤に応じて定期的に',
    disease: ['ra'],
    requiredFor: ['csdmard', 'bdmard', 'jak'],
  },
  {
    id: 'ra-monitor',
    name: '血算、AST/ALT、Cr、尿検査（MTX投与中）',
    purpose: '骨髄抑制・肝障害・腎機能低下の早期発見。',
    interval: '開始3か月間は2〜4週ごと、以後1〜3か月ごと',
    disease: ['ra'],
    requiredFor: ['csdmard'],
  },
  {
    id: 'ra-lipid',
    name: '脂質（TC/LDL/HDL/TG）',
    purpose: 'IL-6阻害薬・JAK阻害薬による脂質上昇のモニタリング。',
    interval: '開始1〜3か月後、以後6〜12か月ごと',
    disease: ['ra'],
    requiredFor: ['bdmard', 'jak'],
  },
  {
    id: 'ra-xray',
    name: '手・足の単純X線（両側・正面）',
    purpose: '骨破壊（骨びらん・関節腔狭小化）の進行評価。',
    interval: '初回、以後6〜12か月ごと',
    disease: ['ra'],
  },
  {
    id: 'ra-echo',
    name: '関節超音波検査（滑膜炎の評価）',
    purpose: '身体所見では捉えにくい滑膜炎・骨びらんの検出。早期診断と寛解の質の評価に有用。',
    interval: '診断時、活動性の判断に迷うとき',
    disease: ['ra'],
  },
  {
    id: 'ra-bmd',
    name: '骨密度測定（DXA）',
    purpose:
      'RAは骨粗鬆症の危険因子であり、ステロイド併用例ではさらにリスクが高い。骨折予防のための評価。',
    interval: '診断時、以後1〜2年ごと（ステロイド使用中はより頻回に）',
    disease: ['ra'],
  },

  // 膝OA
  {
    id: 'knee-xray',
    name: '膝関節 単純X線（立位正面・側面・膝蓋骨軸射）',
    purpose: 'Kellgren-Lawrence 分類による重症度評価、アライメントの確認。',
    interval: '初回。以後は症状変化時',
    disease: ['kneeOA'],
  },
  {
    id: 'knee-lab',
    name: '血液検査（CRP、尿酸、RF など）',
    purpose: '炎症性関節疾患・偽痛風・痛風との鑑別が必要なとき。',
    interval: '鑑別が必要なとき',
    disease: ['kneeOA'],
  },
]

/** 3疾患と症状別疾患をまとめた検査候補マスタ */
export const ALL_LAB_ORDERS: LabOrderItem[] = [...LAB_ORDERS, ...LAB_ORDERS_CONDITION]

export function labsForDisease(disease: DiseaseKey): LabOrderItem[] {
  return ALL_LAB_ORDERS.filter((l) => l.disease.includes(disease))
}

/** IDから検査を引く（疾患モデルの labIds で使う） */
export function getLabOrder(id: string): LabOrderItem | undefined {
  return ALL_LAB_ORDERS.find((l) => l.id === id)
}
