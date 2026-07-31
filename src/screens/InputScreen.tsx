import { useStore } from '@/state/store'
import { Banner, CopyButton, Field, NumberInput, SegButton, Section, TextInput } from '@/components/ui'
import { ImportPanel } from '@/components/ImportPanel'
import { DISEASE_LABEL } from '@/state/session'
import { calcBmi } from '@/logic/locomo'
import { buildValuesLine } from '@/logic/karte'
import { OsteoForm } from './forms/OsteoForm'
import { RaForm } from './forms/RaForm'
import { KneeForm } from './forms/KneeForm'
import { AssessmentPanel } from './forms/AssessmentPanel'

/**
 * STEP 1：患者データの入力
 *
 * 診察の流れを止めないため、
 * - 必須は「年齢・性別」と疾患ごとの数値だけ
 * - 氏名は任意（受付番号だけで運用できる）
 * - 入力するとすぐ右側の判定が更新される
 */
export function InputScreen() {
  const { session, patch, go, urlImport, dismissUrlImport } = useStore()
  const p = session.patient
  const bmi = calcBmi(p.heightCm, p.weightKg)

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">
            {DISEASE_LABEL[session.disease]}｜患者データの入力
          </h2>
          <p className="text-sm text-ink-mute">
            入力すると右側の判定が自動更新されます。空欄のままでも説明モードには進めます。
          </p>
        </div>
        <button type="button" className="btn-primary btn-lg" onClick={() => go('explain')}>
          説明モードへ進む →
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-5">
          {urlImport && (
            <Banner tone="good" title="外部システムから患者データを受け取りました" icon="✓">
              <p>
                取り込んだ項目：{urlImport.applied.join('、')}
              </p>
              {urlImport.ignored.length > 0 && (
                <p className="mt-1 text-alert-600">
                  取り込めなかった項目：{urlImport.ignored.join('、')}（値をご確認ください）
                </p>
              )}
              <p className="mt-1 text-xs text-ink-mute">
                内容を確認し、必要に応じて修正してください。ブラウザのURLからは患者データを消去済みです。
              </p>
              <button type="button" className="btn-ghost mt-2 !min-h-[36px] !py-1.5" onClick={dismissUrlImport}>
                確認しました
              </button>
            </Banner>
          )}

          <ImportPanel />

          <Section title="患者さんの基本情報" subtitle="氏名の入力は任意です。受付番号だけでも運用できます">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="カルテ番号・受付番号">
                <TextInput value={p.chartNo} onChange={(v) => patch('patient', { chartNo: v })} placeholder="例 012345" />
              </Field>
              <Field label="お名前（任意）" hint="パンフレットの表紙に印字されます">
                <TextInput value={p.displayName} onChange={(v) => patch('patient', { displayName: v })} placeholder="例 山田 花子" />
              </Field>
              <Field label="年齢">
                <NumberInput value={p.age} min={0} max={120} unit="歳" onChange={(v) => patch('patient', { age: v })} />
              </Field>
              <Field label="性別" group>
                <SegButton
                  value={p.sex}
                  options={[
                    { value: 'female', label: '女性' },
                    { value: 'male', label: '男性' },
                  ]}
                  onChange={(v) => patch('patient', { sex: v })}
                />
              </Field>
              <Field label="身長">
                <NumberInput value={p.heightCm} step={0.1} unit="cm" onChange={(v) => patch('patient', { heightCm: v })} />
              </Field>
              <Field label="体重">
                <NumberInput value={p.weightKg} step={0.1} unit="kg" onChange={(v) => patch('patient', { weightKg: v })} />
              </Field>
              <Field label="若い頃の最大身長" hint="4cm以上の低下は椎体骨折のサインです">
                <NumberInput
                  value={p.maxHeightCm}
                  step={0.1}
                  unit="cm"
                  onChange={(v) => patch('patient', { maxHeightCm: v })}
                />
              </Field>
              <Field label="担当医">
                <TextInput value={p.doctorName} onChange={(v) => patch('patient', { doctorName: v })} placeholder="例 〇〇 太郎" />
              </Field>
              <Field label="説明日">
                <input
                  type="date"
                  className="input"
                  value={p.visitDate}
                  onChange={(e) => patch('patient', { visitDate: e.target.value })}
                />
              </Field>
              {bmi !== null && (
                <div className="flex items-end">
                  <p className="rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700">
                    BMI <span className="text-lg tnum">{bmi}</span>
                  </p>
                </div>
              )}
            </div>
          </Section>

          {session.disease === 'osteoporosis' && <OsteoForm />}
          {session.disease === 'ra' && <RaForm />}
          {session.disease === 'kneeOA' && <KneeForm />}
        </div>

        {/* 判定パネル（医師向け・画面右に固定） */}
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="card border-brand-200 bg-brand-50/40">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-brand-800">自動判定（医師向け）</h3>
              <div className="flex items-center gap-2">
                <CopyButton size="sm" label="検査値をコピー" text={buildValuesLine(session)} />
                <span className="badge bg-brand-100 text-brand-700">参考</span>
              </div>
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <AssessmentPanel />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={() => go('home')}>
          ← 最初に戻る
        </button>
        <button type="button" className="btn-primary btn-lg" onClick={() => go('explain')}>
          説明モードへ進む →
        </button>
      </div>
    </div>
  )
}
