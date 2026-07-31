import { describe, expect, it } from 'vitest'
import { applyIntakeToSession, calcMhaq, intakeSummary, normalizeBase, type MonshinIntake } from './monshin'
import { createSession } from '@/state/session'
import { parseClinicalText } from './importer'

/**
 * 実機（もろほし整形外科クリニック デジタル問診システム）のデータ形式に対するテスト。
 * server.py の intake_item() が返す形と、doctor.html の
 * 「スコアをカルテにコピー」が出力する文字列を実物どおりに再現している。
 */

function intake(over: Partial<MonshinIntake> = {}): MonshinIntake {
  return {
    id: '20260801-093012-abc',
    time: '2026-08-01T09:30:12',
    status: 'new',
    name: '山田 花子',
    kana: 'ヤマダ ハナコ',
    sex: 'f',
    birth: '1968-04-02',
    age: 58,
    chief: 'リウマチ再診',
    alerts: [],
    stext: '',
    patientId: '012345',
    source: 'tablet',
    form: 'ra',
    answers: {
      form: 'ra',
      patientId: '012345',
      name: '山田 花子',
      sex: 'f',
      vasGlobal: 50,
      mhaq1: '0', mhaq2: '1', mhaq3: '0', mhaq4: '1',
      mhaq5: '0', mhaq6: '1', mhaq7: '0', mhaq8: '0',
      stiffness: 'lt30',
      raChange: 'worse',
      raNote: '右手の痛みが強くなった',
    },
    ...over,
  }
}

describe('ベースURLの正規化', () => {
  it('末尾のスラッシュを取り除く', () => {
    expect(normalizeBase('http://192.168.1.20:8090/')).toBe('http://192.168.1.20:8090')
  })
  it('空欄は同一オリジンを意味する空文字のまま', () => {
    expect(normalizeBase('')).toBe('')
    expect(normalizeBase('  ')).toBe('')
  })
})

describe('mHAQ の計算', () => {
  it('8項目の平均を求める', () => {
    // 0,1,0,1,0,1,0,0 の平均 = 3/8 = 0.375
    const r = calcMhaq(intake().answers)
    expect(r.value).toBe(0.375)
    expect(r.answered).toBe(8)
  })

  it('回答した項目だけで平均する', () => {
    const r = calcMhaq({ mhaq1: '2', mhaq2: '1', mhaq3: '' })
    expect(r.value).toBe(1.5)
    expect(r.answered).toBe(2)
  })

  it('回答がなければ null', () => {
    expect(calcMhaq({}).value).toBeNull()
    expect(calcMhaq(undefined).value).toBeNull()
  })
})

describe('一覧の1行要約', () => {
  it('時刻・氏名・年齢・性別・ID・種別を並べる', () => {
    const s = intakeSummary(intake())
    expect(s).toContain('09:30')
    expect(s).toContain('山田 花子')
    expect(s).toContain('58歳')
    expect(s).toContain('女性')
    expect(s).toContain('012345')
    expect(s).toContain('リウマチ再診')
  })

  it('氏名が未入力なら受付確認の表示にする', () => {
    expect(intakeSummary(intake({ name: '' }))).toContain('受付で確認')
  })
})

describe('問診の取り込み', () => {
  it('リウマチ再診なら疾患を関節リウマチに切り替える', () => {
    const s = createSession('osteoporosis')
    const r = applyIntakeToSession(s, intake())
    expect(r.session.disease).toBe('ra')
    expect(r.applied.join()).toContain('関節リウマチ')
  })

  it('患者基本情報が入る', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.session.patient.chartNo).toBe('012345')
    expect(r.session.patient.displayName).toBe('山田 花子')
    expect(r.session.patient.age).toBe(58)
    expect(r.session.patient.sex).toBe('female')
  })

  it('患者全般評価VASを 0〜100 から 0〜10 に換算する', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.session.ra.patientGlobalVas).toBe(5)
    expect(r.applied.join()).toContain('換算')
  })

  it('mHAQ の平均が HAQ 欄に入る', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.session.ra.haq).toBe(0.375)
  })

  it('朝のこわばり・前回比が日本語ラベルで入る', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.session.ra.morningStiffness).toBe('30分くらい')
    expect(r.session.ra.changeFromLast).toBe('悪くなっている')
  })

  it('悪化・こわばり1時間以上は注意として返す', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.notes.join()).toContain('前回より悪化')

    const r2 = applyIntakeToSession(
      createSession('ra'),
      intake({ answers: { ...intake().answers, stiffness: 'gt60' } }),
    )
    expect(r2.notes.join()).toContain('1時間以上')
  })

  it('患者さんの伝言を注意として返す', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.notes.join()).toContain('右手の痛みが強くなった')
  })

  it('問診システムの警告をそのまま引き継ぐ', () => {
    const r = applyIntakeToSession(
      createSession('ra'),
      intake({ alerts: [{ level: 'warn', label: '抗凝固薬の内服あり' }] }),
    )
    expect(r.notes.join()).toContain('抗凝固薬')
  })

  it('取り込み元がカルテ記載用に記録される', () => {
    const r = applyIntakeToSession(createSession('ra'), intake())
    expect(r.session.ra.external.source).toContain('問診システム')
  })

  it('通常の問診（form が空）では疾患を勝手に変えない', () => {
    // 診察券番号は intake_item() が返すトップレベルの patientId を使う
    const r = applyIntakeToSession(
      createSession('kneeOA'),
      intake({ form: '', patientId: '999', answers: { patientId: '999' } }),
    )
    expect(r.session.disease).toBe('kneeOA')
    expect(r.session.patient.chartNo).toBe('999')
    // リウマチ問診でないので取り込み元は記録しない
    expect(r.session.ra.external.source).toBe('')
  })

  it('元のセッションを書き換えない', () => {
    const s = createSession('osteoporosis')
    applyIntakeToSession(s, intake())
    expect(s.disease).toBe('osteoporosis')
    expect(s.patient.chartNo).toBe('')
  })

  it('回答が無くても落ちない', () => {
    const r = applyIntakeToSession(createSession('ra'), intake({ answers: undefined, alerts: [] }))
    expect(r.session.patient.chartNo).toBe('012345')
    expect(r.session.ra.haq).toBeNull()
  })
})

describe('診察室画面（doctor.html）の出力を貼り付けたとき', () => {
  // 「📋 スコアをカルテにコピー」が実際に生成する文字列
  const COPIED = `【RA疾患活動性（診察室記入）】
腫脹関節数(SJC28)：4　圧痛関節数(TJC28)：6
腫脹関節：右手首・左MCP2
圧痛関節：右手首・左MCP2・右膝
患者全般評価(PGA)：50/100　医師全般評価(EGA)：40/100　CRP：1.2mg/dL　赤沈：30mm/h
SDAI：20.2（中等度）
CDAI：19.0（中等度）
DAS28-CRP：4.45（中等度）
DAS28-ESR：5.01（中等度）
mHAQ：0.375`

  const get = (key: string) => parseClinicalText(COPIED).fields.find((f) => f.key === key)?.value

  it('1行に2項目あっても両方読み取る（SJC28 と TJC28）', () => {
    expect(get('swollenJoints28')).toBe(4)
    expect(get('tenderJoints28')).toBe(6)
  })

  it('PGA・EGA を 0〜100 から 0〜10 に換算する', () => {
    expect(get('patientGlobalVas')).toBe(5)
    expect(get('physicianGlobalVas')).toBe(4)
  })

  it('CRP と 赤沈 を読み取る', () => {
    expect(get('crp')).toBe(1.2)
    expect(get('esr')).toBe(30)
  })

  it('算出済みの4スコアをすべて読み取る', () => {
    expect(get('sdai')).toBe(20.2)
    expect(get('cdai')).toBe(19)
    expect(get('das28crp')).toBe(4.45)
    expect(get('das28esr')).toBe(5.01)
  })

  it('mHAQ を身体機能の指標として読み取る', () => {
    expect(get('haq')).toBe(0.375)
  })

  it('DAS28-CRP を CRP として二重に読まない', () => {
    const crpFields = parseClinicalText(COPIED).fields.filter((f) => f.key === 'crp')
    expect(crpFields).toHaveLength(1)
    expect(crpFields[0].value).toBe(1.2)
  })

  it('内訳と SDAI が整合しているので警告は出ない', () => {
    // 4 + 6 + 5 + 4 + 1.2 = 20.2
    expect(parseClinicalText(COPIED).warnings.join()).not.toContain('一致しません')
  })

  it('転記ミスがあれば警告を出す', () => {
    const wrong = COPIED.replace('SDAI：20.2', 'SDAI：30.2')
    expect(parseClinicalText(wrong).warnings.join()).toContain('一致しません')
  })
})
