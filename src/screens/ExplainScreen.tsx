import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from '@/state/store'
import { getSlides, SLIDE_GROUPS } from '@/slides'
import { citeLabel } from '@/data/sources'
import { Banner, DoctorNote } from '@/components/ui'

/**
 * STEP 2：説明モード（診察室で患者さんに見せる画面）
 *
 * 操作の設計
 * - 進む／戻るは画面下部の大きなボタン、キーボードの ← → 、および画面クリックでも可
 * - 医師用トークスクリプトは既定で表示。患者さんに画面を渡すときはワンタップで隠せる
 * - スライド一覧から「今日話す内容」だけを選べる（選んだものはパンフレットに載る）
 */
export function ExplainScreen() {
  const { session, setSession, go, view, setView } = useStore()
  const slides = useMemo(() => getSlides(session), [session])
  const [index, setIndex] = useState(0)
  const [showList, setShowList] = useState(false)

  const current = slides[Math.min(index, slides.length - 1)]

  const next = useCallback(() => setIndex((i) => Math.min(slides.length - 1, i + 1)), [slides.length])
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])

  // 見せたスライドを記録に残す（カルテ記載と算定の裏づけになる）
  useEffect(() => {
    if (!current) return
    setSession((prev) =>
      prev.shownSlideIds.includes(current.id)
        ? prev
        : { ...prev, shownSlideIds: [...prev.shownSlideIds, current.id] },
    )
  }, [current, setSession])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      }
      if (e.key === 'Escape') setShowList(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Banner tone="warn" title="表示できるスライドがありません">
          先に患者データを入力してください。
        </Banner>
        <button type="button" className="btn-primary mt-4" onClick={() => go('input')}>
          入力画面へ戻る
        </button>
      </div>
    )
  }

  const toneClass = {
    info: 'border-brand-400 bg-brand-50 text-brand-900',
    warn: 'border-alert-400 bg-alert-50 text-alert-600',
    good: 'border-good-400 bg-good-50 text-good-600',
  }

  return (
    <div className="patient-stage flex min-h-[calc(100vh-64px)] flex-col bg-white">
      {/* 上部バー（医師の操作用） */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost !min-h-[40px] !py-1.5" onClick={() => setShowList((v) => !v)}>
            ☰ スライド一覧（{index + 1}/{slides.length}）
          </button>
          <span className="badge bg-slate-200 text-ink-soft">{current.group}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-ghost !min-h-[40px] !py-1.5"
            onClick={() => setView({ showDoctorNote: !view.showDoctorNote })}
          >
            {view.showDoctorNote ? '🙈 医師メモを隠す' : '👁 医師メモを表示'}
          </button>
          <div className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 shadow-sm">
            <span className="text-xs font-bold text-ink-mute">文字</span>
            <button
              type="button"
              className="px-2 text-lg font-bold text-brand-700"
              onClick={() => setView({ patientScale: Math.max(0.8, Number((view.patientScale - 0.1).toFixed(1))) })}
              aria-label="文字を小さく"
            >
              −
            </button>
            <span className="w-10 text-center text-sm tnum font-bold">{Math.round(view.patientScale * 100)}%</span>
            <button
              type="button"
              className="px-2 text-lg font-bold text-brand-700"
              onClick={() => setView({ patientScale: Math.min(1.8, Number((view.patientScale + 0.1).toFixed(1))) })}
              aria-label="文字を大きく"
            >
              ＋
            </button>
          </div>
          <button type="button" className="btn-secondary !min-h-[40px] !py-1.5" onClick={() => go('plan')}>
            治療方針へ →
          </button>
        </div>
      </div>

      {/* スライド一覧 */}
      {showList && (
        <div className="no-print border-b border-slate-200 bg-white p-4 shadow-inner">
          <p className="mb-2 text-sm text-ink-mute">
            話したい順に選べます。クリックでそのスライドへ移動します。パンフレットに載せる内容は次の画面で選びます。
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SLIDE_GROUPS.filter((g) => slides.some((s) => s.group === g)).map((g) => (
              <div key={g}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">{g}</p>
                <ul className="space-y-1">
                  {slides
                    .map((s, i) => ({ s, i }))
                    .filter(({ s }) => s.group === g)
                    .map(({ s, i }) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setIndex(i)
                            setShowList(false)
                          }}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                            i === index ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
                          }`}
                        >
                          <span className="mr-1.5 tnum text-xs opacity-70">{i + 1}.</span>
                          {s.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* スライド本体 */}
      <div
        className="flex flex-1 cursor-pointer flex-col px-6 py-6 lg:px-12"
        onClick={(e) => {
          // 画面の右半分をタップで進む、左端をタップで戻る（診察室でのタブレット操作用）
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const rel = (e.clientX - rect.left) / rect.width
          if (rel > 0.6) next()
          else if (rel < 0.15) prev()
        }}
      >
        <h2 className="mb-2 text-ink">{current.title}</h2>
        {current.lead && <p className="lead mb-4 font-bold text-brand-700">{current.lead}</p>}

        <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {current.figure && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">{current.figure}</div>
          )}
          <div className={current.figure ? '' : 'lg:col-span-2'}>
            {current.points && (
              <ul className="space-y-3">
                {current.points.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="mt-1 shrink-0 text-brand-500">
                      ●
                    </span>
                    <span className="leading-relaxed text-ink">{p}</span>
                  </li>
                ))}
              </ul>
            )}
            {current.highlight && (
              <div className={`mt-5 rounded-2xl border-l-8 p-4 ${toneClass[current.highlight.tone]}`}>
                <p className="lead font-bold">{current.highlight.text}</p>
              </div>
            )}
          </div>
        </div>

        {current.cite && current.cite.length > 0 && (
          <p className="mt-4 text-xs text-ink-mute">出典：{citeLabel(current.cite)}</p>
        )}

        {view.showDoctorNote && current.talk && current.talk.length > 0 && (
          <div className="no-print mt-5">
            <DoctorNote label="医師向け：この画面で伝えること">
              <ul className="list-disc space-y-1 pl-5">
                {current.talk.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </DoctorNote>
          </div>
        )}
      </div>

      {/* 下部ナビ */}
      <div className="no-print sticky bottom-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button type="button" className="btn-secondary btn-lg" onClick={prev} disabled={index === 0}>
          ◀ 前へ
        </button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              title={s.title}
              onClick={() => setIndex(i)}
              className={`h-3 rounded-full transition-all ${
                i === index ? 'w-8 bg-brand-600' : i < index ? 'w-3 bg-brand-300' : 'w-3 bg-slate-300'
              }`}
              aria-label={`${i + 1}枚目：${s.title}`}
            />
          ))}
        </div>
        {index < slides.length - 1 ? (
          <button type="button" className="btn-primary btn-lg" onClick={next}>
            次へ ▶
          </button>
        ) : (
          <button type="button" className="btn-primary btn-lg" onClick={() => go('plan')}>
            治療方針を決める →
          </button>
        )}
      </div>
    </div>
  )
}
