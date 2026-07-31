import { getDrug, needsDentalCoordination, needsSequentialTherapy } from '@/data/drugs'
import { getExercise } from '@/data/exercises'
import { LIFESTYLE_ITEMS } from '@/data/nutrition'
import { FEE_ITEMS, LAB_ORDERS } from '@/data/fees'
import { DISEASE_LABEL } from '@/state/session'
import type { FeeItem, LabOrderItem, Session } from '@/types'
import { assessOsteoporosis, fmtT } from './osteoporosis'
import { assessRa, ACTIVITY_LABEL } from './ra'
import { assessLocomo, calcBmi, KL_GRADE_LABEL } from './locomo'

/**
 * カルテ記載文の自動生成
 *
 * 目的
 * - 診察室で説明した内容を、そのまま電子カルテに貼り付けられる形にすること。
 *   説明内容の記録は、診療の質と算定要件の両面で重要である。
 * - 医師のタイピング時間を減らすことが、このシステムの「効率化」の中心。
 *
 * 注意
 * - 生成した文章は必ず医師が確認・修正してから確定してください。
 * - 算定候補は「該当しうる項目の候補」であり、算定可否の判断ではありません。
 */

const EXERCISE_PATHWAY_LABEL: Record<string, string> = {
  undoukiRehab: '運動器リハビリテーション（理学療法士による個別指導）',
  clinicClass: '当院の運動教室（集団）',
  homeExercise: '自主トレーニング（自宅）',
  homeVisitRehab: '訪問リハビリテーション',
  referral: '他施設への紹介',
}

export interface KarteOutput {
  /** 説明記録（そのまま貼り付け用） */
  text: string
  /** SOAP形式 */
  soap: string
  /** 算定候補 */
  feeCandidates: FeeItem[]
  /** 検査オーダー候補 */
  labCandidates: LabOrderItem[]
  /** 次回来院までのToDo */
  followUp: string[]
}

export function buildKarte(session: Session): KarteOutput {
  const { patient, disease, plan } = session
  const lines: string[] = []
  const soapS: string[] = []
  const soapO: string[] = []
  const soapA: string[] = []
  const soapP: string[] = []
  const followUp: string[] = []

  const head = `【患者説明記録】${patient.visitDate}　${DISEASE_LABEL[disease]}`
  lines.push(head)
  if (patient.doctorName) lines.push(`説明者：${patient.doctorName}`)
  lines.push(
    `対象：${patient.chartNo ? `ID ${patient.chartNo} ` : ''}${patient.displayName || '（氏名省略）'}　` +
      `${patient.age ?? '—'}歳 ${patient.sex === 'female' ? '女性' : '男性'}`,
  )
  const bmi = calcBmi(patient.heightCm, patient.weightKg)
  if (patient.heightCm || patient.weightKg) {
    lines.push(
      `身体計測：身長 ${patient.heightCm ?? '—'}cm／体重 ${patient.weightKg ?? '—'}kg` +
        (bmi ? `／BMI ${bmi}` : ''),
    )
  }
  lines.push('')

  // ---------------------------------------------------------------- 疾患別の所見
  if (disease === 'osteoporosis') {
    const a = assessOsteoporosis(session.osteo, patient)
    const b = session.osteo.bmd
    lines.push('■ 骨密度・評価')
    if (a.adoptedYam !== null) {
      lines.push(
        `DXA（${b.measuredAt}）：腰椎 ${fmtVal(b.lumbar, b.unit)}／大腿骨近位部 ${fmtVal(b.femur, b.unit)}　` +
          `→ 採用値 ${a.adoptedSite === 'lumbar' ? '腰椎' : '大腿骨近位部'} YAM ${a.adoptedYam}%（Tスコア ${fmtT(a.adoptedTscore)}）`,
      )
      soapO.push(
        `DXA：採用値 YAM ${a.adoptedYam}%（T ${fmtT(a.adoptedTscore)}、${a.adoptedSite === 'lumbar' ? '腰椎' : '大腿骨'}）`,
      )
    } else {
      lines.push('DXA：未測定')
    }
    if (session.osteo.fractures.length > 0) {
      const f = session.osteo.fractures
        .map((x) => `${FRACTURE_JP[x.site]}${x.when === 'within12m' ? '（12か月以内）' : ''}${x.multiple ? '（多発）' : ''}`)
        .join('、')
      lines.push(`脆弱性骨折：${f}`)
      soapO.push(`脆弱性骨折：${f}`)
    } else {
      lines.push('脆弱性骨折：なし')
    }
    const rf = riskFactorList(session)
    if (rf.length > 0) {
      lines.push(`危険因子：${rf.join('、')}`)
      soapO.push(`危険因子：${rf.join('、')}`)
    }
    if (a.heightLossCm !== null && a.heightLossCm >= 2) {
      lines.push(`身長低下：${a.heightLossCm}cm（最大身長 ${patient.maxHeightCm}cm → 現在 ${patient.heightCm}cm）`)
    }
    lines.push(`診断：${DIAGNOSIS_JP[a.diagnosis]}`)
    lines.push(`骨折リスク区分：${RISK_TIER_JP[a.riskTier]}${a.riskTierReasons.length ? `（${a.riskTierReasons.join('、')}）` : ''}`)
    lines.push(
      `薬物治療開始基準：${a.pharmacotherapyIndicated === true ? '該当' : a.pharmacotherapyIndicated === 'consider' ? '要検討' : '非該当'}` +
        `　※${a.pharmacotherapyReasons[0] ?? ''}`,
    )
    soapA.push(`${DIAGNOSIS_JP[a.diagnosis]}／骨折リスク：${RISK_TIER_JP[a.riskTier]}`)
    if (a.cautions.length > 0) {
      lines.push('留意事項：')
      a.cautions.forEach((c) => lines.push(`　・${c}`))
    }
    lines.push('')

    lines.push('■ 説明した内容')
    lines.push('　・骨粗鬆症の病態（骨梁の減少）と骨密度の意味を図で説明')
    lines.push('　・骨折の連鎖（1度の骨折が次の骨折を招くこと）と、生活機能への影響を説明')
    lines.push('　・治療の3本柱（薬物療法・運動療法・栄養）を説明')
  } else if (disease === 'ra') {
    const a = assessRa(session.ra)
    const r = session.ra
    lines.push('■ 疾患活動性')
    lines.push(
      `関節：圧痛 ${r.tenderJoints28 ?? '—'}/28、腫脹 ${r.swollenJoints28 ?? '—'}/28　` +
        `VAS：患者 ${r.patientGlobalVas ?? '—'}／医師 ${r.physicianGlobalVas ?? '—'}（0-10cm）`,
    )
    lines.push(`血液：CRP ${r.crp ?? '—'} mg/dL、ESR ${r.esr ?? '—'} mm/h、MMP-3 ${r.mmp3 ?? '—'} ng/mL`)
    const scores = [
      a.sdai.value !== null ? `SDAI ${a.sdai.value}（${ACTIVITY_LABEL[a.sdai.level]}）` : null,
      a.cdai.value !== null ? `CDAI ${a.cdai.value}（${ACTIVITY_LABEL[a.cdai.level]}）` : null,
      a.das28crp.value !== null ? `DAS28-CRP ${a.das28crp.value}（${ACTIVITY_LABEL[a.das28crp.level]}）` : null,
      a.das28esr.value !== null ? `DAS28-ESR ${a.das28esr.value}（${ACTIVITY_LABEL[a.das28esr.level]}）` : null,
    ].filter(Boolean)
    if (scores.length > 0) {
      lines.push(`疾患活動性：${scores.join('、')}`)
      soapO.push(`疾患活動性：${scores.join('、')}`)
    }
    if (a.booleanRemission.met !== null) {
      lines.push(`ACR/EULAR Boolean寛解基準：${a.booleanRemission.met ? '達成' : '未達成'}`)
    }
    if (r.erosion) lines.push('単純X線：骨びらんあり')
    if (r.affectedRegions.length > 0) lines.push(`罹患関節：${r.affectedRegions.length}領域（説明図に記録）`)
    if (a.classification2010.score !== null) {
      lines.push(
        `ACR/EULAR 2010分類基準（参考）：${a.classification2010.score}点${a.classification2010.suggestsRa ? '（6点以上）' : ''}`,
      )
    }
    soapA.push(
      `関節リウマチ／${a.primary.name !== '—' ? `${a.primary.name} ${a.primary.score.value}（${ACTIVITY_LABEL[a.primary.score.level]}）` : '活動性評価は次回'}`,
    )
    if (a.cautions.length > 0) {
      lines.push('留意事項：')
      a.cautions.forEach((c) => lines.push(`　・${c}`))
    }
    lines.push('')
    lines.push('■ 説明した内容')
    lines.push('　・関節リウマチの病態（滑膜炎から骨破壊に至る流れ）を図で説明')
    lines.push('　・治療目標（T2T：寛解または低疾患活動性）と、3か月ごとの評価・6か月での見直しを説明')
    lines.push('　・薬物治療の進め方（MTXを基本とし、効果不十分ならbDMARD／JAK阻害薬を追加）を説明')
    a.t2tComment.forEach((c) => lines.push(`　・${c}`))
  } else {
    const k = session.knee
    const loco = assessLocomo(session.locomo)
    lines.push('■ 膝関節・移動機能')
    lines.push(
      `部位：${k.side === 'both' ? '両側' : k.side === 'left' ? '左' : k.side === 'right' ? '右' : '—'}　` +
        `K-L分類：${k.klGrade !== null ? `グレード${k.klGrade}` : '—'}　痛みNRS：${k.painNrs ?? '—'}/10`,
    )
    if (k.klGrade !== null) soapO.push(`膝OA K-L ${KL_GRADE_LABEL[k.klGrade]}`)
    if (k.effusion) lines.push('関節液貯留：あり')
    if (k.romLimitation) lines.push('可動域制限：あり')
    if (k.alignment) lines.push(`アライメント：${k.alignment === 'varus' ? '内側型（O脚傾向）' : k.alignment === 'valgus' ? '外側型（X脚傾向）' : '中間'}`)
    if (loco.stage !== null) {
      lines.push(
        `ロコモ度：${loco.stage === 0 ? '該当なし' : `ロコモ度${loco.stage}`}` +
          `（立ち上がり：片脚 ${fmtStandUp(session.locomo.standUpOneLegCm)}／両脚 ${fmtStandUp(session.locomo.standUpBothLegCm)}、` +
          `2ステップ値 ${session.locomo.twoStepValue ?? '—'}、ロコモ25 ${session.locomo.locomo25 ?? '—'}点）`,
      )
      soapO.push(`ロコモ度：${loco.stage === 0 ? '該当なし' : `ロコモ度${loco.stage}`}`)
      soapA.push(loco.message)
    }
    if (bmi !== null) soapO.push(`BMI ${bmi}`)
    lines.push('')
    lines.push('■ 説明した内容')
    lines.push('　・変形性膝関節症の病態（軟骨のすり減りと骨棘形成）を図で説明')
    lines.push('　・治療の順序（運動療法・体重管理・装具が土台、次に薬・注射・手術）を説明')
    lines.push('　・体重1kgの減量で歩行時の膝への負担が約3kg分軽減することを説明')
  }

  // ---------------------------------------------------------------- 薬物治療
  if (plan.drugIds.length > 0) {
    lines.push('')
    lines.push('■ 薬物治療（説明・同意）')
    plan.drugIds.forEach((id) => {
      const d = getDrug(id)
      if (!d) return
      lines.push(`　・${d.generic}（${d.route}）`)
      lines.push(`　　　作用：${d.plain.replace(/\n/g, '')}`)
      lines.push(`　　　注意点として説明：${d.cautions.slice(0, 3).join('／')}`)
      if (d.durationLimit) lines.push(`　　　投与期間：${d.durationLimit}（終了後の逐次療法の必要性を説明）`)
      soapP.push(`${d.generic} 開始／継続`)
    })
    const dental = plan.drugIds.filter(needsDentalCoordination)
    if (dental.length > 0) {
      lines.push('　・骨吸収抑制薬の使用にあたり、顎骨壊死（MRONJ）のリスクと歯科受診の必要性を説明した。')
      lines.push('　　抜歯時の休薬は原則行わない方針（顎骨壊死検討委員会ポジションペーパー2023）であることを併せて説明。')
      followUp.push('歯科受診（開始前のむし歯・歯周病治療、以後3〜6か月ごとの口腔管理）')
    }
    const seq = plan.drugIds.filter(needsSequentialTherapy)
    if (seq.length > 0) {
      lines.push('　・骨形成促進薬は投与期間に上限があり、終了後に骨吸収抑制薬へ切り替える必要があることを説明した。')
      followUp.push('骨形成促進薬の終了時期を確認し、後続薬（骨吸収抑制薬）の予約を先に確保する')
    }
    if (plan.drugIds.includes('denosumab')) {
      lines.push('　・デノスマブは自己中断により多発椎体骨折のリスクがあるため、中断しないこと・次回投与の受診を厳守することを説明した。')
      followUp.push('デノスマブ次回投与日を予約（6か月後）／カルシウム・ビタミンD製剤の継続を確認')
    }
    if (plan.drugIds.includes('mtx')) {
      lines.push('　・MTXは週1回投与であり、連日服用は重篤な骨髄抑制につながることを、曜日を指定して説明した。葉酸の併用も指導。')
      followUp.push('MTX開始後は2〜4週ごとに血算・肝機能・腎機能を確認')
    }
  }

  // ---------------------------------------------------------------- 運動療法
  if (plan.exercisePathway.length > 0 || plan.prescription.length > 0) {
    lines.push('')
    lines.push('■ 運動療法（当院の中心的治療）')
    if (plan.exercisePathway.length > 0) {
      lines.push(`　導入経路：${plan.exercisePathway.map((p) => EXERCISE_PATHWAY_LABEL[p] ?? p).join('、')}`)
      if (plan.exercisePathway.includes('undoukiRehab')) {
        soapP.push('運動器リハビリテーション導入')
      }
    }
    if (plan.prescription.length > 0) {
      lines.push('　運動処方（パンフレットとして交付）：')
      plan.prescription.forEach((p) => {
        const e = getExercise(p.exerciseId)
        if (!e) return
        lines.push(`　　・${e.name}：${p.reps}／${p.sets}／${p.frequency}${p.memo ? `　※${p.memo}` : ''}`)
      })
      lines.push('　　運動時の中止基準（痛みの増悪、めまい、翌日まで残る痛み）を説明した。')
      soapP.push(`運動処方 ${plan.prescription.length}項目を文書で交付`)
    }
  }

  // ---------------------------------------------------------------- 生活指導
  if (plan.lifestyleIds.length > 0) {
    lines.push('')
    lines.push('■ 生活指導')
    plan.lifestyleIds.forEach((id) => {
      const l = LIFESTYLE_ITEMS.find((x) => x.id === id)
      if (l) lines.push(`　・${l.label}：${l.detail}`)
    })
  }

  // ---------------------------------------------------------------- 次回
  lines.push('')
  lines.push('■ 次回')
  if (plan.nextVisit) {
    lines.push(`　次回来院：${plan.nextVisit}`)
    soapP.push(`次回 ${plan.nextVisit}`)
  }
  if (plan.nextTests.length > 0) {
    const names = plan.nextTests.map((id) => LAB_ORDERS.find((l) => l.id === id)?.name ?? id)
    lines.push(`　予定検査：${names.join('、')}`)
    soapP.push(`検査予定：${names.join('、')}`)
  }
  if (plan.doctorMessage) {
    lines.push(`　本人へのメッセージ：${plan.doctorMessage}`)
  }

  lines.push('')
  lines.push('■ 交付物')
  lines.push('　・疾患説明パンフレット（当院作成）を印刷して本人に交付し、内容を口頭でも説明した。')
  lines.push('　・本人（および同席者）から質問を受け、了解を得た。')

  // ---------------------------------------------------------------- SOAP
  soapS.push('（患者の訴えを記入してください）')
  const soap = [
    'S) ' + soapS.join('　'),
    'O) ' + (soapO.length ? soapO.join('／') : '—'),
    'A) ' + (soapA.length ? soapA.join('／') : '—'),
    'P) ' + (soapP.length ? soapP.join('／') : '—') + '　＋ 疾患説明パンフレット交付・運動療法指導',
  ].join('\n')

  return {
    text: lines.join('\n'),
    soap,
    feeCandidates: suggestFees(session),
    labCandidates: suggestLabs(session),
    followUp,
  }
}

// ---------------------------------------------------------------- 算定候補

/**
 * 算定の「候補」を提示する。
 * 点数・要件は改定で変わるため、必ず院内で確認する前提の一覧である。
 */
export function suggestFees(session: Session): FeeItem[] {
  const out: FeeItem[] = []
  const { disease, plan } = session

  if (plan.exercisePathway.includes('undoukiRehab')) {
    out.push(...FEE_ITEMS.filter((f) => f.id.startsWith('undouki-reha-')))
    out.push(...FEE_ITEMS.filter((f) => f.id === 'reha-plan' || f.id === 'reha-over150'))
  }

  if (disease === 'osteoporosis') {
    const hasHipFracture = session.osteo.fractures.some((f) => f.site === 'proximalFemur')
    if (hasHipFracture) {
      out.push(...FEE_ITEMS.filter((f) => f.id.startsWith('secondary-fracture-')))
    }
    out.push(...FEE_ITEMS.filter((f) => f.id === 'bmd-dxa'))
  }

  if (disease === 'ra') {
    out.push(...FEE_ITEMS.filter((f) => f.id === 'biologic-intro'))
  }

  if (disease === 'kneeOA' && plan.drugIds.includes('ha-injection')) {
    out.push(...FEE_ITEMS.filter((f) => f.id === 'joint-injection'))
  }

  if (plan.drugIds.some(needsDentalCoordination)) {
    out.push(...FEE_ITEMS.filter((f) => f.id === 'shinryo-joho'))
  }

  if (plan.drugIds.length > 0) {
    out.push(...FEE_ITEMS.filter((f) => f.id === 'shoyaku-shido'))
  }

  out.push(...FEE_ITEMS.filter((f) => f.id === 'seikatsu-shukan'))

  // 重複を除く
  const seen = new Set<string>()
  return out.filter((f) => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })
}

// ---------------------------------------------------------------- 検査候補

export function suggestLabs(session: Session): LabOrderItem[] {
  const { disease, plan } = session
  const base = LAB_ORDERS.filter((l) => l.disease.includes(disease))

  // 薬剤クラスに紐づく検査を前に出す
  const classes = new Set(plan.drugIds.map((id) => getDrug(id)?.cls).filter(Boolean) as string[])
  return [...base].sort((a, b) => {
    const aReq = a.requiredFor?.some((c) => classes.has(c)) ? 0 : 1
    const bReq = b.requiredFor?.some((c) => classes.has(c)) ? 0 : 1
    return aReq - bReq
  })
}

// ---------------------------------------------------------------- 次回来院の目安

export function suggestNextVisit(session: Session): { label: string; value: string }[] {
  const { disease, plan } = session
  const options: { label: string; value: string }[] = []

  if (disease === 'osteoporosis') {
    if (plan.drugIds.includes('denosumab')) {
      options.push({ label: 'デノスマブ次回投与（6か月後）', value: '6か月後（デノスマブ投与）' })
      options.push({ label: '中間の経過観察（3か月後）', value: '3か月後（経過観察・採血）' })
    }
    if (plan.drugIds.includes('zoledronate')) {
      options.push({ label: 'ゾレドロン酸 次回点滴（1年後）', value: '1年後（ゾレドロン酸点滴）' })
      options.push({ label: '経過観察（3〜6か月後）', value: '3〜6か月後（経過観察）' })
    }
    if (plan.drugIds.some((id) => ['teriparatide', 'romosozumab', 'abaloparatide'].includes(getDrug(id)?.cls ?? ''))) {
      options.push({ label: '自己注射の手技確認（2週後）', value: '2週後（注射手技の確認）' })
      options.push({ label: '定期評価（1〜3か月ごと）', value: '1か月後（定期評価）' })
    }
    options.push({ label: '骨代謝マーカーで効果判定（3〜6か月後）', value: '3〜6か月後（骨代謝マーカー）' })
    options.push({ label: '骨密度の再検査（6〜12か月後）', value: '12か月後（骨密度再検査）' })
    options.push({ label: '通常の処方継続（1〜3か月ごと）', value: '1〜3か月ごと（処方継続）' })
  } else if (disease === 'ra') {
    if (plan.drugIds.includes('mtx')) {
      options.push({ label: 'MTX開始後の血液検査（2週後）', value: '2週後（血算・肝腎機能）' })
    }
    options.push({ label: 'T2Tの評価（1か月後）', value: '1か月後（活動性評価）' })
    options.push({ label: 'T2Tの評価（3か月後）', value: '3か月後（活動性評価・治療見直しの検討）' })
    options.push({ label: '6か月での治療目標の判定', value: '6か月後（治療目標の判定）' })
    options.push({ label: '画像評価（6〜12か月後）', value: '6〜12か月後（手足X線）' })
  } else {
    options.push({ label: 'リハビリ開始後の評価（2〜4週後）', value: '2〜4週後（リハビリ経過）' })
    options.push({ label: '運動療法の効果判定（3か月後）', value: '3か月後（疼痛・機能の再評価）' })
    options.push({ label: 'ロコモ度テストの再評価（6か月後）', value: '6か月後（ロコモ度テスト再評価）' })
  }
  return options
}

// ---------------------------------------------------------------- 補助

const FRACTURE_JP: Record<string, string> = {
  vertebra: '椎体骨折',
  proximalFemur: '大腿骨近位部骨折',
  rib: '肋骨骨折',
  pelvis: '骨盤骨折',
  proximalHumerus: '上腕骨近位部骨折',
  distalRadius: '橈骨遠位端骨折',
  lowerLeg: '下腿骨骨折',
}

const DIAGNOSIS_JP: Record<string, string> = {
  osteoporosis: '骨粗鬆症（原発性骨粗鬆症の診断基準を満たす）',
  lowBoneMass: '骨量減少',
  normal: '骨密度は正常範囲',
  insufficientData: '判定に必要な情報が不足',
}

const RISK_TIER_JP: Record<string, string> = {
  veryHigh: 'きわめて高い',
  high: '高い',
  moderate: '中等度',
  low: '低い',
  unknown: '判定不能',
}

function fmtVal(v: number | null, unit: 'yam' | 'tscore'): string {
  if (v === null) return '—'
  return unit === 'yam' ? `${v}%` : `T ${fmtT(v)}`
}

/** 立ち上がりテストの結果を「20cm」「40cm不可」「未実施」の3通りで表記する */
function fmtStandUp(v: import('@/types').StandUpResult): string {
  if (v === null) return '未実施'
  if (v === 'cannot') return '40cm不可'
  return `${v}cm`
}

function riskFactorList(session: Session): string[] {
  const r = session.osteo.risk
  const out: string[] = []
  if (r.parentHipFracture) out.push('両親の大腿骨近位部骨折歴')
  if (r.currentSmoking) out.push('現在喫煙')
  if (r.alcohol3Units) out.push('アルコール3単位/日以上')
  if (r.glucocorticoid) out.push('経口グルココルチコイド使用')
  if (r.rheumatoidArthritis) out.push('関節リウマチ')
  if (r.secondaryOsteoporosis) out.push('続発性骨粗鬆症')
  if (r.fallLastYear) out.push('過去1年の転倒歴')
  if (r.diabetesT2) out.push('2型糖尿病')
  if (r.ckd) out.push('慢性腎臓病')
  if (r.lowBodyWeight) out.push('低体重')
  if (r.fraxMajorPercent !== null) out.push(`FRAX®主要骨折 ${r.fraxMajorPercent}%`)
  if (r.fraxHipPercent !== null) out.push(`FRAX®大腿骨近位部 ${r.fraxHipPercent}%`)
  return out
}
