import { useState } from 'react'
import { useStore } from '@/state/store'
import { Banner, Chip, CopyButton, Field, SegButton, Section, TextInput } from '@/components/ui'
import { DEFAULT_CLINIC, resetClinic, type ClinicConfig, type ExerciseProgram } from '@/data/clinic'
import { FEE_ITEMS, FEE_MASTER_VERIFIED_AT } from '@/data/fees'
import { buildSampleUrl, URL_PARAM_DOC } from '@/logic/urlParams'

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
  // 連携用URLの見本は、いま開いているアドレスを基準に作る
  const baseUrl =
    typeof window !== 'undefined' && window.location.protocol.startsWith('http')
      ? `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}`
      : 'http://192.168.10.20:8080'

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
          title="問診システム・電子カルテとの連携"
          subtitle="電子カルテと直接つながなくても、次の3つの方法でデータを渡せます"
        >
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-4">
              <p className="font-bold text-brand-800">① 貼り付け取り込み（すぐ使えます・設定不要）</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                入力画面の上にある「貼り付けて取り込む」を開き、問診システムの結果画面や
                電子カルテの検査結果を選択してコピーし、貼り付けるだけです。
                「圧痛関節数：6」「腰椎YAM 64%」のように<strong>項目名と数値が同じ行にあれば</strong>読み取れます。
                読み取った内容は必ず確認画面に出るので、誤読があればチェックを外せます。
              </p>
              <p className="mt-1 text-xs text-ink-mute">
                対応項目：SDAI・CDAI・DAS28・圧痛/腫脹関節数・患者/医師VAS・CRP・ESR・RF・抗CCP・MMP-3・HAQ・
                罹病期間／腰椎・大腿骨のYAMとTスコア・FRAX・Ca・25(OH)D・TRACP-5b・P1NP・eGFR／
                K-L分類・NRS・ロコモ25・2ステップ値／年齢・性別・身長・体重・カルテ番号
              </p>
            </div>

            <div className="rounded-xl border-2 border-slate-200 p-4">
              <p className="font-bold text-ink">② ファイル読み込み</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                問診システムから CSV・TSV・テキストで書き出せる場合は、そのファイルを
                取り込みパネルにドラッグ＆ドロップしてください。項目名の読み取り方は①と同じです。
              </p>
            </div>

            <div className="rounded-xl border-2 border-slate-200 p-4">
              <p className="font-bold text-ink">③ URL連携（問診システム側にリンクを置ける場合）</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                問診システムや電子カルテに「せつめいナビを開く」ボタン／リンクを作れる場合は、
                下のような URL を組み立てて渡すと、入力ゼロで説明を始められます。
                患者データは<strong>読み込んだ直後にURLから消去</strong>され、ブラウザの履歴には残りません。
              </p>

              <div className="mt-3 space-y-2">
                {(['ra', 'osteoporosis', 'kneeOA'] as const).map((d) => (
                  <div key={d} className="rounded-lg bg-slate-100 p-2">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-ink-soft">
                        {d === 'ra' ? '関節リウマチ' : d === 'osteoporosis' ? '骨粗鬆症' : '変形性膝関節症・ロコモ'}の例
                      </span>
                      <CopyButton size="sm" label="URLをコピー" text={buildSampleUrl(baseUrl, d)} />
                    </div>
                    <code className="block break-all font-mono text-xs text-ink-soft">{buildSampleUrl(baseUrl, d)}</code>
                  </div>
                ))}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-brand-700">
                  使えるパラメータの一覧（問診システムの担当者にお渡しください）
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-ink-mute">
                        <th className="py-1">パラメータ</th>
                        <th className="py-1">内容</th>
                        <th className="py-1">書き方</th>
                      </tr>
                    </thead>
                    <tbody>
                      {URL_PARAM_DOC.map((p) => (
                        <tr key={p.param} className="border-b border-slate-100">
                          <td className="py-1 font-mono text-xs">{p.param}</td>
                          <td className="py-1">{p.label}</td>
                          <td className="py-1 font-mono text-xs text-ink-mute">{p.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              <div className="mt-3">
                <Banner tone="warn" title="URL連携を使うときの注意">
                  URL には患者データが含まれます。院内サーバー経由で使う場合、
                  サーバーのアクセスログに URL が記録されることがあります。
                  ログに患者データを残したくない場合は、①の貼り付け取り込みをお使いください。
                </Banner>
              </div>
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
