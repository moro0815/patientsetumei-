import { describe, expect, it } from 'vitest'
import { applyParsedFields, fieldsForDisease, normalizeText, parseClinicalText } from './importer'
import { createSession } from '@/state/session'

const val = (text: string, key: string) => {
  const f = parseClinicalText(text).fields.find((x) => x.key === key)
  return f?.value
}

describe('文字の正規化', () => {
  it('全角英数字を半角にする', () => {
    expect(normalizeText('ＣＲＰ　１．２')).toBe('CRP 1.2')
  })
  it('全角コロン・読点を半角にする', () => {
    expect(normalizeText('圧痛関節数：６')).toBe('圧痛関節数:6')
  })
})

describe('問診システムの結果からの読み取り（関節リウマチ）', () => {
  const text = `
関節リウマチ 問診結果
圧痛関節数：6
腫脹関節数：4
患者全般評価（VAS）：5.0
医師全般評価（VAS）：4.0
CRP：1.2
ESR：30
SDAI：20.2
罹病期間：8
`

  it('関節数を読み取る', () => {
    expect(val(text, 'tenderJoints28')).toBe(6)
    expect(val(text, 'swollenJoints28')).toBe(4)
  })

  it('患者VASと医師VASを取り違えない', () => {
    expect(val(text, 'patientGlobalVas')).toBe(5)
    expect(val(text, 'physicianGlobalVas')).toBe(4)
  })

  it('CRP と ESR を読み取る', () => {
    expect(val(text, 'crp')).toBe(1.2)
    expect(val(text, 'esr')).toBe(30)
  })

  it('算出済みの SDAI を読み取る', () => {
    expect(val(text, 'sdai')).toBe(20.2)
  })

  it('罹病期間を読み取る', () => {
    expect(val(text, 'durationMonths')).toBe(8)
  })
})

describe('紛らわしいラベルの取り違えを防ぐ', () => {
  it('DAS28-CRP を CRP として誤読しない', () => {
    const r = parseClinicalText('DAS28-CRP 4.45\nCRP 1.2')
    expect(val('DAS28-CRP 4.45\nCRP 1.2', 'das28crp')).toBe(4.45)
    expect(val('DAS28-CRP 4.45\nCRP 1.2', 'crp')).toBe(1.2)
    expect(r.fields.filter((f) => f.key === 'crp')).toHaveLength(1)
  })

  it('DAS28-CRP だけがある場合、CRP を勝手に作らない', () => {
    expect(val('DAS28-CRP 4.45', 'crp')).toBeUndefined()
  })

  it('DAS28-ESR を ESR として誤読しない', () => {
    expect(val('DAS28-ESR 5.01', 'das28esr')).toBe(5.01)
    expect(val('DAS28-ESR 5.01', 'esr')).toBeUndefined()
  })

  it('「最大身長」を「身長」として誤読しない', () => {
    const t = '身長 148\n若い頃の身長 155'
    expect(val(t, 'heightCm')).toBe(148)
    expect(val(t, 'maxHeightCm')).toBe(155)
  })

  it('抗CCP抗体を CRP と混同しない', () => {
    const t = '抗CCP抗体 120\nCRP 0.8'
    expect(val(t, 'accp')).toBe(120)
    expect(val(t, 'crp')).toBe(0.8)
  })

  it('eGFR の中の GFR を二重に読まない', () => {
    const r = parseClinicalText('eGFR 58')
    expect(r.fields.filter((f) => f.key === 'egfr')).toHaveLength(1)
    expect(val('eGFR 58', 'egfr')).toBe(58)
  })
})

describe('表記ゆれへの対応', () => {
  it('英語略号でも読み取れる', () => {
    const t = 'TJC28  6\nSJC28  4\nPtGA 5\nPhGA 4'
    expect(val(t, 'tenderJoints28')).toBe(6)
    expect(val(t, 'swollenJoints28')).toBe(4)
    expect(val(t, 'patientGlobalVas')).toBe(5)
    expect(val(t, 'physicianGlobalVas')).toBe(4)
  })

  it('タブ区切り（Excel からの貼り付け）でも読み取れる', () => {
    const t = '圧痛関節数\t6\n腫脹関節数\t4'
    expect(val(t, 'tenderJoints28')).toBe(6)
    expect(val(t, 'swollenJoints28')).toBe(4)
  })

  it('「6/28」のような分母付き表記でも分子を読む', () => {
    expect(val('圧痛関節数 6/28', 'tenderJoints28')).toBe(6)
  })

  it('全角で書かれていても読み取れる', () => {
    expect(val('ＳＤＡＩ：２０．２', 'sdai')).toBe(20.2)
  })

  it('単位が付いていても読み取れる', () => {
    expect(val('CRP 1.2 mg/dL', 'crp')).toBe(1.2)
    expect(val('腰椎YAM 64%', 'lumbarYam')).toBe(64)
  })
})

describe('単位の自動換算と警告', () => {
  it('VAS が mm 表記なら cm に換算する', () => {
    const f = parseClinicalText('患者VAS 50mm').fields.find((x) => x.key === 'patientGlobalVas')
    expect(f?.value).toBe(5)
    expect(f?.note).toContain('cm')
  })

  it('VAS が 0〜10 ならそのまま扱う', () => {
    const f = parseClinicalText('患者VAS 5').fields.find((x) => x.key === 'patientGlobalVas')
    expect(f?.value).toBe(5)
    expect(f?.note).toBeUndefined()
  })

  it('CRP が高すぎる場合は単位を疑う警告を出す', () => {
    const r = parseClinicalText('CRP 25')
    expect(r.warnings.join()).toContain('mg/L')
  })

  it('SDAI と内訳が一致しない場合は警告を出す', () => {
    const r = parseClinicalText(
      '圧痛関節数 6\n腫脹関節数 4\n患者VAS 5\n医師VAS 4\nCRP 1.2\nSDAI 30.0',
    )
    expect(r.warnings.join()).toContain('一致しません')
  })

  it('SDAI と内訳が一致していれば警告を出さない', () => {
    const r = parseClinicalText(
      '圧痛関節数 6\n腫脹関節数 4\n患者VAS 5\n医師VAS 4\nCRP 1.2\nSDAI 20.2',
    )
    expect(r.warnings.join()).not.toContain('一致しません')
  })
})

describe('想定範囲外の値は取り込まない', () => {
  it('圧痛関節数が28を超えていたら取り込まず警告する', () => {
    const r = parseClinicalText('圧痛関節数 45')
    expect(r.fields.find((f) => f.key === 'tenderJoints28')).toBeUndefined()
    expect(r.warnings.join()).toContain('圧痛関節数')
  })

  it('K-L分類が5以上なら取り込まない', () => {
    expect(val('K-L分類 7', 'klGrade')).toBeUndefined()
  })

  it('何も読み取れなければその旨を警告する', () => {
    const r = parseClinicalText('本日は経過良好です。次回2週間後。')
    expect(r.fields).toHaveLength(0)
    expect(r.warnings.join()).toContain('見つかりません')
  })
})

describe('骨密度（電子カルテからの貼り付け）', () => {
  const text = `
骨密度検査 2026/07/20
腰椎YAM 64%
大腿骨近位部YAM 62%
身長 148
体重 46
eGFR 58
`
  it('腰椎と大腿骨のYAMを読み取る', () => {
    expect(val(text, 'lumbarYam')).toBe(64)
    expect(val(text, 'femurYam')).toBe(62)
  })

  it('身長・体重・eGFRも読み取る', () => {
    expect(val(text, 'heightCm')).toBe(148)
    expect(val(text, 'weightKg')).toBe(46)
    expect(val(text, 'egfr')).toBe(58)
  })

  it('Tスコアも読み取れる', () => {
    const t = '腰椎Tスコア -3.0\n大腿骨Tスコア -2.9'
    expect(val(t, 'lumbarT')).toBe(-3)
    expect(val(t, 'femurT')).toBe(-2.9)
  })
})

describe('患者基本情報', () => {
  it('性別を読み取る', () => {
    expect(val('性別 女性', 'sex')).toBe('female')
    expect(val('性別 男', 'sex')).toBe('male')
  })

  it('カルテ番号を読み取る', () => {
    expect(val('カルテ番号 012345', 'chartNo')).toBe('012345')
  })

  it('氏名が数字だけなら取り込まない（誤読を避ける）', () => {
    expect(val('氏名 12345', 'displayName')).toBeUndefined()
  })
})

describe('疾患ごとの絞り込み', () => {
  it('関節リウマチの画面では骨密度の項目を出さない', () => {
    const all = parseClinicalText('腰椎YAM 64\n圧痛関節数 6').fields
    const ra = fieldsForDisease(all, 'ra')
    expect(ra.map((f) => f.key)).toContain('tenderJoints28')
    expect(ra.map((f) => f.key)).not.toContain('lumbarYam')
  })

  it('骨粗鬆症の画面では関節数を出さない', () => {
    const all = parseClinicalText('腰椎YAM 64\n圧痛関節数 6').fields
    const op = fieldsForDisease(all, 'osteoporosis')
    expect(op.map((f) => f.key)).toContain('lumbarYam')
    expect(op.map((f) => f.key)).not.toContain('tenderJoints28')
  })
})

describe('セッションへの反映', () => {
  it('関節リウマチの項目が正しく入る', () => {
    const s = createSession('ra')
    const { fields } = parseClinicalText(
      '圧痛関節数 6\n腫脹関節数 4\n患者VAS 5\n医師VAS 4\nCRP 1.2\nESR 30\nSDAI 20.2',
    )
    const next = applyParsedFields(s, fields)
    expect(next.ra.tenderJoints28).toBe(6)
    expect(next.ra.swollenJoints28).toBe(4)
    expect(next.ra.patientGlobalVas).toBe(5)
    expect(next.ra.physicianGlobalVas).toBe(4)
    expect(next.ra.crp).toBe(1.2)
    expect(next.ra.esr).toBe(30)
    expect(next.ra.external.sdai).toBe(20.2)
    expect(next.ra.external.source).not.toBe('')
  })

  it('チェックを外した項目は反映しない', () => {
    const s = createSession('ra')
    const { fields } = parseClinicalText('圧痛関節数 6\n腫脹関節数 4')
    const chosen = fields.map((f) => (f.key === 'swollenJoints28' ? { ...f, selected: false } : f))
    const next = applyParsedFields(s, chosen.filter((f) => f.selected))
    expect(next.ra.tenderJoints28).toBe(6)
    expect(next.ra.swollenJoints28).toBeNull()
  })

  it('YAM を取り込むと入力単位が YAM に切り替わる', () => {
    const s = createSession('osteoporosis')
    const { fields } = parseClinicalText('腰椎YAM 64\n大腿骨YAM 62')
    const next = applyParsedFields(s, fields)
    expect(next.osteo.bmd.unit).toBe('yam')
    expect(next.osteo.bmd.lumbar).toBe(64)
    expect(next.osteo.bmd.femur).toBe(62)
  })

  it('Tスコアだけを取り込むと入力単位が Tスコア に切り替わる', () => {
    const s = createSession('osteoporosis')
    const { fields } = parseClinicalText('腰椎Tスコア -3.0\n大腿骨Tスコア -2.9')
    const next = applyParsedFields(s, fields)
    expect(next.osteo.bmd.unit).toBe('tscore')
    expect(next.osteo.bmd.lumbar).toBe(-3)
    expect(next.osteo.bmd.femur).toBe(-2.9)
  })

  it('元のセッションを書き換えない（副作用がない）', () => {
    const s = createSession('ra')
    const { fields } = parseClinicalText('圧痛関節数 6')
    applyParsedFields(s, fields)
    expect(s.ra.tenderJoints28).toBeNull()
  })
})

describe('かっこ書きを挟む書き方', () => {
  it('「患者全般評価（VAS）：5.0」を読み取れる', () => {
    expect(val('患者全般評価（VAS）：5.0', 'patientGlobalVas')).toBe(5)
  })
  it('「CRP (mg/dL): 1.2」を読み取れる', () => {
    expect(val('CRP (mg/dL): 1.2', 'crp')).toBe(1.2)
  })
  it('「圧痛関節数 [0-28] 6」を読み取れる', () => {
    expect(val('圧痛関節数 [0-28] 6', 'tenderJoints28')).toBe(6)
  })
  it('「腰椎（L2-4）YAM 64%」を読み取れる', () => {
    expect(val('腰椎(L2-4)YAM 64%', 'lumbarYam')).toBe(64)
  })
})
