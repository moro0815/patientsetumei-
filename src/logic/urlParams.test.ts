import { describe, expect, it } from 'vitest'
import { buildSampleUrl, sessionFromSearchParams } from './urlParams'

describe('URL連携', () => {
  it('パラメータが無ければ null（通常の起動）', () => {
    expect(sessionFromSearchParams('')).toBeNull()
  })

  it('関係のないパラメータだけなら null', () => {
    expect(sessionFromSearchParams('?utm_source=mail')).toBeNull()
  })

  it('疾患を指定できる', () => {
    const r = sessionFromSearchParams('?d=ra')
    expect(r?.session.disease).toBe('ra')
  })

  it('疾患名の別名にも対応する', () => {
    expect(sessionFromSearchParams('?d=op')?.session.disease).toBe('osteoporosis')
    expect(sessionFromSearchParams('?d=osteoporosis')?.session.disease).toBe('osteoporosis')
    expect(sessionFromSearchParams('?d=knee')?.session.disease).toBe('kneeOA')
    expect(sessionFromSearchParams('?disease=ra')?.session.disease).toBe('ra')
  })

  it('関節リウマチの一式を受け取れる', () => {
    const r = sessionFromSearchParams('?d=ra&tjc=6&sjc=4&ptvas=5&phvas=4&crp=1.2&esr=30&sdai=20.2&dur=8')
    expect(r).not.toBeNull()
    expect(r!.session.ra.tenderJoints28).toBe(6)
    expect(r!.session.ra.swollenJoints28).toBe(4)
    expect(r!.session.ra.patientGlobalVas).toBe(5)
    expect(r!.session.ra.physicianGlobalVas).toBe(4)
    expect(r!.session.ra.crp).toBe(1.2)
    expect(r!.session.ra.esr).toBe(30)
    expect(r!.session.ra.external.sdai).toBe(20.2)
    expect(r!.session.ra.durationMonths).toBe(8)
    expect(r!.session.ra.external.source).toContain('URL連携')
  })

  it('骨粗鬆症の一式を受け取れる', () => {
    const r = sessionFromSearchParams('?d=op&lyam=64&fyam=62&height=148&weight=46&frax=18.5')
    expect(r!.session.osteo.bmd.lumbar).toBe(64)
    expect(r!.session.osteo.bmd.femur).toBe(62)
    expect(r!.session.patient.heightCm).toBe(148)
    expect(r!.session.patient.weightKg).toBe(46)
    expect(r!.session.osteo.risk.fraxMajorPercent).toBe(18.5)
  })

  it('膝OA・ロコモの一式を受け取れる', () => {
    const r = sessionFromSearchParams('?d=knee&kl=3&nrs=6&locomo25=18&twostep=1.05')
    expect(r!.session.knee.klGrade).toBe(3)
    expect(r!.session.knee.painNrs).toBe(6)
    expect(r!.session.locomo.locomo25).toBe(18)
    expect(r!.session.locomo.twoStepValue).toBe(1.05)
  })

  it('カルテ番号・性別・担当医を受け取れる', () => {
    const r = sessionFromSearchParams('?d=ra&chart=012345&sex=f&dr=守屋')
    expect(r!.session.patient.chartNo).toBe('012345')
    expect(r!.session.patient.sex).toBe('female')
    expect(r!.session.patient.doctorName).toBe('守屋')
  })

  it('性別の表記ゆれに対応する', () => {
    expect(sessionFromSearchParams('?sex=female')!.session.patient.sex).toBe('female')
    expect(sessionFromSearchParams('?sex=女性')!.session.patient.sex).toBe('female')
    expect(sessionFromSearchParams('?sex=m')!.session.patient.sex).toBe('male')
    expect(sessionFromSearchParams('?sex=1')!.session.patient.sex).toBe('male')
  })

  it('範囲外の値は取り込まず、無視したものとして返す', () => {
    const r = sessionFromSearchParams('?d=ra&tjc=99&sjc=4')
    expect(r!.session.ra.tenderJoints28).toBeNull()
    expect(r!.session.ra.swollenJoints28).toBe(4)
    expect(r!.ignored.join()).toContain('圧痛関節数')
  })

  it('数値でない値は無視する', () => {
    const r = sessionFromSearchParams('?d=ra&crp=abc&esr=30')
    expect(r!.session.ra.crp).toBeNull()
    expect(r!.session.ra.esr).toBe(30)
    expect(r!.ignored.join()).toContain('CRP')
  })

  it('性別の不正値は無視する', () => {
    const r = sessionFromSearchParams('?d=ra&sex=x&tjc=6')
    expect(r!.ignored.join()).toContain('性別')
  })

  it('取り込んだ項目の一覧を返す', () => {
    const r = sessionFromSearchParams('?d=ra&tjc=6&crp=1.2')
    expect(r!.applied).toContain('圧痛関節数')
    expect(r!.applied).toContain('CRP')
  })

  it('パラメータ名の大文字小文字を区別しない', () => {
    const r = sessionFromSearchParams('?D=RA&TJC=6')
    expect(r!.session.disease).toBe('ra')
    expect(r!.session.ra.tenderJoints28).toBe(6)
  })
})

describe('連携用URLの見本', () => {
  it('末尾のスラッシュや既存のクエリを取り除いて組み立てる', () => {
    const u = buildSampleUrl('http://192.168.10.20:8080/?old=1', 'ra')
    expect(u.startsWith('http://192.168.10.20:8080/?d=ra')).toBe(true)
    expect(u).not.toContain('old=1')
  })

  it('見本URLがそのまま読み取れる（往復して壊れない）', () => {
    for (const d of ['ra', 'osteoporosis', 'kneeOA'] as const) {
      const u = buildSampleUrl('http://example.local', d)
      const search = u.slice(u.indexOf('?'))
      const r = sessionFromSearchParams(search)
      expect(r).not.toBeNull()
      expect(r!.session.disease).toBe(d)
      expect(r!.ignored).toHaveLength(0)
    }
  })
})
