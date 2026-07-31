import type { DiseaseKey, Session, ViewSettings } from '@/types'

/**
 * 診察1件分の状態（セッション）
 *
 * プライバシー方針
 * - 既定では患者情報をブラウザに保存しない（メモリ上のみ）。
 *   「一時保存」を明示的に押した場合だけ sessionStorage に保存し、
 *   ブラウザのタブを閉じると消える。
 * - 施設の判断で院内サーバーに保存する場合は server/ の API を有効化する。
 */

export function todayIso(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const DEFAULT_VIEW: ViewSettings = {
  patientScale: 1,
  ruby: false,
  showDoctorNote: true,
  pamphletScale: 'normal',
}

export function createSession(disease: DiseaseKey = 'osteoporosis'): Session {
  return {
    id: `s-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    disease,
    patient: {
      chartNo: '',
      displayName: '',
      age: null,
      sex: 'female',
      heightCm: null,
      weightKg: null,
      maxHeightCm: null,
      doctorName: '',
      visitDate: todayIso(),
    },
    osteo: {
      bmd: { unit: 'yam', lumbar: null, femur: null, measuredAt: todayIso(), note: '' },
      fractures: [],
      risk: {
        parentHipFracture: false,
        currentSmoking: false,
        alcohol3Units: false,
        glucocorticoid: false,
        rheumatoidArthritis: false,
        secondaryOsteoporosis: false,
        fallLastYear: false,
        diabetesT2: false,
        ckd: false,
        lowBodyWeight: false,
        fraxMajorPercent: null,
        fraxHipPercent: null,
      },
      labs: { calcium: null, vitD25: null, tracp5b: null, p1np: null, egfr: null },
      currentTherapy: [],
    },
    ra: {
      durationMonths: null,
      tenderJoints28: null,
      swollenJoints28: null,
      patientGlobalVas: null,
      physicianGlobalVas: null,
      crp: null,
      esr: null,
      rf: null,
      rfPositive: null,
      accp: null,
      accpPositive: null,
      mmp3: null,
      erosion: false,
      affectedRegions: [],
      largeJointsInvolved: null,
      smallJointsInvolved: null,
      haq: null,
      currentTherapy: [],
      comorbidity: {
        interstitialLungDisease: false,
        hepatitisBC: false,
        latentTb: false,
        ckd: false,
        malignancyHistory: false,
        pregnancyPlan: false,
        elderly75: false,
      },
    },
    knee: {
      side: null,
      klGrade: null,
      painNrs: null,
      alignment: null,
      complaints: [],
      romLimitation: false,
      effusion: false,
    },
    locomo: {
      standUpOneLegCm: null,
      standUpBothLegCm: null,
      twoStepValue: null,
      locomo25: null,
    },
    plan: {
      drugIds: [],
      exercisePathway: [],
      prescription: [],
      lifestyleIds: [],
      nextVisit: '',
      nextTests: [],
      doctorMessage: '',
    },
    shownSlideIds: [],
    pamphletSections: [],
    view: { ...DEFAULT_VIEW },
  }
}

// ---------------------------------------------------------------- 一時保存

const DRAFT_KEY = 'setsumei-navi:draft'

export function saveDraft(session: Session): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(session))
  } catch {
    /* 容量超過などは無視する */
  }
}

export function loadDraft(): Session | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    // 型が変わった場合に壊れないよう、既定値とマージする
    const base = createSession(parsed.disease ?? 'osteoporosis')
    return {
      ...base,
      ...parsed,
      patient: { ...base.patient, ...parsed.patient },
      osteo: {
        ...base.osteo,
        ...parsed.osteo,
        bmd: { ...base.osteo.bmd, ...parsed.osteo?.bmd },
        risk: { ...base.osteo.risk, ...parsed.osteo?.risk },
        labs: { ...base.osteo.labs, ...parsed.osteo?.labs },
      },
      ra: {
        ...base.ra,
        ...parsed.ra,
        comorbidity: { ...base.ra.comorbidity, ...parsed.ra?.comorbidity },
      },
      knee: { ...base.knee, ...parsed.knee },
      locomo: { ...base.locomo, ...parsed.locomo },
      plan: { ...base.plan, ...parsed.plan },
      view: { ...base.view, ...parsed.view },
    }
  } catch {
    return null
  }
}

export function clearDraft(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(DRAFT_KEY)
}

export function hasDraft(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(DRAFT_KEY) !== null
}

// ---------------------------------------------------------------- 表示設定（端末ごとに保持）

const VIEW_KEY = 'setsumei-navi:view'

export function loadViewSettings(): ViewSettings {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_VIEW }
  try {
    const raw = localStorage.getItem(VIEW_KEY)
    if (!raw) return { ...DEFAULT_VIEW }
    return { ...DEFAULT_VIEW, ...(JSON.parse(raw) as Partial<ViewSettings>) }
  } catch {
    return { ...DEFAULT_VIEW }
  }
}

export function saveViewSettings(v: ViewSettings): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(VIEW_KEY, JSON.stringify(v))
}

// ---------------------------------------------------------------- ラベル

export const DISEASE_LABEL: Record<DiseaseKey, string> = {
  osteoporosis: '骨粗鬆症',
  ra: '関節リウマチ',
  kneeOA: '変形性膝関節症・ロコモ',
}

export const DISEASE_SUBLABEL: Record<DiseaseKey, string> = {
  osteoporosis: '骨密度・骨折リスク・骨を強くする治療',
  ra: '関節の炎症・T2T・抗リウマチ薬',
  kneeOA: '膝の痛み・歩く力・運動療法',
}
