import type { FeeItem, LabOrderItem, MasterMeta } from '@/types'

/**
 * 症状別疾患の算定候補と検査オーダー
 *
 * 【重要】点数は改定で変わります。初期値は編集前提の参考値です。
 * 必ず最新の点数表で確認し、`points` を更新してください。
 * 確認できていない項目は `points: null` にしてあり、画面に「要確認」と表示されます。
 */

const meta: MasterMeta = { verifiedAt: '2026-07-31', needsLocalCheck: true }

const ALL_CONDITIONS = [
  'shinSplints',
  'lumbarStenosis',
  'lumbarDiscHernia',
  'cervicalRadiculopathy',
  'plantarFasciitis',
  'tennisElbow',
  'frozenShoulder',
  'triggerFinger',
  'deQuervain',
  'hipOA',
  'vertebralFracture',
  'ankleSprain',
  'muscleStrain',
] as const

export const FEE_ITEMS_CONDITION: FeeItem[] = [
  {
    id: 'shodan-undouki',
    code: 'B001・28',
    name: '生活習慣病管理料／運動器疾患の指導管理',
    points: null,
    unit: '要確認',
    requirement:
      '疾患・算定要件は施設の届出状況により異なります。運動器リハビリテーション料との併算定の可否を含め、必ず院内でご確認ください。',
    facilityStandard: '要確認',
    disease: [...ALL_CONDITIONS],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'shoshin-shochi-injection',
    code: 'G010 / J119 ほか',
    name: '関節腔内注射・腱鞘内注射・神経ブロック',
    points: null,
    unit: '1回（要確認）',
    requirement:
      '注射手技料と薬剤料を分けて算定します。部位（関節腔内／腱鞘内／硬膜外・神経根）で区分が異なります。実施部位と使用薬剤をカルテに記載してください。',
    facilityStandard: '不要（神経ブロックは要件を確認）',
    disease: ['frozenShoulder', 'triggerFinger', 'deQuervain', 'tennisElbow', 'plantarFasciitis', 'hipOA', 'lumbarStenosis', 'lumbarDiscHernia', 'cervicalRadiculopathy'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'soubu-koteizai',
    code: 'J000 / M系',
    name: '創傷処置・副子・装具の作製指示',
    points: null,
    unit: '要確認',
    requirement:
      'コルセット・サポーター・足底板などの治療用装具は、療養費として患者が申請します。医師の意見書（装具装着証明書）が必要です。',
    facilityStandard: '不要',
    disease: ['vertebralFracture', 'ankleSprain', 'plantarFasciitis', 'lumbarStenosis', 'triggerFinger', 'deQuervain', 'cervicalRadiculopathy'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'shohatsu-xp',
    code: 'E001 / E002',
    name: '単純X線撮影（撮影料＋診断料）',
    points: null,
    unit: '部位・枚数による（要確認）',
    requirement: '撮影部位・方向・枚数で点数が変わります。デジタル加算の有無も確認してください。',
    facilityStandard: '不要',
    disease: [...ALL_CONDITIONS],
    meta,
    sources: ['mhlw-fee-r8'],
  },
  {
    id: 'echo-undouki',
    code: 'D215',
    name: '超音波検査（運動器）',
    points: null,
    unit: '1回（要確認）',
    requirement: '実施部位と所見をカルテに記載します。同一月内の算定回数の制限を確認してください。',
    facilityStandard: '不要',
    disease: ['frozenShoulder', 'tennisElbow', 'triggerFinger', 'deQuervain', 'ankleSprain', 'muscleStrain', 'plantarFasciitis', 'shinSplints'],
    meta,
    sources: ['mhlw-fee-r8'],
  },
]

// ================================================================ 検査オーダー

export const LAB_ORDERS_CONDITION: LabOrderItem[] = [
  // ---------------------------------------------------------------- 脊椎
  {
    id: 'spine-xray-general',
    name: '脊椎 単純X線（正面・側面、必要に応じて前後屈）',
    purpose: '変性の程度、すべり・不安定性、圧潰の評価。',
    interval: '初回。以後は症状の変化時',
    disease: ['lumbarStenosis', 'lumbarDiscHernia', 'vertebralFracture'],
  },
  {
    id: 'lss-mri',
    name: '腰椎MRI',
    purpose:
      '脊柱管の狭窄の部位と程度の確認。手術を検討する場合、診断に迷う場合、レッドフラッグがある場合に行う（全例に必須ではない）。',
    interval: '手術検討時、または保存療法で改善しないとき',
    disease: ['lumbarStenosis'],
  },
  {
    id: 'ldh-mri',
    name: '腰椎MRI',
    purpose: 'ヘルニアの部位・大きさ・神経根との位置関係の確認。症状と画像の一致を必ず確認する。',
    interval: '手術検討時、6週以上改善しないとき、レッドフラッグがあるとき',
    disease: ['lumbarDiscHernia'],
  },
  {
    id: 'vf-mri',
    name: '脊椎MRI（STIR含む）',
    purpose: '新鮮骨折か陳旧性かの判別。転移性腫瘍・化膿性脊椎炎との鑑別。',
    interval: '受傷時、または痛みが増悪するとき',
    disease: ['vertebralFracture'],
  },
  {
    id: 'cervical-xray',
    name: '頚椎 単純X線（正面・側面・斜位）',
    purpose: '椎間孔の狭小化、椎間板腔の狭小化、骨棘、後縦靱帯骨化の評価。',
    interval: '初回',
    disease: ['cervicalRadiculopathy'],
  },
  {
    id: 'cervical-mri',
    name: '頚椎MRI',
    purpose: '神経根・脊髄の圧迫の確認。脊髄症を疑う場合、筋力低下がある場合、3か月以上改善しない場合に行う。',
    interval: '脊髄症を疑うとき、手術検討時',
    disease: ['cervicalRadiculopathy'],
  },
  {
    id: 'abi',
    name: 'ABI（足関節上腕血圧比）',
    purpose: '閉塞性動脈硬化症による血管性跛行との鑑別。足背動脈の触知が不良なときに行う。',
    interval: '間欠跛行があり、血管性を疑うとき',
    disease: ['lumbarStenosis'],
  },

  // ---------------------------------------------------------------- 上肢
  {
    id: 'shoulder-xray',
    name: '肩関節 単純X線（正面・スカプラY・軸射）',
    purpose: '石灰沈着・変形性関節症・骨折・脱臼の除外。',
    interval: '初回',
    disease: ['frozenShoulder'],
  },
  {
    id: 'shoulder-echo',
    name: '肩関節 超音波検査',
    purpose: '腱板断裂・石灰沈着・滑液包炎の評価。他動可動域が保たれ自動挙上のみ不可のときに行う。',
    interval: '腱板断裂を疑うとき',
    disease: ['frozenShoulder'],
  },
  {
    id: 'elbow-xray',
    name: '肘関節 単純X線',
    purpose: '関節内病変・遊離体・石灰化の除外。可動域制限や外傷歴があるときに行う。',
    interval: '非典型例・可動域制限があるとき',
    disease: ['tennisElbow'],
  },
  {
    id: 'elbow-echo',
    name: '肘関節 超音波検査',
    purpose: '短橈側手根伸筋腱の変性・部分断裂・石灰化の評価。難治例で行う。',
    interval: '難治例',
    disease: ['tennisElbow'],
  },

  {
    id: 'wrist-echo',
    name: '手関節 超音波検査（第1区画）',
    purpose:
      '腱鞘の肥厚・腱周囲の液体貯留の確認。注射が無効となる原因である隔壁（短母指伸筋腱の別区画）の有無を評価でき、注射をエコーガイド下で行う際にも用いる。',
    interval: '診断に迷うとき、注射前、注射が無効だったとき',
    disease: ['deQuervain'],
  },
  {
    id: 'wrist-xray',
    name: '手関節・母指 単純X線（正面・側面、必要に応じて舟状骨撮影）',
    purpose:
      '母指CM関節症との鑑別、舟状骨骨折の除外。ドケルバン腱鞘炎そのものの診断には不要で、鑑別を要する場合にのみ撮影する。',
    interval: '外傷歴があるとき、CM関節に圧痛があるとき、非典型例',
    disease: ['deQuervain'],
  },

  // ---------------------------------------------------------------- 下肢
  {
    id: 'hip-xray',
    name: '股関節 単純X線（正面・ラウエンシュタイン像）',
    purpose: '関節裂隙、臼蓋形成不全（CE角）、骨頭変形、骨棘の評価。病期分類に用いる。',
    interval: '初回。以後は1〜2年ごと、または症状変化時',
    disease: ['hipOA'],
  },
  {
    id: 'hip-mri',
    name: '股関節MRI',
    purpose: '大腿骨頭壊死症、疲労骨折、腫瘍の鑑別。急激な疼痛悪化・ステロイド歴・大量飲酒があるときに行う。',
    interval: '骨頭壊死を疑うとき',
    disease: ['hipOA'],
  },
  {
    id: 'foot-xray',
    name: '足部 単純X線（荷重位側面・正面）',
    purpose: '踵骨疲労骨折・骨腫瘍の除外。アーチの評価。踵骨棘の有無は診断の決め手にはならない。',
    interval: '非典型例・難治例',
    disease: ['plantarFasciitis'],
  },
  {
    id: 'foot-echo',
    name: '足底腱膜 超音波検査',
    purpose: '腱膜の肥厚（4mm以上）・断裂の評価。',
    interval: '診断に迷うとき、断裂を疑うとき',
    disease: ['plantarFasciitis'],
  },
  {
    id: 'ankle-xray',
    name: '足関節 単純X線（正面・側面・モーティス）',
    purpose: '骨折の除外。Ottawa ankle rules に該当する場合に撮影する。',
    interval: '受傷時（Ottawa ankle rules 該当時）',
    disease: ['ankleSprain'],
  },
  {
    id: 'ankle-echo',
    name: '足関節 超音波検査',
    purpose: '前距腓靱帯・踵腓靱帯の損傷程度の評価。',
    interval: '重症度の判断が必要なとき',
    disease: ['ankleSprain'],
  },
  {
    id: 'muscle-echo',
    name: '超音波検査（筋）',
    purpose: '損傷部位・血腫・断裂の評価。外来で簡便に繰り返し評価できる。',
    interval: '受傷時、経過観察時',
    disease: ['muscleStrain'],
  },
  {
    id: 'muscle-mri',
    name: 'MRI（筋）',
    purpose: '損傷範囲と重症度の正確な評価。完全断裂が疑われる場合、復帰時期の判断が必要な場合に行う。',
    interval: '重症例・競技復帰の判断が必要なとき',
    disease: ['muscleStrain'],
  },

  {
    id: 'tibia-xray',
    name: '下腿 単純X線（正面・側面）',
    purpose: '脛骨疲労骨折・骨腫瘍の除外。ただし初期の疲労骨折は写らないことに注意する。',
    interval: '一点の圧痛・安静時痛があるとき',
    disease: ['shinSplints'],
  },
  {
    id: 'tibia-mri',
    name: '下腿MRI（または骨シンチ）',
    purpose:
      '単純X線に写らない初期の脛骨疲労骨折の検出。骨髄浮腫の有無で重症度を段階評価できる。前方皮質の骨折線は難治性のため必ず確認する。',
    interval: '疲労骨折を疑うとき、保存療法で改善しないとき',
    disease: ['shinSplints'],
  },

  // ---------------------------------------------------------------- 共通
  {
    id: 'hba1c-screen',
    name: '血糖・HbA1c',
    purpose:
      '糖尿病は肩関節周囲炎・ばね指の有病率を高め、経過にも影響する。ステロイド注射を行う前の確認としても有用。',
    interval: '診断時、注射前',
    disease: ['frozenShoulder', 'triggerFinger'],
  },
]
