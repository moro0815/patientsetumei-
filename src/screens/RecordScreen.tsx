import { useMemo, useState } from 'react'
import { useStore } from '@/state/store'
import { Badge, Banner, CopyButton, Section } from '@/components/ui'
import { buildKarte, buildPrescriptionText, buildQuickSummary, buildValuesLine } from '@/logic/karte'
import { FEE_MASTER_VERIFIED_AT } from '@/data/fees'
import { citeLabel } from '@/data/sources'

/**
 * STEP 5：診療記録と算定候補
 *
 * ここが「効率化」の中心。
 * - 説明内容をカルテに貼り付けるテキストを自動生成する
 * - 算定しうる項目を候補として提示する（判断はしない）
 * - 次回までの ToDo を明示する
 */
export function RecordScreen() {
  const { session, go, persistDraft, draftSaved, reset } = useStore()
  const karte = useMemo(() => buildKarte(session), [session])
  const [tab, setTab] = useState<'full' | 'soap' | 'quick'>('full')
  const [checked, setChecked] = useState<string[]>([])

  const text = tab === 'full' ? karte.text : tab === 'soap' ? karte.soap : buildQuickSummary(session)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">診療記録と算定候補</h2>
          <p className="text-sm text-ink-mute">
            内容を確認・修正のうえ、電子カルテに貼り付けてください。
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => go('pamphlet')}>
            ← パンフレットへ
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (confirm('この患者さんの入力内容を消して、最初の画面に戻ります。よろしいですか？')) reset()
            }}
          >
            診察を終了して次の患者さんへ
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <Section
          title="カルテ貼り付け用テキスト"
          subtitle="生成された文章は必ず医師が確認・修正してから確定してください"
          right={
            <div className="flex items-center gap-2">
              <div className="inline-flex gap-1 rounded-lg bg-slate-200 p-1">
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-sm font-bold ${tab === 'full' ? 'bg-white text-brand-700 shadow' : 'text-ink-soft'}`}
                  onClick={() => setTab('full')}
                >
                  説明記録（詳細）
                </button>
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-sm font-bold ${tab === 'soap' ? 'bg-white text-brand-700 shadow' : 'text-ink-soft'}`}
                  onClick={() => setTab('soap')}
                >
                  SOAP
                </button>
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-sm font-bold ${tab === 'quick' ? 'bg-white text-brand-700 shadow' : 'text-ink-soft'}`}
                  onClick={() => setTab('quick')}
                >
                  1〜2行（経過欄用）
                </button>
              </div>
              <CopyButton text={text} />
            </div>
          }
        >
          <textarea
            className="h-[420px] w-full resize-y rounded-xl border-2 border-slate-300 bg-slate-50 p-4 font-mono text-[13px] leading-relaxed"
            value={text}
            readOnly
          />
          <p className="mt-2 text-xs text-ink-mute">
            ※コピー後、電子カルテ側で追記・修正してお使いください。患者さんの訴え（S）は手入力が必要です。
          </p>
        </Section>

        <Section
          title="部分コピー"
          subtitle="必要な部分だけを取り出して、電子カルテの該当欄に貼り付けられます"
        >
          <div className="space-y-3">
            {[
              { label: '検査値の1行まとめ', text: buildValuesLine(session), hint: '経過表・サマリ用' },
              { label: '運動処方', text: buildPrescriptionText(session), hint: 'リハビリ指示・スタッフへの申し送り用' },
              {
                label: '説明した内容のみ',
                text: extractSection(karte.text, '■ 説明した内容'),
                hint: '指導内容の記載欄用',
              },
            ]
              .filter((row) => row.text.trim().length > 0)
              .map((row) => (
                <div key={row.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">{row.label}</p>
                      <p className="text-xs text-ink-mute">{row.hint}</p>
                    </div>
                    <CopyButton size="sm" text={row.text} />
                  </div>
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 font-mono text-xs leading-relaxed text-ink-soft">
{row.text}
                  </pre>
                </div>
              ))}
          </div>
        </Section>

        {karte.followUp.length > 0 && (
          <Banner tone="warn" title="今日のうちに済ませておきたいこと" icon="✓">
            <ul className="list-disc space-y-1 pl-5">
              {karte.followUp.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </Banner>
        )}

        <Section
          title="算定候補"
          subtitle="該当しうる項目の候補です。算定の可否・点数は必ず最新の点数表でご確認ください"
          right={<Badge tone="warn">要確認</Badge>}
        >
          <Banner tone="warn" title="点数は改定で変わります">
            このマスタの最終確認日は <strong>{FEE_MASTER_VERIFIED_AT}</strong> です。
            令和8年度診療報酬改定は令和8年3月5日告示・本体は同年6月1日施行です。
            点数・算定要件は必ず最新の医科診療報酬点数表と地方厚生（支）局の通知でご確認のうえ、
            設定画面から院内の値に更新してください。
          </Banner>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left text-xs text-ink-mute">
                  <th className="w-10 py-2"></th>
                  <th className="py-2">区分</th>
                  <th className="py-2">項目</th>
                  <th className="py-2">点数</th>
                  <th className="py-2">単位</th>
                  <th className="py-2">施設基準</th>
                </tr>
              </thead>
              <tbody>
                {karte.feeCandidates.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 align-top">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-brand-600"
                        checked={checked.includes(f.id)}
                        onChange={() =>
                          setChecked((prev) => (prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]))
                        }
                      />
                    </td>
                    <td className="py-2 font-mono text-xs text-ink-mute">{f.code}</td>
                    <td className="py-2">
                      <p className="font-bold text-ink">{f.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{f.requirement}</p>
                    </td>
                    <td className="py-2 tnum font-bold">
                      {f.points !== null ? `${f.points}点` : <Badge tone="warn">要確認</Badge>}
                    </td>
                    <td className="py-2 text-xs">{f.unit}</td>
                    <td className="py-2 text-xs">{f.facilityStandard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {checked.length > 0 && (
            <div className="mt-4">
              <CopyButton
                label="チェックした算定候補をコピー"
                text={
                  '【算定候補（要確認）】\n' +
                  karte.feeCandidates
                    .filter((f) => checked.includes(f.id))
                    .map((f) => `・${f.code} ${f.name}${f.points !== null ? `（${f.points}点／${f.unit}）` : '（点数要確認）'}`)
                    .join('\n')
                }
              />
            </div>
          )}
        </Section>

        <Section title="検査オーダーの候補" subtitle="選択した薬剤に必要な検査が上位に表示されます">
          <div className="grid gap-2 sm:grid-cols-2">
            {karte.labCandidates.map((l) => (
              <div
                key={l.id}
                className={`rounded-xl border-2 p-3 ${
                  session.plan.nextTests.includes(l.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
                }`}
              >
                <p className="font-bold text-ink">
                  {l.name}
                  {session.plan.nextTests.includes(l.id) && (
                    <span className="ml-2">
                      <Badge tone="info">今回オーダー予定</Badge>
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">{l.purpose}</p>
                <p className="mt-0.5 text-xs font-bold text-brand-600">目安：{l.interval}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <CopyButton
              label="オーダー予定の検査をコピー"
              text={
                '【検査オーダー】\n' +
                karte.labCandidates
                  .filter((l) => session.plan.nextTests.includes(l.id))
                  .map((l) => `・${l.name}`)
                  .join('\n')
              }
            />
          </div>
        </Section>

        <Section title="このセッションの一時保存" subtitle="同じ患者さんの説明を続ける場合に使います">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary" onClick={persistDraft}>
              💾 一時保存する
            </button>
            {draftSaved && <Badge tone="good">保存しました</Badge>}
            <p className="text-sm text-ink-mute">
              ブラウザのタブを閉じると自動的に消えます（sessionStorage）。端末に患者情報を残したくない場合は保存しないでください。
            </p>
          </div>
        </Section>

        <p className="text-xs leading-relaxed text-ink-mute">
          出典：{citeLabel(['mhlw-fee-r8', 'op-gl-2025', 'ra-gl-2024', 'knee-gl-2023', 'fls-standard'])}
        </p>
      </div>
    </div>
  )
}

/** 生成した記録テキストから、指定した見出しのブロックだけを取り出す */
function extractSection(text: string, heading: string): string {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => l.startsWith(heading))
  if (start === -1) return ''
  const rest = lines.slice(start + 1)
  const endRel = rest.findIndex((l) => l.startsWith('■'))
  const body = endRel === -1 ? rest : rest.slice(0, endRel)
  return [lines[start], ...body].join('\n').trim()
}
