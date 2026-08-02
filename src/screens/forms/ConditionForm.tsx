import { useStore } from '@/state/store'
import { Banner, Chip, Field, NumberInput, SegButton, Section, TextInput, VasSlider } from '@/components/ui'
import { getCondition } from '@/data/conditions'
import type { ConditionInput, ConditionOption } from '@/types'

/**
 * 症状別疾患の入力フォーム（全疾患で共通）
 *
 * 疾患モデル（data/conditions）の定義だけを見て画面を組み立てる。
 * 疾患を増やしてもこのファイルは変わらない。
 *
 * 入力の並びは、診察室での実際の流れに合わせている。
 *   ① いつから・どこが・どのくらい痛いか（問診）
 *   ② どんな症状か（患者さんの言葉）
 *   ③ 診察所見・徒手検査（医師）
 *   ④ 見落としてはいけないこと（レッドフラッグ）
 *   ⑤ これまでの治療
 */
export function ConditionForm() {
  const { session, patch } = useStore()
  const def = getCondition(session.disease)
  const c = session.condition
  const set = (v: Partial<ConditionInput>) => patch('condition', v)

  if (!def) return null

  const toggle = (key: 'symptoms' | 'findings' | 'redFlags' | 'priorTreatments', id: string) => {
    const cur = c[key]
    set({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } as Partial<ConditionInput>)
  }

  return (
    <>
      <Section title="症状のあらまし" subtitle="ここだけ入れれば説明モードに進めます">
        <div className="grid gap-5 sm:grid-cols-2">
          {def.sideRelevant && (
            <Field label="どちら側" group>
              <SegButton
                value={c.side}
                options={[
                  { value: 'right', label: '右' },
                  { value: 'left', label: '左' },
                  { value: 'both', label: '両側' },
                ]}
                onChange={(v) => set({ side: v })}
              />
            </Field>
          )}
          <Field label="いつから" group>
            <SegButton
              value={c.duration}
              size="sm"
              options={def.duration.map((d) => ({ value: d.id, label: d.label }))}
              onChange={(v) => set({ duration: v })}
            />
          </Field>
          <Field label="始まり方" group>
            <SegButton
              value={c.onset}
              options={[
                { value: 'sudden', label: '急に始まった' },
                { value: 'gradual', label: '少しずつ' },
              ]}
              onChange={(v) => set({ onset: v })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <p className="label">痛みの強さ（NRS）</p>
          <VasSlider
            value={c.painNrs}
            onChange={(v) => set({ painNrs: v })}
            leftLabel="痛みなし"
            rightLabel="これ以上ない痛み"
          />
        </div>

        {def.stages && def.stages.length > 0 && (
          <div className="mt-5">
            <p className="label">{def.stagesLabel ?? '病期・重症度'}</p>
            <div className="flex flex-wrap gap-2">
              {def.stages.map((st) => (
                <Chip
                  key={st.id}
                  on={c.stage === st.id}
                  title={st.detail}
                  onClick={() => set({ stage: c.stage === st.id ? null : st.id })}
                >
                  {st.label}
                </Chip>
              ))}
            </div>
            {c.stage && (
              <p className="mt-2 text-sm font-bold text-brand-700">
                {def.stages.find((s) => s.id === c.stage)?.detail}
              </p>
            )}
          </div>
        )}

        {def.metrics && def.metrics.length > 0 && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {def.metrics.map((m) => (
              <Field key={m.key} label={m.label} hint={m.hint}>
                <NumberInput
                  value={c.metrics[m.key] ?? null}
                  step={m.step}
                  min={m.min}
                  max={m.max}
                  unit={m.unit}
                  onChange={(v) => set({ metrics: { ...c.metrics, [m.key]: v } })}
                />
              </Field>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="当てはまる症状"
        subtitle="患者さんの言葉に近いものを選んでください。説明スライドの内容にも反映されます"
      >
        <OptionChips options={def.symptomOptions} selected={c.symptoms} onToggle={(id) => toggle('symptoms', id)} />
      </Section>

      <Section title="診察所見・徒手検査" subtitle="医師が確認した所見。カルテ記載文に反映されます">
        <OptionChips options={def.findingOptions} selected={c.findings} onToggle={(id) => toggle('findings', id)} showHint />
      </Section>

      <Section
        title="見落としてはいけない所見（レッドフラッグ）"
        subtitle="1つでも該当すれば、画像評価と専門医への紹介を検討します"
        className="border-alert-300 bg-alert-50/40"
      >
        <OptionChips options={def.redFlagOptions} selected={c.redFlags} onToggle={(id) => toggle('redFlags', id)} showHint tone="warn" />
        {c.redFlags.length > 0 && (
          <div className="mt-4">
            <Banner tone="warn" title="緊急性のある所見が選ばれています" icon="⚠">
              <ul className="list-disc space-y-1 pl-5">
                {c.redFlags.map((id) => {
                  const o = def.redFlagOptions.find((x) => x.id === id)
                  return o ? (
                    <li key={id}>
                      <strong>{o.label}</strong>
                      {o.hint && <span className="text-ink-soft">（{o.hint}）</span>}
                    </li>
                  ) : null
                })}
              </ul>
            </Banner>
          </div>
        )}
      </Section>

      <Section title="これまでに受けた治療" subtitle="次に検討する治療の段の提案に使います">
        <OptionChips
          options={def.priorTreatmentOptions}
          selected={c.priorTreatments}
          onToggle={(id) => toggle('priorTreatments', id)}
        />
        <div className="mt-5">
          <Field label="メモ（カルテ記載文に入ります）">
            <TextInput value={c.note} onChange={(v) => set({ note: v })} placeholder="例：仕事で長時間の立ち仕事あり" />
          </Field>
        </div>
      </Section>
    </>
  )
}

function OptionChips({
  options,
  selected,
  onToggle,
  showHint = false,
  tone = 'normal',
}: {
  options: ConditionOption[]
  selected: string[]
  onToggle: (id: string) => void
  showHint?: boolean
  tone?: 'normal' | 'warn'
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o.id} on={selected.includes(o.id)} title={o.hint} onClick={() => onToggle(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
      {showHint && (
        <ul className="mt-2 space-y-0.5 text-xs text-ink-mute">
          {options
            .filter((o) => o.hint && selected.includes(o.id))
            .map((o) => (
              <li key={o.id} className={tone === 'warn' ? 'font-bold text-alert-600' : ''}>
                ・{o.label}：{o.hint}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
