import {
  KneeLoadFigure,
  KneeOaFigure,
  KneeTreatmentPyramidFigure,
  LocomoStageFigure,
  StandUpTestFigure,
} from '@/components/figures/knee'
import { FallPreventionMapFigure } from '@/components/figures/lifestyle'
import { ExerciseFigure } from '@/components/figures/exercise'
import { assessLocomo, calcBmi, kneeSummary, weightTarget } from '@/logic/locomo'
import { getDrug } from '@/data/drugs'
import { getExercise } from '@/data/exercises'
import type { Session } from '@/types'
import type { Slide, SlideBuilder } from './types'

export const buildKneeSlides: SlideBuilder = (session) => {
  const k = session.knee
  const loco = assessLocomo(session.locomo)
  const summary = kneeSummary(k, session.patient)
  const bmi = calcBmi(session.patient.heightCm, session.patient.weightKg)
  const target = weightTarget(session.patient.heightCm, session.patient.weightKg)
  const selectedDrugs = session.plan.drugIds.map(getDrug).filter(Boolean)

  const pyramidLevel: 1 | 2 | 3 | 4 | null = selectedDrugs.some((d) => d!.cls === 'ha-injection')
    ? 3
    : selectedDrugs.length > 0
      ? 2
      : 1

  const slides: Slide[] = [
    // ---------------------------------------------------------------- 現状
    {
      id: 'knee-status',
      group: '現状',
      title: summary.headline,
      figure: <KneeOaFigure klGrade={k.klGrade} varus={k.alignment === 'varus'} compartment={k.alignment === 'valgus' ? 'lateral' : 'medial'} />,
      points: [
        ...summary.body,
        '膝の骨と骨の間には「軟骨」というクッションがあります。これがすり減ると、骨に直接力がかかって痛みが出ます。',
        '軟骨は元には戻りませんが、まわりの筋肉を鍛えると痛みは軽くなり、進行を遅らせられます。',
      ],
      talk: [
        'レントゲンを見せながら説明できるとより効果的です。図はレントゲンの補助として使ってください。',
        '「軟骨がすり減っている＝手術しかない」という誤解を、次のスライドで解いてください。',
      ],
      cite: ['knee-gl-2023'],
    },
    {
      id: 'knee-locomo',
      group: '現状',
      title: `歩く力の段階：${loco.stage === null ? '未評価' : loco.stage === 0 ? '問題なし' : `ロコモ度${loco.stage}`}`,
      figure: <LocomoStageFigure stage={loco.stage} />,
      when: () => loco.stage !== null,
      points: [loco.message, ...loco.advice],
      talk: [
        'ロコモ度は「今の痛み」ではなく「これからの生活の見通し」を語るための指標です。',
        'ロコモ度2以上では運動器リハビリテーションの導入を積極的に提案してください。',
      ],
      cite: ['locomo-joa'],
    },
    {
      id: 'knee-standup',
      group: '現状',
      title: '立ち上がりテストの結果',
      figure: <StandUpTestFigure oneLegCm={session.locomo.standUpOneLegCm} bothLegCm={session.locomo.standUpBothLegCm} />,
      when: (s) => s.locomo.standUpOneLegCm !== null || s.locomo.standUpBothLegCm !== null,
      points: [
        '台から立ち上がる力は、下半身の筋力をそのまま表します。',
        '今の高さを覚えておいて、3か月後にもう一度測りましょう。低い台から立てるようになれば筋力がついた証拠です。',
      ],
      talk: ['数か月後に再測定して改善を示すことが、運動継続のもっとも強い動機づけになります。'],
      cite: ['locomo-joa'],
    },

    // ---------------------------------------------------------------- 治療
    {
      id: 'knee-pyramid',
      group: '治療',
      title: '治療は「下から順に」積み上げます',
      figure: <KneeTreatmentPyramidFigure level={pyramidLevel} />,
      points: [
        '土台は「運動療法・体重管理・装具」です。これはすべての方に行います。',
        'それでも痛みが残るときに、薬（まず貼り薬）、次に注射を加えます。',
        '手術は、痛みで生活が大きく制限され、他の方法で改善しないときの選択肢です。',
        '土台をしっかり続けることで、上の治療が必要になる時期を遅らせられます。',
      ],
      highlight: {
        tone: 'good',
        text: '運動療法は、国内外のガイドラインで最も確実に勧められている治療です。当院はここに力を入れています。',
      },
      talk: [
        '「注射をしてほしい」という要望に対し、運動療法を土台として位置づける根拠を示すスライドです。',
        '注射だけでは筋力は増えないことを明確に伝えてください。',
      ],
      cite: ['knee-gl-2023', 'oarsi'],
    },
    {
      id: 'knee-weight',
      group: '治療',
      title: '体重を1kg減らすと、膝は3kg分らくになります',
      figure: <KneeLoadFigure weightKg={session.patient.weightKg} targetLossKg={target} />,
      when: () => bmi !== null && bmi >= 25,
      points: [
        '平地を歩くとき、膝には体重の約3倍の力がかかります。階段では約5倍です。',
        'だから、少しの減量でも膝への効果は大きいのです。',
        '急激なダイエットは筋肉を落としてしまいます。運動と食事の両方で、ゆっくり進めましょう。',
      ],
      talk: [
        '減量は膝OAの疼痛・機能改善に対して最も確実な介入のひとつです。数字で示すと納得が得られます。',
        '筋肉量の維持のため、たんぱく質摂取と筋力訓練を併せて指導してください。',
      ],
      cite: ['knee-gl-2023', 'oarsi'],
    },
    {
      id: 'knee-drugs',
      group: '治療',
      title: selectedDrugs.length > 0 ? 'あなたに提案するお薬・処置' : 'お薬について',
      lead: selectedDrugs.length > 0 ? selectedDrugs.map((d) => d!.generic).join('／') : undefined,
      points:
        selectedDrugs.length > 0
          ? selectedDrugs.flatMap((d) => [`【${d!.generic}】${d!.plain}`, `使い方：${d!.schedule}`])
          : [
              'まずは貼り薬・塗り薬（外用）から。体への負担が少なくすみます。',
              'のみ薬は必要なときに短期間で。胃や腎臓への負担があるため、長く続けないようにします。',
              '関節内注射（ヒアルロン酸）は、関節の滑りをよくして痛みをやわらげます。',
            ],
      talk: [
        ...(selectedDrugs.length > 0 ? selectedDrugs.map((d) => `【${d!.generic}】${d!.clinicalNote}`) : []),
        '外用NSAIDsを第一に置く方針は、高齢者の消化管・腎機能への配慮からも合理的です。',
      ],
      cite: ['knee-gl-2023'],
    },

    // ---------------------------------------------------------------- 運動療法
    {
      id: 'knee-exercise-why',
      group: '運動療法',
      title: 'なぜ運動で膝の痛みが軽くなるのか',
      figure: <ExerciseFigure figure="quadSetting" />,
      points: [
        'ももの前の筋肉（大腿四頭筋）は、膝にかかる衝撃を吸収するクッションの役目をしています。',
        'この筋肉が弱ると、衝撃が直接関節にかかり、痛みが強くなります。',
        '筋肉を鍛えると、膝のぐらつきが減り、歩きやすくなります。',
        '関節を動かさずに力を入れる運動から始めれば、痛みが強い時期でも安全にできます。',
      ],
      highlight: {
        tone: 'good',
        text: '効果が出るまで、およそ6〜8週かかります。まずは3か月続けてみましょう。',
      },
      talk: [
        '「痛いから動かさない → 筋力低下 → もっと痛い」という悪循環を図で示すと理解されます。',
        '効果発現に時間がかかることを先に伝えておくと、途中脱落が減ります。',
      ],
      cite: ['knee-gl-2023', 'oarsi'],
    },
    ...buildKneePrescriptionSlides(session),

    // ---------------------------------------------------------------- 生活
    {
      id: 'knee-daily',
      group: '生活',
      title: '毎日の生活で膝を守る工夫',
      points: [
        '杖は「痛い方の反対の手」に持ちます。これで膝への負担が減ります。',
        '正座・和式トイレ・深いソファは膝に負担がかかります。椅子・洋式に変えましょう。',
        '重い物を運ぶときは、カートや台車を使いましょう。',
        '底が厚くクッション性のある靴をはくと、膝への衝撃がやわらぎます。',
        '痛みが強い日は無理をせず、椅子に座ってできる運動に切り替えてください。',
      ],
      talk: ['杖の持ち手を間違えている患者さんは非常に多いです。実際に持ってもらって確認してください。'],
      cite: ['knee-gl-2023'],
    },
    {
      id: 'knee-fall',
      group: '生活',
      title: '転倒を防ぐ家の工夫',
      figure: <FallPreventionMapFigure />,
      when: () => loco.stage !== null && loco.stage >= 1,
      points: [
        '膝の痛みで動きが遅くなると、転びやすくなります。',
        '手すり・足元灯・滑り止めの3つが基本の対策です。',
        '転倒して骨折すると、歩く力が一気に落ちてしまいます。',
      ],
      talk: ['ロコモ度1以上では転倒予防を必ずセットで指導してください。'],
      cite: ['locomo-joa', 'op-gl-2025'],
    },

    // ---------------------------------------------------------------- 見通し
    {
      id: 'knee-outlook',
      group: '見通し',
      title: 'これからの見通し',
      points: [
        '運動療法の効果は、始めて6〜8週で出てきます。まず3か月続けてみましょう。',
        '3か月後に、痛みと歩く力をもう一度測って比べます。',
        '運動を続けても痛みで生活が大きく制限される場合は、手術という選択肢も相談できます。',
        '「痛みをゼロにする」ことより、「やりたいことができる膝を保つ」ことを一緒に目指しましょう。',
      ],
      talk: [
        '再評価の日程を今日決めることが、運動継続率をもっとも上げます。',
        '手術のタイミングについては、患者の生活上の目標（旅行・孫の世話・仕事）を軸に相談すると納得が得られます。',
      ],
      cite: ['knee-gl-2023'],
    },
  ]

  return slides.filter((s) => !s.when || s.when(session))
}

function buildKneePrescriptionSlides(session: Session): Slide[] {
  const items = session.plan.prescription
  if (items.length === 0) return []
  return items.slice(0, 6).map((item, i) => {
    const e = getExercise(item.exerciseId)
    return {
      id: `knee-ex-${item.exerciseId}`,
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
