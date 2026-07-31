import { useMemo } from 'react'
import { useStore } from '@/state/store'
import { Badge, Banner, Cite, DoctorNote } from '@/components/ui'
import { assessOsteoporosis, fmtT, suggestInitialTherapy } from '@/logic/osteoporosis'
import { ACTIVITY_LABEL, assessRa, das28crpRefLabel } from '@/logic/ra'
import { assessLocomo, bmiCategory, calcBmi, kneeSummary, weightTarget } from '@/logic/locomo'
import { citeLabel } from '@/data/sources'

/**
 * 入力に応じてリアルタイムに判定を表示するパネル（医師向け）。
 * 診察室での「判断の下支え」であり、患者さんに見せる画面とは分けている。
 */
export function AssessmentPanel() {
  const { session } = useStore()
  const { disease, patient } = session

  if (disease === 'osteoporosis') return <OsteoAssessment />
  if (disease === 'ra') return <RaAssessment />
  return <KneeAssessment key={patient.visitDate} />
}

function OsteoAssessment() {
  const { session } = useStore()
  const a = useMemo(() => assessOsteoporosis(session.osteo, session.patient), [session.osteo, session.patient])
  const therapy = suggestInitialTherapy(a.riskTier)

  const diagnosisTone =
    a.diagnosis === 'osteoporosis' ? 'warn' : a.diagnosis === 'lowBoneMass' ? 'neutral' : a.diagnosis === 'normal' ? 'good' : 'neutral'

  const tierBadge: Record<typeof a.riskTier, { tone: 'danger' | 'warn' | 'neutral' | 'good' | 'info'; label: string }> = {
    veryHigh: { tone: 'danger', label: 'きわめて高い' },
    high: { tone: 'warn', label: '高い' },
    moderate: { tone: 'neutral', label: '中等度' },
    low: { tone: 'good', label: '低い' },
    unknown: { tone: 'info', label: '判定不能' },
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="採用した骨密度"
          value={a.adoptedYam !== null ? `YAM ${a.adoptedYam}%` : '未測定'}
          sub={a.adoptedTscore !== null ? `Tスコア ${fmtT(a.adoptedTscore)}（${a.adoptedSite === 'lumbar' ? '腰椎' : '大腿骨近位部'}）` : '骨密度を入力してください'}
        />
        <StatCard
          label="診断（基準への当てはめ）"
          value={
            a.diagnosis === 'osteoporosis'
              ? '骨粗鬆症'
              : a.diagnosis === 'lowBoneMass'
                ? '骨量減少'
                : a.diagnosis === 'normal'
                  ? '正常範囲'
                  : '判定不能'
          }
          tone={diagnosisTone}
        />
        <StatCard
          label="骨折リスク区分"
          value={tierBadge[a.riskTier].label}
          tone={a.riskTier === 'veryHigh' || a.riskTier === 'high' ? 'warn' : a.riskTier === 'low' ? 'good' : 'neutral'}
        />
      </div>

      <Banner
        tone={a.pharmacotherapyIndicated === true ? 'warn' : a.pharmacotherapyIndicated === 'consider' ? 'info' : 'neutral'}
        title={
          a.pharmacotherapyIndicated === true
            ? '薬物治療開始基準に該当します'
            : a.pharmacotherapyIndicated === 'consider'
              ? '薬物治療開始基準：要検討'
              : '現時点で薬物治療開始基準に該当しません'
        }
      >
        <ul className="list-disc space-y-1 pl-5">
          {a.pharmacotherapyReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Banner>

      <DoctorNote label="診断根拠">
        <ul className="list-disc space-y-1 pl-5">
          {a.diagnosisReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        {a.riskTierReasons.length > 0 && (
          <p className="mt-2">
            <strong>リスク区分の根拠：</strong>
            {a.riskTierReasons.join('、')}
          </p>
        )}
      </DoctorNote>

      <div className="card bg-brand-50/50">
        <p className="mb-2 font-bold text-brand-800">
          初期治療の考え方：{therapy.headline}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold text-ink-mute">第一選択として検討</p>
            <ul className="mt-1 space-y-0.5 text-sm">
              {therapy.first.length > 0 ? therapy.first.map((t) => <li key={t}>・{t}</li>) : <li>—</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-ink-mute">次に検討</p>
            <ul className="mt-1 space-y-0.5 text-sm">
              {therapy.second.length > 0 ? therapy.second.map((t) => <li key={t}>・{t}</li>) : <li>—</li>}
            </ul>
          </div>
        </div>
        {therapy.notes.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {therapy.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
        <Cite>{citeLabel(['op-gl-2025', 'op-dx-criteria'])}（初期治療アルゴリズムは ASBMR/NOF 2024 の考え方を収載）</Cite>
      </div>

      {a.cautions.length > 0 && (
        <Banner tone="warn" title="確認が必要な事項" icon="⚠">
          <ul className="list-disc space-y-1 pl-5">
            {a.cautions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Banner>
      )}
    </div>
  )
}

function RaAssessment() {
  const { session } = useStore()
  const a = useMemo(() => assessRa(session.ra, session.clinicalSettings), [session.ra, session.clinicalSettings])

  const rows = [
    { name: 'SDAI', s: a.sdai, ref: '寛解 ≦3.3／低 ≦11／中 ≦26／高 >26' },
    { name: 'CDAI', s: a.cdai, ref: '寛解 ≦2.8／低 ≦10／中 ≦22／高 >22' },
    { name: 'DAS28-CRP', s: a.das28crp, ref: das28crpRefLabel(session.clinicalSettings?.das28crpThresholds) },
    { name: 'DAS28-ESR', s: a.das28esr, ref: '寛解 <2.6／低 ≦3.2／中 ≦5.1／高 >5.1' },
  ]

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left text-xs text-ink-mute">
              <th className="py-2">指標</th>
              <th className="py-2">スコア</th>
              <th className="py-2">判定</th>
              <th className="py-2">基準値</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-slate-100">
                <td className="py-2 font-bold">{r.name}</td>
                <td className="py-2 tnum text-lg font-bold text-brand-700">
                  {r.s.value !== null ? r.s.value.toFixed(2) : '—'}
                </td>
                <td className="py-2">
                  {r.s.value !== null ? (
                    <span className="flex flex-wrap items-center gap-1">
                      <Badge
                        tone={
                          r.s.level === 'remission' ? 'good' : r.s.level === 'low' ? 'info' : r.s.level === 'moderate' ? 'warn' : 'danger'
                        }
                      >
                        {ACTIVITY_LABEL[r.s.level]}
                      </Badge>
                      {r.s.source === 'external' && <Badge>取込値</Badge>}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-mute">{r.s.missing.join('・')}が未入力</span>
                  )}
                </td>
                <td className="py-2 text-xs text-ink-mute">{r.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <p className="mb-2 font-bold">ACR/EULAR 2011 Boolean 寛解基準</p>
          <p className="mb-2">
            {a.booleanRemission.met === null ? (
              <Badge>判定不能</Badge>
            ) : a.booleanRemission.met ? (
              <Badge tone="good">達成</Badge>
            ) : (
              <Badge tone="warn">未達成</Badge>
            )}
          </p>
          <ul className="space-y-0.5 text-sm text-ink-soft">
            {a.booleanRemission.detail.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <p className="mb-2 font-bold">ACR/EULAR 2010 分類基準（参考）</p>
          <p className="mb-2">
            {a.classification2010.score === null ? (
              <Badge>未入力</Badge>
            ) : (
              <>
                <span className="mr-2 text-2xl font-bold tnum text-brand-700">{a.classification2010.score}</span>
                <span className="text-sm">/ 10点</span>{' '}
                {a.classification2010.suggestsRa ? <Badge tone="warn">6点以上</Badge> : <Badge>6点未満</Badge>}
              </>
            )}
          </p>
          <ul className="space-y-0.5 text-xs text-ink-soft">
            {a.classification2010.breakdown.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
          <Cite>{citeLabel(['acr-eular-2010'])}（分類基準であり診断基準ではありません）</Cite>
        </div>
      </div>

      <DoctorNote label="T2T（Treat to Target）の評価">
        <ul className="list-disc space-y-1 pl-5">
          {a.t2tComment.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
        <Cite>{citeLabel(['ra-gl-2024', 't2t', 'acr-eular-remission'])}</Cite>
      </DoctorNote>

      {a.cautions.length > 0 && (
        <Banner tone="warn" title="薬剤選択・安全性の確認事項" icon="⚠">
          <ul className="list-disc space-y-1 pl-5">
            {a.cautions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Banner>
      )}
    </div>
  )
}

function KneeAssessment() {
  const { session } = useStore()
  const loco = useMemo(() => assessLocomo(session.locomo), [session.locomo])
  const knee = useMemo(() => kneeSummary(session.knee, session.patient), [session.knee, session.patient])
  const bmi = calcBmi(session.patient.heightCm, session.patient.weightKg)
  const target = weightTarget(session.patient.heightCm, session.patient.weightKg)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="ロコモ度"
          value={loco.stage === null ? '未実施' : loco.stage === 0 ? '該当なし' : `ロコモ度${loco.stage}`}
          tone={loco.stage !== null && loco.stage >= 2 ? 'warn' : loco.stage === 0 ? 'good' : 'neutral'}
          sub={loco.message}
        />
        <StatCard
          label="BMI"
          value={bmi !== null ? String(bmi) : '—'}
          sub={bmi !== null ? bmiCategory(bmi) : '身長・体重を入力してください'}
          tone={bmi !== null && bmi >= 25 ? 'warn' : 'neutral'}
        />
        <StatCard
          label="減量目標（BMI 25未満）"
          value={target !== null ? (target > 0 ? `−${target}kg` : '達成') : '—'}
          sub={target && target > 0 ? `歩行時の膝の負担 約${Math.round(target * 3)}kg 分の軽減` : ''}
        />
      </div>

      <DoctorNote label="所見のまとめ">
        <p className="font-bold">{knee.headline}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {knee.body.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="mt-2 font-bold">治療の提案</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {knee.suggestions.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <Cite>{citeLabel(['knee-gl-2023', 'oarsi', 'locomo-joa'])}</Cite>
      </DoctorNote>

      {loco.stage !== null && (
        <Banner tone={loco.stage >= 2 ? 'warn' : 'info'} title={loco.message}>
          <ul className="list-disc space-y-1 pl-5">
            {loco.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Banner>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'neutral' | 'warn' | 'good'
}) {
  const border = tone === 'warn' ? 'border-alert-400' : tone === 'good' ? 'border-good-400' : 'border-slate-200'
  const color = tone === 'warn' ? 'text-alert-600' : tone === 'good' ? 'text-good-600' : 'text-brand-700'
  return (
    <div className={`rounded-xl border-2 bg-white p-4 ${border}`}>
      <p className="text-xs font-bold text-ink-mute">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tnum ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  )
}
