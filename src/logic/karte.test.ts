import { describe, expect, it } from 'vitest'
import { buildKarte, suggestFees, suggestLabs, suggestNextVisit } from './karte'
import { createSession } from '@/state/session'
import type { Session } from '@/types'

function osteoSession(): Session {
  const s = createSession('osteoporosis')
  return {
    ...s,
    patient: { ...s.patient, chartNo: '000123', age: 76, sex: 'female', heightCm: 148, maxHeightCm: 155, doctorName: '担当医' },
    osteo: {
      ...s.osteo,
      bmd: { ...s.osteo.bmd, unit: 'yam', lumbar: 64, femur: 62 },
      fractures: [{ site: 'vertebra', when: 'within12m', multiple: false }],
    },
    plan: {
      ...s.plan,
      drugIds: ['romosozumab', 'calcium-vitd'],
      exercisePathway: ['undoukiRehab', 'homeExercise'],
      prescription: [
        { exerciseId: 'one-leg-stand', reps: '左右各1分', sets: '1セット', frequency: '1日3回', memo: '机のそばで' },
      ],
      lifestyleIds: ['nutrition-ca', 'fall-prevention'],
      nextVisit: '1か月後（定期評価）',
      nextTests: ['bone-markers', 'op-blood'],
      doctorMessage: 'まず3か月、いっしょに続けましょう。',
    },
  }
}

describe('カルテ記載文の生成（骨粗鬆症）', () => {
  const k = buildKarte(osteoSession())

  it('ヘッダーに日付と疾患名が入る', () => {
    expect(k.text).toContain('【患者説明記録】')
    expect(k.text).toContain('骨粗鬆症')
  })

  it('採用した骨密度と診断が記載される', () => {
    expect(k.text).toContain('採用値')
    expect(k.text).toContain('骨粗鬆症（原発性骨粗鬆症の診断基準を満たす）')
  })

  it('脆弱性骨折と発生時期が記載される', () => {
    expect(k.text).toContain('椎体骨折（12か月以内）')
  })

  it('骨折リスク区分が記載される', () => {
    expect(k.text).toContain('きわめて高い')
  })

  it('身長低下が記載される', () => {
    expect(k.text).toContain('身長低下：7cm')
  })

  it('選択した薬剤と説明した注意点が記載される', () => {
    expect(k.text).toContain('ロモソズマブ')
    expect(k.text).toContain('顎骨壊死')
  })

  it('逐次療法の説明が記載される', () => {
    expect(k.text).toContain('逐次療法')
  })

  it('運動処方が記載される', () => {
    expect(k.text).toContain('開眼片脚立ち（ロコトレ①）')
    expect(k.text).toContain('左右各1分')
    expect(k.text).toContain('机のそばで')
  })

  it('次回予定と検査が記載される', () => {
    expect(k.text).toContain('1か月後（定期評価）')
    expect(k.text).toContain('骨代謝マーカー')
  })

  it('SOAP 形式でも出力される', () => {
    expect(k.soap).toMatch(/^S\) /m)
    expect(k.soap).toMatch(/^O\) /m)
    expect(k.soap).toMatch(/^A\) /m)
    expect(k.soap).toMatch(/^P\) /m)
  })

  it('今日のうちに済ませることに歯科受診と逐次療法が挙がる', () => {
    expect(k.followUp.join()).toContain('歯科')
    expect(k.followUp.join()).toContain('骨形成促進薬')
  })
})

describe('算定候補の提示', () => {
  it('運動器リハを導入したら運動器リハビリテーション料が候補に入る', () => {
    const fees = suggestFees(osteoSession())
    expect(fees.map((f) => f.id)).toContain('undouki-reha-1')
    expect(fees.map((f) => f.id)).toContain('reha-plan')
  })

  it('大腿骨近位部骨折があれば二次性骨折予防継続管理料が候補に入る', () => {
    const s = osteoSession()
    s.osteo.fractures = [{ site: 'proximalFemur', when: 'within12m', multiple: false }]
    const fees = suggestFees(s)
    expect(fees.map((f) => f.id)).toContain('secondary-fracture-3')
  })

  it('骨吸収抑制薬を選んだら診療情報提供料（歯科連携）が候補に入る', () => {
    const fees = suggestFees(osteoSession())
    expect(fees.map((f) => f.id)).toContain('shinryo-joho')
  })

  it('候補に重複はない', () => {
    const ids = suggestFees(osteoSession()).map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('点数が未確認の項目は null のまま提示される（勝手に埋めない）', () => {
    const fees = suggestFees(osteoSession())
    const unknown = fees.find((f) => f.id === 'seikatsu-shukan')
    expect(unknown?.points).toBeNull()
  })
})

describe('検査候補の並び', () => {
  it('選択した薬剤クラスに必要な検査が上位に来る', () => {
    const s = createSession('ra')
    s.plan.drugIds = ['mtx']
    const labs = suggestLabs(s)
    const idx = labs.findIndex((l) => l.id === 'ra-monitor')
    const other = labs.findIndex((l) => l.id === 'ra-echo')
    expect(idx).toBeLessThan(other)
  })
})

describe('次回来院の候補', () => {
  it('デノスマブを選ぶと6か月後の投与予約が候補に入る', () => {
    const s = createSession('osteoporosis')
    s.plan.drugIds = ['denosumab']
    expect(suggestNextVisit(s).map((o) => o.value).join()).toContain('6か月後')
  })

  it('ゾレドロン酸を選ぶと1年後の点滴が候補に入る', () => {
    const s = createSession('osteoporosis')
    s.plan.drugIds = ['zoledronate']
    expect(suggestNextVisit(s).map((o) => o.value).join()).toContain('1年後')
  })

  it('関節リウマチでは3か月・6か月の評価が候補に入る', () => {
    const s = createSession('ra')
    const values = suggestNextVisit(s).map((o) => o.value).join()
    expect(values).toContain('3か月後')
    expect(values).toContain('6か月後')
  })

  it('MTX を選ぶと2週後の血液検査が候補に入る', () => {
    const s = createSession('ra')
    s.plan.drugIds = ['mtx']
    expect(suggestNextVisit(s).map((o) => o.value).join()).toContain('2週後')
  })
})

describe('カルテ記載文の生成（関節リウマチ・膝OA）', () => {
  it('関節リウマチでは疾患活動性スコアが記載される', () => {
    const s = createSession('ra')
    s.ra = {
      ...s.ra,
      tenderJoints28: 6,
      swollenJoints28: 4,
      patientGlobalVas: 5,
      physicianGlobalVas: 4,
      crp: 1.0,
      esr: 30,
    }
    s.plan.drugIds = ['mtx', 'folate']
    const k = buildKarte(s)
    expect(k.text).toContain('SDAI')
    expect(k.text).toContain('週1回投与')
    expect(k.followUp.join()).toContain('血算')
  })

  it('膝OAではロコモ度とK-L分類が記載される', () => {
    const s = createSession('kneeOA')
    s.knee = { ...s.knee, side: 'both', klGrade: 3, painNrs: 6 }
    s.locomo = { ...s.locomo, standUpOneLegCm: 'cannot', standUpBothLegCm: 30, twoStepValue: 1.0, locomo25: 18 }
    const k = buildKarte(s)
    expect(k.text).toContain('K-L分類：グレード3')
    expect(k.text).toContain('ロコモ度2')
  })
})

describe('図から入力した痛みの場所', () => {
  it('図で確認した部位がカルテ文に載る', () => {
    const s = createSession('lumbarDiscHernia')
    s.condition = { ...s.condition, side: 'right', painSpots: ['lowBack', 'thighBackR', 'shinR'] }
    const t = buildKarte(s).text
    expect(t).toContain('疼痛部位（図で確認）：腰、右ももの裏、右すね')
  })

  it('未編集（null）なら載らない', () => {
    const s = createSession('lumbarDiscHernia')
    expect(buildKarte(s).text).not.toContain('疼痛部位（図で確認）')
  })

  it('すべて外した（空配列）ときも載らない', () => {
    const s = createSession('lumbarDiscHernia')
    s.condition = { ...s.condition, painSpots: [] }
    expect(buildKarte(s).text).not.toContain('疼痛部位（図で確認）')
  })
})
