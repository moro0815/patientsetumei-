import type { ReactNode } from 'react'

/* =========================================================================
   画面の共通部品
   診察室での操作（タブレット・大画面モニタ）を前提に、
   タッチターゲットを大きく、入力欄を少なく保つ。
   ========================================================================= */

export function Section({
  title,
  subtitle,
  right,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-mute">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  hint,
  children,
  wide = false,
}: {
  label: string
  hint?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-mute">{hint}</span>}
    </label>
  )
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
  unit,
  placeholder,
}: {
  value: number | null
  onChange: (v: number | null) => void
  step?: number
  min?: number
  max?: number
  unit?: string
  placeholder?: string
}) {
  return (
    <span className="flex items-center gap-2">
      <input
        type="number"
        className="input"
        inputMode="decimal"
        value={value ?? ''}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? null : Number(raw))
        }}
      />
      {unit && <span className="shrink-0 text-sm font-bold text-ink-mute">{unit}</span>}
    </span>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className="input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Chip({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button type="button" title={title} onClick={onClick} className={`chip ${on ? 'chip-on' : ''}`}>
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${
          on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-400 bg-white'
        }`}
      >
        {on ? '✓' : ''}
      </span>
      {children}
    </button>
  )
}

export function SegButton<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T | null
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const pad = size === 'lg' ? 'px-6 py-4 text-lg' : size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5'
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-200 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-lg font-bold transition ${pad} ${
            value === o.value ? 'bg-white text-brand-700 shadow' : 'text-ink-soft hover:bg-white/60'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Banner({
  tone = 'info',
  title,
  children,
  icon,
}: {
  tone?: 'info' | 'warn' | 'good' | 'neutral'
  title?: string
  children?: ReactNode
  icon?: string
}) {
  const tones = {
    info: 'border-brand-300 bg-brand-50 text-brand-900',
    warn: 'border-alert-400 bg-alert-50 text-alert-600',
    good: 'border-good-400 bg-good-50 text-good-600',
    neutral: 'border-slate-300 bg-slate-50 text-ink-soft',
  }
  return (
    <div className={`rounded-xl border-l-4 px-4 py-3 ${tones[tone]}`}>
      {title && (
        <p className="font-bold">
          {icon && <span aria-hidden className="mr-1.5">{icon}</span>}
          {title}
        </p>
      )}
      {children && <div className="mt-1 text-sm leading-relaxed">{children}</div>}
    </div>
  )
}

export function DoctorNote({ children, label = '医師向けメモ' }: { children: ReactNode; label?: string }) {
  return (
    <div className="doctor-note">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">{label}</p>
      {children}
    </div>
  )
}

export function Cite({ children }: { children: ReactNode }) {
  return <p className="cite mt-2">出典：{children}</p>
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'info' | 'warn' | 'good' | 'danger'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-slate-200 text-ink-soft',
    info: 'bg-brand-100 text-brand-700',
    warn: 'bg-alert-100 text-alert-600',
    good: 'bg-good-100 text-good-600',
    danger: 'bg-alert-400 text-white',
  }
  return <span className={`badge ${tones[tone]}`}>{children}</span>
}

/** ステップの進行表示（診察室で「あと何段階か」が分かるように） */
export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: { key: string; label: string }[]
  current: string
  onJump?: (key: string) => void
}) {
  const idx = steps.findIndex((s) => s.key === current)
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => {
        const state = i < idx ? 'done' : i === idx ? 'now' : 'todo'
        return (
          <li key={s.key} className="flex items-center gap-1">
            <button
              type="button"
              disabled={!onJump}
              onClick={() => onJump?.(s.key)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold transition ${
                state === 'now'
                  ? 'bg-brand-600 text-white'
                  : state === 'done'
                    ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                    : 'text-ink-mute'
              } ${onJump ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                aria-hidden
                className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                  state === 'now' ? 'bg-white text-brand-700' : state === 'done' ? 'bg-brand-600 text-white' : 'bg-slate-300 text-white'
                }`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && <span aria-hidden className="text-slate-400">›</span>}
          </li>
        )
      })}
    </ol>
  )
}

/** 数値のスライダー（VASなど、患者さんに指で示してもらう用途） */
export function VasSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: number | null
  onChange: (v: number) => void
  leftLabel: string
  rightLabel: string
}) {
  return (
    <div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 w-full accent-brand-600"
      />
      <div className="flex justify-between text-xs font-bold text-ink-mute">
        <span>0 {leftLabel}</span>
        <span className="text-xl tnum text-brand-700">{value ?? '—'}</span>
        <span>{rightLabel} 10</span>
      </div>
    </div>
  )
}

/** コピーボタン（カルテ貼り付け用） */
export function CopyButton({ text, label = 'コピー' }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          alert('クリップボードにコピーしました。電子カルテに貼り付けてください。')
        } catch {
          // クリップボードAPIが使えない環境（古いブラウザ・非HTTPS）向けの代替
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          alert('クリップボードにコピーしました。')
        }
      }}
    >
      📋 {label}
    </button>
  )
}

/** ふりがな。ruby表示のON/OFFはCSSで制御する */
export function R({ t, y }: { t: string; y: string }) {
  return (
    <ruby>
      {t}
      <rt>{y}</rt>
    </ruby>
  )
}
