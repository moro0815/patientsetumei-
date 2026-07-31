import { StoreProvider, useStore, type Screen } from '@/state/store'
import { DISEASE_LABEL } from '@/state/session'
import { Stepper } from '@/components/ui'
import { HomeScreen } from '@/screens/HomeScreen'
import { InputScreen } from '@/screens/InputScreen'
import { ExplainScreen } from '@/screens/ExplainScreen'
import { PlanScreen } from '@/screens/PlanScreen'
import { PamphletScreen } from '@/screens/PamphletScreen'
import { RecordScreen } from '@/screens/RecordScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { LibraryScreen } from '@/screens/LibraryScreen'

const FLOW: { key: Screen; label: string }[] = [
  { key: 'input', label: '① 入力' },
  { key: 'explain', label: '② 説明' },
  { key: 'plan', label: '③ 方針' },
  { key: 'pamphlet', label: '④ 印刷' },
  { key: 'record', label: '⑤ 記録' },
]

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}

function Shell() {
  const { screen, go, session, clinic, persistDraft, draftSaved } = useStore()
  const inFlow = FLOW.some((f) => f.key === screen)

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-2">
          <button
            type="button"
            onClick={() => go('home')}
            className="flex items-center gap-2 text-left"
            title="最初の画面へ"
          >
            <span aria-hidden className="text-2xl">
              🩺
            </span>
            <span>
              <span className="block text-base font-extrabold leading-tight text-ink">せつめいナビ</span>
              <span className="block text-[11px] leading-tight text-ink-mute">{clinic.name}</span>
            </span>
          </button>

          {inFlow && (
            <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
              <span className="badge bg-slate-200 text-ink-soft">{DISEASE_LABEL[session.disease]}</span>
              <Stepper steps={FLOW} current={screen} onJump={(k) => go(k as Screen)} />
            </div>
          )}

          <div className="flex items-center gap-2">
            {inFlow && (
              <button
                type="button"
                className="btn-ghost !min-h-[36px] !px-3 !py-1 text-sm"
                onClick={persistDraft}
                title="この患者さんの入力をタブが閉じるまで保持します"
              >
                {draftSaved ? '✓ 保存済み' : '💾 一時保存'}
              </button>
            )}
            <button
              type="button"
              className="btn-ghost !min-h-[36px] !px-3 !py-1 text-sm"
              onClick={() => go('library')}
              title="出典・図表一覧"
            >
              📖 資料
            </button>
            <button
              type="button"
              className="btn-ghost !min-h-[36px] !px-3 !py-1 text-sm"
              onClick={() => go('settings')}
              title="設定"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main>
        {screen === 'home' && <HomeScreen />}
        {screen === 'input' && <InputScreen />}
        {screen === 'explain' && <ExplainScreen />}
        {screen === 'plan' && <PlanScreen />}
        {screen === 'pamphlet' && <PamphletScreen />}
        {screen === 'record' && <RecordScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'library' && <LibraryScreen />}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white px-4 py-6 text-center text-xs leading-relaxed text-ink-mute">
        <p>
          せつめいナビ — 整形外科 患者説明支援システム（院内利用）
        </p>
        <p className="mt-1">
          本システムは医師による患者説明を支援するツールです。診断・治療を決定する医療機器ではありません。
          表示される判定はガイドラインの基準に当てはめた参考結果であり、最終的な判断は医師が行ってください。
        </p>
        <p className="mt-1">
          収録内容の典拠は「資料集 → 出典一覧」に記載しています。診療報酬の点数・薬剤の用量は必ず最新の情報でご確認ください。
        </p>
      </footer>
    </div>
  )
}
