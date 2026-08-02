import type { SourceRef } from '@/types'

/**
 * 出典一覧
 *
 * 本システムに収録した数値・推奨は、下記の資料を典拠としています。
 * 診療報酬点数のように改定で変わるものは data/fees.ts 側に「最終確認日」を持たせ、
 * 施設での再確認を必須にしています。
 */
export const SOURCES: SourceRef[] = [
  {
    id: 'op-gl-2025',
    short: '骨粗鬆症GL2025',
    title: '骨粗鬆症の予防と治療ガイドライン 2025年版',
    publisher: '日本骨粗鬆症学会／日本骨代謝学会／骨粗鬆症財団',
    year: '2025',
    url: 'https://www.josteo.com/publications/guideline/',
    note: '2015年版から10年ぶりの全面改訂。2025年8月公表。Tスコア評価の正式併用、ASBMR/NOF 2024の初期治療アルゴリズム導入、ゾレドロン酸・アバロパラチド・ロモソズマブの追加。',
  },
  {
    id: 'op-dx-criteria',
    short: '原発性骨粗鬆症の診断基準',
    title: '原発性骨粗鬆症の診断基準（2012年度改訂版／2025年版ガイドラインに収載）',
    publisher: '日本骨代謝学会・日本骨粗鬆症学会',
    year: '2012 / 2025',
    note: '脆弱性骨折の有無と骨密度（YAM%／Tスコア）による診断。低骨量をきたす他疾患の除外が前提。',
  },
  {
    id: 'ra-gl-2024',
    short: 'RA診療GL2024',
    title: '関節リウマチ診療ガイドライン 2024改訂',
    publisher: '一般社団法人 日本リウマチ学会（JCR）',
    year: '2024',
    url: 'https://www.ryumachi-jp.com/publish/others/ra_gl2024/',
    note: '2020年版から3年ぶりの改訂。72のクリニカルクエスチョン。MTX皮下注を薬物治療アルゴリズムに追加、JAK阻害薬とbDMARDを分けて記載しbDMARDの使用を優先。ライフステージ別（高齢者・妊娠授乳期）のCQを新設。',
  },
  {
    id: 'acr-eular-2010',
    short: 'ACR/EULAR 2010分類基準',
    title: '2010 ACR/EULAR classification criteria for rheumatoid arthritis',
    publisher: 'American College of Rheumatology / EULAR（Ann Rheum Dis 2010;69:1580-8）',
    year: '2010',
    note: '合計6点以上でRAと分類。あくまで分類基準であり、確定診断は臨床医の総合判断による。',
  },
  {
    id: 'acr-eular-remission',
    short: 'ACR/EULAR 寛解基準',
    title: 'American College of Rheumatology/EULAR provisional definition of remission in rheumatoid arthritis',
    publisher: 'ACR / EULAR（Ann Rheum Dis 2011;70:404-13）',
    year: '2011',
    note: 'Boolean基準：圧痛関節数≦1、腫脹関節数≦1、CRP≦1mg/dL、患者全般評価≦1（0-10cm）をすべて満たす。SDAI≦3.3も寛解の定義として併記。',
  },
  {
    id: 't2t',
    short: 'Treat to Target',
    title: 'Treating rheumatoid arthritis to target: 2014 update of the recommendations of an international task force',
    publisher: 'International Task Force（Ann Rheum Dis 2016;75:3-15）',
    year: '2014 / 2016',
    note: '臨床的寛解を第一目標とし、達成困難な場合は低疾患活動性を目標とする。3か月毎に評価し、6か月で目標未達なら治療を調整する。',
  },
  {
    id: 'knee-gl-2023',
    short: '膝OA診療GL2023',
    title: '変形性膝関節症診療ガイドライン 2023',
    publisher: '日本整形外科学会',
    year: '2023',
    url: 'https://www.joa.or.jp/',
    note: '運動療法（有酸素運動・筋力強化訓練・関節可動域訓練）と減量を保存療法の中心に位置づけている。',
  },
  {
    id: 'oarsi',
    short: 'OARSI 推奨',
    title: 'OARSI guidelines for the non-surgical management of knee osteoarthritis',
    publisher: 'Osteoarthritis Research Society International',
    year: '2019',
    note: '構造化された陸上運動療法・筋力強化・減量・患者教育をコア治療として全患者に推奨。',
  },
  {
    id: 'locomo-joa',
    short: 'ロコモ度テスト臨床判断値',
    title: 'ロコモ度テストの臨床判断値（ロコモ度1・2・3）',
    publisher: '公益社団法人 日本整形外科学会（ロコモ ONLINE）',
    year: '2015 / 2020（ロコモ度3を追加）',
    url: 'https://locomo-joa.jp/check/judge',
  },
  {
    id: 'mronj-2023',
    short: 'MRONJポジションペーパー2023',
    title: '薬剤関連顎骨壊死の病態と管理：顎骨壊死検討委員会ポジションペーパー2023',
    publisher: '顎骨壊死検討委員会（日本口腔外科学会ほか6学会）',
    year: '2023',
    url: 'https://www.jsoms.or.jp/medical/pdf/2023/0217_1.pdf',
    note: 'ARONJからMRONJへ呼称変更。抜歯に際して骨吸収抑制薬を原則休薬しないことを提案。',
  },
  {
    id: 'fls-standard',
    short: 'FLSクリニカルスタンダード',
    title: '日本版 二次性骨折予防のための骨折リエゾンサービス（FLS）クリニカルスタンダード',
    publisher: '日本骨粗鬆症学会',
    year: '2019',
    url: 'https://www.josteo.com/medical/liaison/',
    note: '脆弱性骨折後の二次性骨折予防を体系化。骨粗鬆症リエゾンサービス（OLS®）／骨粗鬆症マネージャー制度と一体で運用される。',
  },
  {
    id: 'frax',
    short: 'FRAX®',
    title: 'FRAX® 骨折リスク評価ツール',
    publisher: 'University of Sheffield（WHO協力センター）',
    year: '2008-',
    url: 'https://frax.shef.ac.uk/FRAX/tool.aspx?lang=jp',
    note: '本システムはFRAX®の計算を実装していません。FRAX®の値はDXA装置または公式サイトで算出し、結果のみを入力してください。',
  },
  {
    id: 'dri-2025',
    short: '日本人の食事摂取基準2025',
    title: '日本人の食事摂取基準（2025年版）',
    publisher: '厚生労働省',
    year: '2024（2025年度から使用）',
    url: 'https://www.mhlw.go.jp/',
    note: 'ビタミンKの目安量は成人男女150μg/日。骨粗鬆症の治療目的の推奨量（250-300μg/日）とは異なる。',
  },
  {
    id: 'mhlw-security-6',
    short: '医療情報システム安全管理GL 第6.0版',
    title: '医療情報システムの安全管理に関するガイドライン 第6.0版',
    publisher: '厚生労働省',
    year: '2023年5月（Q&A 2025年5月）',
    url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/rinsho/index_00004.html',
  },
  {
    id: 'three-ministry',
    short: '3省2ガイドライン',
    title: '医療情報を取り扱う情報システム・サービスの提供事業者における安全管理ガイドライン',
    publisher: '経済産業省・総務省',
    year: '2023年7月改定',
  },
  {
    id: 'mhlw-fee-r8',
    short: '令和8年度診療報酬改定',
    title: '令和8年度診療報酬改定について（医科診療報酬点数表）',
    publisher: '厚生労働省',
    year: '2026',
    url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000188411.html',
    note: '令和8年3月5日告示。薬価は令和8年4月1日、本体は令和8年6月1日施行。点数は必ず最新の点数表・地方厚生局の通知で確認してください。',
  },
  // ---------------------------------------------------------------- 症状別疾患
  {
    id: 'lbp-gl-2019',
    short: '腰痛診療GL2019',
    title: '腰痛診療ガイドライン 2019（改訂第2版）',
    publisher: '日本整形外科学会／日本腰痛学会',
    year: '2019',
    url: 'https://www.joa.or.jp/media/comment/guideline.html',
    note: '運動療法は慢性腰痛に対して推奨される。特定の1種目の優位性は乏しく、継続できる運動を選ぶことが要点。安静臥床の長期化は推奨されない。',
  },
  {
    id: 'lss-gl-2021',
    short: '腰部脊柱管狭窄症GL2021',
    title: '腰部脊柱管狭窄症診療ガイドライン 2021（改訂第2版）',
    publisher: '日本整形外科学会／日本脊椎脊髄病学会',
    year: '2021',
    url: 'https://www.joa.or.jp/media/comment/guideline.html',
    note: '間欠跛行と前屈による症状軽減が特徴。保存療法（運動療法・薬物療法・ブロック）が基本。馬尾症候群・進行する麻痺は手術の適応。',
  },
  {
    id: 'ldh-gl-2021',
    short: '腰椎椎間板ヘルニアGL2021',
    title: '腰椎椎間板ヘルニア診療ガイドライン 2021（改訂第2版）',
    publisher: '日本整形外科学会／日本脊椎脊髄病学会',
    year: '2021',
    url: 'https://www.joa.or.jp/media/comment/guideline.html',
    note: '多くは自然経過で軽快し、脱出したヘルニアは吸収されうる。安静臥床の長期化は避け、活動性の維持を勧める。',
  },
  {
    id: 'cervical-gl',
    short: '頚椎症性脊髄症GL',
    title: '頚椎症性脊髄症診療ガイドライン（日本整形外科学会診療ガイドライン）',
    publisher: '日本整形外科学会／日本脊椎脊髄病学会',
    year: '2020',
    url: 'https://www.joa.or.jp/media/comment/guideline.html',
    note: '神経根症と脊髄症の鑑別が治療方針を分ける。脊髄症（巧緻運動障害・歩行障害）では手術の検討が必要。',
  },
  {
    id: 'csr-ref',
    short: '頚椎症性神経根症（標準的知見）',
    title: '頚椎症性神経根症の診断と治療に関する標準的知見',
    publisher: '各種教科書・システマティックレビューの要約',
    year: '—',
    note: 'Spurling・Jacksonテストによる誘発、自然軽快傾向、姿勢是正と頚部・肩甲帯の運動療法。院内の運用に合わせて内容を確認・更新してください。',
  },
  {
    id: 'shoulder-ref',
    short: '肩関節周囲炎（標準的知見）',
    title: '肩関節周囲炎（凍結肩）の病期と治療に関する標準的知見',
    publisher: '日本肩関節学会関連資料・システマティックレビューの要約',
    year: '—',
    note: '炎症期・拘縮期・回復期の3期をたどり、1〜2年で自然軽快することが多い。時期に応じた運動療法と、炎症期の関節内ステロイド注射。',
  },
  {
    id: 'elbow-ref',
    short: '外側上顆炎（標準的知見）',
    title: '上腕骨外側上顆炎の治療に関する標準的知見',
    publisher: 'システマティックレビュー・各種教科書の要約',
    year: '—',
    note: '腱の変性（tendinosis）が本態。遠心性収縮訓練とストレッチが中核。ステロイド局注は短期的には有効だが中長期予後はむしろ不良との報告がある。',
  },
  {
    id: 'hand-ref',
    short: 'ばね指（標準的知見）',
    title: '狭窄性腱鞘炎（ばね指）の診断と治療に関する標準的知見',
    publisher: '日本手外科学会関連資料の要約',
    year: '—',
    note: 'Green分類による段階評価。腱鞘内ステロイド注射の奏効率は高いが再発しうる。第4段階・注射抵抗例では腱鞘切開術。糖尿病合併例に注意。',
  },
  {
    id: 'hip-gl-2016',
    short: '変形性股関節症GL2016',
    title: '変形性股関節症診療ガイドライン 2016（改訂第2版）',
    publisher: '日本整形外科学会',
    year: '2016',
    url: 'https://www.joa.or.jp/media/comment/guideline.html',
    note: '日本では臼蓋形成不全を背景とした二次性股関節症が多い。運動療法・減量・杖が保存療法の中核。骨切り術とTHAの適応。',
  },
  {
    id: 'foot-ref',
    short: '足底腱膜炎（標準的知見）',
    title: '足底腱膜炎の診断と治療に関する標準的知見',
    publisher: 'システマティックレビュー・各種教科書の要約',
    year: '—',
    note: '足底腱膜特異的ストレッチと下腿三頭筋ストレッチが中核。踵骨棘は無症候例にも高頻度で、痛みの原因とは限らない。ステロイド局注は腱膜断裂のリスクあり。',
  },
  {
    id: 'ankle-ref',
    short: '足関節捻挫（標準的知見）',
    title: '足関節外側靱帯損傷の診断と治療に関する標準的知見',
    publisher: 'Ottawa ankle rules／システマティックレビューの要約',
    year: '—',
    note: 'Ottawa ankle rules によりX線の要否を判断する。長期固定より機能的治療が優れる。バランス訓練と腓骨筋強化が再受傷を減らす。',
  },
  {
    id: 'shin-ref',
    short: 'シンスプリント（標準的知見）',
    title: 'シンスプリント（脛骨過労性骨膜炎）と脛骨疲労骨折の診断・治療に関する標準的知見',
    publisher: 'スポーツ医学領域のシステマティックレビュー・各種教科書の要約',
    year: '—',
    note: '脛骨内側遠位1/3の5cm以上のびまん性圧痛が診断の中心。限局性圧痛・hop test陽性では疲労骨折を疑う。負荷管理が治療の中核であり、女性アスリートの三主徴の確認を要する。',
  },
  {
    id: 'muscle-ref',
    short: '肉離れ（標準的知見）',
    title: '筋損傷（肉離れ）の分類・治療・競技復帰に関する標準的知見',
    publisher: 'スポーツ医学領域のシステマティックレビューの要約',
    year: '—',
    note: '再発が最大の問題。遠心性収縮訓練（ノルディックハムストリング等）の再発予防効果が報告されている。段階的復帰基準を明示する。',
  },
]

const byId = new Map(SOURCES.map((s) => [s.id, s]))

export function source(id: string): SourceRef | undefined {
  return byId.get(id)
}

/** 出典IDの配列を「骨粗鬆症GL2025, FLSクリニカルスタンダード」のような表記にする */
export function citeLabel(ids: string[]): string {
  return ids
    .map((id) => byId.get(id)?.short)
    .filter((s): s is string => Boolean(s))
    .join('／')
}
