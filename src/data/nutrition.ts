/**
 * 栄養療法・生活指導のコンテンツ
 *
 * 典拠：骨粗鬆症の予防と治療ガイドライン2025年版（栄養療法）
 *  - カルシウム 700〜800mg/日
 *  - ビタミンD 15〜20μg/日（600〜800IU/日）
 *  - ビタミンK 250〜300μg/日
 *  - 2025年版でビタミンC・たんぱく質が重要栄養素として新たに記載された
 *  - カルシウム・ビタミンDの同時摂取で骨折リスクが低下する。
 *    一方でカルシウム単独の過剰摂取は腎結石・心血管リスクとの関連が指摘されている。
 * 参考：日本人の食事摂取基準（2025年版）／厚生労働省
 *  - ビタミンKの目安量は成人男女150μg/日（骨粗鬆症治療目的の推奨量とは異なる）
 */

export interface NutrientTarget {
  id: string
  name: string
  target: string
  why: string
  /** 代表的な食品と1食あたりの含有量の目安 */
  foods: { name: string; amount: string; content: string }[]
  cautions: string[]
  sources: string[]
}

export const NUTRIENTS: NutrientTarget[] = [
  {
    id: 'calcium',
    name: 'カルシウム',
    target: '1日 700〜800mg',
    why: '骨をつくる材料そのものです。足りないと、体は骨からカルシウムを取り出して使ってしまいます。',
    foods: [
      { name: '牛乳', amount: 'コップ1杯（200mL）', content: '約220mg' },
      { name: 'ヨーグルト', amount: '1個（100g）', content: '約120mg' },
      { name: 'プロセスチーズ', amount: '1切れ（20g）', content: '約130mg' },
      { name: '木綿豆腐', amount: '1/2丁（150g）', content: '約180mg' },
      { name: '小松菜（ゆで）', amount: '小鉢1杯（70g）', content: '約100mg' },
      { name: 'しらす干し', amount: '大さじ2（10g）', content: '約52mg' },
      { name: '干しえび・煮干し', amount: '少量でも', content: '高含有' },
    ],
    cautions: [
      'サプリメントで一度に大量にとると、腎臓の石（尿路結石）や血管への影響が心配されます。まずは食事からとることを基本にします。',
      'ビタミンDと一緒にとることで、吸収がよくなり骨折予防効果が高まります。',
      '毎食に「乳製品・大豆製品・青菜・小魚」のどれかを入れると自然に届きます。',
    ],
    sources: ['op-gl-2025'],
  },
  {
    id: 'vitamin-d',
    name: 'ビタミンD',
    target: '1日 15〜20μg（600〜800 IU）',
    why: '食べたカルシウムを腸から吸収するために欠かせません。筋力やバランスを保つ働きもあり、転倒予防にもつながります。',
    foods: [
      { name: 'さけ（焼き）', amount: '1切れ（80g）', content: '約26μg' },
      { name: 'さんま', amount: '1尾（100g）', content: '約16μg' },
      { name: 'いわし丸干し', amount: '1尾（30g）', content: '約15μg' },
      { name: 'きくらげ（乾・戻し）', amount: '小鉢1杯', content: '約4μg' },
      { name: '干ししいたけ', amount: '2個', content: '約1.7μg' },
      { name: '卵', amount: '1個', content: '約1.9μg' },
    ],
    cautions: [
      '日光を浴びると皮膚でもつくられます。1日15〜30分、手や顔に日が当たる程度の外出を心がけましょう（真夏の直射日光は避けて）。',
      '魚を週に3回以上食べることが、いちばん現実的な目標です。',
      '血液中のビタミンDは採血で測れます。不足していれば薬で補います。',
    ],
    sources: ['op-gl-2025'],
  },
  {
    id: 'vitamin-k',
    name: 'ビタミンK',
    target: '1日 250〜300μg（骨粗鬆症の治療目的）',
    why: 'カルシウムを骨にしっかり沈着させるために必要です。骨のたんぱく質（オステオカルシン）を働ける形に変えます。',
    foods: [
      { name: '納豆', amount: '1パック（50g）', content: '約300μg' },
      { name: 'ほうれん草（ゆで）', amount: '小鉢1杯（70g）', content: '約230μg' },
      { name: '小松菜（ゆで）', amount: '小鉢1杯（70g）', content: '約220μg' },
      { name: 'ブロッコリー（ゆで）', amount: '小鉢1杯（60g）', content: '約90μg' },
      { name: 'にら', amount: '1/2束（50g）', content: '約90μg' },
    ],
    cautions: [
      '【重要】ワルファリン（血液をさらさらにする薬）を飲んでいる方は、納豆・青汁・クロレラは禁止です。青菜も急に量を増やさないでください。必ず主治医に確認してください。',
      '納豆1パックで1日の目標量にほぼ届きます。',
    ],
    sources: ['op-gl-2025', 'dri-2025'],
  },
  {
    id: 'protein',
    name: 'たんぱく質',
    target: '体重1kgあたり 1.0〜1.2g/日（例：50kgなら50〜60g）',
    why: '骨の土台（コラーゲン）と、骨を支える筋肉の材料です。2025年のガイドラインで重要な栄養素として新たに記載されました。不足すると筋肉が減り、転倒しやすくなります。',
    foods: [
      { name: '肉・魚', amount: '手のひら1枚分（80〜100g）', content: '約16〜20g' },
      { name: '卵', amount: '1個', content: '約6g' },
      { name: '納豆', amount: '1パック', content: '約8g' },
      { name: '木綿豆腐', amount: '1/2丁', content: '約10g' },
      { name: '牛乳', amount: 'コップ1杯', content: '約7g' },
    ],
    cautions: [
      '3食に分けてとる方が、筋肉づくりには効率的です（朝食で不足しがちです）。',
      '腎臓の病気がある方は、たんぱく質の量を制限することがあります。必ず主治医に確認してください。',
    ],
    sources: ['op-gl-2025'],
  },
  {
    id: 'vitamin-c',
    name: 'ビタミンC',
    target: '1日 100mg以上',
    why: '骨の土台となるコラーゲンをつくるのに必要です。2025年のガイドラインで新たに記載されました。',
    foods: [
      { name: 'ブロッコリー（ゆで）', amount: '小鉢1杯', content: '約30mg' },
      { name: 'キウイフルーツ', amount: '1個', content: '約70mg' },
      { name: 'いちご', amount: '5〜6粒', content: '約50mg' },
      { name: 'ピーマン（生）', amount: '1個', content: '約40mg' },
      { name: 'じゃがいも', amount: '中1個', content: '約30mg' },
    ],
    cautions: ['熱や水に弱いので、生で食べる／さっと加熱する／汁ごといただくのがコツです。'],
    sources: ['op-gl-2025'],
  },
]

export interface AvoidItem {
  id: string
  name: string
  detail: string
}

export const NUTRITION_AVOID: AvoidItem[] = [
  {
    id: 'salt',
    name: '食塩のとりすぎ',
    detail: '塩分が多いと尿からカルシウムが出やすくなります。1日6〜7g未満を目安に、汁物・漬物・加工食品を控えめに。',
  },
  {
    id: 'phosphorus',
    name: 'リンのとりすぎ（加工食品・インスタント食品）',
    detail: 'リンが多いとカルシウムの吸収が落ちます。加工肉・練り物・スナック菓子・清涼飲料水に多く含まれます。',
  },
  {
    id: 'caffeine',
    name: 'カフェインのとりすぎ',
    detail: 'コーヒーは1日2〜3杯程度までを目安に。飲みすぎるとカルシウムが尿に出やすくなります。',
  },
  {
    id: 'alcohol',
    name: '飲酒',
    detail: '1日あたり日本酒1合・ビール中瓶1本を超える飲酒は、骨折の危険を高めます。転倒の原因にもなります。',
  },
  {
    id: 'smoking',
    name: '喫煙',
    detail: '喫煙は骨密度を下げ、骨折の危険を明らかに高めます。禁煙は最も効果の大きい骨折予防です。禁煙外来もご相談ください。',
  },
  {
    id: 'diet',
    name: '過度なダイエット・やせすぎ',
    detail: '体重が軽いことは骨折の危険因子です。BMI 18.5未満の方は体重を増やす工夫をしましょう。',
  },
]

// ---------------------------------------------------------------- 転倒予防

export interface FallPreventionItem {
  id: string
  place: string
  risk: string
  action: string
}

export const FALL_PREVENTION: FallPreventionItem[] = [
  { id: 'stairs', place: '階段', risk: '踏み外し・手すりがない', action: '両側に手すりをつける。段鼻に滑り止めを貼る。' },
  { id: 'bathroom', place: '浴室・脱衣所', risk: '床が滑る・段差', action: '滑り止めマットと手すりを設置。浴槽の出入りは腰かける台を使う。' },
  { id: 'toilet', place: 'トイレ', risk: '立ち座りでふらつく', action: '縦手すりを設置。夜は足元灯をつける。' },
  { id: 'hallway', place: '廊下・寝室', risk: '暗い・コード・敷物のめくれ', action: '足元灯を設置。延長コードは壁沿いに。カーペットの端を固定する。' },
  { id: 'entrance', place: '玄関', risk: '段差・靴の履き替え', action: '腰かけて履ける椅子を置く。手すりを設置。' },
  { id: 'shoes', place: 'はきもの', risk: 'スリッパ・サンダルで脱げる', action: 'かかとが覆われ、底が滑りにくい靴を室内でも使う。' },
  { id: 'medicine', place: 'くすり', risk: '睡眠薬・降圧薬でふらつく', action: '朝起きた時のふらつきがあれば必ず相談。薬の調整を検討する。' },
  { id: 'vision', place: '目・めがね', risk: '見えにくい・遠近両用で足元がぼける', action: '年1回は眼科受診。階段では遠近両用に注意。' },
]

// ---------------------------------------------------------------- 生活指導チェック項目

export interface LifestyleItem {
  id: string
  label: string
  disease: ('osteoporosis' | 'ra' | 'kneeOA')[]
  detail: string
}

export const LIFESTYLE_ITEMS: LifestyleItem[] = [
  {
    id: 'nutrition-ca',
    label: 'カルシウム・ビタミンD・たんぱく質の摂取',
    disease: ['osteoporosis', 'ra', 'kneeOA'],
    detail: 'カルシウム700〜800mg/日、ビタミンD 15〜20μg/日、たんぱく質は体重1kgあたり1.0〜1.2g/日を目標にします。',
  },
  {
    id: 'sunlight',
    label: '日光浴（1日15〜30分）',
    disease: ['osteoporosis'],
    detail: '皮膚でビタミンDがつくられます。買い物や散歩を兼ねて外に出る習慣をつけましょう。',
  },
  {
    id: 'fall-prevention',
    label: '転倒予防（住環境の見直し）',
    disease: ['osteoporosis', 'kneeOA'],
    detail: '手すり・足元灯・滑り止め・室内でも靴を。ふらつく薬がないかも確認します。',
  },
  {
    id: 'smoking',
    label: '禁煙',
    disease: ['osteoporosis', 'ra'],
    detail: '喫煙は骨密度を下げ、リウマチでは薬の効きも悪くします。禁煙外来をご案内できます。',
  },
  {
    id: 'alcohol',
    label: '節酒',
    disease: ['osteoporosis'],
    detail: '1日あたり日本酒1合程度まで。飲みすぎは骨折・転倒の危険を高めます。',
  },
  {
    id: 'dental',
    label: '歯科の定期受診・口腔ケア',
    disease: ['osteoporosis', 'ra'],
    detail: '骨の薬を使うときは歯科と連携します。リウマチでは歯周病が病気の活動性に関係します。',
  },
  {
    id: 'weight',
    label: '体重管理（減量）',
    disease: ['kneeOA'],
    detail: '体重1kgの減量で、歩行時の膝への負担がおよそ3kg分軽くなります。',
  },
  {
    id: 'vaccine',
    label: 'ワクチン接種（インフルエンザ・肺炎球菌・帯状疱疹）',
    disease: ['ra'],
    detail: '免疫を抑える薬を使う前に、不活化ワクチンの接種をおすすめします。生ワクチンは使えません。',
  },
  {
    id: 'infection-watch',
    label: '感染症のサインの見分け方',
    disease: ['ra'],
    detail: '発熱・咳・のどの痛み・排尿時痛・皮膚の赤み。おかしいと思ったら早めにご連絡ください。',
  },
  {
    id: 'joint-protect',
    label: '関節を守る生活の工夫',
    disease: ['ra', 'kneeOA'],
    detail: '重い物は両手で。同じ姿勢を続けない。疲れる前に休む。洋式・高めの椅子を使う。',
  },
  {
    id: 'brace',
    label: '装具・杖・インソールの活用',
    disease: ['kneeOA', 'osteoporosis'],
    detail: '痛みのある側の反対の手に杖を持つと、膝への負担が減ります。装具の適合は当院で確認します。',
  },
  {
    id: 'adherence',
    label: '薬を続けることの大切さ',
    disease: ['osteoporosis', 'ra'],
    detail: '骨粗鬆症の薬は「痛みがないから効いていない」わけではありません。中断すると骨折の危険が戻ってしまいます。',
  },
]
