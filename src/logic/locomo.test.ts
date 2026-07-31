import { describe, expect, it } from 'vitest'
import {
  assessLocomo,
  bmiCategory,
  calcBmi,
  calcTwoStepValue,
  judgeLocomo25,
  judgeStandUp,
  judgeTwoStep,
  kneeLoadReduction,
  weightTarget,
} from './locomo'
import type { LocomoInput } from '@/types'

function loco(over: Partial<LocomoInput> = {}): LocomoInput {
  return { standUpOneLegCm: null, standUpBothLegCm: null, twoStepValue: null, locomo25: null, ...over }
}

describe('立ち上がりテストの判定', () => {
  it('片脚40cmから立てる（両脚も低い台から立てる）ならロコモではない', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 40, standUpBothLegCm: 10 }))).toBe(0)
  })

  it('片脚40cmから立てない（両脚20cmは立てる）ならロコモ度1', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: 20 }))).toBe(1)
  })

  it('両脚20cmから立てない（30cmなら立てる）ならロコモ度2', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: 30 }))).toBe(2)
  })

  it('両脚30cmから立てない（40cmなら立てる）ならロコモ度3', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: 40 }))).toBe(3)
  })

  it('両脚40cmからも立てないならロコモ度3', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: 'cannot' }))).toBe(3)
  })

  it('未実施なら null', () => {
    expect(judgeStandUp(loco())).toBeNull()
  })

  it('「立てない」と「未実施」を区別する（未実施を重症と誤判定しない）', () => {
    // 両脚は20cmから立てるが片脚は未実施 → このテストでは判定できない
    expect(judgeStandUp(loco({ standUpOneLegCm: null, standUpBothLegCm: 20 }))).toBeNull()
    // 同じ状況で片脚が「立てない」なら、はっきりロコモ度1
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: 20 }))).toBe(1)
  })

  it('両脚が未実施でも片脚の結果があれば判定できる', () => {
    expect(judgeStandUp(loco({ standUpOneLegCm: 40, standUpBothLegCm: null }))).toBe(0)
    expect(judgeStandUp(loco({ standUpOneLegCm: 'cannot', standUpBothLegCm: null }))).toBe(1)
  })
})

describe('2ステップテストの判定', () => {
  it('1.3以上ならロコモではない', () => {
    expect(judgeTwoStep(1.35)).toBe(0)
  })
  it('1.1以上1.3未満はロコモ度1', () => {
    expect(judgeTwoStep(1.2)).toBe(1)
  })
  it('0.9以上1.1未満はロコモ度2', () => {
    expect(judgeTwoStep(1.0)).toBe(2)
  })
  it('0.9未満はロコモ度3', () => {
    expect(judgeTwoStep(0.85)).toBe(3)
  })
  it('未入力なら null', () => {
    expect(judgeTwoStep(null)).toBeNull()
  })
})

describe('ロコモ25の判定', () => {
  it('7点未満はロコモではない', () => {
    expect(judgeLocomo25(6)).toBe(0)
  })
  it('7点以上16点未満はロコモ度1', () => {
    expect(judgeLocomo25(7)).toBe(1)
    expect(judgeLocomo25(15)).toBe(1)
  })
  it('16点以上24点未満はロコモ度2', () => {
    expect(judgeLocomo25(16)).toBe(2)
    expect(judgeLocomo25(23)).toBe(2)
  })
  it('24点以上はロコモ度3', () => {
    expect(judgeLocomo25(24)).toBe(3)
  })
})

describe('総合判定（最も進行した段階を採用する）', () => {
  it('3つのテストのうち最も重い段階を採用する', () => {
    const a = assessLocomo(loco({ standUpOneLegCm: 40, standUpBothLegCm: 10, twoStepValue: 1.35, locomo25: 20 }))
    expect(a.byTest.standUp).toBe(0)
    expect(a.byTest.twoStep).toBe(0)
    expect(a.byTest.locomo25).toBe(2)
    expect(a.stage).toBe(2)
  })

  it('すべて未実施なら判定しない', () => {
    const a = assessLocomo(loco())
    expect(a.stage).toBeNull()
    expect(a.message).toContain('未実施')
  })

  it('ロコモ度2以上では運動器リハビリテーションを勧める', () => {
    const a = assessLocomo(loco({ twoStepValue: 1.0 }))
    expect(a.advice.join()).toContain('運動器リハビリテーション')
  })

  it('ロコモ度3では介護保険にも触れる', () => {
    const a = assessLocomo(loco({ locomo25: 30 }))
    expect(a.advice.join()).toContain('介護保険')
  })
})

describe('2ステップ値の計算', () => {
  it('2歩幅 ÷ 身長 で求める', () => {
    expect(calcTwoStepValue(210, 155)).toBeCloseTo(1.35, 2)
  })
  it('身長が未入力なら計算しない', () => {
    expect(calcTwoStepValue(210, null)).toBeNull()
  })
})

describe('BMI と減量目標', () => {
  it('BMI を計算する', () => {
    expect(calcBmi(160, 64)).toBe(25)
  })

  it('BMI の区分を返す', () => {
    expect(bmiCategory(17)).toContain('やせ')
    expect(bmiCategory(22)).toBe('標準')
    expect(bmiCategory(27)).toContain('肥満')
  })

  it('BMI 25未満になるための減量目標を返す', () => {
    // 160cm で BMI 24.9 → 63.7kg。70kg なら約6.3kg
    expect(weightTarget(160, 70)).toBeCloseTo(6.3, 1)
  })

  it('すでに BMI 25未満なら 0 を返す', () => {
    expect(weightTarget(160, 55)).toBe(0)
  })

  it('膝への負担の軽減量は歩行で3倍・階段で5倍', () => {
    expect(kneeLoadReduction(5)).toEqual({ walk: 15, stairs: 25 })
  })
})
