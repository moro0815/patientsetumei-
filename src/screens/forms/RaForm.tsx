import { useStore } from '@/state/store'
import { Chip, Field, NumberInput, Section, TextInput, VasSlider } from '@/components/ui'
import type { RaInput, RaJointRegion } from '@/types'

const REGION_GROUPS: { label: string; items: { key: RaJointRegion; label: string }[] }[] = [
  {
    label: '手・指',
    items: [
      { key: 'wristR', label: '右手首' },
      { key: 'wristL', label: '左手首' },
      { key: 'mcpR', label: '右MCP（指の付け根）' },
      { key: 'mcpL', label: '左MCP' },
      { key: 'pipR', label: '右PIP（指の第2関節）' },
      { key: 'pipL', label: '左PIP' },
    ],
  },
  {
    label: '上肢・体幹',
    items: [
      { key: 'elbowR', label: '右ひじ' },
      { key: 'elbowL', label: '左ひじ' },
      { key: 'shoulderR', label: '右肩' },
      { key: 'shoulderL', label: '左肩' },
      { key: 'cervical', label: '首（頸椎）' },
    ],
  },
  {
    label: '下肢・足',
    items: [
      { key: 'hipR', label: '右股' },
      { key: 'hipL', label: '左股' },
      { key: 'kneeR', label: '右ひざ' },
      { key: 'kneeL', label: '左ひざ' },
      { key: 'ankleR', label: '右足首' },
      { key: 'ankleL', label: '左足首' },
      { key: 'mtpR', label: '右MTP（足指の付け根）' },
      { key: 'mtpL', label: '左MTP' },
    ],
  },
]

const COMORBIDITY: { key: keyof RaInput['comorbidity']; label: string }[] = [
  { key: 'interstitialLungDisease', label: '間質性肺疾患' },
  { key: 'hepatitisBC', label: 'B型／C型肝炎（既往・キャリア）' },
  { key: 'latentTb', label: '潜在性結核の疑い・既往' },
  { key: 'ckd', label: '腎機能低下' },
  { key: 'malignancyHistory', label: '悪性腫瘍の既往' },
  { key: 'pregnancyPlan', label: '妊娠の希望・可能性' },
  { key: 'elderly75', label: '75歳以上' },
]

export function RaForm() {
  const { session, patch } = useStore()
  const r = session.ra
  const set = (v: Partial<RaInput>) => patch('ra', v)

  const toggleRegion = (k: RaJointRegion) => {
    set({
      affectedRegions: r.affectedRegions.includes(k)
        ? r.affectedRegions.filter((x) => x !== k)
        : [...r.affectedRegions, k],
    })
  }

  return (
    <>
      <Section
        title="関節所見（28関節）"
        subtitle="DAS28・SDAI・CDAI の計算に使います。両肩・両肘・両手首・MCP 10・PIP 10・両膝 の28関節"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="圧痛関節数（0〜28）">
            <NumberInput
              value={r.tenderJoints28}
              min={0}
              max={28}
              unit="か所"
              onChange={(v) => set({ tenderJoints28: v })}
            />
          </Field>
          <Field label="腫脹関節数（0〜28）">
            <NumberInput
              value={r.swollenJoints28}
              min={0}
              max={28}
              unit="か所"
              onChange={(v) => set({ swollenJoints28: v })}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label">患者全般評価（患者さんに指で示してもらいます）</p>
            <VasSlider
              value={r.patientGlobalVas}
              onChange={(v) => set({ patientGlobalVas: v })}
              leftLabel="とても良い"
              rightLabel="とても悪い"
            />
          </div>
          <div>
            <p className="label">医師全般評価</p>
            <VasSlider
              value={r.physicianGlobalVas}
              onChange={(v) => set({ physicianGlobalVas: v })}
              leftLabel="活動性なし"
              rightLabel="非常に高い"
            />
          </div>
        </div>
      </Section>

      <Section title="検査値" subtitle="CRP は mg/dL で入力してください（DAS28-CRP の計算時に自動で換算します）">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="CRP">
            <NumberInput value={r.crp} step={0.01} unit="mg/dL" onChange={(v) => set({ crp: v })} />
          </Field>
          <Field label="ESR">
            <NumberInput value={r.esr} step={1} unit="mm/h" onChange={(v) => set({ esr: v })} />
          </Field>
          <Field label="RF（定量）">
            <NumberInput value={r.rf} step={0.1} unit="IU/mL" onChange={(v) => set({ rf: v })} />
          </Field>
          <Field label="抗CCP抗体">
            <NumberInput value={r.accp} step={0.1} unit="U/mL" onChange={(v) => set({ accp: v })} />
          </Field>
          <Field label="MMP-3">
            <NumberInput value={r.mmp3} step={0.1} unit="ng/mL" onChange={(v) => set({ mmp3: v })} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip on={r.rfPositive === true} onClick={() => set({ rfPositive: r.rfPositive === true ? null : true })}>
            RF 陽性（定性のみの場合）
          </Chip>
          <Chip on={r.accpPositive === true} onClick={() => set({ accpPositive: r.accpPositive === true ? null : true })}>
            抗CCP抗体 陽性（定性のみの場合）
          </Chip>
          <Chip on={r.erosion} onClick={() => set({ erosion: !r.erosion })}>
            単純X線で骨びらんあり
          </Chip>
        </div>
      </Section>

      <Section title="経過とADL">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="発症からの期間">
            <NumberInput value={r.durationMonths} min={0} unit="か月" onChange={(v) => set({ durationMonths: v })} />
          </Field>
          <Field label="HAQ-DI（0〜3・任意）">
            <NumberInput value={r.haq} step={0.125} min={0} max={3} onChange={(v) => set({ haq: v })} />
          </Field>
          <Field label="現在の治療（カンマ区切り）">
            <TextInput
              value={r.currentTherapy.join(', ')}
              placeholder="例：MTX 8mg/週, 葉酸 5mg/週"
              onChange={(v) =>
                set({
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

      <Section title="炎症のある関節（説明図に反映されます）" subtitle="患者さんに図で示すために選択します">
        <div className="space-y-4">
          {REGION_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="label">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <Chip key={it.key} on={r.affectedRegions.includes(it.key)} onClick={() => toggleRegion(it.key)}>
                    {it.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="ACR/EULAR 2010 分類基準用の関節数（早期例のみ・任意）"
        subtitle="大関節＝肩・肘・股・膝・足関節／小関節＝MCP・PIP・第2〜5MTP・母指IP・手関節。28関節とは対象が異なります"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="腫脹・圧痛のある大関節の数">
            <NumberInput
              value={r.largeJointsInvolved}
              min={0}
              unit="か所"
              onChange={(v) => set({ largeJointsInvolved: v })}
            />
          </Field>
          <Field label="腫脹・圧痛のある小関節の数">
            <NumberInput
              value={r.smallJointsInvolved}
              min={0}
              unit="か所"
              onChange={(v) => set({ smallJointsInvolved: v })}
            />
          </Field>
        </div>
      </Section>

      <Section title="併存疾患・注意事項" subtitle="選択すると、薬剤選択上の注意が自動で表示されます">
        <div className="flex flex-wrap gap-2">
          {COMORBIDITY.map((c) => (
            <Chip
              key={String(c.key)}
              on={Boolean(r.comorbidity[c.key])}
              onClick={() => set({ comorbidity: { ...r.comorbidity, [c.key]: !r.comorbidity[c.key] } })}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </Section>
    </>
  )
}
