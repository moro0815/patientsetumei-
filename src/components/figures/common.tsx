import type { ReactNode } from 'react'

/**
 * 図表の共通部品
 *
 * 方針
 * - すべて手描きのSVG。外部画像・外部フォントに依存しないため、
 *   オフラインの院内PCでも、A4印刷でも劣化しない。
 * - 色は色覚バリアフリーを意識し、赤と緑の対比だけで情報を伝えない
 *   （必ず形・位置・文字ラベルを併用する）。
 * - 患者さんが2秒で意味をつかめることを優先し、要素数を絞る。
 */

export const PALETTE = {
  ink: '#1f2933',
  inkSoft: '#3e4c59',
  inkMute: '#7b8794',
  line: '#9aa5b1',
  paper: '#ffffff',
  bg: '#f5f7fa',

  bone: '#efe0c4',
  boneEdge: '#b99a62',
  boneDark: '#d9c39a',

  // 「良い・保たれている」側
  good: '#2f855a',
  goodLight: '#d3ebdd',
  // 「注意・弱っている」側（赤ではなくオレンジ系で色覚に配慮）
  warn: '#cf5a20',
  warnLight: '#fbdccf',
  // 情報・薬
  brand: '#1f5c86',
  brandLight: '#d6e9f5',
  brandMid: '#4794c4',
  // 炎症
  inflame: '#b83280',
  inflameLight: '#f7d9ec',

  purple: '#5b4a9e',
  purpleLight: '#e0dcf3',
} as const

interface FigureProps {
  /** SVGのviewBox */
  viewBox: string
  /** 読み上げ・代替テキスト */
  title: string
  desc?: string
  children: ReactNode
  className?: string
  /** 最大幅（px）。診察室の大画面では大きく、印刷では小さく */
  maxWidth?: number
}

export function Figure({ viewBox, title, desc, children, className = '', maxWidth }: FigureProps) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={title}
      className={`h-auto w-full ${className}`}
      style={maxWidth ? { maxWidth } : undefined}
      preserveAspectRatio="xMidYMid meet"
      fontFamily='"Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP","BIZ UDPGothic",Meiryo,"Yu Gothic",sans-serif'
    >
      <title>{title}</title>
      {desc && <desc>{desc}</desc>}
      {children}
    </svg>
  )
}

/** 図の中の小見出し */
export function FigCaption({
  x,
  y,
  children,
  anchor = 'middle',
  size = 15,
  color = PALETTE.ink,
  weight = 700,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  size?: number
  color?: string
  weight?: number
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}>
      {children}
    </text>
  )
}

/** 角丸のラベル枠 */
export function Pill({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  label,
  labelColor = PALETTE.ink,
  size = 13,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke?: string
  label: string
  labelColor?: string
  size?: number
  dashed?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2.6}
        fill={fill}
        stroke={stroke ?? 'none'}
        strokeWidth={stroke ? 1.5 : 0}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={700}
        fill={labelColor}
      >
        {label}
      </text>
    </g>
  )
}

/** 矢印の定義（<defs>に一度だけ置く） */
export function ArrowDefs({ id = 'arrow', color = PALETTE.inkSoft, size = 7 }: { id?: string; color?: string; size?: number }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth={size}
        markerHeight={size}
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
  )
}

/** 複数行テキスト（SVGは自動折返ししないため手動で分ける） */
export function MultiText({
  x,
  y,
  lines,
  size = 13,
  lineHeight = 1.5,
  anchor = 'start',
  color = PALETTE.inkSoft,
  weight = 400,
}: {
  x: number
  y: number
  lines: string[]
  size?: number
  lineHeight?: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  weight?: number
}) {
  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + i * size * lineHeight}
          textAnchor={anchor}
          fontSize={size}
          fontWeight={weight}
          fill={color}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

/**
 * 決定的な擬似乱数（線形合同法）。
 * 骨梁のようなランダムに見える模様を、再描画・印刷のたびに同じ形で出すために使う。
 */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// ---------------------------------------------------------------- 棒人間の部品

export interface StickOptions {
  color?: string
  stroke?: number
  headR?: number
}

/**
 * 棒人間の頭・胴・四肢を描くための最小限のヘルパー。
 * 運動療法の図を、同じ描き味で量産するために使う。
 */
export function StickPerson({
  x,
  y,
  scale = 1,
  color = PALETTE.ink,
  stroke = 5,
  /** 各関節の座標（頭の中心を原点とした相対座標） */
  pose,
}: {
  x: number
  y: number
  scale?: number
  color?: string
  stroke?: number
  pose: StickPose
}) {
  const p = (pt: [number, number]) => `${pt[0] * scale},${pt[1] * scale}`
  const seg = (a: [number, number], b: [number, number], key: string) => (
    <line
      key={key}
      x1={a[0] * scale}
      y1={a[1] * scale}
      x2={b[0] * scale}
      y2={b[1] * scale}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  )
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx={pose.head[0] * scale} cy={pose.head[1] * scale} r={11 * scale} fill={color} />
      <polyline
        points={[pose.neck, pose.hip].map(p).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={stroke + 1}
        strokeLinecap="round"
      />
      {seg(pose.neck, pose.elbowL, 'ael')}
      {seg(pose.elbowL, pose.handL, 'ahl')}
      {seg(pose.neck, pose.elbowR, 'aer')}
      {seg(pose.elbowR, pose.handR, 'ahr')}
      {seg(pose.hip, pose.kneeL, 'lkl')}
      {seg(pose.kneeL, pose.footL, 'lfl')}
      {seg(pose.hip, pose.kneeR, 'lkr')}
      {seg(pose.kneeR, pose.footR, 'lfr')}
    </g>
  )
}

export interface StickPose {
  head: [number, number]
  neck: [number, number]
  hip: [number, number]
  elbowL: [number, number]
  handL: [number, number]
  elbowR: [number, number]
  handR: [number, number]
  kneeL: [number, number]
  footL: [number, number]
  kneeR: [number, number]
  footR: [number, number]
}

/** 床のライン */
export function Floor({ x1, x2, y, color = PALETTE.line }: { x1: number; x2: number; y: number; color?: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={3} />
      {Array.from({ length: Math.floor((x2 - x1) / 14) }).map((_, i) => (
        <line
          key={i}
          x1={x1 + i * 14}
          y1={y}
          x2={x1 + i * 14 - 8}
          y2={y + 8}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.6}
        />
      ))}
    </g>
  )
}

/** 動きの方向を示す矢印（曲線） */
export function MotionArrow({
  d,
  color = PALETTE.brandMid,
  markerId,
  width = 3,
  dash,
}: {
  d: string
  color?: string
  markerId: string
  width?: number
  dash?: string
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      markerEnd={`url(#${markerId})`}
    />
  )
}
