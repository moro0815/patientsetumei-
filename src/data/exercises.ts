import type { DiseaseKey, ExerciseItem } from '@/types'
import { EXERCISES_CONDITION, RECOMMENDED_SETS_CONDITION } from './exercises2'

/**
 * 運動療法メニュー（当院の中心的な治療）
 *
 * 典拠
 * - 骨粗鬆症の予防と治療ガイドライン2025年版
 *   運動療法は治療の柱として位置づけられ、荷重・筋力による機械的刺激による骨密度への効果と、
 *   身体機能（筋力・バランス・立ち上がり時間・歩行速度）の改善による転倒予防効果が期待される。
 *   バランス訓練を含むプロトコルは転倒による外傷の予防に有効。
 * - ロコモティブシンドローム予防（日本整形外科学会）：ロコモーショントレーニング（片脚立ち・スクワット）
 * - 変形性膝関節症診療ガイドライン2023／OARSI：有酸素運動・筋力強化訓練・関節可動域訓練を推奨
 * - 関節リウマチのリハビリテーション（日本リハビリテーション医学会ほか）：
 *   炎症の強い時期は疼痛の鎮静・関節保護・等尺性運動を基本とし、
 *   炎症が落ち着いてから可動域訓練・筋力増強訓練を進める。
 *
 * 注意：処方量は「開始時の目安」です。実際の負荷は理学療法士の評価と患者の状態に合わせて調整してください。
 */

export const EXERCISES: ExerciseItem[] = [
  // ============================================================ バランス（転倒予防）
  {
    id: 'one-leg-stand',
    name: '開眼片脚立ち（ロコトレ①）',
    shortName: 'かた足立ち',
    category: 'balance',
    disease: ['osteoporosis', 'kneeOA', 'ankleSprain'],
    level: 'standing-support',
    steps: [
      '床につかない程度に片脚を上げます。',
      '目は開けたまま、まっすぐ前を見ます。',
      '左右それぞれ1分間を目標に、1日3回行います。',
      '転びそうで不安なときは、必ずつかまるものがある場所で行ってください。',
    ],
    dose: { reps: '左右各1分', sets: '1セット', frequency: '1日3回' },
    stopRules: [
      'めまい・ふらつきが強いときは中止してください。',
      '必ず机や手すりのそばで行い、いつでもつかまれるようにしてください。',
      'つかまらないとできない場合は、指先を軽くつく／両手をつくところから始めます。',
    ],
    figure: 'oneLegStand',
    clinicalNote:
      'バランス訓練は転倒による外傷の予防に有効。開始時は両手支持→片手支持→指先支持→支持なしと段階的に難易度を上げる。',
    sources: ['op-gl-2025', 'locomo-joa'],
  },
  {
    id: 'tandem-stance',
    name: 'つぎ足立ち（タンデム立位）',
    shortName: 'つぎ足立ち',
    category: 'balance',
    disease: ['osteoporosis'],
    level: 'standing-support',
    steps: [
      '片方の足のつま先に、もう片方の足のかかとをつけて一直線に立ちます。',
      'そのまま30秒キープします。',
      '左右を入れ替えて行います。',
    ],
    dose: { reps: '左右各30秒', sets: '2セット', frequency: '1日1〜2回' },
    stopRules: ['壁や手すりのそばで行ってください。', 'ふらつきが強い日は無理をしないでください。'],
    figure: 'oneLegStand',
    sources: ['op-gl-2025'],
  },

  // ============================================================ 筋力・荷重
  {
    id: 'squat',
    name: 'スクワット（ロコトレ②）',
    shortName: 'スクワット',
    category: 'strength',
    disease: ['osteoporosis', 'kneeOA'],
    level: 'standing',
    steps: [
      '足を肩幅に開き、つま先はやや外向きにします。',
      'お尻をゆっくり後ろに引くように、ひざを曲げて腰を下ろします。',
      'ひざがつま先より前に出ないように、また深く曲げすぎないようにします。',
      '息を止めずに、3秒かけて下ろし、3秒かけて戻します。',
      '5〜6回を1セットとして、1日3セット行います。',
    ],
    dose: { reps: '5〜6回', sets: '3セット', frequency: '1日3回（毎日）' },
    stopRules: [
      'ひざに痛みが出る場合は、曲げる角度を浅くします。',
      '支えが必要な方は、椅子の背やテーブルに手をついて行ってください。',
      '深くしゃがめない方は、椅子に浅く座って立ち上がる動作を繰り返す方法（椅子スクワット）に変えます。',
    ],
    figure: 'squat',
    clinicalNote:
      '下肢筋力と荷重刺激を同時に得られる。膝OA併存例は膝屈曲角度を60度程度までに制限。バルサルバを避け呼吸を止めないよう指導。',
    sources: ['op-gl-2025', 'locomo-joa', 'knee-gl-2023'],
  },
  {
    id: 'chair-stand',
    name: '椅子からの立ち上がり運動',
    shortName: '立ち上がり運動',
    category: 'strength',
    disease: ['osteoporosis', 'kneeOA', 'lumbarStenosis', 'hipOA', 'vertebralFracture'],
    level: 'standing-support',
    steps: [
      '椅子に浅めに腰かけ、両腕を胸の前で組みます。',
      '上体を少し前に傾け、勢いをつけずに立ち上がります。',
      'ゆっくり座ります（ドスンと座らないように）。',
      '10回を1セットとして行います。',
    ],
    dose: { reps: '10回', sets: '2〜3セット', frequency: '1日1〜2回' },
    stopRules: [
      '立ち上がるときにふらつく場合は、手をひざや椅子の座面についてください。',
      'ひざの痛みが強くなる場合は回数を減らします。',
    ],
    figure: 'chairStand',
    clinicalNote: '立ち上がり時間の短縮は転倒予防・ADL改善につながる。5回立ち上がりテストで経過評価が可能。',
    sources: ['op-gl-2025', 'knee-gl-2023'],
  },
  {
    id: 'heel-raise',
    name: 'かかと上げ（カーフレイズ）',
    shortName: 'かかと上げ',
    category: 'weightBearing',
    disease: ['osteoporosis', 'ankleSprain', 'shinSplints'],
    level: 'standing-support',
    steps: [
      'テーブルや椅子の背に軽く手をおいて立ちます。',
      'かかとをゆっくり持ち上げ、つま先立ちになります。',
      '2秒キープしてから、かかとをゆっくり下ろします。',
      '下ろすときに、かかとを軽く床にトンと着けると骨への刺激になります。',
    ],
    dose: { reps: '10〜20回', sets: '2〜3セット', frequency: '1日1〜2回' },
    stopRules: [
      'ふくらはぎに強い痛みが出たら中止してください。',
      '足首やアキレス腱に痛みがある方は、かかとを落とす動作を省いてください。',
    ],
    figure: 'heelRaise',
    clinicalNote:
      '下肢への軽い衝撃荷重（heel drop）は大腿骨近位部の骨密度維持に寄与する可能性がある。転倒リスクが高い例は必ず支持物ありで実施。',
    sources: ['op-gl-2025'],
  },
  {
    id: 'back-extension',
    name: '背筋（せすじ）を伸ばす運動',
    shortName: '背すじ運動',
    category: 'backExtensor',
    disease: ['osteoporosis', 'vertebralFracture'],
    level: 'sitting',
    steps: [
      '椅子に深く座り、両手を後ろで組みます（届かない方は太ももの横に置きます）。',
      '胸を軽く張って、背中をまっすぐ上に伸ばします。',
      '5秒キープして、ゆっくり戻します。',
      'うつ伏せで行う場合は、おなかの下に薄い枕を入れ、頭と胸を少しだけ持ち上げます（反らせすぎない）。',
    ],
    dose: { reps: '5〜10回', sets: '2〜3セット', frequency: '1日1〜2回' },
    stopRules: [
      '腰や背中に痛みが出る範囲までは動かさないでください。',
      '【重要】背中を強く反らせる運動、体を大きく前に曲げる運動、体をひねる運動は、背骨の骨折があると新たな骨折の原因になります。医師の指示に従ってください。',
    ],
    figure: 'backExtension',
    clinicalNote:
      '背筋筋力の維持は椎体骨折後の姿勢異常・後続骨折の予防に重要。椎体骨折の既往がある例では体幹の屈曲・回旋を伴う運動（起き上がり腹筋運動、前屈ストレッチ、ゴルフスイングなど）を避けるよう明示的に指導する。',
    sources: ['op-gl-2025'],
  },

  // ============================================================ 有酸素運動
  {
    id: 'walking',
    name: 'ウォーキング',
    shortName: 'ウォーキング',
    category: 'aerobic',
    disease: ['osteoporosis', 'ra', 'kneeOA', 'lumbarStenosis', 'hipOA'],
    level: 'active',
    steps: [
      'かかとから着地し、背すじを伸ばして歩きます。',
      '「少し息が上がるが会話はできる」くらいの速さを目安にします。',
      '1回20〜30分、週3〜5回を目標にします。',
      '一度に長く歩けない場合は、10分×3回に分けても効果があります。',
    ],
    dose: { reps: '20〜30分', sets: '1回', frequency: '週3〜5回' },
    stopRules: [
      '胸の痛み・息切れ・強いめまいがあれば中止して受診してください。',
      '関節の痛みが翌日まで残るときは、時間を短くしてください。',
      '真夏・真冬は室内での足踏みや踏み台昇降に切り替えましょう。',
    ],
    figure: 'walking',
    clinicalNote:
      '有酸素運動は骨密度への効果は限定的だが、体力・体重管理・転倒予防・心血管リスク低減に有用。膝OAでは疼痛と機能の改善に強く推奨される。',
    sources: ['op-gl-2025', 'knee-gl-2023', 'oarsi'],
  },
  {
    id: 'aquatic',
    name: '水中運動（プールでの歩行・体操）',
    shortName: '水中運動',
    category: 'aquatic',
    disease: ['kneeOA', 'ra', 'osteoporosis', 'hipOA'],
    level: 'active',
    steps: [
      '胸の高さくらいの水中で、ゆっくり歩きます。',
      '横歩き・後ろ歩きを混ぜると、いろいろな筋肉が使えます。',
      '20〜30分を目安に行います。',
    ],
    dose: { reps: '20〜30分', sets: '1回', frequency: '週1〜3回' },
    stopRules: [
      '水中は関節への負担が少ない反面、骨への荷重刺激は弱くなります。骨粗鬆症の方は陸上での運動も組み合わせてください。',
      '心臓や血圧の病気がある方は事前にご相談ください。',
    ],
    figure: 'aquatic',
    clinicalNote: '浮力により関節負荷を軽減できるため、疼痛が強い膝OAやRAの導入期に有用。骨への荷重刺激は陸上運動に劣る。',
    sources: ['knee-gl-2023', 'op-gl-2025'],
  },

  // ============================================================ 膝：筋力
  {
    id: 'quad-setting',
    name: '大腿四頭筋セッティング（ももの前の筋トレ）',
    shortName: 'ももの前の筋トレ',
    category: 'strength',
    disease: ['kneeOA', 'ra', 'vertebralFracture', 'hipOA'],
    level: 'sitting',
    steps: [
      '床や布団に座り、ひざをまっすぐ伸ばします。',
      'ひざの下に丸めたタオルを置きます。',
      'タオルを押しつぶすように、ももの前に力を入れます。',
      '5秒キープして、ゆっくりゆるめます。',
    ],
    dose: { reps: '10回', sets: '2〜3セット', frequency: '1日2回' },
    stopRules: [
      '関節を動かさない運動なので、痛みが強い時期でも行いやすい運動です。',
      'それでも痛みが出る場合は、力の入れ方を弱めてください。',
    ],
    figure: 'quadSetting',
    clinicalNote:
      '等尺性運動のため関節への剪断力が小さく、膝OAの疼痛期・RAの活動期にも導入できる。大腿四頭筋筋力は膝OAの疼痛・機能と強く関連する。',
    sources: ['knee-gl-2023', 'oarsi'],
  },
  {
    id: 'slr',
    name: '脚上げ運動（下肢伸展挙上・SLR）',
    shortName: '脚上げ運動',
    category: 'strength',
    disease: ['kneeOA'],
    level: 'sitting',
    steps: [
      'あお向けに寝て、片ひざを立て、反対の脚はまっすぐ伸ばします。',
      '伸ばした脚のつま先を自分の方に向け、ひざを伸ばしたまま10〜20cm持ち上げます。',
      '5秒キープして、ゆっくり下ろします。',
    ],
    dose: { reps: '10回', sets: '2〜3セット', frequency: '1日2回' },
    stopRules: ['腰に痛みが出る場合は、反対のひざを立てて腰を安定させてください。', '高く上げる必要はありません。'],
    figure: 'straightLegRaise',
    sources: ['knee-gl-2023'],
  },
  {
    id: 'side-leg-raise',
    name: '横向き脚上げ（お尻の横の筋トレ）',
    shortName: '横向き脚上げ',
    category: 'strength',
    disease: ['kneeOA', 'osteoporosis', 'hipOA', 'shinSplints'],
    level: 'sitting',
    steps: [
      '横向きに寝て、下の脚を軽く曲げます。',
      '上の脚をまっすぐ伸ばしたまま、30度ほど持ち上げます。',
      '3秒キープして、ゆっくり下ろします。',
    ],
    dose: { reps: '10回', sets: '2〜3セット', frequency: '1日1〜2回' },
    stopRules: ['股関節の前に痛みが出る場合は、上げる高さを下げてください。'],
    figure: 'sideLegRaise',
    clinicalNote: '中殿筋の強化は歩行時の骨盤安定性を高め、膝内側への負荷とTrendelenburg歩行を軽減する。',
    sources: ['knee-gl-2023'],
  },
  {
    id: 'ankle-rom',
    name: '足首の運動・ふくらはぎのストレッチ',
    shortName: '足首の運動',
    category: 'rom',
    disease: ['kneeOA', 'osteoporosis', 'ankleSprain', 'vertebralFracture'],
    level: 'sitting',
    steps: [
      '椅子に座り、足首をゆっくり上下に動かします（20回）。',
      '壁に手をつき、片脚を後ろに引いてかかとを床につけたまま前の脚のひざを曲げます。',
      'ふくらはぎが伸びるところで20〜30秒キープします。',
    ],
    dose: { reps: '足首20回／ストレッチ20〜30秒', sets: '左右2セット', frequency: '1日1〜2回' },
    stopRules: ['痛みが出るところまで伸ばさないでください。'],
    figure: 'ankleRom',
    clinicalNote: '足関節背屈制限は歩行・立ち上がり動作とバランスに影響し、転倒リスクに関与する。',
    sources: ['knee-gl-2023'],
  },

  // ============================================================ RA：関節可動域・関節保護
  {
    id: 'hand-rom',
    name: '手指・手首の関節可動域運動',
    shortName: '手の運動',
    category: 'rom',
    disease: ['ra', 'triggerFinger', 'deQuervain'],
    level: 'sitting',
    steps: [
      '入浴中や入浴後、手が温まっているときに行います。',
      '手をグーからパーへ、ゆっくり大きく開きます（10回）。',
      '親指を他の指の先に順番に合わせます（10回）。',
      '手首をゆっくり上下・左右に動かします（各10回）。',
      '痛みのない範囲で、動く範囲を保つことが目的です。',
    ],
    dose: { reps: '各10回', sets: '1〜2セット', frequency: '1日1〜2回（入浴後がおすすめ）' },
    stopRules: [
      '関節が赤く熱をもって強く腫れている時期は、無理に動かさず安静を優先してください。',
      '運動した翌日まで痛みや腫れが強く残る場合は、回数・強さを減らしてください。',
    ],
    figure: 'wristRom',
    clinicalNote:
      '炎症活動期は疼痛鎮静・関節保護を優先し、可動域は「痛みのない範囲での維持」に留める。温熱後の実施で可動域が得やすい。',
    sources: ['ra-gl-2024'],
  },
  {
    id: 'grip-isometric',
    name: '握る力を保つ運動（等尺性）',
    shortName: '握る運動',
    category: 'strength',
    disease: ['ra', 'deQuervain'],
    level: 'sitting',
    steps: [
      'やわらかいスポンジやタオルを軽く握ります。',
      '強く握りしめず、「軽く握って5秒キープ」を繰り返します。',
      '指の関節を深く曲げすぎないようにします。',
    ],
    dose: { reps: '10回', sets: '2セット', frequency: '1日1〜2回' },
    stopRules: [
      '硬いボールを強く握る運動は、指の関節の変形を進めることがあるため避けてください。',
      '痛みが出る強さでは行わないでください。',
    ],
    figure: 'gripBall',
    clinicalNote:
      '関節を動かさない等尺性収縮が基本。硬いグリップ器具での強い握力訓練はMCP関節への負荷が大きく、変形のある例では避ける。',
    sources: ['ra-gl-2024'],
  },
  {
    id: 'shoulder-rom',
    name: '肩の可動域運動（振り子・棒体操）',
    shortName: '肩の運動',
    category: 'rom',
    disease: ['ra', 'osteoporosis', 'frozenShoulder'],
    level: 'sitting',
    steps: [
      '体を軽く前に倒して、腕を力を抜いてぶら下げ、前後・左右に小さく振ります（各10回）。',
      '両手で棒（つっぱり棒・傘など）を持ち、痛くない範囲でゆっくり上に持ち上げます（10回）。',
    ],
    dose: { reps: '各10回', sets: '1〜2セット', frequency: '1日1回' },
    stopRules: ['肩に鋭い痛みが出る高さまでは上げないでください。'],
    figure: 'shoulderPulley',
    sources: ['ra-gl-2024'],
  },
  {
    id: 'joint-protection',
    name: '関節を守る生活の工夫（関節保護）',
    shortName: '関節を守る工夫',
    category: 'jointProtection',
    disease: ['ra', 'kneeOA', 'hipOA'],
    level: 'active',
    steps: [
      '重い物は、指先でつまむのではなく、両手のひら全体で持ちます。',
      'ペットボトルや蛇口は、握って回すより「オープナー」や「レバー式」に変えます。',
      '同じ姿勢を続けず、30〜60分ごとに姿勢を変えます。',
      '大きな関節・強い関節を使います（ドアは手のひらや腰で押す）。',
      '疲れる前に休みます（痛くなってから休むのでは遅い）。',
      '和式トイレ・低い椅子・深いソファは関節に負担がかかります。洋式・高めの椅子に変えましょう。',
    ],
    dose: { reps: '—', sets: '—', frequency: '毎日の生活の中で' },
    stopRules: ['作業のあと2時間以上痛みが続く場合は、その作業のやり方を見直しましょう。'],
    figure: 'jointProtect',
    clinicalNote:
      '関節保護（joint protection）の指導は作業療法の中心。患者主観的な身体機能の改善にエビデンスがある。自助具の紹介と併せて行う。',
    sources: ['ra-gl-2024'],
  },
]

/** 骨粗鬆症・RA・膝OA に加えて、症状別疾患の運動も同じ1本のマスタとして扱う */
export const ALL_EXERCISES: ExerciseItem[] = [...EXERCISES, ...EXERCISES_CONDITION]

const byId = new Map(ALL_EXERCISES.map((e) => [e.id, e]))

export function getExercise(id: string): ExerciseItem | undefined {
  return byId.get(id)
}

export function exercisesForDisease(disease: DiseaseKey): ExerciseItem[] {
  return ALL_EXERCISES.filter((e) => e.disease.includes(disease))
}

export const CATEGORY_LABEL: Record<ExerciseItem['category'], string> = {
  balance: 'バランス（転倒予防）',
  strength: '筋力をつける',
  weightBearing: '骨に刺激を与える',
  backExtensor: '背すじを保つ',
  aerobic: '有酸素運動',
  rom: '関節を動かす',
  jointProtection: '関節を守る工夫',
  aquatic: '水中運動',
  stretch: 'ストレッチ（伸ばす）',
  stabilization: '体をささえる力',
  eccentric: 'ゆっくり戻す運動',
  nerveGlide: '神経・腱をすべらせる',
}

/**
 * 推奨される標準セット。
 * 医師が「おすすめをまとめて選ぶ」ボタンで使う。
 */
const RECOMMENDED_SETS_CORE: Record<string, { label: string; ids: string[]; note: string }[]> = {
  osteoporosis: [
    {
      label: '基本セット（ロコトレ＋背すじ）',
      ids: ['one-leg-stand', 'squat', 'back-extension'],
      note: '骨粗鬆症の方にまず勧める組み合わせ。バランス・下肢筋力・背筋を同時にカバーします。',
    },
    {
      label: '転倒予防を重視（バランス中心）',
      ids: ['one-leg-stand', 'tandem-stance', 'chair-stand', 'heel-raise'],
      note: '転倒歴がある方、ふらつきが目立つ方に。支持物のある環境で行うことを必ず指導します。',
    },
    {
      label: '椎体骨折がある方（前屈・回旋を避ける）',
      ids: ['back-extension', 'quad-setting', 'chair-stand', 'one-leg-stand'],
      note: '体幹の屈曲・回旋を伴う運動は避けます。背筋の維持と下肢筋力を優先します。',
    },
    {
      label: '骨に刺激を与える（荷重運動）',
      ids: ['heel-raise', 'squat', 'walking'],
      note: '骨密度への効果を狙う荷重運動の組み合わせ。心血管系のリスクを確認してから開始します。',
    },
  ],
  ra: [
    {
      label: '炎症が強い時期（安静＋等尺性）',
      ids: ['hand-rom', 'grip-isometric', 'quad-setting', 'joint-protection'],
      note: '関節を動かさない運動と関節保護が中心。痛みのない範囲での可動域維持に留めます。',
    },
    {
      label: '炎症が落ち着いてきた時期',
      ids: ['hand-rom', 'shoulder-rom', 'quad-setting', 'walking', 'joint-protection'],
      note: '可動域訓練と有酸素運動を追加します。',
    },
    {
      label: '寛解・低疾患活動性の維持期',
      ids: ['walking', 'squat', 'quad-setting', 'hand-rom', 'joint-protection'],
      note: '体力づくりと骨粗鬆症予防を兼ねた運動へ移行します。',
    },
  ],
  kneeOA: [
    {
      label: '基本セット（膝の筋トレ）',
      ids: ['quad-setting', 'slr', 'side-leg-raise'],
      note: '膝OAの治療の中心。まず等尺性運動から始め、慣れたら回数を増やします。',
    },
    {
      label: '痛みが強い時期',
      ids: ['quad-setting', 'ankle-rom', 'aquatic', 'joint-protection'],
      note: '荷重を避けながら筋力と可動域を保ちます。',
    },
    {
      label: '歩ける方（体重管理も含む）',
      ids: ['quad-setting', 'squat', 'walking', 'chair-stand'],
      note: '有酸素運動と筋力訓練を組み合わせ、減量と併せて行います。',
    },
  ],
}

/** 全疾患をまとめた推奨セット */
export const RECOMMENDED_SETS: Record<string, { label: string; ids: string[]; note: string }[]> = {
  ...RECOMMENDED_SETS_CORE,
  ...RECOMMENDED_SETS_CONDITION,
}
