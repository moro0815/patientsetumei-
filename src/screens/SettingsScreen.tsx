import { useState } from 'react'
import { useStore } from '@/state/store'
import { Banner, Chip, Field, SegButton, Section, TextInput } from '@/components/ui'
import { DEFAULT_CLINIC, resetClinic, type ClinicConfig, type ExerciseProgram } from '@/data/clinic'
import { FEE_ITEMS, FEE_MASTER_VERIFIED_AT } from '@/data/fees'

/**
 * 設定・マスタ編集
 *
 * 導入時に必ず設定していただきたい項目を上に、
 * 端末ごとの表示設定を下に置いている。
 */
export function SettingsScreen() {
  const { clinic, setClinic, view, setView, go } = useStore()
  const [draft, setDraft] = useState<ClinicConfig>(clinic)
  const [saved, setSaved] = useState(false)

  const set = (v: Partial<ClinicConfig>) => {
    setDraft((prev) => ({ ...prev, ...v }))
    setSaved(false)
  }

  const setProgram = (id: string, v: Partial<ExerciseProgram>) => {
    set({ programs: draft.programs.map((p) => (p.id === id ? { ...p, ...v } : p)) })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">設定・マスタ編集</h2>
          <p className="text-sm text-ink-mute">この端末のブラウザに保存されます（院内の全端末で設定する必要があります）</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => go('home')}>
            ← 戻る
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setClinic(draft)
              setSaved(true)
            }}
          >
            保存する
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-4">
          <Banner tone="good" title="保存しました" icon="✓">
            パンフレットと画面表示に反映されます。
          </Banner>
        </div>
      )}

      <div className="space-y-5">
        <Banner tone="warn" title="導入時に必ず確認してください" icon="⚠">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>診療報酬の点数</strong>は改定（2年ごと）で変わります。本システムの初期値は
              「編集前提の参考値」であり、そのまま算定根拠には使えません。最終確認日：{FEE_MASTER_VERIFIED_AT}
            </li>
            <li>
              <strong>薬剤の用量・禁忌</strong>は必ず最新の添付文書でご確認ください。商品名は院内採用品に置き換えてください。
            </li>
            <li>
              <strong>運動処方の内容・強度</strong>は、理学療法士の評価と患者の状態に合わせて必ず調整してください。
            </li>
            <li>
              このシステムは<strong>説明支援ツール</strong>であり、診断・治療を決定する医療機器ではありません。
            </li>
          </ul>
        </Banner>

        <Section title="医療機関の情報" subtitle="パンフレットの表紙・連絡先ページに印字されます">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="医療機関名">
              <TextInput value={draft.name} onChange={(v) => set({ name: v })} />
            </Field>
            <Field label="診療科">
              <TextInput value={draft.department} onChange={(v) => set({ department: v })} />
            </Field>
            <Field label="郵便番号">
              <TextInput value={draft.postalCode} onChange={(v) => set({ postalCode: v })} />
            </Field>
            <Field label="住所">
              <TextInput value={draft.address} onChange={(v) => set({ address: v })} />
            </Field>
            <Field label="電話番号">
              <TextInput value={draft.tel} onChange={(v) => set({ tel: v })} />
            </Field>
            <Field label="電話の注記">
              <TextInput value={draft.telNote} onChange={(v) => set({ telNote: v })} />
            </Field>
            <Field label="診療時間">
              <TextInput value={draft.hours} onChange={(v) => set({ hours: v })} />
            </Field>
            <Field label="休診日">
              <TextInput value={draft.closed} onChange={(v) => set({ closed: v })} />
            </Field>
            <Field label="当院の特色（表紙に印字）" wide>
              <TextInput value={draft.tagline} onChange={(v) => set({ tagline: v })} />
            </Field>
            <Field label="時間外の案内文" wide>
              <TextInput value={draft.emergencyContact} onChange={(v) => set({ emergencyContact: v })} />
            </Field>
            <Field
              label="患者向けページのURL（QRコードになります）"
              hint="院内LANの静的ページ、または院のWebサイト。空欄にするとQRコードは印刷されません"
              wide
            >
              <TextInput value={draft.patientPageUrl} onChange={(v) => set({ patientPageUrl: v })} />
            </Field>
            <Field label="リハビリスタッフ体制">
              <TextInput value={draft.rehabStaff} onChange={(v) => set({ rehabStaff: v })} />
            </Field>
            <Field label="骨粗鬆症マネージャー等の記載">
              <TextInput value={draft.olsNote} onChange={(v) => set({ olsNote: v })} />
            </Field>
          </div>
        </Section>

        <Section title="運動療法プログラム" subtitle="パンフレットの案内に載ります。日程・費用は院内の最新のものに合わせてください">
          <div className="space-y-4">
            {draft.programs.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="プログラム名">
                    <TextInput value={p.name} onChange={(v) => setProgram(p.id, { name: v })} />
                  </Field>
                  <Field label="日程">
                    <TextInput value={p.schedule} onChange={(v) => setProgram(p.id, { schedule: v })} />
                  </Field>
                  <Field label="所要時間">
                    <TextInput value={p.duration} onChange={(v) => setProgram(p.id, { duration: v })} />
                  </Field>
                  <Field label="担当">
                    <TextInput value={p.staff} onChange={(v) => setProgram(p.id, { staff: v })} />
                  </Field>
                  <Field label="費用">
                    <TextInput value={p.cost} onChange={(v) => setProgram(p.id, { cost: v })} />
                  </Field>
                  <Field label="対象">
                    <TextInput value={p.target} onChange={(v) => setProgram(p.id, { target: v })} />
                  </Field>
                  <Field label="患者さん向けの説明" wide>
                    <TextInput value={p.description} onChange={(v) => setProgram(p.id, { description: v })} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="連携先" subtitle="歯科・薬局・専門医療機関。パンフレットに一部が印字されます">
          <div className="space-y-3">
            {draft.partners.map((pt, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-3">
                <Field label="種別">
                  <TextInput
                    value={pt.kind}
                    onChange={(v) =>
                      set({ partners: draft.partners.map((x, j) => (j === i ? { ...x, kind: v } : x)) })
                    }
                  />
                </Field>
                <Field label="名称">
                  <TextInput
                    value={pt.name}
                    onChange={(v) =>
                      set({ partners: draft.partners.map((x, j) => (j === i ? { ...x, name: v } : x)) })
                    }
                  />
                </Field>
                <Field label="メモ">
                  <TextInput
                    value={pt.note}
                    onChange={(v) =>
                      set({ partners: draft.partners.map((x, j) => (j === i ? { ...x, note: v } : x)) })
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
        </Section>

        <Section title="表示の設定（この端末のみ）" subtitle="診察室のモニタサイズや患者さんの見えやすさに合わせて調整します">
          <div className="space-y-4">
            <Field label="説明画面の文字の大きさ">
              <SegButton
                value={String(view.patientScale)}
                options={[
                  { value: '0.9', label: '小' },
                  { value: '1', label: '標準' },
                  { value: '1.2', label: '大' },
                  { value: '1.4', label: '特大' },
                ]}
                onChange={(v) => setView({ patientScale: Number(v) })}
              />
            </Field>
            <Field label="パンフレットの文字の大きさ">
              <SegButton
                value={view.pamphletScale}
                options={[
                  { value: 'normal', label: '標準' },
                  { value: 'large', label: '大きめ（高齢の方向け）' },
                ]}
                onChange={(v) => setView({ pamphletScale: v })}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Chip on={view.ruby} onClick={() => setView({ ruby: !view.ruby })}>
                ふりがなを表示する
              </Chip>
              <Chip on={view.showDoctorNote} onClick={() => setView({ showDoctorNote: !view.showDoctorNote })}>
                説明画面に医師用メモを表示する
              </Chip>
            </div>
          </div>
        </Section>

        <Section
          title="診療報酬マスタ"
          subtitle="点数はソースコード（src/data/fees.ts）で管理しています。改定時はここを更新してください"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left text-xs text-ink-mute">
                  <th className="py-2">区分</th>
                  <th className="py-2">項目</th>
                  <th className="py-2">初期値</th>
                  <th className="py-2">単位</th>
                </tr>
              </thead>
              <tbody>
                {FEE_ITEMS.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-xs text-ink-mute">{f.code}</td>
                    <td className="py-2">{f.name}</td>
                    <td className="py-2 tnum font-bold">{f.points !== null ? `${f.points}点` : '要確認'}</td>
                    <td className="py-2 text-xs">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-mute">
            最終確認日：{FEE_MASTER_VERIFIED_AT}　／　更新方法は docs/05_カスタマイズガイド.md をご覧ください。
          </p>
        </Section>

        <Section title="初期化">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (confirm('医療機関の設定を初期状態に戻します。よろしいですか？')) {
                resetClinic()
                setDraft(DEFAULT_CLINIC)
                setClinic(DEFAULT_CLINIC)
              }
            }}
          >
            医療機関の設定を初期状態に戻す
          </button>
        </Section>
      </div>
    </div>
  )
}
