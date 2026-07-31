import { useMemo, useState } from 'react'
import { useStore } from '@/state/store'
import { Badge, Banner, Chip, Cite, DoctorNote, Field, Section, TextInput } from '@/components/ui'
import { drugsForDisease } from '@/data/drugs'
import { CATEGORY_LABEL, exercisesForDisease, getExercise, RECOMMENDED_SETS } from '@/data/exercises'
import { LIFESTYLE_ITEMS } from '@/data/nutrition'
import { labsForDisease } from '@/data/fees'
import { suggestNextVisit } from '@/logic/karte'
import { citeLabel } from '@/data/sources'
import { ExerciseFigure } from '@/components/figures/exercise'
import type { ExercisePathway, ExercisePrescriptionItem } from '@/types'

const PATHWAYS: { key: ExercisePathway; label: string; detail: string }[] = [
  {
    key: 'undoukiRehab',
    label: '運動器リハビリテーション（個別）',
    detail: '理学療法士が1対1で評価・指導。健康保険が使えます。',
  },
  { key: 'clinicClass', label: '当院の運動教室（集団）', detail: '仲間と一緒に続けやすい形。継続率が高いのが利点です。' },
  { key: 'homeExercise', label: '自主トレーニング（自宅）', detail: 'パンフレットの運動処方と記録表をお渡しします。' },
  { key: 'homeVisitRehab', label: '訪問リハビリテーション', detail: '通院が難しい方に。介護保険との調整が必要です。' },
  { key: 'referral', label: '他施設への紹介', detail: '入院リハビリや専門的な装具作製が必要な場合。' },
]

/**
 * STEP 3：治療方針の決定
 *
 * 選んだ内容が、そのまま
 * - 説明スライド（薬・運動のスライド）
 * - パンフレット（患者さんへの交付物）
 * - カルテ記載文・算定候補
 * に反映される。二重入力をしないことが効率化の要点。
 */
export function PlanScreen() {
  const { session, patch, go, clinic } = useStore()
  const drugs = useMemo(() => drugsForDisease(session.disease), [session.disease])
  const exercises = useMemo(() => exercisesForDisease(session.disease), [session.disease])
  const labs = useMemo(() => labsForDisease(session.disease), [session.disease])
  const nextVisitOptions = useMemo(() => suggestNextVisit(session), [session])
  const [openDrug, setOpenDrug] = useState<string | null>(null)

  const plan = session.plan

  const toggleDrug = (id: string) => {
    patch('plan', {
      drugIds: plan.drugIds.includes(id) ? plan.drugIds.filter((x) => x !== id) : [...plan.drugIds, id],
    })
  }

  const toggleExercise = (id: string) => {
    const exists = plan.prescription.find((p) => p.exerciseId === id)
    if (exists) {
      patch('plan', { prescription: plan.prescription.filter((p) => p.exerciseId !== id) })
    } else {
      const e = getExercise(id)
      if (!e) return
      const item: ExercisePrescriptionItem = {
        exerciseId: id,
        reps: e.dose.reps,
        sets: e.dose.sets,
        frequency: e.dose.frequency,
        memo: '',
      }
      patch('plan', { prescription: [...plan.prescription, item] })
    }
  }

  const applySet = (ids: string[]) => {
    const items: ExercisePrescriptionItem[] = ids
      .map((id) => getExercise(id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => ({ exerciseId: e.id, reps: e.dose.reps, sets: e.dose.sets, frequency: e.dose.frequency, memo: '' }))
    patch('plan', { prescription: items })
  }

  const updatePrescription = (id: string, v: Partial<ExercisePrescriptionItem>) => {
    patch('plan', {
      prescription: plan.prescription.map((p) => (p.exerciseId === id ? { ...p, ...v } : p)),
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">治療方針を決める</h2>
          <p className="text-sm text-ink-mute">
            ここで選んだ内容が、説明スライド・パンフレット・カルテ記載文にそのまま反映されます。
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => go('explain')}>
            ← 説明モードへ
          </button>
          <button type="button" className="btn-primary btn-lg" onClick={() => go('pamphlet')}>
            パンフレットを作る →
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* ---------------------------------------------------------------- 薬 */}
        <Section title="① お薬" subtitle="選ぶと患者さん向けの説明と注意点がパンフレットに入ります">
          <div className="space-y-2">
            {drugs.map((d) => {
              const on = plan.drugIds.includes(d.id)
              const open = openDrug === d.id
              return (
                <div
                  key={d.id}
                  className={`rounded-xl border-2 transition ${on ? 'border-brand-500 bg-brand-50/60' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex flex-wrap items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => toggleDrug(d.id)}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 text-lg font-bold ${
                        on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-transparent'
                      }`}
                      aria-label={`${d.generic}を選択`}
                    >
                      ✓
                    </button>
                    <button type="button" className="flex-1 text-left" onClick={() => toggleDrug(d.id)}>
                      <span className="block font-bold text-ink">{d.generic}</span>
                      <span className="block text-sm text-ink-mute">
                        {d.route}
                        {d.brands.length > 0 && `　（${d.brands.slice(0, 3).join('・')}）`}
                      </span>
                    </button>
                    {d.durationLimit && <Badge tone="warn">{d.durationLimit}</Badge>}
                    {d.costHint && <span className="text-xs text-ink-mute">{d.costHint}</span>}
                    <button
                      type="button"
                      className="btn-ghost !min-h-[36px] !px-3 !py-1 text-sm"
                      onClick={() => setOpenDrug(open ? null : d.id)}
                    >
                      {open ? '閉じる' : '詳細'}
                    </button>
                  </div>
                  {open && (
                    <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-sm">
                      <p className="leading-relaxed">{d.plain}</p>
                      <p className="leading-relaxed text-ink-soft">
                        <strong>効き方：</strong>
                        {d.howItWorks}
                      </p>
                      <p className="leading-relaxed text-ink-soft">
                        <strong>使い方：</strong>
                        {d.schedule}
                      </p>
                      <div>
                        <p className="font-bold">患者さんへの注意点（パンフレットに印刷されます）</p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-ink-soft">
                          {d.cautions.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <DoctorNote>{d.clinicalNote}</DoctorNote>
                      <Cite>{citeLabel(d.sources)}</Cite>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- 運動療法 */}
        <Section
          title="② 運動療法（当院の中心的治療）"
          subtitle="導入経路と運動処方を選びます。処方量はその場で調整できます"
        >
          <div className="mb-5">
            <p className="label">導入する経路</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PATHWAYS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() =>
                    patch('plan', {
                      exercisePathway: plan.exercisePathway.includes(p.key)
                        ? plan.exercisePathway.filter((x) => x !== p.key)
                        : [...plan.exercisePathway, p.key],
                    })
                  }
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    plan.exercisePathway.includes(p.key)
                      ? 'border-good-400 bg-good-50'
                      : 'border-slate-200 bg-white hover:border-good-400/50'
                  }`}
                >
                  <span className="block font-bold text-ink">{p.label}</span>
                  <span className="block text-sm text-ink-mute">{p.detail}</span>
                </button>
              ))}
            </div>
          </div>

          {plan.exercisePathway.includes('clinicClass') && (
            <div className="mb-5">
              <Banner tone="good" title="当院の運動プログラム（パンフレットに案内が入ります）">
                <ul className="mt-1 space-y-2">
                  {clinic.programs.map((pg) => (
                    <li key={pg.id}>
                      <strong>{pg.name}</strong>：{pg.schedule}／{pg.duration}／{pg.staff}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  内容は設定画面から編集できます。日程・費用は必ず院内の最新のものに合わせてください。
                </p>
              </Banner>
            </div>
          )}

          <div className="mb-4">
            <p className="label">おすすめの組み合わせ（クリックで一括選択）</p>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_SETS[session.disease].map((s) => (
                <button key={s.label} type="button" className="btn-secondary !py-2 text-sm" onClick={() => applySet(s.ids)} title={s.note}>
                  {s.label}
                </button>
              ))}
            </div>
            {RECOMMENDED_SETS[session.disease].length > 0 && (
              <p className="mt-2 text-xs text-ink-mute">
                ※ボタンにカーソルを合わせると、その組み合わせを選ぶ理由が表示されます
              </p>
            )}
          </div>

          <p className="label">個別に選ぶ</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {exercises.map((e) => (
              <Chip key={e.id} on={plan.prescription.some((p) => p.exerciseId === e.id)} onClick={() => toggleExercise(e.id)}>
                <span className="text-left">
                  {e.name}
                  <span className="ml-1 text-xs font-normal text-ink-mute">（{CATEGORY_LABEL[e.category]}）</span>
                </span>
              </Chip>
            ))}
          </div>

          {plan.prescription.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="label">処方量の調整（患者さんの状態に合わせて変更してください）</p>
              {plan.prescription.map((p) => {
                const e = getExercise(p.exerciseId)
                if (!e) return null
                return (
                  <div key={p.exerciseId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="rounded-lg bg-white p-1">
                        <ExerciseFigure figure={e.figure} />
                      </div>
                      <div>
                        <p className="mb-2 font-bold text-ink">{e.name}</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Field label="回数">
                            <TextInput value={p.reps} onChange={(v) => updatePrescription(p.exerciseId, { reps: v })} />
                          </Field>
                          <Field label="セット">
                            <TextInput value={p.sets} onChange={(v) => updatePrescription(p.exerciseId, { sets: v })} />
                          </Field>
                          <Field label="頻度">
                            <TextInput value={p.frequency} onChange={(v) => updatePrescription(p.exerciseId, { frequency: v })} />
                          </Field>
                        </div>
                        <div className="mt-2">
                          <Field label="この患者さん向けのひとこと（パンフレットに印字）">
                            <TextInput
                              value={p.memo}
                              placeholder="例：右ひざが痛いときは回数を半分に"
                              onChange={(v) => updatePrescription(p.exerciseId, { memo: v })}
                            />
                          </Field>
                        </div>
                        {e.stopRules.length > 0 && (
                          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-alert-600">
                            {e.stopRules.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <Cite>{citeLabel(['op-gl-2025', 'knee-gl-2023', 'oarsi', 'ra-gl-2024', 'locomo-joa'])}</Cite>
        </Section>

        {/* ---------------------------------------------------------------- 生活指導 */}
        <Section title="③ 生活指導" subtitle="選んだ項目がパンフレットのチェックリストになります">
          <div className="grid gap-2 sm:grid-cols-2">
            {LIFESTYLE_ITEMS.filter((l) => l.disease.includes(session.disease)).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  patch('plan', {
                    lifestyleIds: plan.lifestyleIds.includes(l.id)
                      ? plan.lifestyleIds.filter((x) => x !== l.id)
                      : [...plan.lifestyleIds, l.id],
                  })
                }
                className={`rounded-xl border-2 p-3 text-left transition ${
                  plan.lifestyleIds.includes(l.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'
                }`}
              >
                <span className="block font-bold text-ink">{l.label}</span>
                <span className="block text-sm text-ink-mute">{l.detail}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- 次回 */}
        <Section title="④ 次回の予定と検査" subtitle="選択した薬に応じて候補が変わります">
          <div className="mb-4">
            <p className="label">次回来院の目安</p>
            <div className="flex flex-wrap gap-2">
              {nextVisitOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => patch('plan', { nextVisit: o.value })}
                  className={`chip ${plan.nextVisit === o.value ? 'chip-on' : ''}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="mt-3 max-w-md">
              <Field label="次回来院（自由入力）">
                <TextInput
                  value={plan.nextVisit}
                  onChange={(v) => patch('plan', { nextVisit: v })}
                  placeholder="例：6か月後（デノスマブ投与）"
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="label">次回までに行う検査</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {labs.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    patch('plan', {
                      nextTests: plan.nextTests.includes(l.id)
                        ? plan.nextTests.filter((x) => x !== l.id)
                        : [...plan.nextTests, l.id],
                    })
                  }
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    plan.nextTests.includes(l.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="block font-bold text-ink">{l.name}</span>
                  <span className="block text-sm text-ink-mute">{l.purpose}</span>
                  <span className="mt-0.5 block text-xs font-bold text-brand-600">目安：{l.interval}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Field label="患者さんへのひとこと（パンフレットに手書き風で印字されます）" wide>
              <TextInput
                value={plan.doctorMessage}
                onChange={(v) => patch('plan', { doctorMessage: v })}
                placeholder="例：まずは3か月、いっしょに続けてみましょう。困ったらいつでも連絡してください。"
              />
            </Field>
          </div>
        </Section>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={() => go('explain')}>
          ← 説明モードへ戻る
        </button>
        <button type="button" className="btn-secondary" onClick={() => go('record')}>
          カルテ記載・算定候補を見る
        </button>
        <button type="button" className="btn-primary btn-lg" onClick={() => go('pamphlet')}>
          パンフレットを作る →
        </button>
      </div>
    </div>
  )
}
