import { describe, expect, it } from 'vitest'
import {
  assessRa,
  booleanRemission,
  cdai,
  cdaiLevel,
  classification2010,
  das28crp,
  das28crpLevel,
  das28esr,
  das28esrLevel,
  sdai,
  sdaiLevel,
} from './ra'
import { createSession } from '@/state/session'
import type { RaInput } from '@/types'

function input(over: Partial<RaInput> = {}): RaInput {
  return { ...createSession('ra').ra, ...over }
}

/** 標準的な症例：圧痛6・腫脹4・患者VAS 5cm・医師VAS 4cm・CRP 1.0mg/dL・ESR 30mm/h */
const CASE = input({
  tenderJoints28: 6,
  swollenJoints28: 4,
  patientGlobalVas: 5,
  physicianGlobalVas: 4,
  crp: 1.0,
  esr: 30,
})

describe('DAS28-ESR', () => {
  it('原式どおりに計算する', () => {
    // 0.56√6 + 0.28√4 + 0.70 ln30 + 0.014×50 = 1.3717 + 0.56 + 2.3808 + 0.7 = 5.0125
    expect(das28esr(CASE).value).toBeCloseTo(5.01, 2)
  })

  it('必要な項目が欠けていれば計算せず、欠損項目を返す', () => {
    const r = das28esr(input({ tenderJoints28: 6, swollenJoints28: 4 }))
    expect(r.value).toBeNull()
    expect(r.missing).toContain('赤血球沈降速度(ESR)')
    expect(r.missing).toContain('患者全般評価(VAS)')
  })

  it('ESR 0 でも計算できる（下限2として扱う）', () => {
    const r = das28esr(input({ tenderJoints28: 0, swollenJoints28: 0, esr: 0, patientGlobalVas: 0 }))
    expect(r.value).not.toBeNull()
    expect(Number.isFinite(r.value!)).toBe(true)
  })

  it('活動性の区分（寛解<2.6／低≦3.2／中≦5.1／高>5.1）', () => {
    expect(das28esrLevel(2.5)).toBe('remission')
    expect(das28esrLevel(3.2)).toBe('low')
    expect(das28esrLevel(5.1)).toBe('moderate')
    expect(das28esrLevel(5.2)).toBe('high')
  })
})

describe('DAS28-CRP', () => {
  it('CRP を mg/dL から mg/L に換算して計算する', () => {
    // 0.56√6 + 0.28√4 + 0.36 ln(10+1) + 0.014×50 + 0.96
    // = 1.3717 + 0.56 + 0.8632 + 0.7 + 0.96 = 4.4549
    expect(das28crp(CASE).value).toBeCloseTo(4.45, 2)
  })

  it('CRP 0 でも計算できる', () => {
    const r = das28crp(input({ tenderJoints28: 0, swollenJoints28: 0, crp: 0, patientGlobalVas: 0 }))
    // 0 + 0 + 0.36 ln(1) + 0 + 0.96 = 0.96
    expect(r.value).toBeCloseTo(0.96, 2)
    expect(r.level).toBe('remission')
  })

  it('活動性の区分は既定で慣用基準（寛解<2.6／低≦3.2／中≦5.1／高>5.1）', () => {
    // 院内のデジタル問診システムと同じ基準に揃えている。
    // CRP調整基準（2.3/2.7/4.1）は設定で選べる（後段のテストを参照）
    expect(das28crpLevel(2.5)).toBe('remission')
    expect(das28crpLevel(3.2)).toBe('low')
    expect(das28crpLevel(4.2)).toBe('moderate')
    expect(das28crpLevel(5.2)).toBe('high')
  })
})

describe('SDAI と CDAI', () => {
  it('SDAI = 腫脹 + 圧痛 + 患者VAS + 医師VAS + CRP(mg/dL)', () => {
    expect(sdai(CASE).value).toBe(20)
    expect(sdai(CASE).level).toBe('moderate')
  })

  it('CDAI は CRP を含まない', () => {
    expect(cdai(CASE).value).toBe(19)
    expect(cdai(CASE).level).toBe('moderate')
  })

  it('SDAI の区分（寛解≦3.3／低≦11／中≦26／高>26）', () => {
    expect(sdaiLevel(3.3)).toBe('remission')
    expect(sdaiLevel(11)).toBe('low')
    expect(sdaiLevel(26)).toBe('moderate')
    expect(sdaiLevel(26.1)).toBe('high')
  })

  it('CDAI の区分（寛解≦2.8／低≦10／中≦22／高>22）', () => {
    expect(cdaiLevel(2.8)).toBe('remission')
    expect(cdaiLevel(10)).toBe('low')
    expect(cdaiLevel(22)).toBe('moderate')
    expect(cdaiLevel(22.1)).toBe('high')
  })

  it('CDAI は CRP がなくても計算できる', () => {
    const r = cdai(input({ tenderJoints28: 1, swollenJoints28: 1, patientGlobalVas: 0.5, physicianGlobalVas: 0.5 }))
    expect(r.value).toBe(3)
    expect(r.level).toBe('low')
  })
})

describe('ACR/EULAR Boolean 寛解基準', () => {
  it('4項目すべてを満たせば寛解', () => {
    const r = booleanRemission(
      input({ tenderJoints28: 1, swollenJoints28: 1, crp: 0.5, patientGlobalVas: 1 }),
    )
    expect(r.met).toBe(true)
  })

  it('1項目でも超えれば寛解ではない', () => {
    const r = booleanRemission(
      input({ tenderJoints28: 2, swollenJoints28: 1, crp: 0.5, patientGlobalVas: 1 }),
    )
    expect(r.met).toBe(false)
    expect(r.detail[0]).toContain('×')
  })

  it('入力が不足していれば判定不能', () => {
    expect(booleanRemission(input({ tenderJoints28: 1 })).met).toBeNull()
  })
})

describe('ACR/EULAR 2010 分類基準', () => {
  it('小関節4か所・抗体高値陽性・CRP高値・6週以上で8点（RAと分類）', () => {
    const r = classification2010(
      input({ smallJointsInvolved: 4, largeJointsInvolved: 0, rf: 120, crp: 0.9, durationMonths: 3 }),
    )
    // A=3（小関節4〜10）, B=3（高値陽性）, C=1, D=1
    expect(r.score).toBe(8)
    expect(r.suggestsRa).toBe(true)
  })

  it('大関節1か所・抗体陰性・炎症なし・6週未満なら0点', () => {
    const r = classification2010(
      input({ smallJointsInvolved: 0, largeJointsInvolved: 1, crp: 0.1, esr: 10, durationMonths: 0.5 }),
    )
    expect(r.score).toBe(0)
    expect(r.suggestsRa).toBe(false)
  })

  it('10か所超（小関節を含む）は関節スコア5点', () => {
    const r = classification2010(input({ smallJointsInvolved: 8, largeJointsInvolved: 4 }))
    expect(r.breakdown[0]).toContain('5点')
  })

  it('低値陽性は2点', () => {
    const r = classification2010(input({ smallJointsInvolved: 2, largeJointsInvolved: 0, rf: 30 }))
    expect(r.breakdown.join()).toContain('低値陽性')
  })

  it('関節数が未入力なら判定しない', () => {
    expect(classification2010(input()).score).toBeNull()
  })
})

describe('総合評価と T2T', () => {
  it('代表指標は SDAI が優先される', () => {
    expect(assessRa(CASE).primary.name).toBe('SDAI')
  })

  it('CRP がなければ DAS28-ESR や CDAI にフォールバックする', () => {
    const noCrp = input({ tenderJoints28: 6, swollenJoints28: 4, patientGlobalVas: 5, physicianGlobalVas: 4, esr: 30 })
    expect(assessRa(noCrp).primary.name).toBe('DAS28-ESR')
  })

  it('中〜高活動性なら治療見直しのコメントを返す', () => {
    const a = assessRa(CASE)
    expect(a.t2tComment.join()).toContain('6か月')
  })

  it('寛解なら減量の順序に言及する', () => {
    const remission = input({
      tenderJoints28: 0,
      swollenJoints28: 0,
      patientGlobalVas: 0.5,
      physicianGlobalVas: 0.5,
      crp: 0.1,
    })
    const a = assessRa(remission)
    expect(a.primary.score.level).toBe('remission')
    expect(a.t2tComment.join()).toContain('グルココルチコイド')
  })

  it('発症2年以内なら window of opportunity に言及する', () => {
    const a = assessRa({ ...CASE, durationMonths: 8 })
    expect(a.t2tComment.join()).toContain('2年以内')
  })

  it('併存疾患に応じた注意が出る', () => {
    const a = assessRa({
      ...CASE,
      comorbidity: { ...CASE.comorbidity, interstitialLungDisease: true, hepatitisBC: true, pregnancyPlan: true },
    })
    const joined = a.cautions.join()
    expect(joined).toContain('間質性肺疾患')
    expect(joined).toContain('B型')
    expect(joined).toContain('MTX')
  })

  it('骨びらんがあれば治療強化の適応に言及する', () => {
    const a = assessRa({ ...CASE, erosion: true })
    expect(a.cautions.join()).toContain('骨破壊')
  })
})

describe('問診システムから取り込んだスコアの扱い', () => {
  const ext = (over: Partial<RaInput['external']>) => ({
    sdai: null, cdai: null, das28crp: null, das28esr: null, source: '問診システム', ...over,
  })

  it('内訳が無ければ取り込んだ SDAI をそのまま使う', () => {
    const a = assessRa(input({ external: ext({ sdai: 20.2 }) }))
    expect(a.sdai.value).toBe(20.2)
    expect(a.sdai.level).toBe('moderate')
    expect(a.sdai.source).toBe('external')
    expect(a.primary.name).toBe('SDAI')
  })

  it('内訳が揃っていれば計算値を優先する', () => {
    const a = assessRa({ ...CASE, external: ext({ sdai: 20.2 }) })
    expect(a.sdai.value).toBe(20)
    expect(a.sdai.source).toBe('computed')
  })

  it('計算値と取り込み値が食い違えば警告を出す', () => {
    const a = assessRa({ ...CASE, external: ext({ sdai: 30 }) })
    expect(a.cautions.join()).toContain('一致しません')
  })

  it('誤差の範囲内なら警告を出さない', () => {
    const a = assessRa({ ...CASE, external: ext({ sdai: 20.2 }) })
    expect(a.cautions.join()).not.toContain('一致しません')
  })

  it('取り込み値を使った場合はその旨をコメントに残す', () => {
    const a = assessRa(input({ external: ext({ sdai: 20.2 }) }))
    expect(a.t2tComment.join()).toContain('問診システム')
  })

  it('DAS28-CRP の取り込みにも対応する', () => {
    const a = assessRa(input({ external: ext({ das28crp: 4.45 }) }))
    expect(a.das28crp.value).toBe(4.45)
    // 既定は慣用基準なので 4.45 は「中」（問診システムの表示と一致する）
    expect(a.das28crp.level).toBe('moderate')
    expect(assessRa(input({ external: ext({ das28crp: 4.45 }) }), { das28crpThresholds: 'crpAdjusted' })
      .das28crp.level).toBe('high')
  })

  it('external が未設定でも従来どおり動く', () => {
    const a = assessRa(CASE)
    expect(a.sdai.value).toBe(20)
    expect(a.cautions.join()).not.toContain('一致しません')
  })
})

describe('DAS28-CRP のカットオフ設定（院内システムとの整合）', () => {
  it('既定（慣用基準 2.6/3.2/5.1）は問診システムと同じ区分になる', () => {
    expect(das28crpLevel(2.5)).toBe('remission')
    expect(das28crpLevel(3.2)).toBe('low')
    expect(das28crpLevel(5.1)).toBe('moderate')
    expect(das28crpLevel(5.2)).toBe('high')
  })

  it('CRP調整基準を選ぶと 2.3/2.7/4.1 になる', () => {
    expect(das28crpLevel(2.2, 'crpAdjusted')).toBe('remission')
    expect(das28crpLevel(2.6, 'crpAdjusted')).toBe('low')
    expect(das28crpLevel(4.1, 'crpAdjusted')).toBe('moderate')
    expect(das28crpLevel(4.2, 'crpAdjusted')).toBe('high')
  })

  it('同じ値でも基準によって区分が変わる（設定の意味）', () => {
    expect(das28crpLevel(4.52, 'classic')).toBe('moderate')
    expect(das28crpLevel(4.52, 'crpAdjusted')).toBe('high')
  })

  it('assessRa に設定を渡すと反映される', () => {
    const classic = assessRa(CASE, { das28crpThresholds: 'classic' })
    const adjusted = assessRa(CASE, { das28crpThresholds: 'crpAdjusted' })
    // CASE の DAS28-CRP は 4.45
    expect(classic.das28crp.value).toBe(adjusted.das28crp.value)
    expect(classic.das28crp.level).toBe('moderate')
    expect(adjusted.das28crp.level).toBe('high')
  })

  it('設定を省略すると慣用基準になる', () => {
    expect(assessRa(CASE).das28crp.level).toBe('moderate')
  })
})

describe('問診システムと計算式が一致すること', () => {
  // doctor.js の実装:
  //   das28crp = 0.56√tjc + 0.28√sjc + 0.36 ln(crp*10 + 1) + 0.014*pga(0-100) + 0.96
  //   das28esr = 0.56√tjc + 0.28√sjc + 0.70 ln(esr) + 0.014*pga(0-100)
  //   sdai = sjc + tjc + ega/10 + pga/10 + crp
  //   cdai = sjc + tjc + ega/10 + pga/10
  const tjc = 6, sjc = 4, pga = 50, ega = 40, crp = 1.2, esr = 30
  const theirs = {
    das28crp: 0.56 * Math.sqrt(tjc) + 0.28 * Math.sqrt(sjc) + 0.36 * Math.log(crp * 10 + 1) + 0.014 * pga + 0.96,
    das28esr: 0.56 * Math.sqrt(tjc) + 0.28 * Math.sqrt(sjc) + 0.7 * Math.log(esr) + 0.014 * pga,
    sdai: sjc + tjc + ega / 10 + pga / 10 + crp,
    cdai: sjc + tjc + ega / 10 + pga / 10,
  }
  const mine = input({
    tenderJoints28: tjc,
    swollenJoints28: sjc,
    patientGlobalVas: pga / 10,
    physicianGlobalVas: ega / 10,
    crp,
    esr,
  })

  it('DAS28-CRP が一致する', () => {
    expect(das28crp(mine).value).toBeCloseTo(theirs.das28crp, 2)
  })
  it('DAS28-ESR が一致する', () => {
    expect(das28esr(mine).value).toBeCloseTo(theirs.das28esr, 2)
  })
  it('SDAI が一致する', () => {
    expect(sdai(mine).value).toBeCloseTo(theirs.sdai, 2)
  })
  it('CDAI が一致する', () => {
    expect(cdai(mine).value).toBeCloseTo(theirs.cdai, 2)
  })
})
