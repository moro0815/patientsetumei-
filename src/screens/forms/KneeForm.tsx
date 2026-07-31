import { useStore } from '@/state/store'
import { Banner, Chip, Field, NumberInput, SegButton, Section, VasSlider } from '@/components/ui'
import { calcTwoStepValue } from '@/logic/locomo'
import { KL_GRADE_LABEL } from '@/logic/locomo'
import type { KneeInput, LocomoInput } from '@/types'

const COMPLAINTS = [
  '歩き始めが痛い',
  '階段の下りが痛い',
  '立ち上がるときが痛い',
  '正座ができない',
  '長く歩けない',
  '膝が伸びきらない',
  '膝がぐらつく',
  '夜間も痛む',
  '腫れる',
]

const STEP_HEIGHTS = [10, 20, 30, 40]

export function KneeForm() {
  const { session, patch } = useStore()
  const k = session.knee
  const l = session.locomo
  const setK = (v: Partial<KneeInput>) => patch('knee', v)
  const setL = (v: Partial<LocomoInput>) => patch('locomo', v)

  return (
    <>
      <Section title="膝の所見">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="部位">
            <SegButton
              value={k.side}
              options={[
                { value: 'right', label: '右' },
                { value: 'left', label: '左' },
                { value: 'both', label: '両側' },
              ]}
              onChange={(v) => setK({ side: v })}
            />
          </Field>
          <Field label="アライメント">
            <SegButton
              value={k.alignment}
              options={[
                { value: 'varus', label: '内側型（O脚）' },
                { value: 'neutral', label: '中間' },
                { value: 'valgus', label: '外側型（X脚）' },
              ]}
              onChange={(v) => setK({ alignment: v })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <p className="label">Kellgren-Lawrence 分類（単純X線）</p>
          <SegButton
            value={k.klGrade !== null ? String(k.klGrade) : null}
            size="lg"
            options={[0, 1, 2, 3, 4].map((g) => ({ value: String(g), label: `${g}` }))}
            onChange={(v) => setK({ klGrade: Number(v) })}
          />
          {k.klGrade !== null && (
            <p className="mt-2 text-sm font-bold text-brand-700">{KL_GRADE_LABEL[k.klGrade]}</p>
          )}
        </div>

        <div className="mt-5">
          <p className="label">痛みの強さ（NRS）</p>
          <VasSlider value={k.painNrs} onChange={(v) => setK({ painNrs: v })} leftLabel="痛みなし" rightLabel="最悪の痛み" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Chip on={k.effusion} onClick={() => setK({ effusion: !k.effusion })}>
            関節液の貯留あり
          </Chip>
          <Chip on={k.romLimitation} onClick={() => setK({ romLimitation: !k.romLimitation })}>
            可動域制限あり
          </Chip>
        </div>

        <div className="mt-5">
          <p className="label">主な訴え（患者さんの言葉に近いものを選択）</p>
          <div className="flex flex-wrap gap-2">
            {COMPLAINTS.map((c) => (
              <Chip
                key={c}
                on={k.complaints.includes(c)}
                onClick={() =>
                  setK({
                    complaints: k.complaints.includes(c)
                      ? k.complaints.filter((x) => x !== c)
                      : [...k.complaints, c],
                  })
                }
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="ロコモ度テスト"
        subtitle="日本整形外科学会の臨床判断値で自動判定します。3つのうち最も進行した段階が判定結果になります"
      >
        <div className="space-y-5">
          <div>
            <p className="label">立ち上がりテスト：片脚で立ち上がれた最も低い台</p>
            <div className="flex flex-wrap gap-2">
              {STEP_HEIGHTS.map((h) => (
                <Chip key={h} on={l.standUpOneLegCm === h} onClick={() => setL({ standUpOneLegCm: h })}>
                  {h}cm
                </Chip>
              ))}
              <Chip on={l.standUpOneLegCm === 'cannot'} onClick={() => setL({ standUpOneLegCm: 'cannot' })}>
                40cmでも片脚では立てない
              </Chip>
              <Chip on={l.standUpOneLegCm === null} onClick={() => setL({ standUpOneLegCm: null })}>
                未実施
              </Chip>
            </div>
            <p className="mt-1 text-xs text-ink-mute">
              ※どちらか一方の脚でも立てない場合は「立てない」として扱います。「立てない」と「未実施」は判定が変わるため区別して選んでください
            </p>
          </div>

          <div>
            <p className="label">立ち上がりテスト：両脚で立ち上がれた最も低い台</p>
            <div className="flex flex-wrap gap-2">
              {STEP_HEIGHTS.map((h) => (
                <Chip key={h} on={l.standUpBothLegCm === h} onClick={() => setL({ standUpBothLegCm: h })}>
                  {h}cm
                </Chip>
              ))}
              <Chip on={l.standUpBothLegCm === 'cannot'} onClick={() => setL({ standUpBothLegCm: 'cannot' })}>
                40cmでも立てない
              </Chip>
              <Chip on={l.standUpBothLegCm === null} onClick={() => setL({ standUpBothLegCm: null })}>
                未実施
              </Chip>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="2歩幅（cm）" hint="2ステップ値 ＝ 2歩幅 ÷ 身長 で自動計算します">
              <NumberInput
                value={null}
                step={1}
                unit="cm"
                placeholder="例 210"
                onChange={(v) => setL({ twoStepValue: calcTwoStepValue(v, session.patient.heightCm) })}
              />
            </Field>
            <Field label="2ステップ値（直接入力も可）">
              <NumberInput value={l.twoStepValue} step={0.01} onChange={(v) => setL({ twoStepValue: v })} />
            </Field>
            <Field label="ロコモ25 合計点（0〜100）">
              <NumberInput
                value={l.locomo25}
                min={0}
                max={100}
                unit="点"
                onChange={(v) => setL({ locomo25: v })}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4">
          <Banner tone="neutral" title="判定基準（日本整形外科学会）">
            <ul className="list-disc space-y-0.5 pl-5">
              <li>ロコモ度1：片脚で40cmから立てない／2ステップ値 1.3未満／ロコモ25 7点以上</li>
              <li>ロコモ度2：両脚で20cmから立てない／2ステップ値 1.1未満／ロコモ25 16点以上</li>
              <li>ロコモ度3：両脚で30cmから立てない／2ステップ値 0.9未満／ロコモ25 24点以上</li>
            </ul>
          </Banner>
        </div>
      </Section>
    </>
  )
}
