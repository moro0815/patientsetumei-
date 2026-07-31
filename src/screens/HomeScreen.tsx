import { useState } from 'react'
import { useStore } from '@/state/store'
import { DISEASE_LABEL, DISEASE_SUBLABEL, hasDraft } from '@/state/session'
import { Banner } from '@/components/ui'
import type { DiseaseKey } from '@/types'

const CARDS: { key: DiseaseKey; icon: string; accent: string }[] = [
  { key: 'osteoporosis', icon: '🦴', accent: 'from-bone-100 to-bone-200 border-bone-400' },
  { key: 'ra', icon: '🖐️', accent: 'from-pink-50 to-pink-100 border-pink-300' },
  { key: 'kneeOA', icon: '🦵', accent: 'from-brand-50 to-brand-100 border-brand-300' },
]

export function HomeScreen() {
  const { reset, setSession, go, clinic, restoreDraft } = useStore()
  const [draftAvailable] = useState(() => hasDraft())

  const start = (disease: DiseaseKey) => {
    reset(disease)
    setSession((prev) => ({ ...prev, disease }))
    go('input')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold tracking-wide text-brand-600">{clinic.name}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">患者説明支援システム</h1>
        <p className="mt-2 text-ink-soft">
          説明したい病気を選んでください。図で説明したあと、そのままパンフレットを印刷できます。
        </p>
      </div>

      {draftAvailable && (
        <div className="mb-6">
          <Banner tone="info" title="前回の入力が残っています" icon="↩">
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={() => {
                if (restoreDraft()) go('input')
              }}
            >
              前回の続きから再開する
            </button>
          </Banner>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        {CARDS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => start(c.key)}
            className={`group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-gradient-to-b p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${c.accent}`}
          >
            <span aria-hidden className="text-6xl">
              {c.icon}
            </span>
            <span className="text-2xl font-extrabold text-ink">{DISEASE_LABEL[c.key]}</span>
            <span className="text-sm leading-relaxed text-ink-soft">{DISEASE_SUBLABEL[c.key]}</span>
            <span className="mt-1 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-brand-700">
              説明をはじめる →
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="section-title">📖 資料集・出典</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            このシステムに収録した内容の典拠（ガイドライン・診断基準）と、疾患ごとの図表を一覧で確認できます。
            勉強会やスタッフ研修にもご利用ください。
          </p>
          <button type="button" className="btn-secondary mt-3" onClick={() => go('library')}>
            資料集を開く
          </button>
        </div>
        <div className="card">
          <h2 className="section-title">⚙️ 設定・マスタ編集</h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            医療機関名・連絡先・運動教室の案内・文字サイズを設定できます。
            <strong className="text-alert-600">診療報酬の点数は改定で変わるため、導入時に必ずご確認ください。</strong>
          </p>
          <button type="button" className="btn-secondary mt-3" onClick={() => go('settings')}>
            設定を開く
          </button>
        </div>
      </div>

      <div className="mt-8">
        <Banner tone="neutral" title="このシステムの位置づけ" icon="ℹ">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              医師による説明を助ける<strong>説明支援ツール</strong>です。診断・治療の決定を行う医療機器ではありません。
            </li>
            <li>表示される判定はガイドラインの基準に当てはめた参考結果です。最終判断は必ず医師が行ってください。</li>
            <li>患者情報は既定ではこの端末の外に出ません（「一時保存」を押した場合のみタブを閉じるまで保持）。</li>
          </ul>
        </Banner>
      </div>
    </div>
  )
}
