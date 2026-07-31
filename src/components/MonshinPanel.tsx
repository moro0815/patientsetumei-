import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/state/store'
import { Badge, Banner, TextInput } from '@/components/ui'
import {
  applyIntakeToSession,
  calcMhaq,
  checkConnection,
  fetchTodayIntakes,
  intakeSummary,
  searchIntakes,
  type MonshinIntake,
} from '@/logic/monshin'

/**
 * 問診システム（monshin-tablet）からの直接読み込み
 *
 * 当日の問診一覧を取得して患者を選ぶだけで、
 * 診察券番号・氏名・年齢・性別と、リウマチ再診問診の回答
 * （患者全般評価VAS・mHAQ・朝のこわばり・前回比）が入力欄に入ります。
 *
 * 関節数・CRP・SDAI は問診システムの診察室画面で入力する値なので、
 * そちらの「スコアをカルテにコピー」を貼り付ける方法（貼り付け取り込み）と
 * 組み合わせて使います。画面にもその案内を出します。
 */
export function MonshinPanel({
  onClose,
  onGoToPaste,
}: {
  onClose: () => void
  /** 「続けてスコアを貼り付ける」で貼り付け取り込みへ切り替える */
  onGoToPaste: () => void
}) {
  const { session, setSession, clinic } = useStore()
  const base = clinic.monshinBaseUrl

  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [intakes, setIntakes] = useState<MonshinIntake[]>([])
  const [selected, setSelected] = useState<MonshinIntake | null>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<{ applied: string[]; notes: string[] } | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setMessage('')
    const r = await fetchTodayIntakes(base)
    if (!r.ok) {
      setStatus('error')
      setMessage(r.error ?? '取得できませんでした。')
      return
    }
    setIntakes(r.intakes)
    setStatus('ok')
    setMessage(r.intakes.length === 0 ? '本日の問診はまだありません。' : '')
  }, [base])

  useEffect(() => {
    void load()
  }, [load])

  const runSearch = async () => {
    if (query.trim().length < 2) return
    setSearching(true)
    const r = await searchIntakes(base, query)
    setSearching(false)
    if (!r.ok) {
      setStatus('error')
      setMessage(r.error ?? '検索できませんでした。')
      return
    }
    setIntakes(r.intakes)
    setMessage(r.intakes.length === 0 ? '該当する問診が見つかりませんでした。' : `検索結果 ${r.intakes.length}件`)
  }

  const apply = () => {
    if (!selected) return
    const r = applyIntakeToSession(session, selected)
    setSession(() => r.session)
    setResult({ applied: r.applied, notes: r.notes })
    setSelected(null)
  }

  return (
    <div className="rounded-2xl border-2 border-good-400 bg-white p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-good-600">問診システムから読み込む</h3>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost !min-h-[36px] !py-1.5" onClick={() => void load()}>
            🔄 更新
          </button>
          <button type="button" className="btn-ghost !min-h-[36px] !py-1.5" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>

      {status === 'loading' && <p className="text-sm text-ink-mute">問診システムに問い合わせています…</p>}

      {status === 'error' && (
        <Banner tone="warn" title="問診システムに接続できませんでした" icon="⚠">
          <p className="whitespace-pre-wrap">{message}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary !min-h-[36px] !py-1.5" onClick={() => void load()}>
              再試行
            </button>
            <button
              type="button"
              className="btn-ghost !min-h-[36px] !py-1.5"
              onClick={async () => {
                const c = await checkConnection(base)
                setMessage(c.message)
              }}
            >
              接続を確認
            </button>
          </div>
          <p className="mt-2 text-xs">
            接続できない場合も、問診システムの画面から文字をコピーして
            「貼り付けて取り込む」を使えば同じ内容を取り込めます。
          </p>
        </Banner>
      )}

      {result && (
        <div className="mb-3">
          <Banner tone="good" title="問診の内容を取り込みました" icon="✓">
            <p>取り込んだ項目：{result.applied.join('、') || '（なし）'}</p>
            {result.notes.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 font-bold">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-ink-mute">
              関節数・CRP・SDAI は診察室で入力する値です。問診システムの診察室画面（doctor.html）の
              「📋 スコアをカルテにコピー」を押して、貼り付け取り込みに貼るとまとめて入ります。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn-primary !min-h-[40px] !py-1.5" onClick={onGoToPaste}>
                続けてスコアを貼り付ける →
              </button>
              <button type="button" className="btn-ghost !min-h-[40px] !py-1.5" onClick={onClose}>
                入力画面に戻る
              </button>
            </div>
          </Banner>
        </div>
      )}

      {status === 'ok' && (
        <>
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <label className="flex-1">
              <span className="label">過去の問診を探す（氏名・カナ・診察券番号・生年月日）</span>
              <TextInput value={query} onChange={setQuery} placeholder="2文字以上で検索" />
            </label>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void runSearch()}
              disabled={query.trim().length < 2 || searching}
            >
              {searching ? '検索中…' : '検索'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('')
                void load()
              }}
            >
              本日分に戻す
            </button>
          </div>

          {message && <p className="mb-2 text-sm text-ink-mute">{message}</p>}

          {intakes.length > 0 && (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
              <ul className="divide-y divide-slate-100">
                {intakes.map((it) => {
                  const on = selected?.id === it.id
                  const mhaq = calcMhaq(it.answers)
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(on ? null : it)}
                        className={`flex w-full flex-wrap items-center gap-2 p-3 text-left transition ${
                          on ? 'bg-good-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                            on ? 'border-good-500 bg-good-500 text-white' : 'border-slate-300 text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span className="flex-1">
                          <span className="block font-bold text-ink">{intakeSummary(it)}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {it.form === 'ra' && <Badge tone="info">リウマチ再診</Badge>}
                            {mhaq.value !== null && <Badge>mHAQ {mhaq.value}</Badge>}
                            {typeof it.answers?.vasGlobal === 'number' && (
                              <Badge>患者VAS {String(it.answers.vasGlobal)}/100</Badge>
                            )}
                            {(it.alerts ?? []).map((al, i) => (
                              <Badge key={i} tone="warn">
                                {al.label}
                              </Badge>
                            ))}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {selected && (
            <div className="mt-3 rounded-xl border-2 border-good-400 bg-good-50 p-3">
              <p className="mb-2 font-bold text-good-600">
                「{selected.name || '（氏名は受付で確認）'}」さんの問診を取り込みます
              </p>
              <PreviewList intake={selected} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" className="btn-primary" onClick={apply}>
                  この内容を取り込む
                </button>
                <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>
                  やめる
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PreviewList({ intake }: { intake: MonshinIntake }) {
  const a = (intake.answers ?? {}) as Record<string, unknown>
  const mhaq = calcMhaq(a)
  const rows: { label: string; value: string }[] = []

  if (intake.patientId) rows.push({ label: '診察券番号', value: intake.patientId })
  if (intake.name) rows.push({ label: '氏名', value: intake.name })
  if (intake.age !== null && intake.age !== undefined) rows.push({ label: '年齢', value: `${intake.age}歳` })
  if (intake.sex) rows.push({ label: '性別', value: intake.sex === 'f' ? '女性' : '男性' })
  if (intake.form === 'ra') rows.push({ label: '問診の種類', value: 'リウマチ再診' })

  const vg = a.vasGlobal
  if (vg !== null && vg !== undefined && vg !== '') {
    rows.push({ label: '患者全般評価VAS', value: `${vg}/100 → ${Number(vg) / 10}（0〜10cm）` })
  }
  if (mhaq.value !== null) {
    rows.push({ label: 'mHAQ', value: `${mhaq.value}${mhaq.answered < 8 ? `（${mhaq.answered}/8項目）` : ''}` })
  }
  if (typeof a.stiffness === 'string' && a.stiffness) rows.push({ label: '朝のこわばり', value: String(a.stiffness) })
  if (typeof a.raChange === 'string' && a.raChange) rows.push({ label: '前回との比較', value: String(a.raChange) })
  if (typeof a.raNote === 'string' && a.raNote.trim()) rows.push({ label: '患者さんの伝言', value: a.raNote })

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-good-100 last:border-0">
            <th className="w-[36%] py-1.5 pr-2 text-left align-top font-bold text-ink-soft">{r.label}</th>
            <td className="py-1.5 align-top text-ink">{r.value}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td className="py-2 text-ink-mute">取り込める項目が見つかりませんでした。</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
