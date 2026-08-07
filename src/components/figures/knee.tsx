import { ArrowDefs, FigCaption, Figure, Floor, PALETTE, Pill } from './common'
import type { LocomoStage, StandUpResult } from '@/types'

/* =========================================================================
   変形性膝関節症・ロコモの説明図
   ========================================================================= */

// ---------------------------------------------------------------- 膝の軟骨のすり減り

/*
  膝の骨の形は、以前は角丸長方形の模式でした。
  レントゲンをトレースするまでの中間として、大腿骨遠位を「2つの円の合併」で描き、
  丸い顆と浅い顆間切痕が確実に出るようにしています（手描きベジエだと形が崩れるため）。
  円弧（A コマンド）で顆をつくるので、太ももの骨らしい広がりと切痕が保証されます。
*/

/** 大腿骨遠位（正面）：中心(±D,0) 半径RC の2円の合併で顆をつくる */
const FEMUR_D = 27
const FEMUR_RC = 35
/** 円の下側交点＝顆間切痕の底 */
const FEMUR_NOTCH_Y = Math.round(Math.sqrt(FEMUR_RC * FEMUR_RC - FEMUR_D * FEMUR_D) * 10) / 10
const FEMUR_CONDYLE_BOTTOM = FEMUR_RC // 顆の最下点（局所 y）

function femurPath(): string {
  const d = FEMUR_D
  const Rc = FEMUR_RC
  const shaftHalf = 22
  const shaftTop = -64
  const iy = FEMUR_NOTCH_Y
  const Lx = -d - Rc
  const Rx = d + Rc
  return (
    `M ${-shaftHalf} ${shaftTop}` +
    ` C ${-shaftHalf - 4} ${shaftTop + 40} ${-shaftHalf - 14} -50 ${Lx + 4} -14` +
    ` C ${Lx} -6 ${Lx} 0 ${Lx} 2` +
    ` A ${Rc} ${Rc} 0 0 0 0 ${iy}` +
    ` A ${Rc} ${Rc} 0 0 0 ${Rx} 2` +
    ` C ${Rx} 0 ${Rx} -6 ${Rx - 4} -14` +
    ` C ${shaftHalf + 14} -50 ${shaftHalf + 4} ${shaftTop + 40} ${shaftHalf} ${shaftTop} Z`
  )
}
/** 顆の丸みに沿う陰影 */
function femurDetailPath(): string {
  const d = FEMUR_D
  const Rc = FEMUR_RC
  const iy = FEMUR_NOTCH_Y
  return (
    `M ${-d - Rc + 8} -6 A ${Rc - 7} ${Rc - 7} 0 0 0 -3 ${iy - 5}` +
    ` M ${d + Rc - 8} -6 A ${Rc - 7} ${Rc - 7} 0 0 1 3 ${iy - 5}`
  )
}
/** 脛骨近位（正面）：平らな関節面＋中央の顆間隆起、シャフトへ絞る */
function tibiaPath(): string {
  const half = 52
  const sh = 24
  const bottom = 96
  return (
    `M ${-half} 6 Q ${-half} 0 ${-half + 9} 0 L -13 0` +
    ` L -7 -7 L -2 0 L 2 0 L 7 -7 L 13 0` +
    ` L ${half - 9} 0 Q ${half} 0 ${half} 6` +
    ` C ${half - 3} 44 ${sh + 7} 74 ${sh} ${bottom}` +
    ` L ${-sh} ${bottom}` +
    ` C ${-sh - 7} 74 ${-half + 3} 44 ${-half} 6 Z`
  )
}

export function KneeOaFigure({
  klGrade,
  varus,
  /** すり減っている側。既定は内側（日本人のOAは内側型が大多数） */
  compartment = 'medial',
}: {
  klGrade?: number | null
  varus?: boolean
  compartment?: 'medial' | 'lateral'
}) {
  const g = klGrade ?? 0
  const gap = [16, 14, 10, 6, 3][Math.min(4, Math.max(0, g))]
  const osteophyte = g >= 1
  const tilt = varus ? (compartment === 'lateral' ? -1 : 1) * Math.min(4, g) : 0

  const femurCy = 132
  const condyleBottom = femurCy + FEMUR_CONDYLE_BOTTOM

  /**
   * 1つの膝を描く。worn を渡すとその区画の軟骨を薄く・オレンジにする。
   * 健康な膝は worn=null。
   */
  const knee = (x: number, cartilageGap: number, worn: 'medial' | 'lateral' | null, showOsteophyte: boolean) => {
    const plateau = condyleBottom + cartilageGap
    const pad = (side: 'medial' | 'lateral', x0: number, x1: number) => {
      const isWorn = worn === side
      const h = isWorn ? Math.max(2.5, cartilageGap * 0.4) : cartilageGap - 1
      const yTop = plateau - h - 0.5
      return (
        <rect
          x={x0}
          y={yTop}
          width={x1 - x0}
          height={h}
          rx={3}
          fill={isWorn ? PALETTE.warnLight : '#bcdcec'}
          stroke={isWorn ? PALETTE.warn : PALETTE.brandMid}
          strokeWidth={isWorn ? 2.5 : 2}
        />
      )
    }
    return (
      <g transform={`translate(${x},0)`}>
        <g transform={`translate(0,${femurCy})`}>
          <path d={femurPath()} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="3" strokeLinejoin="round" />
          <path d={femurDetailPath()} fill="none" stroke={PALETTE.boneEdge} strokeWidth="1.5" opacity="0.6" />
        </g>
        <g transform={`translate(0,${plateau}) rotate(${tilt})`}>
          <path d={tibiaPath()} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="3" strokeLinejoin="round" />
          {showOsteophyte && (
            <g fill={PALETTE.boneDark} stroke={PALETTE.boneEdge} strokeWidth="1.2">
              <path d="M -52 3 l -9 -3 l 9 7 Z" />
              <path d="M 52 3 l 9 -3 l -9 7 Z" />
            </g>
          )}
        </g>
        {pad('medial', -50, -6)}
        {pad('lateral', 6, 50)}
        <text
          x={-58}
          y={plateau - cartilageGap / 2 + 3}
          textAnchor="end"
          fontSize="11"
          fontWeight="700"
          fill={worn === 'medial' ? PALETTE.warn : PALETTE.inkMute}
        >
          内側
        </text>
        <text
          x={58}
          y={plateau - cartilageGap / 2 + 3}
          fontSize="11"
          fontWeight="700"
          fill={worn === 'lateral' ? PALETTE.warn : PALETTE.inkMute}
        >
          外側
        </text>
      </g>
    )
  }

  return (
    <Figure
      viewBox="0 0 620 340"
      title="膝の軟骨のすり減りかた"
      desc="膝のクッションである軟骨がすり減って骨と骨の隙間が狭くなり、骨のとげ（骨棘）ができる。"
    >
      <rect x="0" y="0" width="620" height="340" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        膝の「クッション」がすり減っています
      </FigCaption>

      <g>
        <rect x="40" y="44" width="230" height="252" rx="14" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth="2" />
        <FigCaption x={155} y={60} size={15} color={PALETTE.good}>
          健康な膝
        </FigCaption>
        {knee(155, 16, null, false)}
        <text x={155} y={288} textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
          軟骨が厚く、すき間が広い
        </text>
      </g>

      <g>
        <rect x="350" y="44" width="230" height="252" rx="14" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2.5" />
        <FigCaption x={465} y={60} size={15} color={PALETTE.warn}>
          {klGrade != null ? `あなたの膝（グレード${klGrade}）` : '変形性膝関節症の膝'}
        </FigCaption>
        {knee(465, gap, compartment, osteophyte)}
        <text x={465} y={288} textAnchor="middle" fontSize="12.5" fill={PALETTE.warn} fontWeight="700">
          {compartment === 'lateral' ? '外側' : '内側'}の軟骨がうすくなり、骨のとげができる
        </text>
      </g>

      <ArrowDefs id="arrKnee" color={PALETTE.inkMute} />
      <line x1="288" y1="170" x2="332" y2="170" stroke={PALETTE.inkMute} strokeWidth="4" markerEnd="url(#arrKnee)" />

      <text x={310} y={322} textAnchor="middle" fontSize="13.5" fill={PALETTE.ink} fontWeight="700">
        軟骨は元に戻りませんが、まわりの筋肉を鍛えると痛みは軽くなります
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 体重と膝への負担

export function KneeLoadFigure({
  weightKg,
  targetLossKg,
}: {
  weightKg?: number | null
  targetLossKg?: number | null
}) {
  const loss = targetLossKg && targetLossKg > 0 ? targetLossKg : 3
  return (
    <Figure
      viewBox="0 0 620 300"
      title="体重と膝にかかる力の関係"
      desc="平地歩行では体重の約3倍、階段では約5倍の力が膝にかかる。体重を減らすと膝への負担が大きく減る。"
    >
      <rect x="0" y="0" width="620" height="300" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        体重を1kg減らすと、膝は3kg分らくになります
      </FigCaption>

      {[
        { label: '平地を歩く', mult: 3, y: 62, color: PALETTE.brandMid },
        { label: '階段をのぼる・おりる', mult: 5, y: 138, color: PALETTE.warn },
      ].map((row) => (
        <g key={row.label}>
          <text x="40" y={row.y + 22} fontSize="15" fontWeight="700" fill={PALETTE.ink}>
            {row.label}
          </text>
          <text x="40" y={row.y + 44} fontSize="13" fill={PALETTE.inkSoft}>
            体重の約{row.mult}倍の力
          </text>
          {Array.from({ length: row.mult }).map((_, i) => (
            <rect key={i} x={250 + i * 62} y={row.y} width="54" height="52" rx="8" fill={row.color} opacity={0.28 + i * 0.13} stroke={row.color} strokeWidth="2" />
          ))}
          {weightKg && (
            <text x={250 + row.mult * 62 + 8} y={row.y + 32} fontSize="16" fontWeight="800" fill={row.color}>
              ≒ {Math.round(weightKg * row.mult)}kg
            </text>
          )}
        </g>
      ))}

      <g transform="translate(40,214)">
        <rect x="0" y="0" width="540" height="62" rx="12" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2.5" />
        <text x="270" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill={PALETTE.good}>
          {loss}kg 減らせたら…
        </text>
        <text x="270" y="48" textAnchor="middle" fontSize="14" fill={PALETTE.ink}>
          歩くときの膝への負担は約 {Math.round(loss * 3)}kg 分、階段では約 {Math.round(loss * 5)}kg 分 軽くなります
        </text>
      </g>
    </Figure>
  )
}

// ---------------------------------------------------------------- 治療のピラミッド

export function KneeTreatmentPyramidFigure({ level }: { level?: 1 | 2 | 3 | 4 | null }) {
  const tiers = [
    { n: 4, label: '手術', sub: '人工関節・骨切り', w: 180, color: '#8f2c0d', bg: '#f9d2c2' },
    { n: 3, label: '注射', sub: 'ヒアルロン酸・ステロイド', w: 300, color: PALETTE.warn, bg: PALETTE.warnLight },
    { n: 2, label: 'くすり', sub: '貼り薬・のみ薬', w: 420, color: PALETTE.brand, bg: PALETTE.brandLight },
    { n: 1, label: '運動療法・体重管理・装具', sub: 'すべての方に行う土台の治療', w: 540, color: PALETTE.good, bg: PALETTE.goodLight },
  ]
  return (
    <Figure
      viewBox="0 0 620 320"
      title="変形性膝関節症の治療の順序"
      desc="運動療法・体重管理・装具がすべての患者に行う土台の治療。それでも痛みが残るときに薬・注射・手術を追加する。"
    >
      <rect x="0" y="0" width="620" height="320" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        治療は「下から順に」積み上げます
      </FigCaption>

      {tiers.map((t, i) => {
        const y = 50 + i * 62
        const x = 310 - t.w / 2
        const active = level === t.n
        return (
          <g key={t.n}>
            <rect x={x} y={y} width={t.w} height="54" rx="8" fill={active ? t.color : t.bg} stroke={t.color} strokeWidth={active ? 3.5 : 2} />
            <text x="310" y={y + 24} textAnchor="middle" fontSize="16" fontWeight="800" fill={active ? '#fff' : t.color}>
              {t.label}
            </text>
            <text x="310" y={y + 43} textAnchor="middle" fontSize="12.5" fill={active ? '#fff' : PALETTE.inkSoft}>
              {t.sub}
            </text>
          </g>
        )
      })}
      <text x="310" y={304} textAnchor="middle" fontSize="13" fontWeight="700" fill={PALETTE.good}>
        土台の運動療法を続けることで、上の治療が必要になる時期を遅らせられます
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- ロコモ度

export function LocomoStageFigure({ stage }: { stage: LocomoStage }) {
  const steps = [
    { n: 0, label: '問題なし', sub: '移動機能は保たれている', color: PALETTE.good, bg: PALETTE.goodLight },
    { n: 1, label: 'ロコモ度1', sub: '移動機能の低下が始まっている', color: '#7aa03f', bg: '#eaf3dd' },
    { n: 2, label: 'ロコモ度2', sub: '移動機能の低下が進行している', color: '#d99125', bg: '#fdf0dc' },
    { n: 3, label: 'ロコモ度3', sub: '社会参加に支障が出ている', color: PALETTE.warn, bg: PALETTE.warnLight },
  ]
  return (
    <Figure
      viewBox="0 0 620 300"
      title="ロコモ度（移動機能の段階）と現在の位置"
      desc="立ち上がりテスト・2ステップテスト・ロコモ25の結果から、移動機能の低下の段階を判定する。"
    >
      <rect x="0" y="0" width="620" height="300" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        「歩く力」はいまどの段階？
      </FigCaption>

      {steps.map((s, i) => {
        const h = 44 + i * 34
        const x = 44 + i * 138
        const y = 244 - h
        const active = stage === s.n
        return (
          <g key={s.n}>
            <rect x={x} y={y} width="124" height={h} rx="10" fill={active ? s.color : s.bg} stroke={s.color} strokeWidth={active ? 4 : 2} />
            <text x={x + 62} y={y + 26} textAnchor="middle" fontSize="15" fontWeight="800" fill={active ? '#fff' : s.color}>
              {s.label}
            </text>
            <text x={x + 62} y={y + 44} textAnchor="middle" fontSize="11" fill={active ? '#fff' : PALETTE.inkSoft}>
              {s.sub.length > 12 ? s.sub.slice(0, 11) : s.sub}
            </text>
            {s.sub.length > 12 && (
              <text x={x + 62} y={y + 59} textAnchor="middle" fontSize="11" fill={active ? '#fff' : PALETTE.inkSoft}>
                {s.sub.slice(11)}
              </text>
            )}
            {active && (
              <g>
                <path d={`M ${x + 62} ${y - 24} L ${x + 52} ${y - 8} L ${x + 72} ${y - 8} Z`} fill={PALETTE.ink} />
                <Pill x={x - 4} y={y - 56} w={132} h={28} fill={PALETTE.ink} label="あなたはここ" labelColor="#fff" size={13.5} />
              </g>
            )}
          </g>
        )
      })}
      <Floor x1={30} x2={594} y={246} />
      <text x="310" y={286} textAnchor="middle" fontSize="12" fill={PALETTE.inkMute}>
        判定基準：日本整形外科学会「ロコモ度テストの臨床判断値」
      </text>
    </Figure>
  )
}

/** 立ち上がりテストの説明図（台の高さと片脚／両脚） */
export function StandUpTestFigure({ oneLegCm, bothLegCm }: { oneLegCm?: StandUpResult; bothLegCm?: StandUpResult }) {
  const boxes = [10, 20, 30, 40]
  // その高さの台から立ち上がれたか（○）／立てなかったか（×）／未実施（—）
  const mark = (v: StandUpResult | undefined, cm: number): '○' | '×' | '—' => {
    if (v === null || v === undefined) return '—'
    if (v === 'cannot') return '×'
    return v <= cm ? '○' : '×'
  }
  return (
    <Figure
      viewBox="0 0 620 260"
      title="立ち上がりテスト"
      desc="10cm・20cm・30cm・40cmの台から、片脚または両脚で立ち上がれるかを調べる。"
    >
      <rect x="0" y="0" width="620" height="260" fill={PALETTE.paper} />
      <FigCaption x={310} y={24} size={17}>
        立ち上がりテスト（下肢の筋力）
      </FigCaption>

      {boxes.map((cm, i) => {
        const x = 44 + i * 140
        const h = 26 + (cm / 40) * 72
        const y = 200 - h
        const bothMark = mark(bothLegCm, cm)
        const oneMark = mark(oneLegCm, cm)
        return (
          <g key={cm}>
            <rect x={x} y={y} width="104" height={h} rx="4" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth="2" />
            <text x={x + 52} y={y + h / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill={PALETTE.inkSoft}>
              {cm}cm
            </text>
            <g fontSize="12" fontWeight="700">
              <text x={x + 52} y="222" textAnchor="middle" fill={bothMark === '○' ? PALETTE.good : PALETTE.inkMute}>
                両脚 {bothMark}
              </text>
              <text x={x + 52} y="240" textAnchor="middle" fill={oneMark === '○' ? PALETTE.good : PALETTE.inkMute}>
                片脚 {oneMark}
              </text>
            </g>
          </g>
        )
      })}
      <Floor x1={30} x2={594} y={200} />
      <text x="310" y="60" textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
        片脚で40cmから立てない → ロコモ度1／両脚で20cmから立てない → ロコモ度2／両脚で30cmから立てない → ロコモ度3
      </text>
    </Figure>
  )
}
