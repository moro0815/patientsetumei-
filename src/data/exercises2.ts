import type { ExerciseItem } from '@/types'

/**
 * 運動療法メニュー（症状別疾患）
 *
 * 典拠
 * - 腰痛診療ガイドライン2019改訂第2版（日本整形外科学会・日本腰痛学会）
 *   慢性腰痛に対して運動療法はグレードの高い推奨。特定の1種目が優れるという根拠は乏しく、
 *   「続けられる運動を選ぶ」ことが要点。
 * - 腰部脊柱管狭窄症診療ガイドライン2021改訂第2版：
 *   運動療法は保存療法の中心。屈曲位で症状が軽減する特性を利用した運動・自転車エルゴメータが用いられる。
 * - 腰椎椎間板ヘルニア診療ガイドライン2021改訂第2版：
 *   多くは自然経過で軽快する。安静臥床の長期化は避け、活動性の維持を勧める。
 * - 頚椎症性脊髄症／神経根症：頚部等尺性運動と肩甲帯のトレーニングが用いられる。
 * - 足底腱膜炎：足底腱膜特異的ストレッチと下腿三頭筋ストレッチの有効性が報告されている。
 * - 上腕骨外側上顆炎：手関節伸筋群の遠心性収縮訓練（エキセントリック）とストレッチ。
 * - 肩関節周囲炎：時期に応じた運動（炎症期は疼痛管理と愛護的可動域、拘縮期に可動域訓練を強化）。
 * - ばね指：腱の滑走訓練（tendon gliding）と誘因動作の是正。
 * - 変形性股関節症（診療ガイドライン2016／OARSI）：運動療法は中核的治療。
 * - 足関節外側靱帯損傷：早期の機能的治療とバランス訓練が再受傷を減らす。
 * - 肉離れ：段階的な遠心性収縮訓練が再発予防に有効とされる。
 *
 * 注意：処方量は開始時の目安です。実際の負荷は理学療法士の評価と患者の状態に合わせて調整してください。
 */

export const EXERCISES_CONDITION: ExerciseItem[] = [
  // ============================================================ 腰・体幹
  {
    id: 'draw-in',
    name: 'ドローイン（腹横筋の運動）',
    shortName: 'おなか引き込み',
    category: 'stabilization',
    disease: ['lumbarStenosis', 'lumbarDiscHernia', 'vertebralFracture'],
    level: 'sitting',
    steps: [
      'あお向けになり、両ひざを立てます。',
      '息をゆっくり吐きながら、おへそを背中に近づけるようにおなかをへこませます。',
      'その状態のまま、息を止めずに10秒数えます。',
      '力を抜いて休み、10回くり返します。',
    ],
    dose: { reps: '10秒キープ × 10回', sets: '1セット', frequency: '1日2〜3回' },
    stopRules: [
      '息を止めないでください（血圧が上がります）。',
      '腰やおしりに新しく痛み・しびれが出たら中止してください。',
    ],
    figure: 'drawIn',
    clinicalNote:
      '腹横筋の選択的収縮。腰椎の分節的安定性を高める。慣れたら坐位・立位でも行えるよう段階を上げる。',
    sources: ['lbp-gl-2019', 'lss-gl-2021'],
  },
  {
    id: 'knee-to-chest',
    name: '片ひざ抱え（腰椎屈曲運動）',
    shortName: 'ひざ抱え',
    category: 'stretch',
    disease: ['lumbarStenosis'],
    level: 'sitting',
    steps: [
      'あお向けになり、片方のひざを両手で胸に引き寄せます。',
      '反対の脚は伸ばしたままにします。',
      '腰の後ろが気持ちよく伸びるところで20〜30秒止めます。',
      '左右それぞれ3回ずつ行います。',
    ],
    dose: { reps: '20〜30秒キープ', sets: '左右各3回', frequency: '1日2回' },
    stopRules: ['足のしびれが強くなる場合は、引き寄せる角度をゆるめてください。'],
    figure: 'kneeToChest',
    clinicalNote:
      '腰椎屈曲位で脊柱管の断面積が広がるため、狭窄症では症状が軽減しやすい。伸展位で悪化する例に適する。',
    sources: ['lss-gl-2021'],
  },
  {
    id: 'cat-camel',
    name: '四つ這いで背中を丸める・反らす',
    shortName: '背中まるめ',
    category: 'rom',
    disease: ['lumbarStenosis', 'lumbarDiscHernia'],
    level: 'active',
    steps: [
      '四つ這いになり、手は肩の下、ひざは股関節の下に置きます。',
      '息を吐きながら、背中を天井へ持ち上げるように丸めます。',
      '息を吸いながら、ゆっくり元に戻します。',
      'ゆっくり10往復くり返します。',
    ],
    dose: { reps: 'ゆっくり10往復', sets: '1セット', frequency: '1日2回' },
    stopRules: ['反らしすぎないでください。痛みが出ない範囲で行います。', '手首やひざが痛い場合は無理に行わないでください。'],
    figure: 'catCamel',
    clinicalNote: '腰椎の可動性維持。疼痛の強い急性期には可動範囲を小さくして行う。',
    sources: ['lbp-gl-2019'],
  },
  {
    id: 'hamstring-stretch',
    name: '太ももの裏のばし（ハムストリングストレッチ）',
    shortName: 'もも裏のばし',
    category: 'stretch',
    disease: ['lumbarStenosis', 'lumbarDiscHernia', 'muscleStrain', 'kneeOA'],
    level: 'sitting',
    steps: [
      'あお向けになり、片脚の太ももの裏をタオルで持ちます。',
      'ひざは軽く曲げたままで構いません。',
      '太ももの裏が気持ちよく伸びるところで20〜30秒止めます。',
      '反動をつけず、息を止めずに行います。',
    ],
    dose: { reps: '20〜30秒キープ', sets: '左右各3回', frequency: '1日2回' },
    stopRules: [
      '足に電気が走るようなしびれが出たら、すぐにゆるめてください。',
      '肉離れの直後は行わず、医師の指示があってから始めてください。',
    ],
    figure: 'hamstringStretch',
    clinicalNote:
      'ハムストリングの柔軟性低下は骨盤後傾を介して腰部への負担を増やす。神経症状の誘発（SLR様）に注意。',
    sources: ['lbp-gl-2019'],
  },
  {
    id: 'mckenzie-extension',
    name: 'うつ伏せで上体を反らす（伸展運動）',
    shortName: '上体そらし',
    category: 'rom',
    disease: ['lumbarDiscHernia'],
    level: 'active',
    steps: [
      'うつ伏せになり、両手を胸の横につきます。',
      '腰とおしりの力を抜いたまま、上体だけをゆっくり起こします。',
      '2〜3秒止めて、ゆっくり戻します。',
      '10回を1セットとして、1日3〜5回行います。',
    ],
    dose: { reps: '10回', sets: '1セット', frequency: '1日3〜5回' },
    stopRules: [
      '足やおしりのしびれ・痛みが「強くなる」「より下まで広がる」ときは中止してください。',
      '逆に、しびれが足先から腰の方へ戻ってくる場合は良い反応です。',
    ],
    figure: 'mckenzieExtension',
    clinicalNote:
      '伸展方向への方向特異的運動。症状の centralization（末梢→中枢へ移動）を指標とし、peripheralization では中止する。',
    sources: ['ldh-gl-2021'],
  },
  {
    id: 'hip-flexor-stretch',
    name: '股関節の前のばし（腸腰筋ストレッチ）',
    shortName: 'つけ根のばし',
    category: 'stretch',
    disease: ['hipOA', 'lumbarStenosis', 'muscleStrain'],
    level: 'active',
    steps: [
      '片ひざ立ちになります（後ろのひざを床につけます）。',
      'おしりに軽く力を入れて、腰が反らないようにします。',
      'そのまま体をまっすぐ前に移動させます。',
      '後ろ脚のつけ根が伸びるところで20〜30秒止めます。',
    ],
    dose: { reps: '20〜30秒キープ', sets: '左右各3回', frequency: '1日2回' },
    stopRules: ['腰を反らさないでください。', 'ひざが痛い場合は、下にクッションを敷いてください。'],
    figure: 'hipFlexorStretch',
    clinicalNote: '腸腰筋・大腿直筋の短縮は股関節の伸展制限と代償性の腰椎前弯増強をきたす。',
    sources: ['hip-gl-2016'],
  },

  // ============================================================ 首・肩
  {
    id: 'chin-tuck',
    name: 'あごを引く体操',
    shortName: 'あご引き',
    category: 'stabilization',
    disease: ['cervicalRadiculopathy'],
    level: 'sitting',
    steps: [
      '椅子に座り、背すじを伸ばします。',
      '上や下を向かず、あごを水平に後ろへ引きます（二重あごを作るように）。',
      '5秒間そのまま保ちます。',
      '10回くり返します。',
    ],
    dose: { reps: '5秒キープ × 10回', sets: '1セット', frequency: '1日3回' },
    stopRules: ['腕のしびれが強くなる場合は中止してください。', 'めまいが出たら中止し、次回の受診で相談してください。'],
    figure: 'chinTuck',
    clinicalNote: '頭部前方位の是正。深部頚屈筋の再教育。頚椎伸展位で症状が誘発される例では特に有用。',
    sources: ['csr-ref'],
  },
  {
    id: 'neck-isometric',
    name: '首の等尺性運動',
    shortName: '首の力くらべ',
    category: 'strength',
    disease: ['cervicalRadiculopathy'],
    level: 'sitting',
    steps: [
      '手のひらを額に当てて、首を動かさないように軽く押し合います。',
      '5秒間力を入れ、ゆっくり抜きます。',
      '同じことを、横（こめかみ）・後ろ（後頭部）でも行います。',
      '各方向5回ずつ行います。',
    ],
    dose: { reps: '5秒 × 5回', sets: '前・横・後ろの3方向', frequency: '1日2回' },
    stopRules: [
      '首が動いてしまうほど強く押さないでください。',
      '腕のしびれ・力の入りにくさが増したら中止してください。',
    ],
    figure: 'neckIsometric',
    clinicalNote: '関節運動を伴わないため、神経根への機械的刺激を避けながら頚部筋を賦活できる。',
    sources: ['csr-ref'],
  },
  {
    id: 'scapular-squeeze',
    name: '肩甲骨を寄せる体操',
    shortName: '肩甲骨よせ',
    category: 'strength',
    disease: ['cervicalRadiculopathy', 'frozenShoulder', 'vertebralFracture'],
    level: 'sitting',
    steps: [
      '背すじを伸ばして座ります。',
      '肩を上げずに、左右の肩甲骨を背中の中央に寄せます。',
      '5秒間そのまま保ちます。',
      '10回くり返します。',
    ],
    dose: { reps: '5秒キープ × 10回', sets: '1セット', frequency: '1日3回' },
    stopRules: ['肩をすくめないでください。', '肩の痛みが強い時期は、可能な範囲でかまいません。'],
    figure: 'scapularSqueeze',
    clinicalNote: '僧帽筋中部・下部、菱形筋の賦活。デスクワークによる円背・肩甲骨外転位の是正。',
    sources: ['csr-ref', 'shoulder-ref'],
  },
  {
    id: 'pendulum',
    name: '振り子運動（コッドマン体操）',
    shortName: 'ふりこ運動',
    category: 'rom',
    disease: ['frozenShoulder'],
    level: 'standing-support',
    steps: [
      '机に反対の手をつき、体を少し前に倒します。',
      '痛い方の腕は力を抜いて、そのままぶら下げます。',
      '腕の力ではなく、体を揺らして腕を振ります。',
      '前後・左右・小さく回す、を各20回行います。',
    ],
    dose: { reps: '各方向20回', sets: '1セット', frequency: '1日2〜3回' },
    stopRules: [
      '腕の力で振らないでください（かえって痛みます）。',
      '痛みが強くなる大きさでは行わず、小さく振ってください。',
    ],
    figure: 'pendulum',
    clinicalNote:
      '炎症期から行える愛護的な可動域運動。自動運動ではなく体幹の動きを利用する点を必ず実演して指導する。',
    sources: ['shoulder-ref'],
  },
  {
    id: 'wall-walk',
    name: '壁づたい運動',
    shortName: '壁のぼり',
    category: 'rom',
    disease: ['frozenShoulder'],
    level: 'standing',
    steps: [
      '壁の前に立ち、指を壁につけます。',
      '指を1本ずつ動かして、手を少しずつ上へ登らせます。',
      '突っ張るところまで来たら10秒止めます。',
      'ゆっくり手を下ろします。10回くり返します。',
    ],
    dose: { reps: '10回', sets: '1セット', frequency: '1日2〜3回' },
    stopRules: ['痛みで顔をしかめる高さまでは上げないでください。', '反動をつけないでください。'],
    figure: 'wallWalk',
    clinicalNote: '壁を利用した自動介助運動。到達高をマークして経過を可視化すると継続率が上がる。',
    sources: ['shoulder-ref'],
  },
  {
    id: 'cross-body-stretch',
    name: '腕を胸の前で抱えるストレッチ',
    shortName: '腕の抱えこみ',
    category: 'stretch',
    disease: ['frozenShoulder'],
    level: 'sitting',
    steps: [
      '痛い方の腕を、胸の前に水平に伸ばします。',
      '反対の手でひじを抱えて、体の方へ引き寄せます。',
      '肩の後ろが伸びるところで20〜30秒止めます。',
      '3回くり返します。',
    ],
    dose: { reps: '20〜30秒キープ × 3回', sets: '1セット', frequency: '1日2回' },
    stopRules: ['肩の前側に強い痛みが出る場合は中止してください。'],
    figure: 'crossBodyStretch',
    clinicalNote: '後方関節包のストレッチ。内旋制限が強い例に有用。',
    sources: ['shoulder-ref'],
  },
  {
    id: 'shoulder-er-band',
    name: '腕を外にひねる運動（ゴムチューブ）',
    shortName: '外ひねり',
    category: 'strength',
    disease: ['frozenShoulder'],
    level: 'standing',
    steps: [
      'ゴムチューブを柱などに固定し、片手で持ちます。',
      'ひじを体につけたまま90度に曲げます。',
      'ひじを体から離さずに、前腕を外向きにゆっくり開きます。',
      'ゆっくり戻します。10〜15回くり返します。',
    ],
    dose: { reps: '10〜15回', sets: '2〜3セット', frequency: '週3回' },
    stopRules: ['痛みが出る強さのチューブは使わないでください。', '炎症期（夜間痛が強い時期）には行いません。'],
    figure: 'externalRotation',
    clinicalNote: '棘下筋・小円筋の強化。回復期に導入する。ひじを体幹につけて代償を防ぐ。',
    sources: ['shoulder-ref'],
  },

  // ============================================================ 肘・手
  {
    id: 'wrist-ext-stretch',
    name: '手首を反らす筋肉のストレッチ',
    shortName: '前腕のばし',
    category: 'stretch',
    disease: ['tennisElbow'],
    level: 'sitting',
    steps: [
      'ひじをまっすぐ伸ばし、手のひらを下に向けます。',
      '手首を下に曲げ、反対の手でさらに軽く押さえます。',
      'ひじの外側から前腕にかけて伸びるところで30秒止めます。',
      '3回くり返します。',
    ],
    dose: { reps: '30秒キープ × 3回', sets: '1セット', frequency: '1日3回' },
    stopRules: ['痛みが強い日は無理に伸ばさないでください。', '反動をつけないでください。'],
    figure: 'wristExtStretch',
    clinicalNote: '手関節伸筋群（特にECRB）のストレッチ。肘伸展・前腕回内位で行うと伸張効果が高い。',
    sources: ['elbow-ref'],
  },
  {
    id: 'eccentric-wrist',
    name: '手首をゆっくり下ろす運動（エキセントリック）',
    shortName: 'ゆっくり下ろす',
    category: 'eccentric',
    disease: ['tennisElbow'],
    level: 'sitting',
    steps: [
      '前腕を机につけ、手首から先を机の外に出します。',
      '軽いおもり（500g〜1kg、水の入ったペットボトルでも可）を持ちます。',
      '反対の手で手首を上げてもらう（または自分で上げる）。',
      'そこから3〜5秒かけて、ゆっくり下ろします。これを15回くり返します。',
    ],
    dose: { reps: '15回', sets: '3セット', frequency: '1日1回' },
    stopRules: [
      '運動中の軽い痛み（10段階で3〜4程度）は許容範囲ですが、翌日に強く残る場合は重さを減らしてください。',
      '上げる動作は反対の手で助け、下ろす動作だけを自分で行います。',
    ],
    figure: 'eccentricWrist',
    clinicalNote:
      '遠心性収縮訓練は外側上顆炎の中核的治療。負荷は疼痛に応じて漸増する。効果発現には6〜12週を要する。',
    sources: ['elbow-ref'],
  },
  {
    id: 'tendon-glide',
    name: '指の腱すべり運動',
    shortName: '指のすべり運動',
    category: 'nerveGlide',
    disease: ['triggerFinger'],
    level: 'sitting',
    steps: [
      '指をまっすぐ伸ばします。',
      '指の付け根を伸ばしたまま、指先だけを曲げて「かぎ形」にします。',
      '次に、こぶしを握ります。',
      '最後に、指の付け根から曲げて「平ら」にします。各形を5秒ずつ保ちます。',
    ],
    dose: { reps: '各形5秒 × 5往復', sets: '1セット', frequency: '1日3〜4回' },
    stopRules: [
      '引っかかるところで無理に伸ばさないでください（かえって腫れます）。',
      '朝、指が動かしにくいときは、お湯につけてから行うと楽です。',
    ],
    figure: 'tendonGlide',
    clinicalNote: '屈筋腱の滑走訓練。腱鞘内での癒着を防ぎ、注射後の再発予防としても指導する。',
    sources: ['hand-ref'],
  },

  // ============================================================ 足
  {
    id: 'plantar-stretch',
    name: '足の裏のばし（足底腱膜ストレッチ）',
    shortName: '足裏のばし',
    category: 'stretch',
    disease: ['plantarFasciitis'],
    level: 'sitting',
    steps: [
      '座って、痛い方の足を反対の太ももに乗せます。',
      '手で足の指をまとめて、足首の側へ反らします。',
      '土ふまずのすじが張るのを感じたら、20〜30秒止めます。',
      '朝、床に足をつく前と、日中3回行います。',
    ],
    dose: { reps: '20〜30秒キープ × 3回', sets: '1セット', frequency: '起床時＋1日3回' },
    stopRules: ['痛みで顔をしかめるほど強く反らさないでください。'],
    figure: 'plantarStretch',
    clinicalNote:
      '足底腱膜特異的ストレッチ。起床時・立ち上がり前に行うことで first-step pain を軽減できる。',
    sources: ['foot-ref'],
  },
  {
    id: 'calf-stretch',
    name: 'ふくらはぎのばし',
    shortName: 'ふくらはぎのばし',
    category: 'stretch',
    disease: ['plantarFasciitis', 'ankleSprain', 'muscleStrain'],
    level: 'standing',
    steps: [
      '壁に両手をつき、片脚を後ろに引きます。',
      '後ろ足のかかとを床につけたまま、前足のひざを曲げます。',
      'ふくらはぎが伸びるところで30秒止めます。',
      '左右3回ずつ行います。',
    ],
    dose: { reps: '30秒キープ', sets: '左右各3回', frequency: '1日2回' },
    stopRules: ['かかとが浮いてしまうと効果がありません。無理のない範囲で。'],
    figure: 'calfStretch',
    clinicalNote:
      '下腿三頭筋の柔軟性低下は足底腱膜への牽引力を増す。膝伸展位（腓腹筋）と屈曲位（ヒラメ筋）の両方を指導する。',
    sources: ['foot-ref'],
  },
  {
    id: 'towel-gather',
    name: 'タオルたぐり寄せ',
    shortName: 'タオルたぐり',
    category: 'strength',
    disease: ['plantarFasciitis', 'ankleSprain'],
    level: 'sitting',
    steps: [
      '椅子に座り、床にタオルを敷いて足を乗せます。',
      'かかとは床につけたまま、足の指だけでタオルをたぐり寄せます。',
      'タオル1枚分をたぐり終えたら、広げて最初からやり直します。',
      '5回くり返します。',
    ],
    dose: { reps: 'タオル1枚分 × 5回', sets: '1セット', frequency: '1日2回' },
    stopRules: ['足がつるときは休んでください。'],
    figure: 'towelGather',
    clinicalNote: '足内在筋の強化。内側縦アーチの支持性を高める。',
    sources: ['foot-ref'],
  },
  {
    id: 'ankle-eversion-band',
    name: '足首を外に開く運動（ゴムチューブ）',
    shortName: '足首外開き',
    category: 'strength',
    disease: ['ankleSprain'],
    level: 'sitting',
    steps: [
      '足にゴムチューブをかけ、反対側を柱や反対の足で固定します。',
      'かかとを動かさないようにして、足先を外側へゆっくり開きます。',
      'ゆっくり戻します。',
      '15回を1セットとして、3セット行います。',
    ],
    dose: { reps: '15回', sets: '3セット', frequency: '1日1回' },
    stopRules: ['痛みが出る強さでは行わないでください。', '受傷直後は医師の許可が出てから始めてください。'],
    figure: 'ankleEversionBand',
    clinicalNote: '腓骨筋群の強化。外側靱帯損傷後の動的安定性を補い、再受傷率を下げる。',
    sources: ['ankle-ref'],
  },

  // ============================================================ スポーツ
  {
    id: 'nordic-hamstring',
    name: 'ノルディックハムストリング',
    shortName: 'もも裏ブレーキ',
    category: 'eccentric',
    disease: ['muscleStrain'],
    level: 'active',
    steps: [
      'ひざ立ちになり、足首を誰かに押さえてもらいます（固定できる器具でも可）。',
      '背すじとおしりをまっすぐに保ったまま、できるだけゆっくり前に倒れます。',
      '耐えられなくなったら手をついて体を支えます。',
      '手で押して元の姿勢に戻ります。3〜5回くり返します。',
    ],
    dose: { reps: '3〜5回', sets: '2〜3セット', frequency: '週1〜2回' },
    stopRules: [
      '痛みのある時期には行いません。医師の許可が出てから始めてください。',
      '筋肉痛が強く出やすい運動です。最初は回数を少なくしてください。',
    ],
    figure: 'nordicHamstring',
    clinicalNote:
      'ハムストリング肉離れの再発予防として最も根拠が蓄積している遠心性訓練。復帰期に導入し、シーズン中も継続する。',
    sources: ['muscle-ref'],
  },
]

/**
 * 疾患ごとの標準セット（症状別疾患）。
 * 医師が1クリックでまとめて選べるようにする。
 */
export const RECOMMENDED_SETS_CONDITION: Record<string, { label: string; ids: string[]; note: string }[]> = {
  lumbarStenosis: [
    {
      label: '基本セット（屈曲中心）',
      ids: ['draw-in', 'knee-to-chest', 'hamstring-stretch'],
      note: '腰を丸める方向の運動を中心に組み立てます。伸展で悪化する典型例に適します。',
    },
    {
      label: '歩ける距離を伸ばす',
      ids: ['draw-in', 'knee-to-chest', 'walking', 'chair-stand'],
      note: '休みながら歩く（インターバル歩行）と下肢筋力訓練を組み合わせます。自転車も有効です。',
    },
  ],
  lumbarDiscHernia: [
    {
      label: '急性期（痛みが強い時期）',
      ids: ['draw-in', 'cat-camel'],
      note: '長期の安静臥床は避けます。痛みのない範囲で動きを保つことが回復を早めます。',
    },
    {
      label: '回復期（痛みが落ち着いてから）',
      ids: ['mckenzie-extension', 'draw-in', 'hamstring-stretch', 'cat-camel'],
      note: '伸展運動は、しびれが足先から腰へ戻る反応（centralization）を確認しながら進めます。',
    },
  ],
  cervicalRadiculopathy: [
    {
      label: '基本セット',
      ids: ['chin-tuck', 'scapular-squeeze', 'neck-isometric'],
      note: '姿勢の是正と頚部・肩甲帯の安定化。首を大きく反らす運動は避けます。',
    },
  ],
  plantarFasciitis: [
    {
      label: '基本セット（朝いちばんに）',
      ids: ['plantar-stretch', 'calf-stretch', 'towel-gather'],
      note: '起床時のストレッチが最も効きます。3か月続けることを最初に伝えてください。',
    },
  ],
  tennisElbow: [
    {
      label: '基本セット',
      ids: ['wrist-ext-stretch', 'eccentric-wrist'],
      note: 'ストレッチ＋遠心性訓練。効果が出るまで6〜12週かかることを先に説明します。',
    },
  ],
  frozenShoulder: [
    {
      label: '炎症期（夜間痛が強い時期）',
      ids: ['pendulum', 'scapular-squeeze'],
      note: '無理に動かさず、愛護的な可動域運動にとどめます。夜間痛のコントロールを優先します。',
    },
    {
      label: '拘縮期（動かない時期）',
      ids: ['pendulum', 'wall-walk', 'cross-body-stretch', 'shoulder-rom'],
      note: '可動域訓練をいちばん頑張る時期です。ここでの継続が最終的な可動域を決めます。',
    },
    {
      label: '回復期（動きが戻ってきた時期）',
      ids: ['wall-walk', 'cross-body-stretch', 'shoulder-er-band', 'scapular-squeeze'],
      note: '可動域訓練に筋力訓練を加えます。',
    },
  ],
  triggerFinger: [
    {
      label: '基本セット',
      ids: ['tendon-glide', 'hand-rom'],
      note: '腱の滑走を保ちます。引っかかるところで無理に伸ばさないよう必ず実演してください。',
    },
  ],
  hipOA: [
    {
      label: '基本セット',
      ids: ['side-leg-raise', 'quad-setting', 'hip-flexor-stretch'],
      note: '中殿筋の強化が跛行の改善につながります。杖の使用とあわせて指導します。',
    },
    {
      label: '痛みが強い時期',
      ids: ['quad-setting', 'aquatic', 'joint-protection'],
      note: '荷重を減らしながら筋力と可動域を保ちます。',
    },
    {
      label: '歩ける方（体重管理も含む）',
      ids: ['side-leg-raise', 'walking', 'chair-stand', 'hip-flexor-stretch'],
      note: '有酸素運動と筋力訓練を組み合わせます。減量の効果が大きい関節です。',
    },
  ],
  vertebralFracture: [
    {
      label: '受傷後の急性期',
      ids: ['draw-in', 'quad-setting', 'ankle-rom'],
      note: '体幹の前屈・回旋は避けます。寝たきりを防ぐため、下肢の運動は早期から行います。',
    },
    {
      label: '回復期（背すじを保つ）',
      ids: ['back-extension', 'scapular-squeeze', 'draw-in', 'chair-stand'],
      note: '背筋の強化が円背の進行と次の骨折を防ぎます。前屈運動は行いません。',
    },
  ],
  ankleSprain: [
    {
      label: '急性期を過ぎたら',
      ids: ['ankle-rom', 'calf-stretch', 'towel-gather'],
      note: '腫れが引いてきたら可動域から始めます。',
    },
    {
      label: '再発を防ぐ（いちばん大事）',
      ids: ['ankle-eversion-band', 'one-leg-stand', 'heel-raise', 'calf-stretch'],
      note: 'バランス訓練と腓骨筋の強化が再受傷を減らします。最低3か月は続けてください。',
    },
  ],
  muscleStrain: [
    {
      label: '回復期（痛みが引いてから）',
      ids: ['hamstring-stretch', 'calf-stretch'],
      note: '痛みのない範囲のストレッチから始めます。',
    },
    {
      label: '復帰前（再発を防ぐ）',
      ids: ['nordic-hamstring', 'hamstring-stretch', 'hip-flexor-stretch'],
      note: '遠心性訓練が再発予防の中心です。復帰後もシーズン中は続けてください。',
    },
  ],
}
