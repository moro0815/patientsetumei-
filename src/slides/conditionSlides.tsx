import { getCondition } from '@/data/conditions'
import { getExercise } from '@/data/exercises'
import { getDrug } from '@/data/drugs'
import { assessCondition, currentPhaseIndex, labelsOf, sideLabel } from '@/logic/condition'
import { ExerciseFigure } from '@/components/figures/exercise'
import { PainScaleFigure, RecoveryTimelineFigure, TreatmentLadderFigure, type BodySpot } from '@/components/figures/generic'
import { BodyMapConnected } from '@/components/figures/connected'
import type { ConditionKey, Session } from '@/types'
import type { Slide, SlideBuilder } from './types'

/**
 * 症状別疾患の説明スライドを、疾患モデルから生成する。
 *
 * スライドの並びは、診察室での説明の順序そのもの。
 *   現状 → 病気のしくみ → 見通し → 治療 → 運動療法 → 生活
 *
 * 「見通し（いつ治るのか）」を治療より前に置いているのは、
 * 患者さんがいちばん知りたいことであり、ここに納得があると
 * そのあとの治療の説明が入りやすくなるため。
 */

/** 疾患ごとに、体の地図のどこに印をつけるか */
const SPOT_MAP: Record<ConditionKey, (side: string | null) => BodySpot[]> = {
  lumbarStenosis: () => ['lowBack'],
  lumbarDiscHernia: (s) => ['lowBack', s === 'left' ? 'thighBackL' : 'thighBackR'],
  cervicalRadiculopathy: (s) => ['neck', s === 'left' ? 'elbowL' : 'elbowR'],
  vertebralFracture: () => ['lowBack'],
  frozenShoulder: (s) => [s === 'left' ? 'shoulderL' : 'shoulderR'],
  tennisElbow: (s) => [s === 'left' ? 'elbowL' : 'elbowR'],
  triggerFinger: (s) => [s === 'left' ? 'handL' : 'handR'],
  deQuervain: (s) => (s === 'both' ? ['handL', 'handR'] : s === 'left' ? ['handL'] : ['handR']),
  hipOA: (s) => (s === 'both' ? ['hipL', 'hipR'] : s === 'left' ? ['hipL'] : ['hipR']),
  plantarFasciitis: (s) => (s === 'both' ? ['heelL', 'heelR'] : s === 'left' ? ['heelL'] : ['heelR']),
  ankleSprain: (s) => [s === 'left' ? 'ankleL' : 'ankleR'],
  muscleStrain: (s) => [s === 'left' ? 'thighBackL' : 'thighBackR'],
  shinSplints: (s) => (s === 'both' ? ['shinL', 'shinR'] : s === 'left' ? ['shinL'] : ['shinR']),
}

export const buildConditionSlides: SlideBuilder = (session) => {
  const def = getCondition(session.disease)
  if (!def) return []

  const c = session.condition
  const a = assessCondition(c, def)
  const phaseIndex = currentPhaseIndex(c, def)
  const selectedSymptoms = labelsOf(c.symptoms, def.symptomOptions)
  const spots = SPOT_MAP[def.key]?.(c.side) ?? []
  const selectedDrugs = session.plan.drugIds.map(getDrug).filter(Boolean)

  const slides: Slide[] = [
    // ---------------------------------------------------------------- 現状
    {
      id: `${def.key}-status`,
      group: '現状',
      title: `${sideLabel(c.side)}${def.label}`,
      lead: def.oneLiner,
      // 図から直接入力できるようにする（患者さんが指した場所を押して足せる）
      figure: <BodyMapConnected defaults={spots} caption="いま痛みが出ている場所" />,
      points: [
        ...(selectedSymptoms.length > 0
          ? [`今日うかがった症状：${selectedSymptoms.slice(0, 4).join('、')}`]
          : []),
        ...(c.duration ? [`症状が始まってから：${def.duration.find((d) => d.id === c.duration)?.label}`] : []),
        ...(c.stage && def.stages
          ? [`${def.stagesLabel ?? '病期'}：${def.stages.find((s) => s.id === c.stage)?.label}（${def.stages.find((s) => s.id === c.stage)?.detail}）`]
          : []),
      ],
      talk: [
        '最初に「今日わかったこと」を短くまとめると、患者さんは以降の説明を聞く姿勢になります。',
        `この疾患の説明の目安は約${def.minutes}分です。`,
      ],
      cite: def.sources,
    },
    {
      id: `${def.key}-pain`,
      group: '現状',
      title: 'いまの痛みの強さ',
      figure: <PainScaleFigure value={c.painNrs} />,
      when: (s) => s.condition.painNrs !== null,
      points: [
        '今日の痛みの強さを記録しておきます。',
        '次回、同じ物差しで測ることで、治療が効いているかがはっきり分かります。',
      ],
      talk: ['数値化しておくと、次回の効果判定と治療方針の変更判断が容易になります。'],
    },

    // ---------------------------------------------------------------- 病気のしくみ
    {
      id: `${def.key}-what`,
      group: '病気のしくみ',
      title: '体の中で何が起きているのか',
      figure: def.figure(c, session),
      points: def.what,
      talk: def.mechanismTalk,
      cite: def.sources,
    },
    {
      id: `${def.key}-why`,
      group: '病気のしくみ',
      title: 'なぜ痛み・しびれが出るのか',
      points: def.whyPain,
      talk: def.mechanismTalk,
      cite: def.sources,
    },
    ...(def.extraFigures ?? []).map((f) => ({
      id: `${def.key}-${f.id}`,
      group: f.group,
      title: f.title,
      lead: f.lead,
      figure: f.node(c, session),
      points: f.points,
      talk: f.talk,
      cite: def.sources,
    })),

    // ---------------------------------------------------------------- 見通し
    {
      id: `${def.key}-course`,
      group: '見通し',
      title: def.course.headline,
      lead: 'いちばん気になるのは「いつ治るのか」だと思います',
      figure: <RecoveryTimelineFigure phases={def.course.phases} currentIndex={phaseIndex} />,
      points: def.course.points,
      talk: def.course.talk,
      cite: def.sources,
    },

    // ---------------------------------------------------------------- 治療
    {
      id: `${def.key}-ladder`,
      group: '治療',
      title: '治療は下の段から積み上げます',
      figure: <TreatmentLadderFigure steps={def.treatments.map((t) => t.title)} current={a.suggestedStep} />,
      points: [
        '土台は運動療法と生活の工夫です。これはすべての方に行います。',
        'それでも足りないときに、薬・注射と段を上げていきます。',
        '土台をしっかり続けるほど、上の治療が必要になる時期を遅らせられます。',
      ],
      highlight: {
        tone: 'good',
        text: '当院は運動療法に力を入れています。ここが治療のいちばんの土台です。',
      },
      talk: def.treatmentTalk,
      cite: def.sources,
    },
    ...def.treatments.map((t, i) => ({
      id: `${def.key}-tx-${i}`,
      group: '治療' as const,
      title: `${i + 1}. ${t.title}`,
      points: t.points,
      highlight:
        i + 1 === a.suggestedStep
          ? { tone: 'info' as const, text: 'いま、あなたに提案しているのはこの段です。' }
          : undefined,
      talk: [t.note ?? ''].filter(Boolean),
      cite: def.sources,
    })),
    {
      id: `${def.key}-drugs`,
      group: '治療',
      title: 'あなたに提案するお薬',
      lead: selectedDrugs.map((d) => d!.generic).join('／'),
      when: (s) => s.plan.drugIds.length > 0,
      points: selectedDrugs.flatMap((d) => [`【${d!.generic}】${d!.plain}`, `使い方：${d!.schedule}`]),
      talk: selectedDrugs.map((d) => `【${d!.generic}】${d!.clinicalNote}`),
    },

    // ---------------------------------------------------------------- 運動療法
    {
      id: `${def.key}-exercise-why`,
      group: '運動療法',
      title: 'なぜ運動が効くのか',
      figure: (() => {
        const first = def.exercise.recommendedIds[0]
        const e = first ? getExercise(first) : undefined
        return e ? <ExerciseFigure figure={e.figure} /> : undefined
      })(),
      points: def.exercise.why,
      highlight: {
        tone: 'warn',
        text: def.exercise.cautions[0] ?? '痛みが強くなる動きは避けてください。',
      },
      talk: def.exercise.talk,
      cite: def.sources,
    },
    ...buildPrescriptionSlides(session, def.key),

    // ---------------------------------------------------------------- 生活
    {
      id: `${def.key}-selfcare`,
      group: '生活',
      title: '毎日の生活でできる工夫',
      points: def.selfCare,
      talk: ['具体的な動作に落とし込むほど実行率が上がります。1〜2個に絞って「今日から」と伝えてください。'],
      cite: def.sources,
    },
    {
      id: `${def.key}-avoid`,
      group: '生活',
      title: '避けたほうがよいこと',
      points: def.avoid,
      highlight: {
        tone: 'warn',
        text: '「やってはいけないこと」を1つだけ覚えて帰ってください。',
      },
    },
    {
      id: `${def.key}-warn`,
      group: '見通し',
      title: 'こんなときは、すぐご連絡ください',
      points: def.warnSigns,
      highlight: {
        tone: 'warn',
        text: '上のような症状が出たら、次回の予約を待たずに受診してください。',
      },
      talk: ['レッドフラッグは、パンフレットにも必ず印刷されます。口頭とあわせて渡してください。'],
    },
    {
      id: `${def.key}-next`,
      group: '見通し',
      title: '次回の予定',
      points: [
        `次回の来院：${session.plan.nextVisit || def.nextVisit}`,
        '次回は、今日と同じ物差しで痛みと動きを測って、治療が効いているかを確かめます。',
        '気になることは、パンフレットのメモ欄に書いてお持ちください。',
      ],
      talk: ['再評価の日程を今日決めることが、治療の継続率をもっとも上げます。'],
    },
  ]

  return slides.filter((s) => !s.when || s.when(session))
}

function buildPrescriptionSlides(session: Session, key: string): Slide[] {
  const items = session.plan.prescription
  if (items.length === 0) return []
  return items.slice(0, 6).map((item, i) => {
    const e = getExercise(item.exerciseId)
    return {
      id: `${key}-ex-${item.exerciseId}`,
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
