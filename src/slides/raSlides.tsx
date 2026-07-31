import {
  ActivityMeterFigure,
  JointDestructionFigure,
  MtxCalendarFigure,
  RaAlgorithmFigure,
  RaJointMapFigure,
  SynoviumFigure,
  T2TFigure,
  WindowOfOpportunityFigure,
} from '@/components/figures/joint'
import { CostFigure } from '@/components/figures/lifestyle'
import { ExerciseFigure } from '@/components/figures/exercise'
import { ACTIVITY_PLAIN, assessRa } from '@/logic/ra'
import { getDrug } from '@/data/drugs'
import { getExercise } from '@/data/exercises'
import type { Session } from '@/types'
import type { Slide, SlideBuilder } from './types'

export const buildRaSlides: SlideBuilder = (session) => {
  const a = assessRa(session.ra, session.clinicalSettings)
  const r = session.ra
  const selectedDrugs = session.plan.drugIds.map(getDrug).filter(Boolean)
  const hasMtx = session.plan.drugIds.includes('mtx')
  const hasBio = session.plan.drugIds.some((id) => ['tnf-inhibitor', 'il6-inhibitor', 'abatacept', 'jak-inhibitor'].includes(id))
  const early = r.durationMonths !== null && r.durationMonths <= 24

  const phase: 1 | 2 | 3 | null = hasBio
    ? session.ra.currentTherapy.some((t) => /bDMARD|生物|JAK/i.test(t))
      ? 3
      : 2
    : hasMtx
      ? 1
      : null

  const slides: Slide[] = [
    // ---------------------------------------------------------------- 現状
    {
      id: 'ra-activity',
      group: '現状',
      title: `いまの炎症の強さ：${ACTIVITY_PLAIN[a.primary.score.level]}`,
      lead:
        a.primary.score.value !== null
          ? `${a.primary.name} ${a.primary.score.value}（腫れ ${r.swollenJoints28 ?? '—'}／28、痛み ${r.tenderJoints28 ?? '—'}／28、CRP ${r.crp ?? '—'} mg/dL）`
          : undefined,
      figure: <ActivityMeterFigure name={a.primary.name} value={a.primary.score.value} level={a.primary.score.level} />,
      points: [
        '関節の腫れの数・痛みの数・ご自身の感じ方・血液の炎症の数値を合わせて、炎症の強さを点数にしています。',
        '毎回同じ方法で測るので、「よくなっているか」を客観的に比べられます。',
        '目標は、メーターの左側（炎症がほぼない状態）に入ることです。',
      ],
      talk: [
        '「なんとなく良い／悪い」ではなく数値で共有することが、T2Tの出発点です。',
        '患者VASは必ず患者さん自身に指で示してもらってください。医師の推測で入れると意味が薄れます。',
      ],
      cite: ['ra-gl-2024', 't2t'],
    },
    {
      id: 'ra-joints',
      group: '現状',
      title: '炎症が起きている関節',
      figure: <RaJointMapFigure regions={r.affectedRegions} />,
      when: (s) => s.ra.affectedRegions.length > 0,
      points: [
        'リウマチは、手足の小さな関節から、左右対称に始まることが多い病気です。',
        '朝、手がこわばって握りにくい（30分以上続く）のが典型的なサインです。',
        '腫れている関節の数が減っていくことが、治療がうまくいっているしるしです。',
      ],
      talk: ['図を見せながら、実際に腫れている関節を触って確認すると納得が得られます。'],
      cite: ['ra-gl-2024'],
    },

    // ---------------------------------------------------------------- 病気のしくみ
    {
      id: 'ra-synovium',
      group: '病気のしくみ',
      title: 'リウマチは、関節の「内張り」が腫れる病気です',
      figure: <SynoviumFigure />,
      points: [
        '関節の内側には「滑膜」という薄い内張りがあり、関節を滑らかに動かす液を出しています。',
        'リウマチでは、自分の免疫がこの内張りを間違って攻撃し、厚く腫れてしまいます。',
        '腫れた内張りから出る物質が、クッション（軟骨）と骨をとかしていきます。',
        'だから「腫れ」と「朝のこわばり」が出るのです。',
      ],
      talk: [
        '「免疫が自分を攻撃する」ことは、患者さんにとって受け入れにくい情報です。',
        '「体質のせいでも、生活のせいでもありません」と一言添えると、罪悪感を持たずに治療に向き合えます。',
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-destruction',
      group: '病気のしくみ',
      title: '炎症を止めないと、関節はこの順にこわれます',
      figure: <JointDestructionFigure current={r.erosion ? 2 : 1} />,
      points: [
        '腫れが続くと、まず骨のふちがとけ（骨びらん）、次に軟骨が失われます。',
        '最後には関節が変形して、動かなくなります。',
        '一度こわれた関節は、どんなに良い薬を使っても元には戻りません。',
      ],
      highlight: {
        tone: 'warn',
        text: 'だから「痛みが軽いうちに、しっかり炎症を止める」のが治療の考え方です。',
      },
      talk: [
        r.erosion
          ? 'すでに骨びらんがあります。「関節の中では進行が始まっています」と明確に伝え、治療強化の根拠にしてください。'
          : 'まだ骨破壊がない段階です。「今なら止められる」というメッセージが効果的です。',
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-window',
      group: '病気のしくみ',
      title: '最初の2年が勝負です',
      figure: <WindowOfOpportunityFigure />,
      when: () => early,
      points: [
        '関節がこわれるスピードは、発症してからの最初の2年間が最も速いです。',
        'この時期にしっかり炎症を抑えられると、その後の変形をかなり防げます。',
        '逆に、この時期を逃すと、あとから追いつくのが難しくなります。',
      ],
      talk: [
        'window of opportunity の概念です。早期例では治療強化のためらいを減らす説明として有効です。',
      ],
      cite: ['ra-gl-2024'],
    },

    // ---------------------------------------------------------------- 治療
    {
      id: 'ra-t2t',
      group: '治療',
      title: '目標を決めて、期限を決めて治療します',
      figure: <T2TFigure monthsOnTherapy={null} />,
      points: [
        '目標は「炎症がほぼない状態（寛解）」です。',
        '長く患っている方・ご高齢の方・他の病気がある方では、「炎症が弱い状態」を現実的な目標にします。',
        '3か月ごとに炎症の強さを測り、6か月たっても目標に届かなければ、治療内容を見直します。',
        '「効かない薬を我慢して続ける」ことはしません。',
      ],
      talk: [
        ...a.t2tComment,
        '「期限を決める」ことを最初に伝えておくと、治療変更の提案がスムーズになります。',
      ],
      cite: ['ra-gl-2024', 't2t'],
    },
    {
      id: 'ra-algorithm',
      group: '治療',
      title: '治療は段階を追って進めます',
      figure: <RaAlgorithmFigure currentPhase={phase} />,
      points: [
        'まずメトトレキサート（MTX）から始めます。リウマチ治療の基本になる薬です。',
        'MTXで十分に炎症が収まらないときは、生物学的製剤（注射）またはJAK阻害薬（のみ薬）を追加します。',
        'それでも不十分なら、別の薬に切り替えます。選択肢は複数あります。',
        '2024年のガイドラインでは、まず生物学的製剤を検討することが優先されています。',
      ],
      talk: [
        '「薬が増える／変わる」ことは治療の失敗ではなく、計画どおりの段階の進行であることを伝えてください。',
        'MTXは経口・皮下注のどちらも選択できます（皮下注は2022年から保険適用、GL2024でアルゴリズムに追加）。',
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-mtx',
      group: '治療',
      title: 'メトトレキサートは「週に1回だけ」',
      figure: <MtxCalendarFigure />,
      when: () => hasMtx,
      points: [
        '毎日飲む薬ではありません。決めた曜日に、週1回だけ飲みます。',
        '飲まない日に葉酸の薬を飲むことで、副作用を減らせます。',
        '効果が出てくるまで4〜8週かかります。すぐに効かなくても、続けることが大切です。',
        '飲み忘れたら、翌日までなら飲めます。それ以降は飛ばして次の週にしてください。',
      ],
      highlight: {
        tone: 'warn',
        text: '口の中があれる・のどが痛い・熱が出る・息切れや空咳が続く・発疹が出る、これらが出たら薬を飲まずにすぐご連絡ください。',
      },
      talk: [
        '連日服用による重篤な骨髄抑制は、実際に起きている医療事故です。曜日を具体的に指定し、お薬カレンダーの利用を勧めてください。',
        'ご家族にも同じ説明をしておくと、事故を防げます。',
        '定期的な血液検査（開始3か月は2〜4週ごと）の必要性を必ず伝えてください。',
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-drugs',
      group: '治療',
      title: selectedDrugs.length > 0 ? 'あなたに提案するお薬' : 'お薬の種類',
      lead: selectedDrugs.length > 0 ? selectedDrugs.map((d) => d!.generic).join('／') : undefined,
      points:
        selectedDrugs.length > 0
          ? selectedDrugs.flatMap((d) => [`【${d!.generic}】${d!.plain}`, `使い方：${d!.schedule}`])
          : [
              'まずメトトレキサート。効果が不十分なら生物学的製剤またはJAK阻害薬を追加します。',
              '生物学的製剤は注射薬で、自宅で自己注射できるものもあります。',
              'JAK阻害薬はのみ薬で、効き始めが早いのが特長です。',
            ],
      talk: [
        ...(selectedDrugs.length > 0 ? selectedDrugs.map((d) => `【${d!.generic}】${d!.clinicalNote}`) : []),
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-safety',
      group: '治療',
      title: '安全に使うために気をつけること',
      when: () => selectedDrugs.length > 0,
      points: [
        '免疫を抑える薬なので、感染症にかかりやすくなります。発熱・咳・のどの痛み・排尿時の痛みは早めにご相談ください。',
        '治療を始める前に、結核とB型肝炎の検査を行います。',
        '生ワクチン（麻疹・風疹・水痘・帯状疱疹の生ワクチンなど）は使えません。インフルエンザ・肺炎球菌・帯状疱疹の不活化ワクチンは接種をおすすめします。',
        '手術や抜歯の予定があるときは、事前にお知らせください。',
        '定期的な血液検査を必ず受けてください。',
      ],
      highlight: {
        tone: 'info',
        text: '「風邪くらいで受診してよいのか」と迷ったら、遠慮なくご連絡ください。早めの相談がいちばん安全です。',
      },
      talk: [
        ...a.cautions,
        '「症状が出たら中止して連絡」という行動の指示まで落とし込むことが重要です。',
      ],
      cite: ['ra-gl-2024'],
    },
    {
      id: 'ra-cost',
      group: '治療',
      title: '治療費について',
      figure: (
        <CostFigure
          rows={[
            { label: 'メトトレキサート（のみ薬）', monthly: '約 500〜1,500円', note: '3割負担' },
            { label: 'メトトレキサート（皮下注）', monthly: '約 3,000〜4,000円', note: '3割負担' },
            { label: '生物学的製剤', monthly: '約 25,000〜45,000円', note: 'バイオシミラーでより低額に' },
            { label: 'JAK阻害薬（のみ薬）', monthly: '約 40,000〜45,000円', note: '3割負担' },
          ]}
        />
      ),
      when: () => hasBio,
      points: [
        '生物学的製剤やJAK阻害薬は高額ですが、「高額療養費制度」で自己負担に上限があります。',
        '「バイオシミラー（後続品）」を選ぶと、効果・安全性は同じで費用を抑えられます。',
        '加入している健康保険の付加給付や、自治体の助成が使える場合があります。',
        '費用が心配な場合は、遠慮なくご相談ください。受付でも手続きのご案内ができます。',
      ],
      talk: [
        '費用は治療中断の大きな理由です。切り出しにくい話題なので、医療者側から必ず触れてください。',
        '高額療養費制度の限度額適用認定証、付加給付、自治体助成の3つを案内できると、実際の負担がかなり下がります。',
        '※金額は薬価改定・製剤によって変わります。院内で最新の金額をご確認ください。',
      ],
      cite: ['ra-gl-2024'],
    },

    // ---------------------------------------------------------------- 運動療法
    {
      id: 'ra-exercise-why',
      group: '運動療法',
      title: '運動は「炎症の強さ」に合わせて変えます',
      figure: <ExerciseFigure figure="quadSetting" />,
      points: [
        '関節が赤く熱をもって強く腫れている時期は、その関節を休ませることが優先です。',
        'ただし、まったく動かさないと関節が固まり、筋肉が落ちてしまいます。',
        'そこで、関節を動かさずに筋肉に力を入れる運動（等尺性運動）から始めます。',
        '炎症が落ち着いてきたら、関節を動かす運動・歩く運動へ進めていきます。',
      ],
      highlight: {
        tone: 'good',
        text: '当院では理学療法士が、炎症の状態に応じた運動の内容と強さを一緒に調整します。',
      },
      talk: [
        '「安静か運動か」の二択ではなく、「時期に応じて内容を変える」という考え方を伝えてください。',
        '患者教育と組み合わせた能動的運動療法が基本であり、温熱・電気療法は補助的手段です。',
      ],
      cite: ['ra-gl-2024'],
    },
    ...buildRaPrescriptionSlides(session),
    {
      id: 'ra-joint-protect',
      group: '運動療法',
      title: '関節を守る「使い方」を身につけましょう',
      figure: <ExerciseFigure figure="jointProtect" />,
      points: [
        '重い物は、指先でつまむのではなく、両手のひら全体で持ちます。',
        'ペットボトルのふたや蛇口は、オープナーやレバー式に変えると楽になります。',
        '同じ姿勢を30〜60分以上続けないようにします。',
        '「疲れる前に休む」。痛くなってから休むのでは遅いのです。',
        '低い椅子・深いソファ・和式トイレは関節に負担がかかります。高めの椅子・洋式に変えましょう。',
      ],
      talk: [
        '関節保護の指導は、患者主観的な身体機能の改善にエビデンスがあります。自助具の実物を見せられるとより効果的です。',
        '作業療法士・理学療法士による個別指導につなげてください。',
      ],
      cite: ['ra-gl-2024'],
    },

    // ---------------------------------------------------------------- 生活
    {
      id: 'ra-lifestyle',
      group: '生活',
      title: '毎日の生活でできること',
      points: [
        '禁煙：喫煙はリウマチを悪くし、薬の効きも悪くします。禁煙外来をご案内できます。',
        '歯みがき・歯科の定期受診：歯周病はリウマチの活動性と関係しています。',
        '感染予防：手洗い・うがい、人混みでのマスク、ワクチン接種。',
        '骨を守る：リウマチ自体と、ステロイドを使う場合は骨がもろくなります。骨密度も測っていきます。',
        '疲れをためない：無理をした翌日に強く痛むなら、その日のやり方を見直しましょう。',
      ],
      talk: [
        '禁煙は薬剤の効果に影響する介入可能因子です。必ず毎回確認してください。',
        'RAは骨粗鬆症の危険因子です。DXAの定期測定を治療計画に組み込んでください。',
      ],
      cite: ['ra-gl-2024', 'op-gl-2025'],
    },

    // ---------------------------------------------------------------- 見通し
    {
      id: 'ra-outlook',
      group: '見通し',
      title: 'これからの見通し',
      points: [
        '今のリウマチ治療は、「炎症をほぼゼロにして、関節を守りながら普通に生活する」ことを目標にできます。',
        'そのために、3か月ごとに評価しながら薬を調整していきます。',
        '炎症が落ち着いた状態が長く続けば、薬を減らせる場合もあります（まずステロイド、次に生物学的製剤の間隔を延ばします）。',
        '自己判断で薬をやめると、再び炎症が強くなることがあります。減らすときは必ず相談しながら進めます。',
      ],
      highlight: {
        tone: 'good',
        text: '「一生このままなのか」と不安になりますが、治療がうまくいけば、痛みのない日常を取り戻せる病気です。',
      },
      talk: [
        '寛解維持後の減量順序（GC → bDMARD/JAK の減量・間隔延長 → MTX）を説明しておくと、患者の期待値を適切に保てます。',
        '寛解でも画像上の進行がある例があるため、画像評価の継続を伝えてください。',
      ],
      cite: ['ra-gl-2024', 't2t'],
    },
  ]

  return slides.filter((s) => !s.when || s.when(session))
}

function buildRaPrescriptionSlides(session: Session): Slide[] {
  const items = session.plan.prescription
  if (items.length === 0) return []
  return items.slice(0, 6).map((item, i) => {
    const e = getExercise(item.exerciseId)
    return {
      id: `ra-ex-${item.exerciseId}`,
      group: '運動療法' as const,
      title: e ? `あなたの運動 ${i + 1}／${Math.min(6, items.length)}：${e.name}` : '運動',
      lead: `${item.reps}　${item.sets}　${item.frequency}`,
      figure: e ? <ExerciseFigure figure={e.figure} /> : undefined,
      points: e?.steps,
      highlight: e && e.stopRules.length > 0 ? { tone: 'warn' as const, text: e.stopRules[0] } : undefined,
      talk: [e?.clinicalNote ?? '', '診察室で1回やってもらうと定着します。'].filter(Boolean),
      cite: e?.sources,
    }
  })
}
