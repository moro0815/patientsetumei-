import {
  BmdCurveFigure,
  BoneRemodelingFigure,
  FractureCascadeFigure,
  FractureSitesFigure,
  RiskTierFigure,
  SequentialTherapyFigure,
  SpinePostureFigure,
  TrabecularBoneFigure,
  TreatmentPillarsFigure,
} from '@/components/figures/bone'
import { DailyFoodFigure, DentalCoordinationFigure, FallPreventionMapFigure, NutrientRoleFigure } from '@/components/figures/lifestyle'
import { ExerciseFigure } from '@/components/figures/exercise'
import { assessOsteoporosis, bmdPlainLanguage, fmtT, suggestInitialTherapy } from '@/logic/osteoporosis'
import { getDrug, needsDentalCoordination, needsSequentialTherapy } from '@/data/drugs'
import { getExercise } from '@/data/exercises'
import type { Slide, SlideBuilder } from './types'

export const buildOsteoSlides: SlideBuilder = (session) => {
  const a = assessOsteoporosis(session.osteo, session.patient)
  const plain = bmdPlainLanguage(a.adoptedYam, a.adoptedTscore)
  const therapy = suggestInitialTherapy(a.riskTier)
  const p = session.patient
  const selectedDrugs = session.plan.drugIds.map(getDrug).filter(Boolean)
  const hasVertebralFracture = session.osteo.fractures.some((f) => f.site === 'vertebra')
  const formationDrug = selectedDrugs.find((d) => d && needsSequentialTherapy(d.id))

  const slides: Slide[] = [
    // ---------------------------------------------------------------- 現状
    {
      id: 'op-status',
      group: '現状',
      title: `いまの骨の状態：${plain.headline}`,
      lead: a.adoptedYam !== null ? `骨密度 YAM ${Math.round(a.adoptedYam)}%（Tスコア ${fmtT(a.adoptedTscore)}）` : undefined,
      figure: <BmdCurveFigure age={p.age} sex={p.sex} yam={a.adoptedYam} />,
      points: plain.body,
      talk: [
        'まず「今どこにいるか」を1枚で共有します。グラフの黒い点をペンや指で示しながら話すと伝わりやすいです。',
        '「若い頃の◯%です」と数字を言ったあと、必ず「つまり、こういう状態です」と言い換えてください。数字だけでは行動は変わりません。',
        a.adoptedYam === null
          ? '骨密度が未測定です。まず DXA（腰椎＋大腿骨近位部）の測定をご案内ください。'
          : '腰椎と大腿骨の両方を測っている場合、低い方の値を採用していることを説明します。',
      ],
      cite: ['op-gl-2025', 'op-dx-criteria'],
    },
    {
      id: 'op-diagnosis',
      group: '現状',
      title:
        a.diagnosis === 'osteoporosis'
          ? '「骨粗鬆症」という段階です'
          : a.diagnosis === 'lowBoneMass'
            ? '「骨量減少」という段階です'
            : a.diagnosis === 'normal'
              ? '骨の量は保たれています'
              : '骨の状態を確かめましょう',
      figure: <TrabecularBoneFigure yam={a.adoptedYam} />,
      points: [
        '骨は、外側の硬い殻の中が「スポンジ」のようになっています。そのスポンジの柱が骨を支えています。',
        '骨粗鬆症では、この柱が細くなり、本数も減ります。とくに横向きの柱が先に失われます。',
        '柱が減った骨は、外から見た大きさは同じでも、中身がもろくなっています。',
      ],
      talk: [
        'この図が最も理解されやすい図です。「骨が減る」ではなく「骨の中の柱が減る」と言い換えてください。',
        '「だから、ちょっとした転倒や、しりもちでも折れてしまうのです」とつなげると、次の骨折の話に自然に移れます。',
      ],
      cite: ['op-gl-2025'],
    },

    // ---------------------------------------------------------------- 病気のしくみ
    {
      id: 'op-fracture-sites',
      group: '病気のしくみ',
      title: '折れやすいのは、この4か所です',
      figure: (
        <FractureSitesFigure
          marked={session.osteo.fractures
            .map((f) =>
              f.site === 'vertebra'
                ? 'spine'
                : f.site === 'proximalFemur'
                  ? 'hip'
                  : f.site === 'distalRadius'
                    ? 'wrist'
                    : f.site === 'proximalHumerus'
                      ? 'humerus'
                      : null,
            )
            .filter((x): x is 'spine' | 'hip' | 'wrist' | 'humerus' => x !== null)}
        />
      ),
      points: [
        '手首：転んで手をついたときに折れます。最初のサインになることが多い場所です。',
        '背骨：気づかないうちにつぶれていることがあります。身長が縮む・背中が丸くなるのがサインです。',
        '足の付け根：入院と手術が必要になり、その後の生活に最も大きく影響します。',
        '肩の付け根：転倒時に折れることがあります。',
      ],
      talk: [
        '骨折した既往がある場合はその部位が図で色づいています。「ここが折れましたね」と示してください。',
        '「手首を折った方は、次に背骨や足の付け根が折れる可能性が高い」と、次のスライドにつなげます。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-spine',
      group: '病気のしくみ',
      title: '背骨がつぶれると、体つき全体が変わります',
      figure: <SpinePostureFigure heightLossCm={a.heightLossCm} />,
      points: [
        '背骨が1つつぶれると、身長が1〜2cm縮みます。',
        '背中が丸くなると、胃酸が上がってきて胸やけがしたり、息が浅くなったりします。',
        '重心が前に寄るため、バランスを崩して転びやすくなります。',
        '背骨の骨折の多くは、はっきりした痛みがないまま起きています。',
      ],
      when: (s) =>
        s.osteo.fractures.some((f) => f.site === 'vertebra') ||
        (a.heightLossCm !== null && a.heightLossCm >= 2) ||
        a.diagnosis === 'osteoporosis',
      talk: [
        hasVertebralFracture
          ? '既に椎体骨折があります。「もう1つ折れると、さらに◯cm縮みます」と具体的に説明してください。'
          : '身長低下がある場合は、無症状の椎体骨折を疑い、胸腰椎X線をご検討ください。',
        '「痛くないから大丈夫」という誤解を、この図で解いておくことが大切です。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-cascade',
      group: '病気のしくみ',
      title: '1回の骨折が、次の骨折を招きます',
      figure: <FractureCascadeFigure />,
      points: [
        '一度骨折した方は、次に骨折する危険が2倍以上に高くなります。',
        'とくに骨折してから1年以内が、次の骨折が最も起こりやすい時期です。',
        '治療は、このドミノ倒しを途中で止めるためのものです。',
      ],
      highlight: {
        tone: 'warn',
        text: '足の付け根を骨折すると、多くの方が入院・手術を必要とし、その後の生活が大きく変わってしまいます。だから「折れる前」に手を打ちます。',
      },
      talk: [
        'これが治療のモチベーションを作る図です。時間をかけて説明する価値があります。',
        '「今日の目的は、痛みを取ることではなく、将来の骨折を防ぐことです」とはっきり伝えてください。',
      ],
      cite: ['op-gl-2025', 'fls-standard'],
    },
    {
      id: 'op-risk',
      group: '現状',
      title: 'あなたの「骨折の危険度」',
      figure: <RiskTierFigure tier={a.riskTier} />,
      points:
        a.riskTierReasons.length > 0
          ? [`この判定の理由：${a.riskTierReasons.join('、')}`, '危険度に応じて、使う薬の種類と強さを決めます。']
          : ['骨密度・骨折の既往・転びやすさ・年齢などから、骨折の危険度を判定します。'],
      talk: [
        `現在の区分は「${
          a.riskTier === 'veryHigh' ? 'きわめて高い' : a.riskTier === 'high' ? '高い' : a.riskTier === 'moderate' ? '中等度' : a.riskTier === 'low' ? '低い' : '判定不能'
        }」です。`,
        therapy.headline,
        ...therapy.notes,
      ],
      cite: ['op-gl-2025'],
    },

    // ---------------------------------------------------------------- 治療
    {
      id: 'op-pillars',
      group: '治療',
      title: '治療は「くすり・運動・食事」の3本柱',
      figure: <TreatmentPillarsFigure highlight="exercise" />,
      points: [
        'くすりだけでは、転倒そのものは防げません。',
        '運動は、骨に刺激を与えて骨を強くするだけでなく、「転ばない体」をつくります。',
        '食事は、骨をつくる材料をそろえます。材料がなければ薬も十分に働きません。',
      ],
      highlight: {
        tone: 'good',
        text: '当院は運動療法に力を入れています。理学療法士が、あなたの体に合わせた運動を一緒に組み立てます。',
      },
      talk: [
        '当院の特色を伝えるスライドです。運動教室・個別リハビリの案内につなげてください。',
        '運動療法は骨粗鬆症GL2025でも「治療の柱」として位置づけられています（合意率100%）。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-remodeling',
      group: '治療',
      title: '骨は毎日「こわして・つくり直して」います',
      figure: (
        <BoneRemodelingFigure
          highlight={
            selectedDrugs.some((d) => d && needsSequentialTherapy(d.id))
              ? 'formation'
              : selectedDrugs.length > 0
                ? 'resorption'
                : null
          }
        />
      ),
      points: [
        '骨は変わらない石ではなく、少しずつ入れ替わっている「生きた組織」です。',
        '骨粗鬆症では、こわす働きがつくる働きより勝ってしまっています。',
        'だから薬は、「こわすのを抑える」か「つくるのを増やす」の2通りになります。',
      ],
      talk: [
        '薬の説明に入る前にこの図を挟むと、「なぜこの薬なのか」が理解されます。',
        '選択した薬の系統が図の中で強調されます。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-drugs',
      group: '治療',
      title: selectedDrugs.length > 0 ? 'あなたに提案するお薬' : 'お薬の種類',
      lead: selectedDrugs.length > 0 ? selectedDrugs.map((d) => d!.generic).join('／') : undefined,
      points:
        selectedDrugs.length > 0
          ? selectedDrugs.flatMap((d) => [`【${d!.generic}】${d!.plain}`, `のみ方・打ち方：${d!.schedule}`])
          : [
              '骨をこわすのを抑える薬：ビスホスホネート（のみ薬・点滴）、デノスマブ（半年に1回の注射）、SERM（のみ薬）',
              '骨をつくるのを増やす薬：テリパラチド、アバロパラチド、ロモソズマブ（いずれも注射）',
              '骨折の危険がとても高い方には、骨をつくる薬から始めることが2025年のガイドラインで推奨されています。',
            ],
      talk: [
        '「治療方針」画面で薬を選ぶと、このスライドに具体的な内容が反映されます。',
        '注意点はすべてパンフレットに印刷されます。ここでは「一番大事な1つ」だけを口頭で伝えてください。',
        ...(selectedDrugs.length > 0 ? selectedDrugs.map((d) => `【${d!.generic}】${d!.clinicalNote}`) : []),
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-sequential',
      group: '治療',
      title: '「骨をつくる薬」のあとは、必ず次の薬へつなぎます',
      figure: <SequentialTherapyFigure firstDrug={formationDrug?.generic} />,
      when: () => session.plan.drugIds.some(needsSequentialTherapy),
      points: [
        '骨をつくる薬には、使える期間の上限があります（12〜24か月）。',
        '期間が終わったあとに何もしないと、増えた骨がまた減ってしまいます。',
        'だから、終了と同時に「骨をこわすのを抑える薬」へ切り替えます。',
      ],
      highlight: {
        tone: 'warn',
        text: '次の薬の予約は、今日いっしょに取っておきます。切れ目をつくらないことが何より大切です。',
      },
      talk: [
        '逐次療法の脱落は臨床上もっとも多い失敗です。終了日をカルテと予約に必ず登録してください。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-dental',
      group: '治療',
      title: 'お薬を始める前に、歯科をひとつ済ませましょう',
      figure: <DentalCoordinationFigure />,
      when: () => session.plan.drugIds.some(needsDentalCoordination),
      points: [
        '骨をこわすのを抑える薬では、まれに顎の骨の障害（顎骨壊死）が起こることがあります。',
        '起こる確率は低いですが、口の中を清潔に保つことで危険を大きく減らせます。',
        '抜歯が必要になったとき、この薬を休むことは原則しません。歯科と当院で情報を共有して進めます。',
      ],
      talk: [
        '「抜歯のとき薬を止める」という古い情報を持っている患者さん・歯科医院が今も多いです。',
        'ポジションペーパー2023では、抜歯時の休薬は原則行わないことが提案されています。必要なら診療情報提供書を発行してください。',
      ],
      cite: ['mronj-2023'],
    },

    // ---------------------------------------------------------------- 運動療法
    {
      id: 'op-exercise-why',
      group: '運動療法',
      title: '運動は、骨と「転ばない体」の両方をつくります',
      figure: <ExerciseFigure figure="squat" />,
      points: [
        '骨は、体重や筋肉の力がかかると「もっと強くならなければ」と反応します。だから荷重のかかる運動が大切です。',
        '同時に、筋力とバランスが良くなると転びにくくなります。転ばなければ、折れません。',
        'バランスの練習を含む運動は、転倒によるけがを防ぐ効果が示されています。',
        '1回に長時間やる必要はありません。毎日少しずつ続けることが効果につながります。',
      ],
      highlight: {
        tone: 'good',
        text: '骨粗鬆症の運動療法は、ガイドラインでも「治療の柱」として位置づけられています。',
      },
      talk: [
        '「薬を飲んでいれば大丈夫」という誤解を解くスライドです。',
        '荷重運動＋バランス訓練＋背筋の維持、という3点セットで説明すると整理されます。',
      ],
      cite: ['op-gl-2025', 'locomo-joa'],
    },
    ...buildPrescriptionSlides(session),
    {
      id: 'op-exercise-caution',
      group: '運動療法',
      title: '背骨が折れている方は、避けたい動きがあります',
      figure: <ExerciseFigure figure="backExtension" />,
      when: (s) => s.osteo.fractures.some((f) => f.site === 'vertebra'),
      points: [
        '体を大きく前に曲げる動き（前屈、床のものを拾う姿勢、腹筋の起き上がり運動）は避けてください。',
        '体をひねる動き（ゴルフのスイングなど）も、背骨に負担がかかります。',
        '代わりに、背すじをまっすぐ伸ばす運動と、下半身の筋力トレーニングを行います。',
        '床のものを拾うときは、膝を曲げてしゃがみましょう。',
      ],
      talk: [
        '椎体骨折例における体幹屈曲・回旋運動の回避は、続発骨折の予防として重要です。明示的に伝えてください。',
      ],
      cite: ['op-gl-2025'],
    },

    // ---------------------------------------------------------------- 生活
    {
      id: 'op-nutrition',
      group: '生活',
      title: '骨をつくる材料をそろえましょう',
      figure: <DailyFoodFigure />,
      points: [
        'カルシウムは1日700〜800mgが目標です。牛乳・ヨーグルト・豆腐・青菜・小魚を毎食どれか入れると届きます。',
        'ビタミンDは魚ときのこ、そして日光。週に3回は魚を食べましょう。',
        'ビタミンKは納豆1パックでほぼ1日分です。',
        'たんぱく質（肉・魚・卵・大豆）も骨の土台と筋肉に必要です。',
      ],
      talk: [
        'サプリメントより食事が基本であることを伝えてください。カルシウム単独の過剰摂取は腎結石・心血管リスクの懸念があります。',
        'ワルファリン服用中の方には、納豆・青汁・クロレラを避けるよう必ず確認してください。',
      ],
      cite: ['op-gl-2025'],
    },
    {
      id: 'op-nutrient-role',
      group: '生活',
      title: '栄養素の役割',
      figure: <NutrientRoleFigure />,
      points: [
        'カルシウムは「材料」、ビタミンDは「運び手」、ビタミンKは「接着剤」、たんぱく質は「土台と筋肉」です。',
        'どれか1つだけを増やしても、うまく骨になりません。',
      ],
      talk: ['2025年版ではビタミンC・たんぱく質が重要栄養素として新たに記載されました。'],
      cite: ['op-gl-2025', 'dri-2025'],
    },
    {
      id: 'op-fall',
      group: '生活',
      title: '骨折の多くは「家の中」で起きています',
      figure: <FallPreventionMapFigure />,
      points: [
        '手すり（階段・浴室・トイレ）、足元灯（廊下・寝室）、滑り止め（浴室）が三大対策です。',
        '室内でもかかとのある靴をはくと、つまずきが減ります。',
        'カーペットの端・電気のコード・新聞の束は、転倒の原因になります。',
        '眠くなる薬・血圧の薬でふらつく場合は、必ずご相談ください。調整できることがあります。',
      ],
      talk: [
        '「同居のご家族と一緒に見直してください」と伝え、パンフレットを家族に見せるよう促してください。',
        '介護保険の住宅改修が使える場合があります。ケアマネジャーとの連携をご検討ください。',
      ],
      cite: ['op-gl-2025'],
    },

    // ---------------------------------------------------------------- 見通し
    {
      id: 'op-outlook',
      group: '見通し',
      title: 'これからの見通しと通院',
      points: [
        '骨粗鬆症の薬は、痛みを取る薬ではありません。「効いている実感」が持てないのが特徴です。',
        'それでも続けることで、骨折の危険は確実に下がります。',
        '骨密度は6〜12か月ごと、血液の検査（骨代謝マーカー）は3〜6か月後に確認して、効いているかを判定します。',
        '飲み忘れや、注射の予約忘れが心配なときは、遠慮なくご相談ください。続けやすい方法に変えられます。',
      ],
      highlight: {
        tone: 'info',
        text: '当院には骨粗鬆症の治療を続けるお手伝いをするスタッフがいます。困ったことがあれば、まずご相談ください。',
      },
      talk: [
        'アドヒアランスの確保は、薬剤選択そのものと同じくらい重要です。剤形（週1回・月1回・年1回・半年1回注射）の変更で解決することが多いです。',
        '骨粗鬆症リエゾンサービス（OLS）／骨粗鬆症マネージャーの関与を院内体制として説明してください。',
      ],
      cite: ['op-gl-2025', 'fls-standard'],
    },
  ]

  return slides.filter((s) => !s.when || s.when(session))
}

/** 選択した運動処方を1〜2枚のスライドにする */
function buildPrescriptionSlides(session: import('@/types').Session): Slide[] {
  const items = session.plan.prescription
  if (items.length === 0) return []
  return items.slice(0, 6).map((item, i) => {
    const e = getExercise(item.exerciseId)
    return {
      id: `ex-${item.exerciseId}`,
      group: '運動療法' as const,
      title: e ? `あなたの運動 ${i + 1}／${Math.min(6, items.length)}：${e.name}` : '運動',
      lead: `${item.reps}　${item.sets}　${item.frequency}`,
      figure: e ? <ExerciseFigure figure={e.figure} /> : undefined,
      points: e?.steps,
      highlight:
        e && e.stopRules.length > 0
          ? { tone: 'warn' as const, text: e.stopRules[0] }
          : undefined,
      talk: [
        e?.clinicalNote ?? '',
        '実際に診察室でやってみせて、患者さんに1回やってもらうと定着率が上がります。',
        'パンフレットに同じ図が印刷されます。',
      ].filter(Boolean),
      cite: e?.sources,
    }
  })
}
