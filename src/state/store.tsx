import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ClinicConfig } from '@/data/clinic'
import { loadClinic, saveClinic } from '@/data/clinic'
import type { DiseaseKey, Session, ViewSettings } from '@/types'
import {
  clearDraft,
  createSession,
  loadDraft,
  loadViewSettings,
  saveDraft,
  saveViewSettings,
} from './session'

export type Screen = 'home' | 'input' | 'explain' | 'plan' | 'pamphlet' | 'record' | 'settings' | 'library'

interface Store {
  session: Session
  setSession: (updater: (prev: Session) => Session) => void
  patch: <K extends keyof Session>(key: K, value: Partial<Session[K]>) => void
  reset: (disease?: DiseaseKey) => void
  restoreDraft: () => boolean
  persistDraft: () => void
  draftSaved: boolean

  screen: Screen
  go: (s: Screen) => void

  clinic: ClinicConfig
  setClinic: (c: ClinicConfig) => void

  view: ViewSettings
  setView: (v: Partial<ViewSettings>) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session>(() => createSession('osteoporosis'))
  const [screen, setScreen] = useState<Screen>('home')
  const [clinic, setClinicState] = useState<ClinicConfig>(() => loadClinic())
  const [view, setViewState] = useState<ViewSettings>(() => loadViewSettings())
  const [draftSaved, setDraftSaved] = useState(false)

  // 患者説明画面の文字倍率をCSS変数に反映する
  useEffect(() => {
    document.documentElement.style.setProperty('--patient-scale', String(view.patientScale))
    document.documentElement.classList.toggle('no-ruby', !view.ruby)
  }, [view.patientScale, view.ruby])

  const setSession = useCallback((updater: (prev: Session) => Session) => {
    setSessionState((prev) => updater(prev))
    setDraftSaved(false)
  }, [])

  const patch = useCallback(
    <K extends keyof Session>(key: K, value: Partial<Session[K]>) => {
      setSessionState((prev) => {
        const cur = prev[key]
        const next =
          cur !== null && typeof cur === 'object' && !Array.isArray(cur)
            ? ({ ...(cur as object), ...(value as object) } as Session[K])
            : (value as Session[K])
        return { ...prev, [key]: next }
      })
      setDraftSaved(false)
    },
    [],
  )

  const reset = useCallback((disease?: DiseaseKey) => {
    clearDraft()
    setSessionState(createSession(disease ?? 'osteoporosis'))
    setDraftSaved(false)
    setScreen('home')
  }, [])

  const restoreDraft = useCallback(() => {
    const d = loadDraft()
    if (!d) return false
    setSessionState(d)
    setDraftSaved(true)
    return true
  }, [])

  const persistDraft = useCallback(() => {
    setSessionState((prev) => {
      saveDraft(prev)
      return prev
    })
    setDraftSaved(true)
  }, [])

  const setClinic = useCallback((c: ClinicConfig) => {
    setClinicState(c)
    saveClinic(c)
  }, [])

  const setView = useCallback((v: Partial<ViewSettings>) => {
    setViewState((prev) => {
      const next = { ...prev, ...v }
      saveViewSettings(next)
      return next
    })
  }, [])

  // セッション内の view はストア側の view と同期させる（パンフレット出力で参照するため）
  useEffect(() => {
    setSessionState((prev) => (prev.view === view ? prev : { ...prev, view }))
  }, [view])

  const value = useMemo<Store>(
    () => ({
      session,
      setSession,
      patch,
      reset,
      restoreDraft,
      persistDraft,
      draftSaved,
      screen,
      go: setScreen,
      clinic,
      setClinic,
      view,
      setView,
    }),
    [session, setSession, patch, reset, restoreDraft, persistDraft, draftSaved, screen, clinic, setClinic, view, setView],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider の外で useStore が呼ばれました')
  return v
}
