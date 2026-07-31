import { useStore } from '@/state/store'
import { Chip, Field, NumberInput, SegButton, Section, TextInput } from '@/components/ui'
import { fractureLabel } from '@/logic/osteoporosis'
import type { FragilityFracture, FragilityFractureSite, OsteoporosisRiskFactors } from '@/types'

const FRACTURE_SITES: FragilityFractureSite[] = [
  'vertebra',
  'proximalFemur',
  'distalRadius',
  'proximalHumerus',
  'rib',
  'pelvis',
  'lowerLeg',
]

const RISK_LABELS: { key: keyof OsteoporosisRiskFactors; label: string; hint?: string }[] = [
  { key: 'parentHipFracture', label: '両親の大腿骨近位部骨折歴' },
  { key: 'currentSmoking', label: '現在喫煙している' },
  { key: 'alcohol3Units', label: 'アルコール3単位/日以上' },
  { key: 'glucocorticoid', label: '経口ステロイドの使用' },
  { key: 'rheumatoidArthritis', label: '関節リウマチ' },
  { key: 'secondaryOsteoporosis', label: 'その他の続発性骨粗鬆症' },
  { key: 'fallLastYear', label: '過去1年に転倒した' },
  { key: 'diabetesT2', label: '2型糖尿病' },
  { key: 'ckd', label: '慢性腎臓病' },
  { key: 'lowBodyWeight', label: '低体重（BMI 18.5未満）' },
]

export function OsteoForm() {
  const { session, patch } = useStore()
  const o = session.osteo

  const setBmd = (v: Partial<typeof o.bmd>) => patch('osteo', { bmd: { ...o.bmd, ...v } })
  const setRisk = (v: Partial<OsteoporosisRiskFactors>) => patch('osteo', { risk: { ...o.risk, ...v } })
  const setLabs = (v: Partial<typeof o.labs>) => patch('osteo', { labs: { ...o.labs, ...v } })

  const toggleFracture = (site: FragilityFractureSite) => {
    const exists = o.fractures.find((f) => f.site === site)
    if (exists) {
      patch('osteo', { fractures: o.fractures.filter((f) => f.site !== site) })
    } else {
      patch('osteo', {
        fractures: [...o.fractures, { site, when: 'unknown', multiple: false } as FragilityFracture],
      })
    }
  }

  const updateFracture = (site: FragilityFractureSite, v: Partial<FragilityFracture>) => {
    patch('osteo', {
      fractures: o.fractures.map((f) => (f.site === site ? { ...f, ...v } : f)),
    })
  }

  return (
    <>
      <Section
        title="骨密度（DXA）"
        subtitle="腰椎（L1-L4 または L2-L4）と大腿骨近位部の両方を入力すると、低い方を自動で採用します"
        right={
          <SegButton
            value={o.bmd.unit}
            size="sm"
            options={[
              { value: 'yam', label: 'YAM（%）で入力' },
              { value: 'tscore', label: 'Tスコアで入力' },
            ]}
            onChange={(v) => setBmd({ unit: v })}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={`腰椎 ${o.bmd.unit === 'yam' ? 'YAM（%）' : 'Tスコア'}`}>
            <NumberInput
              value={o.bmd.lumbar}
              step={o.bmd.unit === 'yam' ? 1 : 0.1}
              unit={o.bmd.unit === 'yam' ? '%' : 'SD'}
              placeholder={o.bmd.unit === 'yam' ? '例 72' : '例 -2.3'}
              onChange={(v) => setBmd({ lumbar: v })}
            />
          </Field>
          <Field label={`大腿骨近位部 ${o.bmd.unit === 'yam' ? 'YAM（%）' : 'Tスコア'}`}>
            <NumberInput
              value={o.bmd.femur}
              step={o.bmd.unit === 'yam' ? 1 : 0.1}
              unit={o.bmd.unit === 'yam' ? '%' : 'SD'}
              placeholder={o.bmd.unit === 'yam' ? '例 68' : '例 -2.7'}
              onChange={(v) => setBmd({ femur: v })}
            />
          </Field>
          <Field label="測定日">
            <input
              type="date"
              className="input"
              value={o.bmd.measuredAt}
              onChange={(e) => setBmd({ measuredAt: e.target.value })}
            />
          </Field>
          <Field label="測定機種などのメモ">
            <TextInput value={o.bmd.note} onChange={(v) => setBmd({ note: v })} placeholder="例：DXA 腰椎L2-4" />
          </Field>
        </div>
      </Section>

      <Section
        title="脆弱性骨折の既往"
        subtitle="椎体・大腿骨近位部の骨折があれば、骨密度によらず骨粗鬆症と診断されます"
      >
        <div className="flex flex-wrap gap-2">
          {FRACTURE_SITES.map((s) => (
            <Chip key={s} on={o.fractures.some((f) => f.site === s)} onClick={() => toggleFracture(s)}>
              {fractureLabel(s)}
            </Chip>
          ))}
        </div>

        {o.fractures.length > 0 && (
          <div className="mt-4 space-y-3">
            {o.fractures.map((f) => (
              <div key={f.site} className="rounded-xl bg-slate-50 p-3">
                <p className="mb-2 font-bold text-ink">{fractureLabel(f.site)}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <SegButton
                    value={f.when}
                    size="sm"
                    options={[
                      { value: 'within12m', label: '12か月以内' },
                      { value: 'over12m', label: '1年以上前' },
                      { value: 'unknown', label: '不明' },
                    ]}
                    onChange={(v) => updateFracture(f.site, { when: v })}
                  />
                  <Chip on={f.multiple} onClick={() => updateFracture(f.site, { multiple: !f.multiple })}>
                    複数（2か所以上）
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="危険因子" subtitle="FRAX® の入力項目に対応しています">
        <div className="flex flex-wrap gap-2">
          {RISK_LABELS.map((r) => (
            <Chip
              key={String(r.key)}
              on={Boolean(o.risk[r.key])}
              onClick={() => setRisk({ [r.key]: !o.risk[r.key] } as Partial<OsteoporosisRiskFactors>)}
            >
              {r.label}
            </Chip>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="FRAX® 主要骨折 10年確率"
            hint="DXA装置または FRAX® 公式サイトで算出した値を入力してください（本システムでは計算しません）"
          >
            <NumberInput
              value={o.risk.fraxMajorPercent}
              step={0.1}
              unit="%"
              placeholder="例 18.5"
              onChange={(v) => setRisk({ fraxMajorPercent: v })}
            />
          </Field>
          <Field label="FRAX® 大腿骨近位部骨折 10年確率">
            <NumberInput
              value={o.risk.fraxHipPercent}
              step={0.1}
              unit="%"
              placeholder="例 5.2"
              onChange={(v) => setRisk({ fraxHipPercent: v })}
            />
          </Field>
        </div>
      </Section>

      <Section title="検査値（任意）" subtitle="除外診断と薬剤選択のために入力すると、注意点が自動で表示されます">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="血清カルシウム">
            <NumberInput value={o.labs.calcium} step={0.1} unit="mg/dL" onChange={(v) => setLabs({ calcium: v })} />
          </Field>
          <Field label="25(OH)D">
            <NumberInput value={o.labs.vitD25} step={0.1} unit="ng/mL" onChange={(v) => setLabs({ vitD25: v })} />
          </Field>
          <Field label="TRACP-5b">
            <NumberInput value={o.labs.tracp5b} step={1} unit="mU/dL" onChange={(v) => setLabs({ tracp5b: v })} />
          </Field>
          <Field label="P1NP">
            <NumberInput value={o.labs.p1np} step={0.1} unit="μg/L" onChange={(v) => setLabs({ p1np: v })} />
          </Field>
          <Field label="eGFR">
            <NumberInput value={o.labs.egfr} step={0.1} unit="mL/min/1.73m²" onChange={(v) => setLabs({ egfr: v })} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="現在の骨粗鬆症治療（カンマ区切り）" wide>
            <TextInput
              value={o.currentTherapy.join(', ')}
              placeholder="例：アレンドロン酸 週1回, エルデカルシトール"
              onChange={(v) =>
                patch('osteo', {
                  currentTherapy: v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </div>
      </Section>
    </>
  )
}
