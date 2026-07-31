import { useState } from 'react'
import { useStore } from '@/state/store'
import { Banner, Section } from '@/components/ui'
import { SOURCES } from '@/data/sources'
import { DRUGS } from '@/data/drugs'
import { EXERCISES, CATEGORY_LABEL } from '@/data/exercises'
import { NUTRIENTS } from '@/data/nutrition'
import { ExerciseFigure } from '@/components/figures/exercise'
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
import {
  KneeLoadFigure,
  KneeOaFigure,
  KneeTreatmentPyramidFigure,
  LocomoStageFigure,
  StandUpTestFigure,
} from '@/components/figures/knee'
import {
  DailyFoodFigure,
  DentalCoordinationFigure,
  FallPreventionMapFigure,
  NutrientRoleFigure,
} from '@/components/figures/lifestyle'

type Tab = 'sources' | 'figures' | 'drugs' | 'exercises' | 'nutrition'

/**
 * 資料集
 *
 * - 収録内容の典拠を一覧で示す（説明の信頼性を担保するため）
 * - 図表を一覧で見られるようにする（スタッフ研修・患者説明の準備に使える）
 */
export function LibraryScreen() {
  const { goBack, returnTo } = useStore()
  const [tab, setTab] = useState<Tab>('sources')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sources', label: '出典一覧' },
    { key: 'figures', label: '図表一覧' },
    { key: 'drugs', label: '薬剤一覧' },
    { key: 'exercises', label: '運動メニュー一覧' },
    { key: 'nutrition', label: '栄養の目標' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-ink">資料集</h2>
        <button type="button" className="btn-ghost" onClick={goBack}>
          {returnTo === 'home' ? '← 戻る' : '← 診察の続きへ戻る'}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-slate-200 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2.5 font-bold transition ${
              tab === t.key ? 'bg-white text-brand-700 shadow' : 'text-ink-soft hover:bg-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sources' && (
        <div className="space-y-4">
          <Banner tone="info" title="このシステムに収録した内容の典拠">
            数値基準・推奨はすべて下記の資料に基づいています。ガイドラインは改訂されるため、
            改訂時には本システムの内容も更新が必要です（更新手順は docs/05_カスタマイズガイド.md）。
          </Banner>
          {SOURCES.map((s) => (
            <div key={s.id} className="card">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="badge bg-brand-100 text-brand-700">{s.short}</span>
                <h3 className="text-lg font-bold text-ink">{s.title}</h3>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {s.publisher}　／　{s.year}
              </p>
              {s.note && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.note}</p>}
              {s.url && (
                <p className="mt-2 break-all text-xs text-brand-600">
                  <a href={s.url} target="_blank" rel="noreferrer noopener">
                    {s.url}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'figures' && <FigureGallery />}

      {tab === 'drugs' && (
        <div className="space-y-4">
          <Banner tone="warn" title="用量・禁忌は必ず最新の添付文書でご確認ください">
            商品名は代表的なものです。院内採用品に合わせて src/data/drugs.ts を編集してください。
          </Banner>
          {DRUGS.map((d) => (
            <div key={d.id} className="card">
              <h3 className="text-lg font-bold text-ink">{d.generic}</h3>
              <p className="text-sm text-ink-mute">
                {d.route}
                {d.brands.length > 0 && `　（${d.brands.join('・')}）`}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{d.plain}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                <strong>効き方：</strong>
                {d.howItWorks}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                <strong>使い方：</strong>
                {d.schedule}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-brand-700">患者さんへの注意点・医師向けメモ</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {d.cautions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <div className="doctor-note mt-3">{d.clinicalNote}</div>
              </details>
            </div>
          ))}
        </div>
      )}

      {tab === 'exercises' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {EXERCISES.map((e) => (
            <div key={e.id} className="card">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-lg font-bold text-ink">{e.name}</h3>
                <span className="badge bg-good-100 text-good-600">{CATEGORY_LABEL[e.category]}</span>
              </div>
              <div className="my-2 rounded-lg border border-slate-200 bg-white p-1">
                <ExerciseFigure figure={e.figure} />
              </div>
              <p className="text-sm font-bold text-brand-700">
                {e.dose.reps}／{e.dose.sets}／{e.dose.frequency}
              </p>
              <ol className="mt-2 space-y-0.5 text-sm text-ink-soft">
                {e.steps.map((s, i) => (
                  <li key={i}>
                    {i + 1}. {s}
                  </li>
                ))}
              </ol>
              {e.stopRules.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-alert-600">
                  {e.stopRules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              {e.clinicalNote && <div className="doctor-note mt-2 text-xs">{e.clinicalNote}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="space-y-4">
          <div className="card">
            <NutrientRoleFigure />
          </div>
          {NUTRIENTS.map((n) => (
            <div key={n.id} className="card">
              <h3 className="text-lg font-bold text-ink">
                {n.name}
                <span className="ml-3 text-base font-bold text-brand-700">{n.target}</span>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{n.why}</p>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-ink-mute">
                    <th className="py-1">食品</th>
                    <th className="py-1">量</th>
                    <th className="py-1">含有量</th>
                  </tr>
                </thead>
                <tbody>
                  {n.foods.map((f) => (
                    <tr key={f.name} className="border-b border-slate-100">
                      <td className="py-1 font-bold">{f.name}</td>
                      <td className="py-1">{f.amount}</td>
                      <td className="py-1 tnum">{f.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">
                {n.cautions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FigureGallery() {
  const groups: { label: string; items: { name: string; node: React.ReactNode }[] }[] = [
    {
      label: '骨粗鬆症',
      items: [
        { name: '骨の中身の比較（骨梁）', node: <TrabecularBoneFigure yam={64} /> },
        { name: '年齢と骨密度のグラフ', node: <BmdCurveFigure age={72} sex="female" yam={64} /> },
        { name: '骨のつくりかえと薬の作用点', node: <BoneRemodelingFigure highlight="resorption" /> },
        { name: '折れやすい4か所', node: <FractureSitesFigure marked={['spine', 'hip']} /> },
        { name: '骨折の連鎖', node: <FractureCascadeFigure /> },
        { name: '骨折リスクの区分', node: <RiskTierFigure tier="high" /> },
        { name: '背骨の骨折と姿勢の変化', node: <SpinePostureFigure heightLossCm={5} /> },
        { name: '治療の3本柱', node: <TreatmentPillarsFigure highlight="exercise" /> },
        { name: '逐次療法（薬の切り替え）', node: <SequentialTherapyFigure firstDrug="ロモソズマブ" /> },
      ],
    },
    {
      label: '関節リウマチ',
      items: [
        { name: '正常な関節と滑膜炎', node: <SynoviumFigure /> },
        { name: '関節破壊の進行段階', node: <JointDestructionFigure current={2} /> },
        { name: '罹患関節マップ', node: <RaJointMapFigure regions={['mcpL', 'mcpR', 'pipL', 'pipR', 'wristL', 'wristR']} /> },
        { name: '疾患活動性メーター', node: <ActivityMeterFigure name="SDAI" value={18} level="moderate" /> },
        { name: 'T2T のタイムライン', node: <T2TFigure monthsOnTherapy={3} /> },
        { name: '薬物治療アルゴリズム', node: <RaAlgorithmFigure currentPhase={1} /> },
        { name: 'MTX の週間カレンダー', node: <MtxCalendarFigure /> },
        { name: '早期治療の重要性', node: <WindowOfOpportunityFigure /> },
      ],
    },
    {
      label: '変形性膝関節症・ロコモ',
      items: [
        { name: '膝の軟骨のすり減り', node: <KneeOaFigure klGrade={3} varus /> },
        { name: '体重と膝への負担', node: <KneeLoadFigure weightKg={68} targetLossKg={5} /> },
        { name: '治療のピラミッド', node: <KneeTreatmentPyramidFigure level={1} /> },
        { name: 'ロコモ度', node: <LocomoStageFigure stage={2} /> },
        { name: '立ち上がりテスト', node: <StandUpTestFigure oneLegCm={null} bothLegCm={20} /> },
      ],
    },
    {
      label: '栄養・生活',
      items: [
        { name: '1日にとりたい食品', node: <DailyFoodFigure /> },
        { name: '栄養素の役割', node: <NutrientRoleFigure /> },
        { name: '家の中の転倒危険マップ', node: <FallPreventionMapFigure /> },
        { name: '骨の薬と歯科の連携', node: <DentalCoordinationFigure /> },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <Banner tone="info" title="図表はすべて手描きのSVGです">
        外部の画像・フォントに依存しないため、インターネットに接続していない院内PCでも、A4印刷でも、拡大しても劣化しません。
        患者さんの数値を入れると図に反映されるものもあります（下記は見本の数値です）。
      </Banner>
      {groups.map((g) => (
        <Section key={g.label} title={g.label}>
          <div className="grid gap-5 lg:grid-cols-2">
            {g.items.map((it) => (
              <div key={it.name}>
                <p className="mb-1 text-sm font-bold text-ink-soft">{it.name}</p>
                <div className="rounded-xl border border-slate-200 bg-white p-2">{it.node}</div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}
