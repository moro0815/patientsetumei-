import { useMemo, useState } from 'react'
import { useStore } from '@/state/store'
import { hasDraft } from '@/state/session'
import { Banner, TextInput } from '@/components/ui'
import { DISEASE_CARDS, DISEASE_REGIONS, searchDiseases } from '@/data/diseaseCatalog'
import type { DiseaseKey } from '@/types'

/**
 * 疾患の選択画面
 *
 * 診察室では「今日どの説明をするか」が決まった状態で開くため、
 * 目的の疾患に2秒でたどり着けることを最優先にしている。
 *
 * - 骨粗鬆症・関節リウマチは「継続して管理していく病気」なので、大きなカードで最上段に置く。
 * - それ以外はすべて部位から探す。診察室では「膝が痛い」「腰が痛い」から入るため、
 *   変形性膝関節症も股関節症と同じ「股・膝」に置いている。
 * - 患者さんの言い方（「五十肩」「ばね指」「ヘルニア」）でも検索できるようにする。
 */

export function HomeScreen() {
  const { reset, setSession, go, clinic, restoreDraft } = useStore()
  const [draftAvailable] = useState(() => hasDraft())
  const [query, setQuery] = useState('')

  const searching = query.trim().length > 0
  const filtered = useMemo(() => searchDiseases(query), [query])
  const mainMatches = filtered.filter((c) => c.region === 'main')

  const start = (disease: DiseaseKey) => {
    reset(disease)
    setSession((prev) => ({ ...prev, disease }))
    go('input')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 text-center">
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

      <div className="mx-auto mb-7 max-w-xl">
        <label className="block">
          <span className="sr-only">病名で探す</span>
          <TextInput
            value={query}
            onChange={setQuery}
            placeholder="🔍 病名で探す（例：五十肩、ばね指、ヘルニア、かかと）"
          />
        </label>
        {searching && (
          <p className="mt-2 text-center text-sm text-ink-mute">
            {filtered.length}件が見つかりました
            <button type="button" className="ml-2 font-bold text-brand-600 underline" onClick={() => setQuery('')}>
              クリア
            </button>
          </p>
        )}
      </div>

      {mainMatches.length > 0 && (
        <section className="mb-8">
          {!searching && (
            <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-mute">
              継続してみていく病気（検査値をもとに判定します）
            </h2>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            {mainMatches.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => start(c.key)}
                className={`group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-gradient-to-b p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${c.accent}`}
              >
                <span aria-hidden className="text-5xl">
                  {c.icon}
                </span>
                <span className="text-2xl font-extrabold text-ink">{c.label}</span>
                <span className="text-sm leading-relaxed text-ink-soft">{c.subLabel}</span>
                <span className="mt-1 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-brand-700">
                  説明をはじめる →
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        {!searching && (
          <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-mute">
            症状・部位から選ぶ（外来でよくみる運動器の病気）
          </h2>
        )}
        {DISEASE_REGIONS.map((region) => {
          const items = filtered.filter((c) => c.region === region)
          if (items.length === 0) return null
          return (
            <div key={region} className="mb-5">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-soft">
                <span className="h-4 w-1 rounded-full bg-brand-400" aria-hidden />
                {region}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => start(c.key)}
                    className={`flex items-start gap-3 rounded-2xl border-2 bg-gradient-to-b p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${c.accent}`}
                  >
                    <span aria-hidden className="text-3xl leading-none">
                      {c.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-extrabold leading-snug text-ink">{c.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{c.subLabel}</span>
                      <span className="mt-1.5 block text-[11px] text-ink-mute">
                        目安 {c.minutes}分 ／ {c.aka[0]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {searching && filtered.length === 0 && mainMatches.length === 0 && (
          <p className="py-8 text-center text-ink-mute">
            該当する病気が見つかりませんでした。別の言い方でお試しください。
          </p>
        )}
      </section>

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
            <li>収録している病気は {DISEASE_CARDS.length} 疾患です。</li>
          </ul>
        </Banner>
      </div>
    </div>
  )
}
