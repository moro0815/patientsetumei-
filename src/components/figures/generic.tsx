import { ArrowDefs, FigCaption, Figure, MultiText, PALETTE, Pill } from './common'
import type { CoursePhase } from '@/types'

/**
 * 疾患によらず使いまわす図。
 *
 * 「治療は下から積み上げる」「時間とともに良くなる」「痛みの強さ」は
 * どの運動器疾患でも説明の骨格になるため、部品として共通化する。
 */

// ---------------------------------------------------------------- 治療の階段

/**
 * 段階的治療の図。
 * 「まず土台（運動・生活）→ 効かなければ次」という順序を、階段で示す。
 * current を渡すと「いまここ」が立つ。
 */
export function TreatmentLadderFigure({
  steps,
  current,
  title = '治療は下の段から積み上げます',
  showTitle = false,
}: {
  steps: string[]
  current?: number | null
  title?: string
  /** 図の中に見出しを描くか。スライドや紙面の見出しと重複するため既定は false */
  showTitle?: boolean
}) {
  const n = Math.min(steps.length, 5)
  const items = steps.slice(0, n)
  const stepH = 46
  const top = showTitle ? 40 : 12
  const baseY = top + n * stepH
  const w = 560

  return (
    <Figure
      viewBox={`0 0 ${w} ${baseY + 46}`}
      title={title}
      desc={`治療の段階：${items.join('、')}`}
    >
      <ArrowDefs id="ladder-arrow" color={PALETTE.brand} />
      {showTitle && (
        <FigCaption x={w / 2} y={24} size={16}>
          {title}
        </FigCaption>
      )}

      {items.map((label, i) => {
        // 下（i=0）が土台。上に行くほど幅を狭くして「上ほど限られた選択肢」を表す
        const fromBottom = i
        const y = baseY - (fromBottom + 1) * stepH
        const inset = fromBottom * 26
        const x = 74 + inset
        const width = w - 150 - inset * 2
        const on = current != null && current === i + 1
        const below = current != null && i + 1 < current
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={width}
              height={stepH - 8}
              rx={8}
              fill={on ? PALETTE.brandLight : below ? PALETTE.goodLight : PALETTE.bg}
              stroke={on ? PALETTE.brand : below ? PALETTE.good : PALETTE.line}
              strokeWidth={on ? 3 : 1.6}
            />
            <text
              x={x + 14}
              y={y + (stepH - 8) / 2}
              dominantBaseline="central"
              fontSize={14}
              fontWeight={on ? 800 : 700}
              fill={on ? PALETTE.brand : PALETTE.inkSoft}
            >
              {`${i + 1}. ${label}`}
            </text>
            {below && (
              <text
                x={x + width - 12}
                y={y + (stepH - 8) / 2}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={700}
                fill={PALETTE.good}
              >
                実施ずみ
              </text>
            )}
            {on && (
              <g>
                <Pill x={x - 66} y={y + 4} w={58} h={26} fill={PALETTE.brand} label="いまここ" labelColor="#fff" size={12} />
              </g>
            )}
          </g>
        )
      })}

      <line x1={40} y1={baseY} x2={w - 40} y2={baseY} stroke={PALETTE.ink} strokeWidth={3} />
      <text x={40} y={baseY + 24} fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        ↑ 土台をしっかり続けるほど、上の治療が必要になる時期を遅らせられます
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 回復の見通し

/**
 * 回復の時間軸。
 * 「いつ良くなるのか」を数字で示すことが、患者さんの不安をいちばん減らす。
 * 折れ線は痛みの目安（painLevel 0〜1）。
 */
export function RecoveryTimelineFigure({
  phases,
  headline,
  currentIndex,
}: {
  phases: CoursePhase[]
  /** 図の中に描く見出し。省略すると図だけになる（スライド・紙面の見出しと重複させない） */
  headline?: string
  currentIndex?: number | null
}) {
  const w = 640
  const h = 300
  const left = 62
  const right = w - 24
  const top = headline ? 58 : 40
  const bottom = 176
  const n = phases.length
  const colW = (right - left) / Math.max(1, n)
  const px = (i: number) => left + colW * (i + 0.5)
  const py = (v: number) => bottom - v * (bottom - top)

  return (
    <Figure viewBox={`0 0 ${w} ${h}`} title={headline ?? '回復の見通し'} desc={phases.map((p) => `${p.period}：${p.state}`).join('／')}>
      <ArrowDefs id="tl-arrow" color={PALETTE.inkSoft} />
      {headline && (
        <FigCaption x={w / 2} y={26} size={16}>
          {headline}
        </FigCaption>
      )}

      {/* 縦軸 */}
      <line x1={left} y1={top - 12} x2={left} y2={bottom} stroke={PALETTE.line} strokeWidth={2} markerStart="url(#tl-arrow)" />
      <text x={left - 8} y={top - 4} textAnchor="end" fontSize={12} fontWeight={700} fill={PALETTE.inkMute}>
        痛み
      </text>
      <text x={left - 8} y={bottom} textAnchor="end" fontSize={12} fill={PALETTE.inkMute}>
        なし
      </text>

      {/* 区間の帯 */}
      {phases.map((_, i) => (
        <g key={i}>
          <rect
            x={left + colW * i}
            y={top - 12}
            width={colW}
            height={bottom - top + 12}
            fill={i % 2 === 0 ? PALETTE.bg : '#ffffff'}
            opacity={0.9}
          />
          {currentIndex === i && (
            <rect
              x={left + colW * i + 2}
              y={top - 12}
              width={colW - 4}
              height={bottom - top + 12}
              fill={PALETTE.brandLight}
              stroke={PALETTE.brand}
              strokeWidth={2}
              rx={6}
            />
          )}
        </g>
      ))}

      {/* 痛みの推移 */}
      <polyline
        points={phases.map((p, i) => `${px(i)},${py(p.painLevel)}`).join(' ')}
        fill="none"
        stroke={PALETTE.warn}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {phases.map((p, i) => (
        <circle key={i} cx={px(i)} cy={py(p.painLevel)} r={6} fill={PALETTE.warn} stroke="#fff" strokeWidth={2} />
      ))}

      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={PALETTE.ink} strokeWidth={2.5} />

      {/* 各区間のラベル */}
      {phases.map((p, i) => (
        <g key={`lb-${i}`}>
          <text x={px(i)} y={bottom + 20} textAnchor="middle" fontSize={13} fontWeight={800} fill={PALETTE.ink}>
            {p.period}
          </text>
          <MultiText
            x={px(i)}
            y={bottom + 40}
            anchor="middle"
            size={11.5}
            lines={wrapJp(p.state, 9)}
            color={PALETTE.inkSoft}
            weight={600}
          />
          <MultiText
            x={px(i)}
            y={bottom + 40 + wrapJp(p.state, 9).length * 17 + 4}
            anchor="middle"
            size={11}
            lines={wrapJp(p.todo, 10)}
            color={PALETTE.brand}
          />
        </g>
      ))}
    </Figure>
  )
}

/** 日本語は単語境界がないため、文字数で折り返す */
export function wrapJp(text: string, per: number): string[] {
  const out: string[] = []
  let line = ''
  for (const ch of text) {
    line += ch
    // 句読点で切れるならそこで折り返す
    if (line.length >= per && (ch === '、' || ch === '。' || ch === '・')) {
      out.push(line)
      line = ''
    } else if (line.length >= per + 2) {
      out.push(line)
      line = ''
    }
  }
  if (line) out.push(line)
  return out.length > 0 ? out : ['']
}

// ---------------------------------------------------------------- 痛みのスケール

export function PainScaleFigure({ value, showTitle = false }: { value: number | null; showTitle?: boolean }) {
  const w = 560
  const h = showTitle ? 150 : 126
  const left = 40
  const right = w - 40
  const y = showTitle ? 76 : 52
  const at = (v: number) => left + ((right - left) * v) / 10

  return (
    <Figure viewBox={`0 0 ${w} ${h}`} title="いまの痛みの強さ" desc={value !== null ? `NRS ${value}／10` : '未評価'}>
      {showTitle && (
        <FigCaption x={w / 2} y={26} size={16}>
          いまの痛みの強さ
        </FigCaption>
      )}
      <defs>
        <linearGradient id="painGrad" x1="0" x2="1">
          <stop offset="0%" stopColor={PALETTE.goodLight} />
          <stop offset="50%" stopColor="#fde9c8" />
          <stop offset="100%" stopColor={PALETTE.warnLight} />
        </linearGradient>
      </defs>
      <rect x={left} y={y - 14} width={right - left} height={28} rx={14} fill="url(#painGrad)" stroke={PALETTE.line} />
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i}>
          <line x1={at(i)} y1={y + 14} x2={at(i)} y2={y + 22} stroke={PALETTE.line} strokeWidth={1.5} />
          <text x={at(i)} y={y + 38} textAnchor="middle" fontSize={12} fill={PALETTE.inkMute}>
            {i}
          </text>
        </g>
      ))}
      <text x={left} y={y - 24} fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        痛みなし
      </text>
      <text x={right} y={y - 24} textAnchor="end" fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
        これ以上ない痛み
      </text>
      {value !== null && (
        <g>
          <line x1={at(value)} y1={y - 34} x2={at(value)} y2={y + 14} stroke={PALETTE.ink} strokeWidth={3} />
          <circle cx={at(value)} cy={y} r={13} fill="#fff" stroke={PALETTE.ink} strokeWidth={3.5} />
          <text x={at(value)} y={y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={PALETTE.ink}>
            {value}
          </text>
          <Pill
            x={Math.min(Math.max(at(value) - 52, 4), w - 108)}
            y={h - 34}
            w={104}
            h={26}
            fill={PALETTE.ink}
            label={`いま ${value} / 10`}
            labelColor="#fff"
            size={12.5}
          />
        </g>
      )}
    </Figure>
  )
}

// ---------------------------------------------------------------- 体の地図（痛む場所）

/**
 * 痛む場所を示す簡単な全身図。
 * 部位名を渡すとその場所に印が付く。
 */
export type BodySpot =
  | 'lowBack'
  | 'neck'
  | 'shoulderL' | 'shoulderR'
  | 'elbowL' | 'elbowR'
  | 'handL' | 'handR'
  | 'hipL' | 'hipR'
  | 'kneeL' | 'kneeR'
  | 'ankleL' | 'ankleR'
  | 'heelL' | 'heelR'
  | 'thighBackL' | 'thighBackR'
  | 'shinL' | 'shinR'

/** 読み上げ・操作・カルテ記載に使う部位名 */
export const BODY_SPOT_LABEL: Record<BodySpot, string> = {
  neck: '首',
  shoulderR: '右肩', shoulderL: '左肩',
  lowBack: '腰',
  elbowR: '右ひじ', elbowL: '左ひじ',
  handR: '右手', handL: '左手',
  hipR: '右股関節', hipL: '左股関節',
  thighBackR: '右ももの裏', thighBackL: '左ももの裏',
  kneeR: '右ひざ', kneeL: '左ひざ',
  shinR: '右すね', shinL: '左すね',
  ankleR: '右足首', ankleL: '左足首',
  heelR: '右かかと', heelL: '左かかと',
}

const SPOT_POS: Record<BodySpot, [number, number]> = {
  neck: [100, 52],
  shoulderR: [72, 76],
  shoulderL: [128, 76],
  lowBack: [100, 148],
  elbowR: [56, 132],
  elbowL: [144, 132],
  handR: [46, 186],
  handL: [154, 186],
  hipR: [82, 176],
  hipL: [118, 176],
  thighBackR: [82, 222],
  thighBackL: [118, 222],
  kneeR: [84, 268],
  kneeL: [116, 268],
  shinR: [85, 306],
  shinL: [115, 306],
  ankleR: [86, 340],
  ankleL: [114, 340],
  heelR: [86, 352],
  heelL: [114, 352],
}

export function BodyMapFigure({
  spots,
  caption,
  /**
   * 印を押したときに呼ばれる。
   * 患者さんが「ここも痛い」と指した場所を、その場で足せるようにする。
   * 渡さなければ従来どおり表示専用。
   */
  onToggle,
}: {
  spots: BodySpot[]
  caption?: string
  onToggle?: (spot: BodySpot) => void
}) {
  return (
    <Figure viewBox="0 0 200 400" title="痛みのある場所" desc={caption ?? '体の図に痛む場所を示しています'} maxWidth={200}>
      {/* シルエット */}
      <g fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2}>
        <circle cx={100} cy={30} r={19} />
        <path d="M100 49 L100 60" strokeWidth={12} strokeLinecap="round" stroke={PALETTE.line} />
        <path d="M74 66 Q100 58 126 66 L130 168 Q100 176 70 168 Z" />
        <path d="M74 70 L50 130 L44 190" fill="none" strokeWidth={11} strokeLinecap="round" />
        <path d="M126 70 L150 130 L156 190" fill="none" strokeWidth={11} strokeLinecap="round" />
        <path d="M84 170 L84 268 L86 344" fill="none" strokeWidth={14} strokeLinecap="round" />
        <path d="M116 170 L116 268 L114 344" fill="none" strokeWidth={14} strokeLinecap="round" />
        <path d="M86 348 L72 358" fill="none" strokeWidth={9} strokeLinecap="round" />
        <path d="M114 348 L128 358" fill="none" strokeWidth={9} strokeLinecap="round" />
      </g>
      {spots.map((s) => {
        const [x, y] = SPOT_POS[s]
        return (
          <g key={s}>
            <circle cx={x} cy={y} r={13} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={3} />
            <circle cx={x} cy={y} r={4.5} fill={PALETTE.warn} />
          </g>
        )
      })}

      {/*
        押せる位置。押せるようにしたときだけ、選ばれていない場所にも薄い点を出す。
        点がないと医師がどこを狙えばよいか分からないため。
        患者さんに見せるだけの図（onToggle なし）では出さないので、見た目は従来のまま。
        足首とかかとは12しか離れておらず、当たり判定は多少重なる。
        あとに描いたものが上に来るので、SPOT_POS の並び順で優先が決まる。
      */}
      {onToggle &&
        (Object.keys(SPOT_POS) as BodySpot[]).map((s) => {
          const [x, y] = SPOT_POS[s]
          const on = spots.includes(s)
          return (
            <g key={`hit-${s}`}>
              {!on && <circle cx={x} cy={y} r={3} fill={PALETTE.line} opacity={0.5} />}
              <circle
                cx={x}
                cy={y}
                r={10}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2f7fb0]"
                role="button"
                tabIndex={0}
                aria-label={`${BODY_SPOT_LABEL[s]}${on ? '（痛みあり）' : ''}`}
                aria-pressed={on}
                onClick={(e) => {
                  // 説明モードは画面の右側タップでスライドが進むため、ここで止める
                  e.stopPropagation()
                  onToggle(s)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggle(s)
                  }
                }}
              />
            </g>
          )
        })}
      {caption && (
        <text x={100} y={380} textAnchor="middle" fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
          {caption}
        </text>
      )}
      {onToggle && (
        <text
          x={100}
          y={396}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={PALETTE.brandMid}
          className="print:hidden"
        >
          押して増やせます
        </text>
      )}
    </Figure>
  )
}

// ---------------------------------------------------------------- 比較（正常 vs いまの状態）

export function BeforeAfterFrame({
  leftTitle,
  rightTitle,
  leftNode,
  rightNode,
  width = 560,
  height = 240,
  note,
}: {
  leftTitle: string
  rightTitle: string
  leftNode: React.ReactNode
  rightNode: React.ReactNode
  width?: number
  height?: number
  note?: string
}) {
  const half = width / 2
  return (
    <Figure viewBox={`0 0 ${width} ${height}`} title={`${leftTitle}と${rightTitle}の比較`}>
      <rect x={4} y={4} width={half - 10} height={height - (note ? 34 : 10)} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} />
      <rect
        x={half + 6}
        y={4}
        width={half - 10}
        height={height - (note ? 34 : 10)}
        rx={12}
        fill={PALETTE.warnLight}
        opacity={0.45}
        stroke={PALETTE.warn}
      />
      <FigCaption x={half / 2} y={26} size={14} color={PALETTE.inkSoft}>
        {leftTitle}
      </FigCaption>
      <FigCaption x={half + half / 2} y={26} size={14} color={PALETTE.warn}>
        {rightTitle}
      </FigCaption>
      <g>{leftNode}</g>
      <g transform={`translate(${half},0)`}>{rightNode}</g>
      {note && (
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.ink}>
          {note}
        </text>
      )}
    </Figure>
  )
}
