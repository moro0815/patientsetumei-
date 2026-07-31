import { useMemo, useRef, useState } from 'react'
import { useStore } from '@/state/store'
import { Badge, Banner } from '@/components/ui'
import { applyParsedFields, fieldsForDisease, parseClinicalText, type ParsedField } from '@/logic/importer'

/**
 * 外部システムからの取り込みパネル
 *
 * 問診システムの結果画面・電子カルテの検査結果を「そのまま貼り付ける」だけで、
 * 項目名を読み取って入力欄に反映する。相手のシステムを問わず使える。
 *
 * 安全のため、必ず「読み取った内容の確認 → 取り込む」の2段階にしている。
 * 誤読があってもチェックを外せば取り込まれない。
 */
export function ImportPanel() {
  const { session, setSession } = useStore()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<ParsedField[] | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [applied, setApplied] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const placeholder = useMemo(() => {
    if (session.disease === 'ra') {
      return `例）問診システムの結果画面をそのまま貼り付けてください

圧痛関節数：6
腫脹関節数：4
患者全般評価（VAS）：5.0
医師全般評価（VAS）：4.0
CRP：1.2
ESR：30
SDAI：20.2
罹病期間：8か月`
    }
    if (session.disease === 'osteoporosis') {
      return `例）電子カルテやDXAレポートの記載を貼り付けてください

腰椎YAM 64%
大腿骨近位部YAM 62%
身長 148
体重 46
eGFR 58`
    }
    return `例）検査結果を貼り付けてください

K-L分類 3
疼痛NRS 6
ロコモ25 18
2ステップ値 1.05`
  }, [session.disease])

  const run = (raw: string) => {
    const result = parseClinicalText(raw)
    const filtered = fieldsForDisease(result.fields, session.disease)
    const dropped = result.fields.length - filtered.length
    setParsed(filtered)
    setWarnings(
      dropped > 0
        ? [...result.warnings, `いま選んでいる疾患に関係しない項目 ${dropped} 件は表示していません。`]
        : result.warnings,
    )
    setApplied(null)
  }

  const readFile = async (file: File) => {
    const content = await file.text()
    setText(content)
    run(content)
  }

  const apply = () => {
    if (!parsed) return
    const chosen = parsed.filter((f) => f.selected)
    setSession((prev) => applyParsedFields(prev, chosen))
    setApplied(chosen.length)
    setParsed(null)
    setText('')
  }

  const toggle = (key: string) => {
    setParsed((prev) => (prev ? prev.map((f) => (f.key === key ? { ...f, selected: !f.selected } : f)) : prev))
  }

  if (!open) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-brand-800">
              📋 問診システム・電子カルテの結果を貼り付けて取り込む
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {session.disease === 'ra'
                ? 'SDAI・関節数・VAS・CRP などを、画面からコピーして貼るだけで入力できます。'
                : session.disease === 'osteoporosis'
                  ? 'YAM値・身長体重・検査値を、カルテからコピーして貼るだけで入力できます。'
                  : 'K-L分類・NRS・ロコモ度テストの結果を貼り付けて入力できます。'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {applied !== null && <Badge tone="good">{applied}項目を取り込みました</Badge>}
            <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
              貼り付けて取り込む
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 border-brand-400 bg-white p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-brand-800">外部システムからの取り込み</h3>
        <button type="button" className="btn-ghost !min-h-[36px] !py-1.5" onClick={() => setOpen(false)}>
          閉じる
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files?.[0]
          if (f) void readFile(f)
        }}
        className={dragging ? 'rounded-xl ring-4 ring-brand-300' : ''}
      >
        <textarea
          className="h-48 w-full resize-y rounded-xl border-2 border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-relaxed focus:border-brand-500 focus:outline-none"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            // 貼り付けたその場で読み取る（ボタンを押す手間を省く）
            const pasted = e.clipboardData.getData('text')
            if (pasted) {
              e.preventDefault()
              setText(pasted)
              run(pasted)
            }
          }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={() => run(text)} disabled={!text.trim()}>
          読み取る
        </button>
        <button type="button" className="btn-ghost !min-h-[40px] !py-1.5" onClick={() => fileRef.current?.click()}>
          ファイルから読み込む（CSV / TSV / テキスト）
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt,.json,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void readFile(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          className="btn-ghost !min-h-[40px] !py-1.5"
          onClick={() => {
            setText('')
            setParsed(null)
            setWarnings([])
          }}
        >
          消去
        </button>
        <span className="text-xs text-ink-mute">
          ドラッグ＆ドロップでもファイルを読み込めます。貼り付けると自動で読み取ります。
        </span>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3">
          <Banner tone="warn" title="確認してください" icon="⚠">
            <ul className="list-disc space-y-1 pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Banner>
        </div>
      )}

      {parsed && parsed.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-ink">
              読み取った内容（{parsed.filter((f) => f.selected).length} / {parsed.length} 件を取り込みます）
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost !min-h-[32px] !px-3 !py-1 text-sm"
                onClick={() => setParsed(parsed.map((f) => ({ ...f, selected: true })))}
              >
                すべて選択
              </button>
              <button
                type="button"
                className="btn-ghost !min-h-[32px] !px-3 !py-1 text-sm"
                onClick={() => setParsed(parsed.map((f) => ({ ...f, selected: false })))}
              >
                すべて解除
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-ink-mute">
                  <th className="w-10 p-2"></th>
                  <th className="p-2">項目</th>
                  <th className="p-2">読み取った値</th>
                  <th className="p-2">元の記載</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((f) => (
                  <tr key={f.key} className={`border-b border-slate-100 ${f.selected ? '' : 'opacity-40'}`}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-brand-600"
                        checked={f.selected}
                        onChange={() => toggle(f.key)}
                      />
                    </td>
                    <td className="p-2 font-bold text-ink">{f.label}</td>
                    <td className="p-2">
                      <span className="tnum text-base font-bold text-brand-700">
                        {typeof f.value === 'string'
                          ? f.value === 'female'
                            ? '女性'
                            : f.value === 'male'
                              ? '男性'
                              : f.value
                          : f.value}
                      </span>
                      {f.note && <span className="ml-2 text-xs text-alert-600">（{f.note}）</span>}
                    </td>
                    <td className="p-2 font-mono text-xs text-ink-mute">{f.raw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={apply}
              disabled={parsed.every((f) => !f.selected)}
            >
              チェックした項目を取り込む
            </button>
            <p className="text-sm text-ink-mute">
              取り込んだあとも、入力欄で自由に修正できます。
            </p>
          </div>
        </div>
      )}

      {parsed && parsed.length === 0 && (
        <p className="mt-3 text-sm text-ink-mute">
          読み取れる項目がありませんでした。「項目名」と「数値」が同じ行にある形式でお試しください。
        </p>
      )}
    </div>
  )
}
