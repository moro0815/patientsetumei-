import { describe, expect, it } from 'vitest'
import {
  assessCondition,
  conditionSummaryLine,
  currentPhaseIndex,
  isProlonged,
  labelsOf,
  painBandOf,
  sideLabel,
} from './condition'
import { CONDITIONS, CONDITION_REGIONS, emptyConditionInput, getCondition, isConditionKey, searchConditions } from '@/data/conditions'
import { DISEASE_CARDS, DISEASE_REGIONS, MAIN_CARDS, cardsByRegion, searchDiseases } from '@/data/diseaseCatalog'
import { ALL_EXERCISES, getExercise } from '@/data/exercises'
import { getDrug } from '@/data/drugs'
import { getLabOrder } from '@/data/fees'
import { source } from '@/data/sources'
import { createSession, DISEASE_LABEL, DISEASE_SUBLABEL } from '@/state/session'
import type { ConditionInput } from '@/types'

function input(over: Partial<ConditionInput> = {}): ConditionInput {
  return { ...emptyConditionInput(), ...over }
}

describe('痛みの区分', () => {
  it('NRS を区分に変換する', () => {
    expect(painBandOf(null)).toBe('unknown')
    expect(painBandOf(0)).toBe('none')
    expect(painBandOf(3)).toBe('mild')
    expect(painBandOf(4)).toBe('moderate')
    expect(painBandOf(6)).toBe('moderate')
    expect(painBandOf(7)).toBe('severe')
    expect(painBandOf(10)).toBe('severe')
  })
})

describe('レッドフラッグの検出', () => {
  const def = getCondition('lumbarStenosis')!

  it('馬尾症候群を選ぶと紹介を提案する', () => {
    const a = assessCondition(input({ redFlags: ['bladder'] }), def)
    expect(a.referralSuggested).toBe(true)
    expect(a.redFlags).toContain('尿が出にくい・もれる、便が出にくい')
    expect(a.actions.join()).toContain('紹介')
  })

  it('レッドフラッグの医師向け補足が留意事項に入る', () => {
    const a = assessCondition(input({ redFlags: ['bladder'] }), def)
    expect(a.cautions.join()).toContain('馬尾症候群')
  })

  it('レッドフラッグがなければ紹介は提案しない', () => {
    const a = assessCondition(input({ painNrs: 4 }), def)
    expect(a.referralSuggested).toBe(false)
    expect(a.redFlags).toHaveLength(0)
  })

  it('存在しないIDは無視する（データ変更で壊れない）', () => {
    const a = assessCondition(input({ redFlags: ['no-such-id'] }), def)
    expect(a.redFlags).toHaveLength(0)
    expect(a.referralSuggested).toBe(false)
  })

  it('症状側の脊髄症のサインも留意事項に上がる（頚椎症性神経根症）', () => {
    const csr = getCondition('cervicalRadiculopathy')!
    const a = assessCondition(input({ symptoms: ['gaitUnsteady'] }), csr)
    expect(a.cautions.join()).toContain('脊髄症')
  })
})

describe('治療の段の提案', () => {
  const def = getCondition('lumbarStenosis')!

  it('未治療なら土台（第1段）から始める', () => {
    const a = assessCondition(input(), def)
    expect(a.suggestedStep).toBe(1)
    expect(a.suggestedStepReasons.join()).toContain('土台')
  })

  it('すでに薬を使っていれば次の段を提案する', () => {
    const a = assessCondition(input({ priorTreatments: ['nsaid'] }), def)
    expect(a.suggestedStep).toBe(3)
    expect(a.suggestedStepReasons.join()).toContain('のみ薬')
  })

  it('注射まで済んでいれば手術の段になる', () => {
    const a = assessCondition(input({ priorTreatments: ['nsaid', 'block'] }), def)
    expect(a.suggestedStep).toBe(4)
  })

  it('段は治療の段数を超えない', () => {
    const a = assessCondition(input({ priorTreatments: ['surgery'] }), def)
    expect(a.suggestedStep).toBeLessThanOrEqual(def.treatments.length)
  })

  it('痛みが強ければ、土台だけで様子を見ずに薬の段へ進める', () => {
    const a = assessCondition(input({ painNrs: 8 }), def)
    expect(a.suggestedStep).toBe(2)
    expect(a.suggestedStepReasons.join()).toContain('運動療法を始められる状態ではない')
  })

  it('長引いていれば薬の段へ進める', () => {
    const a = assessCondition(input({ duration: '>1y' }), def)
    expect(a.suggestedStep).toBe(2)
    expect(a.suggestedStepReasons.join()).toContain('長引いて')
  })

  it('すでに進んだ治療がある場合、痛みの強さで段を下げない', () => {
    const a = assessCondition(input({ painNrs: 9, priorTreatments: ['block'] }), def)
    expect(a.suggestedStep).toBe(4)
  })

  it('レッドフラッグがあるときは、その旨を理由の先頭に置く', () => {
    const a = assessCondition(input({ redFlags: ['bladder'], priorTreatments: ['nsaid'] }), def)
    expect(a.suggestedStepReasons[0]).toContain('緊急性')
  })
})

describe('長引いているかの判定', () => {
  it('長期の期間IDを拾う', () => {
    expect(isProlonged('>1y')).toBe(true)
    expect(isProlonged('>6m')).toBe(true)
    expect(isProlonged('2-5y')).toBe(true)
  })
  it('短期・未選択は false', () => {
    expect(isProlonged('<2w')).toBe(false)
    expect(isProlonged('2-6w')).toBe(false)
    expect(isProlonged(null)).toBe(false)
  })
})

describe('入力を促す助言', () => {
  const def = getCondition('frozenShoulder')!

  it('未入力の指標があれば測定を促す', () => {
    const a = assessCondition(input(), def)
    expect(a.actions.join()).toContain('前から上げられる角度')
  })

  it('すべて入力すれば促さない', () => {
    const a = assessCondition(
      input({
        painNrs: 5,
        side: 'right',
        stage: 'frozen',
        metrics: { flexion: 100, abduction: 90, externalRotation: 10 },
      }),
      def,
    )
    expect(a.actions).toHaveLength(0)
  })

  it('疾患モデルがなければ空の判定を返す', () => {
    const a = assessCondition(input(), undefined)
    expect(a.redFlags).toHaveLength(0)
    expect(a.suggestedStep).toBe(1)
  })
})

describe('経過フェーズの推定', () => {
  const def = getCondition('lumbarDiscHernia')!

  it('いちばん早い期間なら最初のフェーズ', () => {
    expect(currentPhaseIndex(input({ duration: '<2w' }), def)).toBe(0)
  })
  it('いちばん長い期間なら最後のフェーズ', () => {
    expect(currentPhaseIndex(input({ duration: '>3m' }), def)).toBe(def.course.phases.length - 1)
  })
  it('未選択なら null', () => {
    expect(currentPhaseIndex(input(), def)).toBeNull()
  })
  it('未知の期間IDなら null', () => {
    expect(currentPhaseIndex(input({ duration: 'unknown' }), def)).toBeNull()
  })
})

describe('表示用の変換', () => {
  it('IDをラベルに変換し、未知のIDは落とす', () => {
    const def = getCondition('tennisElbow')!
    expect(labelsOf(['gripPain', 'no-such'], def.symptomOptions)).toEqual(['握ると痛い・力が入らない'])
  })

  it('左右のラベル', () => {
    expect(sideLabel('left')).toBe('左')
    expect(sideLabel('right')).toBe('右')
    expect(sideLabel('both')).toBe('両側')
    expect(sideLabel(null)).toBe('')
  })

  it('1行サマリを組み立てる', () => {
    const s = createSession('plantarFasciitis')
    s.condition = input({ side: 'right', painNrs: 6, duration: '1-3m' })
    expect(conditionSummaryLine(s)).toBe('右／NRS 6/10／1〜3か月')
  })

  it('症状別疾患でないセッションでは空文字', () => {
    expect(conditionSummaryLine(createSession('ra'))).toBe('')
  })
})

describe('疾患モデルの登録簿', () => {
  it('12疾患が登録されている', () => {
    expect(CONDITIONS).toHaveLength(12)
  })

  it('キーが重複していない', () => {
    const keys = CONDITIONS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('症状別疾患かどうかを判定できる', () => {
    expect(isConditionKey('lumbarStenosis')).toBe(true)
    expect(isConditionKey('osteoporosis')).toBe(false)
    expect(isConditionKey('ra')).toBe(false)
    expect(isConditionKey('kneeOA')).toBe(false)
  })

  it('すべての疾患がいずれかの部位に属する', () => {
    for (const c of CONDITIONS) {
      expect(CONDITION_REGIONS).toContain(c.region)
    }
  })

  it('病名・別名で検索できる', () => {
    expect(searchConditions('五十肩').map((c) => c.key)).toEqual(['frozenShoulder'])
    expect(searchConditions('ばね指').map((c) => c.key)).toEqual(['triggerFinger'])
    expect(searchConditions('ヘルニア').map((c) => c.key)).toContain('lumbarDiscHernia')
    expect(searchConditions('かかと').map((c) => c.key)).toContain('plantarFasciitis')
  })

  it('検索語が空ならすべて返す', () => {
    expect(searchConditions('  ')).toHaveLength(CONDITIONS.length)
  })

  it('疾患名が DISEASE_LABEL に載っている', () => {
    for (const c of CONDITIONS) {
      expect(DISEASE_LABEL[c.key]).toBe(c.label)
      expect(DISEASE_SUBLABEL[c.key]).toBe(c.subLabel)
    }
  })
})

describe('疾患モデルの内容の妥当性（データの取り違え防止）', () => {
  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：必須の説明がそろっている', (_label, c) => {
    expect(c.oneLiner.length).toBeGreaterThan(10)
    expect(c.what.length).toBeGreaterThan(0)
    expect(c.whyPain.length).toBeGreaterThan(0)
    expect(c.course.points.length).toBeGreaterThan(0)
    expect(c.course.phases.length).toBeGreaterThan(1)
    expect(c.treatments.length).toBeGreaterThan(1)
    expect(c.selfCare.length).toBeGreaterThan(0)
    expect(c.avoid.length).toBeGreaterThan(0)
    expect(c.warnSigns.length).toBeGreaterThan(0)
    expect(c.workup.length).toBeGreaterThan(0)
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：選択肢のIDが重複していない', (_label, c) => {
    for (const opts of [c.symptomOptions, c.findingOptions, c.redFlagOptions, c.priorTreatmentOptions, c.duration]) {
      const ids = opts.map((o) => o.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：レッドフラッグが1つ以上ある', (_label, c) => {
    expect(c.redFlagOptions.length).toBeGreaterThan(0)
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：推奨する運動が実在する', (_label, c) => {
    expect(c.exercise.recommendedIds.length).toBeGreaterThan(0)
    for (const id of c.exercise.recommendedIds) {
      expect(getExercise(id), `運動ID ${id} が見つかりません`).toBeDefined()
    }
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：治療で挙げた薬が実在する', (_label, c) => {
    for (const t of c.treatments) {
      for (const id of t.drugIds ?? []) {
        expect(getDrug(id), `薬剤ID ${id} が見つかりません`).toBeDefined()
      }
    }
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：検査候補が実在する', (_label, c) => {
    for (const id of c.labIds ?? []) {
      expect(getLabOrder(id), `検査ID ${id} が見つかりません`).toBeDefined()
    }
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：出典が実在する', (_label, c) => {
    expect(c.sources.length).toBeGreaterThan(0)
    for (const id of c.sources) {
      expect(source(id), `出典ID ${id} が見つかりません`).toBeDefined()
    }
  })

  it.each(CONDITIONS.map((c) => [c.label, c] as const))('%s：推奨する運動がその疾患向けに登録されている', (_label, c) => {
    for (const id of c.exercise.recommendedIds) {
      const e = getExercise(id)!
      expect(e.disease, `${e.name} が ${c.key} 向けに登録されていません`).toContain(c.key)
    }
  })
})

describe('トップ画面の疾患カタログ', () => {
  it('15疾患すべてが載っている', () => {
    expect(DISEASE_CARDS).toHaveLength(15)
    expect(DISEASE_CARDS.length).toBe(3 + CONDITIONS.length)
  })

  it('最上段は骨粗鬆症と関節リウマチだけ', () => {
    expect(MAIN_CARDS.map((c) => c.key)).toEqual(['osteoporosis', 'ra'])
  })

  it('変形性膝関節症は「股・膝」に置かれている', () => {
    const knee = DISEASE_CARDS.find((c) => c.key === 'kneeOA')
    expect(knee?.region).toBe('股・膝')
  })

  it('「股・膝」には膝と股関節が並ぶ', () => {
    expect(cardsByRegion('股・膝').map((c) => c.key)).toEqual(['kneeOA', 'hipOA'])
  })

  it('すべてのカードが部位（または main）に属する', () => {
    for (const c of DISEASE_CARDS) {
      if (c.region === 'main') continue
      expect(DISEASE_REGIONS).toContain(c.region)
    }
  })

  it('キーが重複していない', () => {
    const keys = DISEASE_CARDS.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('患者さんの言い方で検索できる（膝・ロコモを含む）', () => {
    expect(searchDiseases('ひざ').map((c) => c.key)).toContain('kneeOA')
    expect(searchDiseases('ロコモ').map((c) => c.key)).toContain('kneeOA')
    expect(searchDiseases('リウマチ').map((c) => c.key)).toContain('ra')
    expect(searchDiseases('シンスプリント').map((c) => c.key)).toEqual(['shinSplints'])
    expect(searchDiseases('すね').map((c) => c.key)).toContain('shinSplints')
  })

  it('検索語が空ならすべて返す', () => {
    expect(searchDiseases('')).toHaveLength(DISEASE_CARDS.length)
  })
})

describe('運動マスタの整合', () => {
  it('運動IDが重複していない', () => {
    const ids = ALL_EXERCISES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('すべての運動に出典と中止基準がある', () => {
    for (const e of ALL_EXERCISES) {
      expect(e.sources.length, `${e.name} に出典がありません`).toBeGreaterThan(0)
      expect(e.stopRules.length, `${e.name} に中止基準がありません`).toBeGreaterThan(0)
    }
  })
})
