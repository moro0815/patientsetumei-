import { useEffect } from 'react'
import { useStore } from '@/state/store'
import { Banner, SegButton } from '@/components/ui'
import { Pamphlet, SECTION_LABELS, type PamphletSection } from '@/components/pamphlet/Pamphlet'

/**
 * STEP 4：パンフレットの作成と印刷
 *
 * 「その場で印刷して渡せる」ことがこのシステムの目的なので、
 * 余計な確認を挟まず、プレビュー → 印刷ボタン の2手で完結させる。
 */
export function PamphletScreen() {
  const { session, setSession, clinic, go, view, setView } = useStore()

  // 初回表示時に、選ばれている内容に応じて既定のページ構成を決める
  useEffect(() => {
    if (session.pamphletSections.length > 0) return
    const defaults: PamphletSection[] = ['cover', 'mechanism', 'schedule']
    if (session.plan.drugIds.length > 0) defaults.splice(2, 0, 'treatment')
    if (session.plan.prescription.length > 0) defaults.splice(defaults.length - 1, 0, 'exercise', 'record')
    defaults.splice(defaults.length - 1, 0, 'nutrition')
    if (session.disease !== 'ra') defaults.splice(defaults.length - 1, 0, 'fall')
    setSession((prev) => ({ ...prev, pamphletSections: defaults }))
  }, [session.pamphletSections.length, session.plan.drugIds.length, session.plan.prescription.length, session.disease, setSession])

  const toggle = (k: PamphletSection) => {
    setSession((prev) => ({
      ...prev,
      pamphletSections: prev.pamphletSections.includes(k)
        ? prev.pamphletSections.filter((x) => x !== k)
        : [...prev.pamphletSections, k],
    }))
  }

  const sections = session.pamphletSections as PamphletSection[]

  return (
    <div>
      {/* 操作パネル（印刷されない） */}
      <div className="no-print sticky top-16 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-ink">パンフレットの作成</h2>
            <p className="text-sm text-ink-mute">
              載せるページを選んで、印刷ボタンを押してください（PDFで保存する場合も同じボタンです）
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegButton
              value={view.pamphletScale}
              size="sm"
              options={[
                { value: 'normal', label: '標準の文字' },
                { value: 'large', label: '大きな文字' },
              ]}
              onChange={(v) => setView({ pamphletScale: v })}
            />
            <button type="button" className="btn-secondary" onClick={() => go('plan')}>
              ← 治療方針へ
            </button>
            <button type="button" className="btn-primary btn-lg" onClick={() => window.print()}>
              🖨 印刷する
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 max-w-6xl">
          <div className="flex flex-wrap gap-2">
            {SECTION_LABELS.map((s) => {
              const disabled =
                (s.key === 'treatment' && session.plan.drugIds.length === 0) ||
                ((s.key === 'exercise' || s.key === 'record') && session.plan.prescription.length === 0) ||
                (s.key === 'fall' && session.disease === 'ra')
              return (
                <button
                  key={s.key}
                  type="button"
                  disabled={disabled}
                  title={disabled ? '前の画面で内容を選ぶと使えます' : s.detail}
                  onClick={() => toggle(s.key)}
                  className={`chip ${sections.includes(s.key) && !disabled ? 'chip-on' : ''} ${disabled ? 'opacity-40' : ''}`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="no-print mx-auto max-w-6xl px-4 py-4">
        <Banner tone="info" title="印刷のコツ">
          <ul className="list-disc space-y-0.5 pl-5">
            <li>用紙サイズ「A4」・倍率「100%」・「背景のグラフィック」をオンにすると、図が見やすく印刷されます。</li>
            <li>PDFにする場合は、印刷先（プリンタ）で「PDFに保存」を選んでください。</li>
            <li>両面印刷にすると枚数が半分になります。高齢の方には片面のほうが読みやすいこともあります。</li>
          </ul>
        </Banner>
      </div>

      {/* プレビュー（印刷対象） */}
      <div className="bg-slate-200 py-6 print:bg-white print:py-0">
        <Pamphlet session={session} clinic={clinic} sections={sections} />
      </div>

      <div className="no-print mx-auto flex max-w-6xl flex-wrap justify-end gap-3 px-4 py-6">
        <button type="button" className="btn-ghost" onClick={() => go('plan')}>
          ← 治療方針へ戻る
        </button>
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          🖨 もう一度印刷
        </button>
        <button type="button" className="btn-primary btn-lg" onClick={() => go('record')}>
          カルテ記載・算定候補へ →
        </button>
      </div>
    </div>
  )
}
