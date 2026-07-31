import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import type { ClinicConfig } from '@/data/clinic'
import { getDrug, needsDentalCoordination, needsSequentialTherapy } from '@/data/drugs'
import { getExercise } from '@/data/exercises'
import { LIFESTYLE_ITEMS, NUTRIENTS, NUTRITION_AVOID } from '@/data/nutrition'
import { LAB_ORDERS } from '@/data/fees'
import { assessOsteoporosis, bmdPlainLanguage, fmtT } from '@/logic/osteoporosis'
import { ACTIVITY_PLAIN, assessRa } from '@/logic/ra'
import { assessLocomo, calcBmi, kneeSummary, weightTarget } from '@/logic/locomo'
import { DISEASE_LABEL } from '@/state/session'
import { ExerciseFigure } from '@/components/figures/exercise'
import {
  TrabecularBoneFigure,
  BmdCurveFigure,
  FractureCascadeFigure,
  FractureSitesFigure,
  TreatmentPillarsFigure,
} from '@/components/figures/bone'
import {
  SynoviumFigure,
  JointDestructionFigure,
  MtxCalendarFigure,
  WindowOfOpportunityFigure,
  T2TFigure,
} from '@/components/figures/joint'
import { KneeOaFigure, KneeLoadFigure, KneeTreatmentPyramidFigure } from '@/components/figures/knee'
import { DailyFoodFigure, FallPreventionMapFigure } from '@/components/figures/lifestyle'
import type { Session } from '@/types'

/**
 * 患者さんにお渡しするパンフレット（A4・印刷用）
 *
 * 設計
 * - 画面上ではA4サイズのプレビュー、印刷時は @media print で紙面にそのまま流れる。
 * - PDFにしたい場合はブラウザの印刷ダイアログで「PDFに保存」を選ぶ。
 *   （日本語フォントの埋め込みでつまずかず、どの端末でも同じ結果になる）
 * - 「書き込める」ことを重視：運動記録表、質問メモ欄を用意する。
 */

export type PamphletSection =
  | 'cover'
  | 'mechanism'
  | 'treatment'
  | 'exercise'
  | 'record'
  | 'nutrition'
  | 'fall'
  | 'schedule'

export const SECTION_LABELS: { key: PamphletSection; label: string; detail: string }[] = [
  { key: 'cover', label: '表紙・今日わかったこと', detail: 'お名前・検査結果・今日決めたことの要約' },
  { key: 'mechanism', label: '病気のしくみ', detail: '図による解説' },
  { key: 'treatment', label: 'お薬の説明', detail: '選んだ薬の使い方と注意点' },
  { key: 'exercise', label: '運動処方', detail: '図入りの運動メニュー' },
  { key: 'record', label: '運動記録表', detail: '1か月分のチェック表（書き込み用）' },
  { key: 'nutrition', label: '食事・生活', detail: '栄養の目標と生活の工夫' },
  { key: 'fall', label: '転倒予防', detail: '家の中の対策（骨粗鬆症・ロコモ向け）' },
  { key: 'schedule', label: '次回の予定・連絡先', detail: '通院予定と困ったときの連絡先' },
]

export function Pamphlet({
  session,
  clinic,
  sections,
}: {
  session: Session
  clinic: ClinicConfig
  sections: PamphletSection[]
}) {
  const has = (s: PamphletSection) => sections.includes(s)
  const large = session.view.pamphletScale === 'large'
  const base = large ? 'text-[13pt] leading-[1.85]' : 'text-[10.5pt] leading-[1.7]'

  return (
    <div className={`print-root ${base}`}>
      {has('cover') && <CoverSheet session={session} clinic={clinic} />}
      {has('mechanism') && <MechanismSheet session={session} />}
      {has('treatment') && session.plan.drugIds.length > 0 && <TreatmentSheet session={session} clinic={clinic} />}
      {has('exercise') && session.plan.prescription.length > 0 && <ExerciseSheet session={session} />}
      {has('record') && session.plan.prescription.length > 0 && <RecordSheet session={session} />}
      {has('nutrition') && <NutritionSheet session={session} />}
      {has('fall') && session.disease !== 'ra' && <FallSheet />}
      {has('schedule') && <ScheduleSheet session={session} clinic={clinic} />}
    </div>
  )
}

// ================================================================ 共通部品

function Sheet({ children, title, page }: { children: ReactNode; title?: string; page?: string }) {
  return (
    <section className="sheet">
      {title && (
        <div className="mb-3 flex items-end justify-between border-b-2 border-slate-700 pb-1.5">
          <h2 className="text-[15pt] font-extrabold text-slate-900">{title}</h2>
          {page && <span className="text-[9pt] text-slate-500">{page}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

function Box({
  title,
  children,
  tone = 'plain',
  className = '',
}: {
  title?: string
  children: ReactNode
  tone?: 'plain' | 'fill' | 'warn'
  className?: string
}) {
  const styles = {
    plain: 'border-slate-400',
    fill: 'border-slate-400 print-fill-light bg-slate-100',
    warn: 'border-slate-800 bg-white',
  }
  return (
    <div className={`avoid-break print-box rounded border ${styles[tone]} p-3 ${className}`}>
      {title && <p className="mb-1.5 text-[11pt] font-extrabold text-slate-900">{title}</p>}
      {children}
    </div>
  )
}

function WriteLines({ n = 3, label }: { n?: number; label?: string }) {
  return (
    <div className="avoid-break">
      {label && <p className="mb-1 text-[10pt] font-bold text-slate-700">{label}</p>}
      <div className="space-y-4">
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className="border-b border-dotted border-slate-400" />
        ))}
      </div>
    </div>
  )
}

// ================================================================ 表紙

function CoverSheet({ session, clinic }: { session: Session; clinic: ClinicConfig }) {
  const { patient, disease } = session
  const findings = buildFindings(session)
  const decisions = buildDecisions(session)

  return (
    <Sheet>
      {/* ヘッダー */}
      <div className="mb-5 flex items-start justify-between border-b-4 border-slate-800 pb-3">
        <div>
          <p className="text-[11pt] font-bold text-slate-600">{clinic.name}</p>
          <p className="text-[9pt] text-slate-500">{clinic.department}</p>
        </div>
        <div className="text-right text-[9pt] text-slate-600">
          <p>
            {clinic.postalCode && `〒${clinic.postalCode}　`}
            {clinic.address}
          </p>
          <p>TEL {clinic.tel}</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        <p className="text-[10pt] font-bold text-slate-500">あなたの病気と治療について</p>
        <h1 className="mt-1 text-[26pt] font-extrabold leading-tight text-slate-900">{DISEASE_LABEL[disease]}</h1>
        <p className="mt-2 text-[10pt] text-slate-600">{clinic.tagline}</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Box tone="fill">
          <p className="text-[9pt] text-slate-500">お名前</p>
          <p className="text-[14pt] font-bold text-slate-900">{patient.displayName || '　'}</p>
        </Box>
        <Box tone="fill">
          <p className="text-[9pt] text-slate-500">説明した日</p>
          <p className="text-[14pt] font-bold text-slate-900">{formatJpDate(patient.visitDate)}</p>
        </Box>
        <Box tone="fill">
          <p className="text-[9pt] text-slate-500">担当医</p>
          <p className="text-[14pt] font-bold text-slate-900">{patient.doctorName || '　'}</p>
        </Box>
      </div>

      <Box title="■ 今日わかったこと（あなたの検査結果）" className="mb-4">
        <table className="w-full text-[10.5pt]">
          <tbody>
            {findings.map((f, i) => (
              <tr key={i} className="border-b border-slate-200 last:border-0">
                <th className="w-[36%] py-1.5 pr-2 text-left align-top font-bold text-slate-700">{f.label}</th>
                <td className="py-1.5 align-top">
                  <span className="text-[12pt] font-extrabold text-slate-900">{f.value}</span>
                  {f.note && <span className="ml-2 text-[9.5pt] text-slate-600">{f.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box title="■ 今日決めたこと" tone="warn" className="mb-4">
        <ol className="space-y-1.5">
          {decisions.map((d, i) => (
            <li key={i} className="flex gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-800 text-[9pt] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[11pt] leading-snug">{d}</span>
            </li>
          ))}
        </ol>
      </Box>

      {session.plan.doctorMessage && (
        <Box title="■ 担当医から" className="mb-4">
          <p className="text-[11.5pt] font-bold leading-relaxed text-slate-800">{session.plan.doctorMessage}</p>
        </Box>
      )}

      <WriteLines n={3} label="■ 聞きたいこと・気になることを書いておきましょう（次回お持ちください）" />

      <p className="mt-6 text-[8.5pt] leading-relaxed text-slate-500">
        このパンフレットは、診察でお話しした内容をまとめたものです。あなたの状態に合わせて作成しているため、
        ほかの方には当てはまらないことがあります。内容についてわからないことがあれば、遠慮なくお尋ねください。
      </p>
    </Sheet>
  )
}

function buildFindings(session: Session): { label: string; value: string; note?: string }[] {
  const { patient, disease } = session
  const out: { label: string; value: string; note?: string }[] = []

  if (disease === 'osteoporosis') {
    const a = assessOsteoporosis(session.osteo, patient)
    const plain = bmdPlainLanguage(a.adoptedYam, a.adoptedTscore)
    out.push({
      label: '骨密度',
      value: a.adoptedYam !== null ? `若い頃の ${Math.round(a.adoptedYam)}%` : '未測定',
      note: a.adoptedTscore !== null ? `Tスコア ${fmtT(a.adoptedTscore)}` : undefined,
    })
    out.push({
      label: '骨の状態',
      value: plain.headline,
    })
    out.push({
      label: '骨折の危険度',
      value:
        a.riskTier === 'veryHigh'
          ? 'きわめて高い'
          : a.riskTier === 'high'
            ? '高い'
            : a.riskTier === 'moderate'
              ? '中くらい'
              : a.riskTier === 'low'
                ? '低い'
                : '評価中',
    })
    if (session.osteo.fractures.length > 0) {
      out.push({
        label: 'これまでの骨折',
        value: `${session.osteo.fractures.length}か所`,
        note: '骨折したことがある方は、次の骨折を防ぐ治療が大切です',
      })
    }
    if (a.heightLossCm !== null && a.heightLossCm >= 2) {
      out.push({ label: '身長の変化', value: `${a.heightLossCm}cm 縮んでいます`, note: '背骨のつぶれのサインです' })
    }
  } else if (disease === 'ra') {
    const a = assessRa(session.ra)
    out.push({
      label: 'いまの炎症の強さ',
      value: ACTIVITY_PLAIN[a.primary.score.level],
      note: a.primary.score.value !== null ? `${a.primary.name} ${a.primary.score.value}` : undefined,
    })
    out.push({
      label: '腫れている関節',
      value: `${session.ra.swollenJoints28 ?? '—'} か所`,
      note: '28の関節を調べています',
    })
    out.push({
      label: '押して痛い関節',
      value: `${session.ra.tenderJoints28 ?? '—'} か所`,
    })
    if (session.ra.crp !== null) {
      out.push({ label: '血液の炎症の数値（CRP）', value: `${session.ra.crp} mg/dL` })
    }
    out.push({
      label: '治療の目標',
      value: '炎症がほぼない状態（寛解）',
      note: '3か月ごとに測って、6か月で判断します',
    })
  } else {
    const k = kneeSummary(session.knee, patient)
    const loco = assessLocomo(session.locomo)
    const bmi = calcBmi(patient.heightCm, patient.weightKg)
    const target = weightTarget(patient.heightCm, patient.weightKg)
    out.push({ label: 'レントゲンの所見', value: session.knee.klGrade !== null ? `グレード ${session.knee.klGrade}` : '未評価', note: k.headline })
    if (session.knee.painNrs !== null) {
      out.push({ label: '痛みの強さ', value: `${session.knee.painNrs} / 10` })
    }
    if (loco.stage !== null) {
      out.push({
        label: '歩く力（ロコモ度）',
        value: loco.stage === 0 ? '問題なし' : `ロコモ度 ${loco.stage}`,
        note: loco.message,
      })
    }
    if (bmi !== null) {
      out.push({
        label: '体重・BMI',
        value: `${patient.weightKg}kg（BMI ${bmi}）`,
        note: target && target > 0 ? `${target}kg 減らすと膝の負担が約${Math.round(target * 3)}kg 軽くなります` : undefined,
      })
    }
  }
  return out
}

function buildDecisions(session: Session): string[] {
  const out: string[] = []
  const drugs = session.plan.drugIds.map(getDrug).filter(Boolean)
  if (drugs.length > 0) {
    out.push(`お薬：${drugs.map((d) => d!.generic).join('、')} を使います`)
  } else {
    out.push('今日はお薬を始めません。生活の見直しと運動から始めます')
  }
  if (session.plan.prescription.length > 0) {
    out.push(`運動：${session.plan.prescription.length}種類の運動を、このパンフレットのとおりに続けます`)
  }
  if (session.plan.exercisePathway.includes('undoukiRehab')) {
    out.push('リハビリ：理学療法士による個別の運動指導を受けます')
  }
  if (session.plan.exercisePathway.includes('clinicClass')) {
    out.push('当院の運動教室に参加します')
  }
  if (session.plan.nextVisit) {
    out.push(`次回の来院：${session.plan.nextVisit}`)
  }
  if (session.plan.nextTests.length > 0) {
    out.push('次回までに、必要な検査を行います（詳しくは最後のページ）')
  }
  return out.length > 0 ? out : ['今日は病気の説明を行いました。次回、治療の方針を相談します']
}

// ================================================================ 病気のしくみ

/**
 * 図を紙面に収めるための枠。
 * SVGは幅いっぱいに広がると縦にも伸びてしまい、A4 1枚に収まらなくなる。
 * 図の幅に上限を設けることで、1ページあたりの情報量を確保する。
 */
function PFig({ children, w = 150, className = '' }: { children: ReactNode; w?: number; className?: string }) {
  return (
    <div className={`avoid-break mx-auto ${className}`} style={{ maxWidth: `${w}mm` }}>
      {children}
    </div>
  )
}

function MechanismSheet({ session }: { session: Session }) {
  if (session.disease === 'osteoporosis') return <OsteoMechanismSheets session={session} />
  if (session.disease === 'ra') return <RaMechanismSheets session={session} />
  return <KneeMechanismSheets session={session} />
}

function OsteoMechanismSheets({ session }: { session: Session }) {
  const a = assessOsteoporosis(session.osteo, session.patient)
  const markedSites = session.osteo.fractures
    .map((f) =>
      f.site === 'vertebra'
        ? ('spine' as const)
        : f.site === 'proximalFemur'
          ? ('hip' as const)
          : f.site === 'distalRadius'
            ? ('wrist' as const)
            : f.site === 'proximalHumerus'
              ? ('humerus' as const)
              : null,
    )
    .filter((x): x is 'spine' | 'hip' | 'wrist' | 'humerus' => x !== null)

  return (
    <>
      <Sheet title="骨粗鬆症とは、どんな病気でしょうか" page="病気のしくみ ①">
        <PFig w={165} className="mb-2">
          <TrabecularBoneFigure yam={a.adoptedYam} />
        </PFig>
        <Box title="■ 骨の中身は「スポンジ」のようになっています" className="mb-3">
          <ul className="space-y-1">
            <li>・骨の内側には、細い柱（骨梁）が網目のように組み合わさっていて、これが骨を支えています。</li>
            <li>・骨粗鬆症では、この柱が細くなり、本数も減っていきます。とくに横向きの柱が先に失われます。</li>
            <li>・外から見た骨の大きさは変わりませんが、中身がもろくなり、わずかな力でも折れやすくなります。</li>
            <li>・骨は毎日少しずつ「こわされて、つくり直されて」います。骨粗鬆症では、こわす働きが勝っています。</li>
          </ul>
        </Box>
        <p className="mb-1 text-[11pt] font-extrabold text-slate-900">■ 骨の量は、年齢とともに変わります</p>
        <PFig w={160}>
          <BmdCurveFigure age={session.patient.age} sex={session.patient.sex} yam={a.adoptedYam} />
        </PFig>
      </Sheet>

      <Sheet title="どうして今、治療を始めるのでしょうか" page="病気のしくみ ②">
        <PFig w={175} className="mb-2">
          <FractureCascadeFigure />
        </PFig>
        <div className="grid grid-cols-[minmax(0,1fr)_88mm] gap-3">
          <Box title="■ 治療の目的は「次の骨折を防ぐこと」です" tone="warn">
            <ul className="space-y-1">
              <li>・一度骨折すると、次に骨折する危険が2倍以上に高まります。とくに骨折後1年以内が危険です。</li>
              <li>・背骨の骨折は、痛みがないまま起きていることが多く、気づかないうちに進みます。</li>
              <li>・足の付け根を骨折すると、入院・手術が必要になり、その後の生活が大きく変わってしまいます。</li>
              <li className="font-bold">・治療の目的は「痛みを取ること」ではなく「将来の骨折を防ぐこと」です。</li>
              <li>・お薬・運動・食事・転倒予防の4つを組み合わせて、この連鎖を止めます。</li>
            </ul>
          </Box>
          <PFig w={88}>
            <FractureSitesFigure marked={markedSites} />
          </PFig>
        </div>
        <p className="mb-1 mt-3 text-[11pt] font-extrabold text-slate-900">■ 治療は「くすり・運動・食事」の3本柱</p>
        <PFig w={130}>
          <TreatmentPillarsFigure highlight="exercise" />
        </PFig>
      </Sheet>
    </>
  )
}

function RaMechanismSheets({ session }: { session: Session }) {
  return (
    <>
      <Sheet title="関節リウマチとは、どんな病気でしょうか" page="病気のしくみ ①">
        <PFig w={160} className="mb-2">
          <SynoviumFigure />
        </PFig>
        <Box title="■ 関節の「内張り」が腫れる病気です" className="mb-3">
          <ul className="space-y-1">
            <li>・関節の内側には「滑膜」という薄い内張りがあり、関節をなめらかに動かす液を出しています。</li>
            <li>・関節リウマチでは、自分の免疫がこの内張りを誤って攻撃し、厚く腫れてしまいます。</li>
            <li>・腫れた内張りから出る物質が、クッション（軟骨）と骨をとかしていきます。</li>
            <li>・だから「関節の腫れ」と「朝のこわばり」が出ます。左右対称に、手足の小さな関節から始まりやすいのが特徴です。</li>
            <li>・体質のせいでも、これまでの生活のせいでもありません。</li>
          </ul>
        </Box>
        <p className="mb-1 text-[11pt] font-extrabold text-slate-900">■ 炎症が続くと、関節はこの順にこわれます</p>
        <PFig w={175}>
          <JointDestructionFigure current={session.ra.erosion ? 2 : 1} />
        </PFig>
      </Sheet>

      <Sheet title="早く治療を始めることが大切な理由" page="病気のしくみ ②">
        <PFig w={165} className="mb-2">
          <WindowOfOpportunityFigure />
        </PFig>
        <Box title="■ 最初の2年が勝負です" tone="warn" className="mb-3">
          <ul className="space-y-1">
            <li className="font-bold">・一度こわれた関節は、どんなお薬を使っても元には戻りません。</li>
            <li>・関節がこわれるスピードは、発症してからの最初の2年間がもっとも速いです。</li>
            <li>・この時期にしっかり炎症を抑えられると、その後の変形をかなり防げます。</li>
            <li>・だから「痛みが軽いうちに、しっかり炎症を止める」のが今の治療の考え方です。</li>
          </ul>
        </Box>
        <p className="mb-1 text-[11pt] font-extrabold text-slate-900">■ 目標を決めて、期限を決めて治療します</p>
        <PFig w={175}>
          <T2TFigure monthsOnTherapy={null} />
        </PFig>
      </Sheet>
    </>
  )
}

function KneeMechanismSheets({ session }: { session: Session }) {
  return (
    <>
      <Sheet title="変形性膝関節症とは、どんな病気でしょうか" page="病気のしくみ ①">
        <PFig w={160} className="mb-2">
          <KneeOaFigure klGrade={session.knee.klGrade} varus={session.knee.alignment === 'varus'} />
        </PFig>
        <Box title="■ 膝のクッション（軟骨）がすり減る病気です" className="mb-3">
          <ul className="space-y-1">
            <li>・膝の骨と骨の間には、軟骨というクッションがあり、衝撃を受け止めています。</li>
            <li>・年齢・体重・膝の使い方などによって軟骨がすり減ると、骨に直接力がかかり、痛みが出ます。</li>
            <li>・骨のふちに「とげ（骨棘）」ができ、動きが悪くなります。</li>
            <li className="font-bold">
              ・軟骨そのものは元に戻りませんが、まわりの筋肉を鍛えると痛みは軽くなり、進行を遅らせられます。
            </li>
          </ul>
        </Box>
        <p className="mb-1 text-[11pt] font-extrabold text-slate-900">■ 治療は「下から順に」積み上げます</p>
        <PFig w={160}>
          <KneeTreatmentPyramidFigure level={1} />
        </PFig>
      </Sheet>

      <Sheet title="体重と膝の関係" page="病気のしくみ ②">
        <PFig w={170} className="mb-3">
          <KneeLoadFigure
            weightKg={session.patient.weightKg}
            targetLossKg={weightTarget(session.patient.heightCm, session.patient.weightKg)}
          />
        </PFig>
        <Box title="■ 膝を守るためにできること" className="mb-3">
          <ul className="space-y-1">
            <li>・平地を歩くとき、膝には体重の約3倍の力がかかります。階段では約5倍です。</li>
            <li>・少しの減量でも膝への効果は大きく、痛みと歩きやすさが改善します。</li>
            <li>・急激なダイエットは筋肉を落とします。運動と食事の両方で、ゆっくり進めましょう。</li>
            <li>・杖は「痛い方の反対の手」に持ちます。これで膝への負担が減ります。</li>
            <li>・正座・和式トイレ・深いソファは膝に負担がかかります。椅子・洋式に変えましょう。</li>
            <li>・底が厚くクッション性のある靴をはくと、膝への衝撃がやわらぎます。</li>
          </ul>
        </Box>
        <WriteLines n={3} label="■ 生活の中で変えてみることを書いておきましょう" />
      </Sheet>
    </>
  )
}

// ================================================================ お薬

function TreatmentSheet({ session, clinic }: { session: Session; clinic: ClinicConfig }) {
  const drugs = session.plan.drugIds.map(getDrug).filter(Boolean)
  const dental = session.plan.drugIds.some(needsDentalCoordination)
  const seq = session.plan.drugIds.some(needsSequentialTherapy)
  const hasMtx = session.plan.drugIds.includes('mtx')

  return (
    <Sheet title="あなたのお薬について" page="お薬について">
      <div className="space-y-3">
        {drugs.map((d) => (
          <Box key={d!.id} title={`■ ${d!.generic}`}>
            {d!.brands.length > 0 && (
              <p className="mb-1 text-[9.5pt] text-slate-500">おもな製品名：{d!.brands.join('・')}</p>
            )}
            <p className="mb-2">{d!.plain}</p>
            <table className="mb-2 w-full border-collapse text-[10pt]">
              <tbody>
                <tr>
                  <th className="w-[22%] border border-slate-300 bg-slate-100 p-1.5 text-left align-top print-fill-light">
                    使い方
                  </th>
                  <td className="border border-slate-300 p-1.5">{d!.schedule}</td>
                </tr>
                {d!.durationLimit && (
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-1.5 text-left align-top print-fill-light">
                      使う期間
                    </th>
                    <td className="border border-slate-300 p-1.5 font-bold">{d!.durationLimit}</td>
                  </tr>
                )}
                {d!.costHint && (
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-1.5 text-left align-top print-fill-light">
                      費用のめやす
                    </th>
                    <td className="border border-slate-300 p-1.5">
                      {d!.costHint}
                      <span className="ml-1 text-[8.5pt] text-slate-500">
                        ※加入している保険や薬の種類で変わります。詳しくは受付でお尋ねください。
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="mb-1 text-[10.5pt] font-extrabold">気をつけていただきたいこと</p>
            <ul className="space-y-1">
              {d!.cautions.map((c, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="shrink-0 font-bold">□</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </div>

      {hasMtx && (
        <PFig w={170} className="mt-3">
          <MtxCalendarFigure />
        </PFig>
      )}

      {seq && (
        <Box title="■ 大切なお願い：お薬の切り替えについて" tone="warn" className="mt-3">
          <p>
            骨をつくるお薬には使える期間の上限があります。期間が終わったあと、何もしないと増えた骨がまた減ってしまいます。
            <strong>終了と同時に、次のお薬（骨をこわすのを抑えるお薬）に切り替えます。</strong>
            次回の予約を必ずお取りください。
          </p>
        </Box>
      )}

      {dental && (
        <Box title="■ 歯科の受診について" tone="warn" className="mt-3">
          <ul className="space-y-1">
            <li>・お薬を始める前に、むし歯・歯周病の治療と、必要な抜歯を済ませておくと安心です。</li>
            <li>・治療中も3〜6か月ごとに歯科を受診し、毎日の歯みがきを続けてください。</li>
            <li>・歯科では「骨の薬を使っています」と必ずお伝えください。</li>
            <li className="font-bold">
              ・抜歯のためにこのお薬を休むことは、原則ありません。自己判断で中断しないでください。
            </li>
          </ul>
          {clinic.partners.find((p) => p.kind === '歯科') && (
            <p className="mt-1.5 text-[9.5pt] text-slate-600">
              連携歯科：{clinic.partners.find((p) => p.kind === '歯科')!.name}
            </p>
          )}
        </Box>
      )}

      <Box title="■ すぐにご連絡いただきたい症状" tone="warn" className="mt-3">
        <p>
          {session.disease === 'ra'
            ? '発熱／のどの痛み／咳や息切れが続く／口の中があれる／皮膚に発疹／体の片側に帯状の痛みや水ぶくれ／ふくらはぎの痛みやむくみ'
            : '強い腰背部の痛みが急に出た／顎や歯ぐきの痛み・腫れ・違和感が続く／太ももの付け根や太ももの痛みが続く／注射のあとの強い体調不良'}
        </p>
        <p className="mt-1.5 font-bold">
          連絡先：{clinic.name}　TEL {clinic.tel}（{clinic.hours}）
        </p>
        <p className="text-[9.5pt] text-slate-600">{clinic.emergencyContact}</p>
      </Box>
    </Sheet>
  )
}

// ================================================================ 運動処方

function ExerciseSheet({ session }: { session: Session }) {
  const items = session.plan.prescription
  return (
    <Sheet title="あなたの運動メニュー" page="運動療法">
      <Box tone="fill" className="mb-3">
        <p className="text-[11pt] font-bold">
          運動は、この病気の治療の柱です。お薬と同じくらい大切な「処方」としてお渡しします。
        </p>
        <p className="mt-1 text-[10pt]">
          いきなり全部やろうとしなくて大丈夫です。まず1つ、生活の中の決まった時間（歯みがきのあと、朝の支度のあとなど）に
          組み込んでみてください。効果が出てくるまで6〜8週かかります。
        </p>
      </Box>

      {/* 段組み（multi-column）にすると、カードの高さがばらついても
          紙面の下まで詰めて配置され、無駄な余白が出にくい */}
      <div className="columns-2 gap-3">
        {items.map((item, i) => {
          const e = getExercise(item.exerciseId)
          if (!e) return null
          return (
            <div
              key={item.exerciseId}
              className="avoid-break print-box mb-3 break-inside-avoid rounded border border-slate-400 p-2.5"
            >
              <p className="mb-1 text-[11.5pt] font-extrabold text-slate-900">
                {i + 1}. {e.name}
              </p>
              <div className="mx-auto mb-1.5" style={{ maxWidth: '58mm' }}>
                <ExerciseFigure figure={e.figure} />
              </div>
              <table className="mb-1.5 w-full border-collapse text-[9.5pt]">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 p-1 print-fill-light">回数</th>
                    <th className="border border-slate-300 bg-slate-100 p-1 print-fill-light">セット</th>
                    <th className="border border-slate-300 bg-slate-100 p-1 print-fill-light">頻度</th>
                  </tr>
                  <tr className="text-center font-bold">
                    <td className="border border-slate-300 p-1">{item.reps}</td>
                    <td className="border border-slate-300 p-1">{item.sets}</td>
                    <td className="border border-slate-300 p-1">{item.frequency}</td>
                  </tr>
                </tbody>
              </table>
              <ol className="mb-1.5 space-y-0.5 text-[9.5pt]">
                {e.steps.map((s, j) => (
                  <li key={j} className="flex gap-1">
                    <span className="shrink-0 font-bold">{j + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {e.stopRules.length > 0 && (
                <p className="border-t border-slate-300 pt-1 text-[9pt] font-bold text-slate-800">
                  ⚠ {e.stopRules.join(' ／ ')}
                </p>
              )}
              {item.memo && (
                <p className="mt-1 border-t border-dashed border-slate-400 pt-1 text-[10pt] font-bold">
                  あなたへ：{item.memo}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Box title="■ 運動をやめて、ご相談いただきたいとき" tone="warn" className="mt-3">
        <p>
          胸の痛み・強い息切れ・強いめまい／運動した翌日まで痛みや腫れが強く残る／関節が赤く熱をもって腫れている／
          いつもと違う痛みが出た。このようなときは無理をせず、次の受診でお知らせください。
        </p>
      </Box>

    </Sheet>
  )
}

// ================================================================ 運動記録表

function RecordSheet({ session }: { session: Session }) {
  const items = session.plan.prescription
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  return (
    <Sheet title="運動の記録表" page="記録表">
      <Box tone="fill" className="mb-3">
        <p className="text-[10.5pt]">
          できた日に「○」をつけてください。全部できなくても構いません。
          <strong>次回の受診のときにお持ちください。</strong>
          記録があると、運動の効果を一緒に確かめられます。
        </p>
      </Box>

      <p className="mb-2 text-[10.5pt]">
        月：<span className="inline-block w-16 border-b border-slate-500" /> 月
      </p>

      <div className="avoid-break overflow-x-auto">
        <table className="w-full border-collapse text-[8pt]">
          <thead>
            <tr>
              <th className="w-[26%] border border-slate-400 bg-slate-100 p-1 text-left print-fill-light">運動</th>
              {days.map((d) => (
                <th key={d} className="border border-slate-400 bg-slate-100 p-0.5 text-center print-fill-light">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const e = getExercise(item.exerciseId)
              return (
                <tr key={item.exerciseId}>
                  <td className="border border-slate-400 p-1 text-[9pt] font-bold">{e?.shortName ?? e?.name}</td>
                  {days.map((d) => (
                    <td key={d} className="h-6 border border-slate-400" />
                  ))}
                </tr>
              )
            })}
            <tr>
              <td className="border border-slate-400 p-1 text-[9pt] font-bold">歩いた歩数・時間</td>
              {days.map((d) => (
                <td key={d} className="h-6 border border-slate-400" />
              ))}
            </tr>
            <tr>
              <td className="border border-slate-400 p-1 text-[9pt] font-bold">体重（kg）</td>
              {days.map((d) => (
                <td key={d} className="h-6 border border-slate-400" />
              ))}
            </tr>
            {session.disease === 'ra' && (
              <tr>
                <td className="border border-slate-400 p-1 text-[9pt] font-bold">朝のこわばり（分）</td>
                {days.map((d) => (
                  <td key={d} className="h-6 border border-slate-400" />
                ))}
              </tr>
            )}
            {session.plan.drugIds.length > 0 && (
              <tr>
                <td className="border border-slate-400 p-1 text-[9pt] font-bold">お薬をのんだ／打った</td>
                {days.map((d) => (
                  <td key={d} className="h-6 border border-slate-400" />
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <WriteLines n={5} label="■ 気づいたこと・困ったこと（次回お聞かせください）" />
      </div>
    </Sheet>
  )
}

// ================================================================ 食事・生活

function NutritionSheet({ session }: { session: Session }) {
  const lifestyle = LIFESTYLE_ITEMS.filter(
    (l) => session.plan.lifestyleIds.includes(l.id) || l.disease.includes(session.disease),
  ).slice(0, 8)

  return (
    <Sheet title="食事と毎日の生活" page="食事・生活">
      {session.disease !== 'ra' && (
        <PFig w={168} className="mb-3">
          <DailyFoodFigure />
        </PFig>
      )}

      <Box title="■ 骨と筋肉のためにとりたい栄養" className="mb-3">
        <table className="w-full border-collapse text-[9.5pt]">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-100 p-1.5 text-left print-fill-light">栄養素</th>
              <th className="w-[22%] border border-slate-300 bg-slate-100 p-1.5 text-left print-fill-light">1日の目標</th>
              <th className="border border-slate-300 bg-slate-100 p-1.5 text-left print-fill-light">多く含む食品</th>
            </tr>
          </thead>
          <tbody>
            {NUTRIENTS.map((n) => (
              <tr key={n.id}>
                <td className="border border-slate-300 p-1.5 font-bold">{n.name}</td>
                <td className="border border-slate-300 p-1.5 font-bold">{n.target}</td>
                <td className="border border-slate-300 p-1.5">
                  {n.foods.slice(0, 4).map((f) => `${f.name}（${f.amount}＝${f.content}）`).join('、')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1.5 text-[9pt] font-bold text-slate-800">
          ⚠ ワルファリン（血液をさらさらにするお薬）をのんでいる方は、納豆・青汁・クロレラは避けてください。
        </p>
      </Box>

      <Box title="■ 控えたほうがよいもの" className="mb-3">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {NUTRITION_AVOID.map((a) => (
            <li key={a.id} className="text-[9.5pt]">
              <strong>{a.name}</strong>：{a.detail}
            </li>
          ))}
        </ul>
      </Box>

      <Box title="■ 今日お話しした生活の工夫（チェックしながら取り組みましょう）">
        <ul className="space-y-1.5">
          {lifestyle.map((l) => (
            <li key={l.id} className="flex gap-1.5">
              <span className="shrink-0 font-bold">□</span>
              <span>
                <strong>{l.label}</strong>：{l.detail}
              </span>
            </li>
          ))}
        </ul>
      </Box>
    </Sheet>
  )
}

// ================================================================ 転倒予防

function FallSheet() {
  return (
    <Sheet title="転ばないための家の工夫" page="転倒予防">
      <Box tone="fill" className="mb-3">
        <p className="text-[11pt] font-bold">
          骨折の多くは、外ではなく「家の中」で起きています。ご家族と一緒に、家の中を見直してみてください。
        </p>
      </Box>
      <PFig w={168} className="mb-3">
        <FallPreventionMapFigure />
      </PFig>
      <Box title="■ 今日からできる7つのこと">
        <ol className="space-y-1">
          <li>1. 階段・浴室・トイレに手すりをつける（介護保険が使える場合があります）</li>
          <li>2. 廊下・寝室に足元灯をつける（夜のトイレが安全になります）</li>
          <li>3. 浴室に滑り止めマットを敷く</li>
          <li>4. カーペットの端を固定し、電気のコードは壁沿いにまとめる</li>
          <li>5. 室内でも、かかとが覆われた滑りにくい靴をはく（スリッパは脱げやすく危険です）</li>
          <li>6. 眠くなる薬・血圧の薬でふらつくときは、必ず相談する（調整できることがあります）</li>
          <li>7. 年1回は眼科を受診する（見えにくさは転倒の大きな原因です）</li>
        </ol>
      </Box>
      <div className="mt-3">
        <WriteLines n={3} label="■ 家の中で気になった場所を書いておきましょう" />
      </div>
    </Sheet>
  )
}

// ================================================================ 次回の予定・連絡先

function ScheduleSheet({ session, clinic }: { session: Session; clinic: ClinicConfig }) {
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    if (!clinic.patientPageUrl) return
    let cancelled = false
    QRCode.toDataURL(clinic.patientPageUrl, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setQr(url)
      })
      .catch(() => setQr(null))
    return () => {
      cancelled = true
    }
  }, [clinic.patientPageUrl])

  return (
    <Sheet title="これからの予定と連絡先" page="予定・連絡先">
      <Box title="■ 次回の来院" tone="warn" className="mb-3">
        <p className="text-[14pt] font-extrabold">{session.plan.nextVisit || '　　　　年　　月　　日（　）　　　時　　分'}</p>
        <p className="mt-1 text-[10pt] text-slate-600">
          お薬・注射の予約は、間隔が空きすぎると効果が落ちることがあります。都合が悪くなったら早めにご連絡ください。
        </p>
      </Box>

      {session.plan.nextTests.length > 0 && (
        <Box title="■ 次回までに行う検査" className="mb-3">
          <TestList session={session} />
        </Box>
      )}

      {session.plan.exercisePathway.filter((p) => p !== 'homeExercise').length > 0 && (
        <Box title="■ 当院でのリハビリ・運動教室のご案内" className="mt-3">
          <div className="space-y-2">
            {clinic.programs
              .filter((pg) =>
                session.plan.exercisePathway.includes('undoukiRehab')
                  ? true
                  : session.plan.exercisePathway.includes('clinicClass')
                    ? pg.id !== 'undouki-reha'
                    : false,
              )
              .map((pg) => (
                <div key={pg.id} className="border-b border-slate-200 pb-1.5 last:border-0">
                  <p className="text-[11pt] font-bold">{pg.name}</p>
                  <p className="text-[10pt]">{pg.description}</p>
                  <p className="text-[9.5pt] text-slate-600">
                    {pg.schedule}／{pg.duration}／担当：{pg.staff}／{pg.cost}
                  </p>
                </div>
              ))}
          </div>
          <p className="mt-1.5 text-[9.5pt] text-slate-600">ご予約・ご相談は受付までお声かけください。</p>
        </Box>
      )}

      <Box title="■ 治療を続けるためのコツ" className="mb-3">
        <ul className="space-y-1">
          <li>・お薬カレンダーやスマートフォンのアラームを使うと、飲み忘れが減ります。</li>
          <li>・「効いている実感がない」お薬もあります。それでも続けることに意味があります。</li>
          <li>・体調や生活の変化で続けにくくなったら、必ずご相談ください。続けやすい方法に変えられます。</li>
          <li>・他の医療機関を受診するときは、このパンフレットとお薬手帳をお持ちください。</li>
        </ul>
      </Box>

      <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3">
        <Box title="■ ご連絡先">
          <p className="text-[12pt] font-extrabold">{clinic.name}</p>
          <p className="text-[10pt]">{clinic.department}</p>
          <table className="mt-1.5 w-full text-[10pt]">
            <tbody>
              <tr>
                <th className="w-[18%] py-0.5 text-left align-top">住所</th>
                <td className="py-0.5">
                  {clinic.postalCode && `〒${clinic.postalCode} `}
                  {clinic.address}
                </td>
              </tr>
              <tr>
                <th className="py-0.5 text-left align-top">電話</th>
                <td className="py-0.5 font-bold">
                  {clinic.tel}
                  {clinic.telNote && <span className="ml-1 text-[9pt] font-normal text-slate-600">（{clinic.telNote}）</span>}
                </td>
              </tr>
              <tr>
                <th className="py-0.5 text-left align-top">診療時間</th>
                <td className="py-0.5">{clinic.hours}</td>
              </tr>
              <tr>
                <th className="py-0.5 text-left align-top">休診</th>
                <td className="py-0.5">{clinic.closed}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1.5 text-[9.5pt] text-slate-700">{clinic.emergencyContact}</p>
          {clinic.olsNote && <p className="mt-1.5 text-[9.5pt] font-bold text-slate-700">{clinic.olsNote}</p>}
        </Box>

        {qr && (
          <div className="avoid-break print-box rounded border border-slate-400 p-2 text-center">
            <img src={qr} alt="患者向けページのQRコード" className="mx-auto w-full" />
            <p className="mt-1 text-[8.5pt] leading-tight text-slate-700">
              運動のやり方や病気の説明を、
              <br />
              スマートフォンでも見られます
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <WriteLines n={4} label="■ 質問メモ" />
      </div>

      <p className="mt-5 border-t border-slate-300 pt-2 text-[8pt] leading-relaxed text-slate-500">
        このパンフレットは {clinic.name} が診察時に作成したものです（作成日：{formatJpDate(session.patient.visitDate)}）。
        記載内容は、日本骨粗鬆症学会ほか「骨粗鬆症の予防と治療ガイドライン2025年版」、
        日本リウマチ学会「関節リウマチ診療ガイドライン2024改訂」、日本整形外科学会「変形性膝関節症診療ガイドライン2023」
        および「ロコモ度テストの臨床判断値」等を参考にしています。
        費用の記載はめやすであり、実際の負担額は保険の種類・制度の適用によって変わります。
      </p>
    </Sheet>
  )
}

function TestList({ session }: { session: Session }) {
  return (
    <ul className="space-y-1">
      {session.plan.nextTests.map((id) => {
        const l = LAB_ORDERS.find((x) => x.id === id)
        if (!l) return null
        return (
          <li key={id} className="flex gap-1.5">
            <span className="shrink-0 font-bold">□</span>
            <span>
              <strong>{l.name}</strong>
              <span className="ml-1 text-[9.5pt] text-slate-600">（{l.purpose}）</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ================================================================ 補助

function formatJpDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${y}年${Number(m)}月${Number(d)}日`
}
