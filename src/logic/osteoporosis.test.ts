import { describe, expect, it } from 'vitest'
import {
  adoptBmd,
  assessOsteoporosis,
  suggestInitialTherapy,
  tscoreToYam,
  yamToTscore,
} from './osteoporosis'
import { createSession } from '@/state/session'
import type { FragilityFracture, OsteoporosisInput, PatientBasics } from '@/types'

function base(): { osteo: OsteoporosisInput; patient: PatientBasics } {
  const s = createSession('osteoporosis')
  return { osteo: s.osteo, patient: { ...s.patient, age: 72, sex: 'female' } }
}

function withBmd(yamLumbar: number | null, yamFemur: number | null = null): OsteoporosisInput {
  const { osteo } = base()
  return { ...osteo, bmd: { ...osteo.bmd, unit: 'yam', lumbar: yamLumbar, femur: yamFemur } }
}

describe('YAM と Tスコアの換算', () => {
  it('腰椎では YAM 70% がほぼ Tスコア −2.5 に対応する', () => {
    expect(yamToTscore(70, 'lumbar')).toBeCloseTo(-2.5, 5)
  })

  it('腰椎では YAM 80% がほぼ Tスコア −1.67 に対応する', () => {
    expect(yamToTscore(80, 'lumbar')).toBeCloseTo(-1.667, 2)
  })

  it('逆変換が元の値に戻る', () => {
    expect(tscoreToYam(yamToTscore(63, 'femur'), 'femur')).toBeCloseTo(63, 5)
  })
})

describe('骨密度の採用（低い方を採用する）', () => {
  it('腰椎と大腿骨の両方があれば Tスコアの低い方を採用する', () => {
    // 腰椎80% → T -1.67／大腿骨70% → T -2.31 なので大腿骨を採用
    const a = adoptBmd({ unit: 'yam', lumbar: 80, femur: 70, measuredAt: '2026-07-01', note: '' })
    expect(a.site).toBe('femur')
    expect(a.tscore).toBeCloseTo(-2.3, 1)
  })

  it('片方だけならその値を採用する', () => {
    const a = adoptBmd({ unit: 'yam', lumbar: 66, femur: null, measuredAt: '2026-07-01', note: '' })
    expect(a.site).toBe('lumbar')
    expect(a.yam).toBe(66)
  })

  it('Tスコア入力にも対応する', () => {
    const a = adoptBmd({ unit: 'tscore', lumbar: -2.8, femur: -2.0, measuredAt: '2026-07-01', note: '' })
    expect(a.site).toBe('lumbar')
    expect(a.tscore).toBe(-2.8)
  })

  it('未入力なら null を返す', () => {
    const a = adoptBmd({ unit: 'yam', lumbar: null, femur: null, measuredAt: '2026-07-01', note: '' })
    expect(a.site).toBeNull()
    expect(a.yam).toBeNull()
  })
})

describe('原発性骨粗鬆症の診断基準', () => {
  const { patient } = base()

  it('椎体骨折があれば骨密度によらず骨粗鬆症と診断する', () => {
    const osteo: OsteoporosisInput = {
      ...withBmd(95),
      fractures: [{ site: 'vertebra', when: 'over12m', multiple: false }],
    }
    const a = assessOsteoporosis(osteo, patient)
    expect(a.diagnosis).toBe('osteoporosis')
    expect(a.pharmacotherapyIndicated).toBe(true)
  })

  it('大腿骨近位部骨折があれば骨粗鬆症と診断する', () => {
    const osteo: OsteoporosisInput = {
      ...withBmd(88),
      fractures: [{ site: 'proximalFemur', when: 'over12m', multiple: false }],
    }
    expect(assessOsteoporosis(osteo, patient).diagnosis).toBe('osteoporosis')
  })

  it('その他の部位の骨折は YAM 80%未満で骨粗鬆症と診断する', () => {
    const fx: FragilityFracture[] = [{ site: 'distalRadius', when: 'over12m', multiple: false }]
    expect(assessOsteoporosis({ ...withBmd(78), fractures: fx }, patient).diagnosis).toBe('osteoporosis')
    expect(assessOsteoporosis({ ...withBmd(85), fractures: fx }, patient).diagnosis).toBe('lowBoneMass')
  })

  it('骨折がなければ YAM 70%以下（Tスコア −2.5以下）で骨粗鬆症と診断する', () => {
    expect(assessOsteoporosis(withBmd(68), patient).diagnosis).toBe('osteoporosis')
    expect(assessOsteoporosis(withBmd(70), patient).diagnosis).toBe('osteoporosis')
    expect(assessOsteoporosis(withBmd(75), patient).diagnosis).toBe('lowBoneMass')
    expect(assessOsteoporosis(withBmd(88), patient).diagnosis).toBe('normal')
  })

  it('骨密度未入力なら判定不能とする', () => {
    expect(assessOsteoporosis(withBmd(null), patient).diagnosis).toBe('insufficientData')
  })
})

describe('薬物治療開始基準', () => {
  const { patient } = base()

  it('YAM 70%未満なら適応', () => {
    expect(assessOsteoporosis(withBmd(66), patient).pharmacotherapyIndicated).toBe(true)
  })

  it('YAM 70〜80% で危険因子がなければ「要検討」', () => {
    expect(assessOsteoporosis(withBmd(75), patient).pharmacotherapyIndicated).toBe('consider')
  })

  it('YAM 70〜80% で大腿骨近位部骨折の家族歴があれば適応', () => {
    const o = withBmd(75)
    const a = assessOsteoporosis({ ...o, risk: { ...o.risk, parentHipFracture: true } }, patient)
    expect(a.pharmacotherapyIndicated).toBe(true)
  })

  it('YAM 70〜80% で FRAX 主要骨折10年確率が15%以上なら適応', () => {
    const o = withBmd(75)
    const a = assessOsteoporosis({ ...o, risk: { ...o.risk, fraxMajorPercent: 18 } }, patient)
    expect(a.pharmacotherapyIndicated).toBe(true)
    expect(a.pharmacotherapyReasons.join()).toContain('18%')
  })

  it('FRAX 15%以上でも75歳以上では適用範囲の注記が付く', () => {
    const o = withBmd(75)
    const a = assessOsteoporosis({ ...o, risk: { ...o.risk, fraxMajorPercent: 18 } }, { ...patient, age: 80 })
    expect(a.pharmacotherapyReasons.join()).toContain('75歳未満')
  })

  it('YAM 80%以上・骨折なしなら開始基準を満たさない', () => {
    expect(assessOsteoporosis(withBmd(90), patient).pharmacotherapyIndicated).toBe(false)
  })
})

describe('骨折リスクの層別化', () => {
  const { patient } = base()

  it('直近12か月以内の骨折は「きわめて高い」', () => {
    const o: OsteoporosisInput = {
      ...withBmd(75),
      fractures: [{ site: 'distalRadius', when: 'within12m', multiple: false }],
    }
    expect(assessOsteoporosis(o, patient).riskTier).toBe('veryHigh')
  })

  it('多発骨折は「きわめて高い」', () => {
    const o: OsteoporosisInput = {
      ...withBmd(75),
      fractures: [
        { site: 'vertebra', when: 'over12m', multiple: false },
        { site: 'distalRadius', when: 'over12m', multiple: false },
      ],
    }
    expect(assessOsteoporosis(o, patient).riskTier).toBe('veryHigh')
  })

  it('Tスコア −3.0以下は「きわめて高い」', () => {
    // YAM 62% → T = (62-100)/12 = -3.17
    expect(assessOsteoporosis(withBmd(62), patient).riskTier).toBe('veryHigh')
  })

  it('転倒歴があれば「きわめて高い」', () => {
    const o = withBmd(78)
    expect(assessOsteoporosis({ ...o, risk: { ...o.risk, fallLastYear: true } }, patient).riskTier).toBe('veryHigh')
  })

  it('Tスコア −2.5以下（−3.0より上）は「高い」', () => {
    // YAM 68% → T = -2.67
    expect(assessOsteoporosis(withBmd(68), patient).riskTier).toBe('high')
  })

  it('骨量減少のみなら「中等度」', () => {
    expect(assessOsteoporosis(withBmd(78), patient).riskTier).toBe('moderate')
  })

  it('正常骨密度・危険因子なしなら「低い」', () => {
    expect(assessOsteoporosis(withBmd(95), patient).riskTier).toBe('low')
  })
})

describe('身長低下と注意事項', () => {
  const { patient } = base()

  it('4cm以上の身長低下で椎体骨折の精査を促す', () => {
    const a = assessOsteoporosis(withBmd(75), { ...patient, heightCm: 148, maxHeightCm: 154 })
    expect(a.heightLossCm).toBe(6)
    expect(a.cautions.join()).toContain('胸腰椎')
  })

  it('高カルシウム血症があれば注意を出す', () => {
    const o = withBmd(66)
    const a = assessOsteoporosis({ ...o, labs: { ...o.labs, calcium: 11.0 } }, patient)
    expect(a.cautions.join()).toContain('副甲状腺')
  })

  it('ビタミンD不足があれば補充を促す', () => {
    const o = withBmd(66)
    const a = assessOsteoporosis({ ...o, labs: { ...o.labs, vitD25: 12 } }, patient)
    expect(a.cautions.join()).toContain('ビタミンD')
  })

  it('腎機能低下があればビスホスホネートの注意を出す', () => {
    const o = withBmd(66)
    const a = assessOsteoporosis({ ...o, labs: { ...o.labs, egfr: 28 } }, patient)
    expect(a.cautions.join()).toContain('ビスホスホネート')
  })

  it('ステロイド使用中はステロイド性骨粗鬆症の指針に触れる', () => {
    const o = withBmd(75)
    const a = assessOsteoporosis({ ...o, risk: { ...o.risk, glucocorticoid: true } }, patient)
    expect(a.cautions.join()).toContain('ステロイド性骨粗鬆症')
  })
})

describe('初期治療の提案', () => {
  it('きわめて高リスクでは骨形成促進薬を第一選択にする', () => {
    const t = suggestInitialTherapy('veryHigh')
    expect(t.first.join()).toMatch(/ロモソズマブ|テリパラチド|アバロパラチド/)
    expect(t.notes.join()).toContain('逐次療法')
  })

  it('低リスクでは薬物治療を勧めない', () => {
    expect(suggestInitialTherapy('low').first.join()).toContain('薬物治療は不要')
  })

  it('判定不能では検査を促す', () => {
    expect(suggestInitialTherapy('unknown').notes.join()).toContain('DXA')
  })
})
