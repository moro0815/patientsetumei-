import { ArrowDefs, FigCaption, Figure, Floor, makeRng, MultiText, PALETTE, Pill } from './common'
import type { OsteoporosisAssessment } from '@/types'

/* =========================================================================
   骨粗鬆症の説明図
   ========================================================================= */

// ---------------------------------------------------------------- 骨の中身（骨梁）の比較

function trabeculae(
  seed: number,
  density: number,
  thickness: number,
  w: number,
  h: number,
  color: string,
) {
  const rng = makeRng(seed)
  const cols = 7
  const rows = 9
  const nodes: [number, number][][] = []
  for (let r = 0; r < rows; r++) {
    const row: [number, number][] = []
    for (let c = 0; c < cols; c++) {
      row.push([
        (w / (cols - 1)) * c + (rng() - 0.5) * 12,
        (h / (rows - 1)) * r + (rng() - 0.5) * 12,
      ])
    }
    nodes.push(row)
  }
  const lines: { a: [number, number]; b: [number, number]; sw: number }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 縦方向（荷重を支える主要な梁）は残りやすい
      if (r < rows - 1 && rng() < density + 0.12) {
        lines.push({ a: nodes[r][c], b: nodes[r + 1][c], sw: thickness * (0.85 + rng() * 0.4) })
      }
      // 横方向（水平の梁）は骨粗鬆症で先に失われる
      if (c < cols - 1 && rng() < density - 0.1) {
        lines.push({ a: nodes[r][c], b: nodes[r][c + 1], sw: thickness * (0.6 + rng() * 0.4) })
      }
      // 斜めの梁
      if (r < rows - 1 && c < cols - 1 && rng() < density - 0.25) {
        lines.push({ a: nodes[r][c], b: nodes[r + 1][c + 1], sw: thickness * 0.6 })
      }
    }
  }
  return lines.map((l, i) => (
    <line
      key={i}
      x1={l.a[0]}
      y1={l.a[1]}
      x2={l.b[0]}
      y2={l.b[1]}
      stroke={color}
      strokeWidth={Math.max(1, l.sw)}
      strokeLinecap="round"
    />
  ))
}

/**
 * 骨の中身の比較図。
 * 「骨は中がスポンジ状で、その柱（骨梁）が細くなり本数が減るのが骨粗鬆症」という
 * 一番大事な理解を、1枚で伝えるための図。
 */
export function TrabecularBoneFigure({ yam }: { yam?: number | null }) {
  const patientLabel =
    yam != null ? `あなたの骨（YAM ${Math.round(yam)}%）` : '骨粗鬆症の骨'
  const isSevere = yam != null ? yam < 70 : true
  const density = isSevere ? 0.34 : 0.5
  const thickness = isSevere ? 2.2 : 3.2

  return (
    <Figure
      viewBox="0 0 640 360"
      title="正常な骨と骨粗鬆症の骨の内部構造の比較"
      desc="骨の内部は柱（骨梁）が網目状に組み合わさっている。骨粗鬆症では柱が細くなり、本数が減って隙間が広がる。"
    >
      <rect x="0" y="0" width="640" height="360" fill={PALETTE.paper} />

      {/* 左：若い頃の骨 */}
      <g transform="translate(40,58)">
        <rect x="0" y="0" width="230" height="240" rx="14" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="4" />
        <g transform="translate(18,18)" clipPath="url(#clipL)">
          {trabeculae(20250801, 0.78, 5, 194, 204, PALETTE.boneEdge)}
        </g>
        <defs>
          <clipPath id="clipL">
            <rect x="0" y="0" width="194" height="204" rx="8" />
          </clipPath>
        </defs>
      </g>
      <FigCaption x={155} y={38} size={19}>
        じょうぶな骨（20〜44歳の平均）
      </FigCaption>
      <MultiText
        x={155}
        y={325}
        anchor="middle"
        size={15}
        lines={['柱が太く、本数も多い。', '横の柱がしっかり残っている。']}
      />

      {/* 右：患者の骨 */}
      <g transform="translate(370,58)">
        <rect x="0" y="0" width="230" height="240" rx="14" fill={PALETTE.bone} stroke={PALETTE.warn} strokeWidth="4" />
        <g transform="translate(18,18)" clipPath="url(#clipR)">
          {trabeculae(19990101, density, thickness, 194, 204, PALETTE.boneEdge)}
        </g>
        <defs>
          <clipPath id="clipR">
            <rect x="0" y="0" width="194" height="204" rx="8" />
          </clipPath>
        </defs>
      </g>
      <FigCaption x={485} y={38} size={19} color={PALETTE.warn}>
        {patientLabel}
      </FigCaption>
      <MultiText
        x={485}
        y={325}
        anchor="middle"
        size={15}
        color={PALETTE.warn}
        weight={600}
        lines={['柱が細くなり、本数が減っている。', 'とくに横の柱が先に失われる。']}
      />

      {/* 中央の矢印 */}
      <ArrowDefs id="arrBone" color={PALETTE.inkMute} />
      <line x1="285" y1="178" x2="350" y2="178" stroke={PALETTE.inkMute} strokeWidth="4" markerEnd="url(#arrBone)" />
      <text x={317} y={162} textAnchor="middle" fontSize={13} fill={PALETTE.inkMute} fontWeight={700}>
        加齢・閉経
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 骨密度の年齢変化グラフ

/**
 * 年齢と骨密度（YAM%）の関係に、患者さんの現在位置をプロットする図。
 *
 * カーブは「閉経後に女性の骨密度が急速に低下する」という一般的な経過を
 * 説明のために模式化したものであり、個人の予測値ではない。
 */
export function BmdCurveFigure({
  age,
  sex,
  yam,
}: {
  age: number | null
  sex: 'female' | 'male'
  yam: number | null
}) {
  const W = 640
  const H = 380
  const padL = 62
  const padR = 30
  const padT = 34
  const padB = 56
  const x0 = padL
  const x1 = W - padR
  const y0 = padT
  const y1 = H - padB

  const ageMin = 20
  const ageMax = 90
  const yamMin = 40
  const yamMax = 115

  const sx = (a: number) => x0 + ((a - ageMin) / (ageMax - ageMin)) * (x1 - x0)
  const sy = (v: number) => y1 - ((v - yamMin) / (yamMax - yamMin)) * (y1 - y0)

  // 模式的な平均骨密度の経過
  const femalePts: [number, number][] = [
    [20, 100], [30, 101], [40, 100], [45, 98], [50, 95],
    [55, 87], [60, 81], [65, 77], [70, 73], [75, 70], [80, 67], [85, 64], [90, 61],
  ]
  const malePts: [number, number][] = [
    [20, 100], [30, 100], [40, 99], [50, 96], [60, 92],
    [70, 87], [75, 84], [80, 81], [85, 78], [90, 75],
  ]
  const line = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[0])},${sy(p[1])}`).join(' ')

  return (
    <Figure
      viewBox={`0 0 ${W} ${H}`}
      title="年齢と骨密度の関係、および現在の位置"
      desc="横軸は年齢、縦軸は若年成人平均値（YAM）に対する骨密度の割合。80%未満が骨量減少、70%以下が骨粗鬆症の範囲。"
    >
      <rect x="0" y="0" width={W} height={H} fill={PALETTE.paper} />

      {/* 危険域の帯 */}
      <rect x={x0} y={sy(70)} width={x1 - x0} height={y1 - sy(70)} fill={PALETTE.warnLight} opacity={0.75} />
      <rect x={x0} y={sy(80)} width={x1 - x0} height={sy(70) - sy(80)} fill="#fdf0dc" />
      <rect x={x0} y={y0} width={x1 - x0} height={sy(80) - y0} fill={PALETTE.goodLight} opacity={0.5} />

      {/* 基準線 */}
      {[70, 80, 100].map((v) => (
        <g key={v}>
          <line
            x1={x0}
            y1={sy(v)}
            x2={x1}
            y2={sy(v)}
            stroke={v === 70 ? PALETTE.warn : PALETTE.line}
            strokeWidth={v === 70 ? 2.5 : 1.5}
            strokeDasharray={v === 100 ? '4 4' : undefined}
          />
          <text x={x0 - 8} y={sy(v) + 5} textAnchor="end" fontSize={13} fontWeight={700} fill={PALETTE.inkSoft}>
            {v}%
          </text>
        </g>
      ))}

      {/* 帯のラベル。患者さんの位置を示す吹き出しと重ならないよう、
          グラフの左側（曲線が通らない領域）に置く */}
      <text x={x0 + 8} y={sy(87)} fontSize={13} fontWeight={700} fill={PALETTE.good}>
        正常（80%以上）
      </text>
      <text x={x0 + 8} y={sy(75) + 4} fontSize={13} fontWeight={700} fill="#a9702a">
        骨量減少（70〜80%）
      </text>
      <text x={x0 + 8} y={sy(63)} fontSize={13} fontWeight={700} fill={PALETTE.warn}>
        骨粗鬆症（70%以下）
      </text>

      {/* 軸 */}
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={PALETTE.ink} strokeWidth="2" />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={PALETTE.ink} strokeWidth="2" />
      {[20, 30, 40, 50, 60, 70, 80, 90].map((a) => (
        <g key={a}>
          <line x1={sx(a)} y1={y1} x2={sx(a)} y2={y1 + 6} stroke={PALETTE.ink} strokeWidth="1.5" />
          <text x={sx(a)} y={y1 + 22} textAnchor="middle" fontSize={13} fill={PALETTE.inkSoft}>
            {a}
          </text>
        </g>
      ))}
      <text x={(x0 + x1) / 2} y={H - 14} textAnchor="middle" fontSize={14} fontWeight={700} fill={PALETTE.inkSoft}>
        年齢（歳）
      </text>
      <text
        x={16}
        y={(y0 + y1) / 2}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={PALETTE.inkSoft}
        transform={`rotate(-90 16 ${(y0 + y1) / 2})`}
      >
        骨密度（若い頃を100%として）
      </text>

      {/* 平均カーブ */}
      <path d={line(malePts)} fill="none" stroke={PALETTE.brandMid} strokeWidth={sex === 'male' ? 4 : 2.5} strokeDasharray={sex === 'male' ? undefined : '6 5'} />
      <path d={line(femalePts)} fill="none" stroke={PALETTE.inflame} strokeWidth={sex === 'female' ? 4 : 2.5} strokeDasharray={sex === 'female' ? undefined : '6 5'} />
      <text x={sx(88)} y={sy(78) - 6} textAnchor="end" fontSize={12} fontWeight={700} fill={PALETTE.brandMid}>
        男性の平均
      </text>
      <text x={sx(86)} y={sy(60) + 2} textAnchor="end" fontSize={12} fontWeight={700} fill={PALETTE.inflame}>
        女性の平均
      </text>

      {/* 閉経の目印 */}
      {sex === 'female' && (
        <g>
          <line x1={sx(50)} y1={y0} x2={sx(50)} y2={y1} stroke={PALETTE.inflame} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.8} />
          <text x={sx(50) + 5} y={y0 + 14} fontSize={12} fontWeight={700} fill={PALETTE.inflame}>
            閉経のころ
          </text>
        </g>
      )}

      {/* 患者さんの位置 */}
      {age != null && yam != null && (
        <g>
          <circle cx={sx(clamp(age, ageMin, ageMax))} cy={sy(clamp(yam, yamMin, yamMax))} r="13" fill={PALETTE.paper} stroke={PALETTE.ink} strokeWidth="4" />
          <circle cx={sx(clamp(age, ageMin, ageMax))} cy={sy(clamp(yam, yamMin, yamMax))} r="6" fill={PALETTE.ink} />
          <g transform={`translate(${sx(clamp(age, ageMin, ageMax))},${sy(clamp(yam, yamMin, yamMax))})`}>
            <Pill
              x={age > 65 ? -152 : 22}
              y={-16}
              w={130}
              h={32}
              fill={PALETTE.ink}
              label={`いまここ ${Math.round(yam)}%`}
              labelColor="#fff"
              size={15}
            />
          </g>
        </g>
      )}
      <FigCaption x={x0} y={20} anchor="start" size={13} color={PALETTE.inkMute} weight={400}>
        ※カーブは一般的な経過を示した模式図です（個人の将来予測ではありません）
      </FigCaption>
    </Figure>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

// ---------------------------------------------------------------- 骨のつくりかえ（リモデリング）と薬の作用点

/**
 * 骨は毎日こわされてつくり直されている（リモデリング）ことと、
 * 薬が「こわすのを抑える」か「つくるのを増やす」のどちらかであることを示す図。
 */
export function BoneRemodelingFigure({
  highlight,
}: {
  /** 'resorption' = 骨吸収抑制薬を強調、'formation' = 骨形成促進薬を強調 */
  highlight?: 'resorption' | 'formation' | null
}) {
  const hiRes = highlight === 'resorption'
  const hiForm = highlight === 'formation'
  return (
    <Figure
      viewBox="0 0 640 400"
      title="骨のつくりかえ（骨リモデリング）と薬の働く場所"
      desc="骨は骨をこわす細胞と骨をつくる細胞のはたらきで入れ替わっている。骨粗鬆症ではこわす方が勝っている。薬はこわす側を抑えるか、つくる側を増やす。"
    >
      <rect x="0" y="0" width="640" height="400" fill={PALETTE.paper} />
      <ArrowDefs id="arrRem" color={PALETTE.inkSoft} />
      <ArrowDefs id="arrRemWarn" color={PALETTE.warn} />
      <ArrowDefs id="arrRemGood" color={PALETTE.good} />

      <FigCaption x={320} y={26} size={18}>
        骨は毎日、少しずつ「こわして・つくり直して」います
      </FigCaption>

      {/* シーソー */}
      <g transform="translate(320,215)">
        {/* 支点 */}
        <path d="M -26 62 L 26 62 L 0 14 Z" fill={PALETTE.inkMute} />
        {/* 板：骨吸収が優位なので左が下がっている */}
        <g transform="rotate(-9)">
          <rect x="-220" y="4" width="440" height="14" rx="7" fill={PALETTE.inkSoft} />
        </g>
      </g>

      {/* 左：骨をこわす（破骨細胞） */}
      <g transform="translate(90,86)">
        <rect x="0" y="0" width="200" height="112" rx="14" fill={hiRes ? PALETTE.brandLight : PALETTE.bg} stroke={hiRes ? PALETTE.brand : PALETTE.line} strokeWidth={hiRes ? 3.5 : 1.8} />
        <FigCaption x={100} y={26} size={16} color={PALETTE.warn}>
          骨をこわす細胞
        </FigCaption>
        <text x={100} y={44} textAnchor="middle" fontSize={12} fill={PALETTE.inkMute}>
          （破骨細胞）
        </text>
        {/* 骨を削っているイメージ */}
        <rect x="30" y="80" width="140" height="20" rx="4" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="2" />
        <path d="M 66 80 q 14 20 30 0 q 14 18 28 0" fill={PALETTE.paper} stroke={PALETTE.warn} strokeWidth="2.5" />
        <circle cx="82" cy="66" r="11" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2.5" />
        <circle cx="122" cy="66" r="11" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2.5" />
      </g>

      {/* 右：骨をつくる（骨芽細胞） */}
      <g transform="translate(350,86)">
        <rect x="0" y="0" width="200" height="112" rx="14" fill={hiForm ? PALETTE.goodLight : PALETTE.bg} stroke={hiForm ? PALETTE.good : PALETTE.line} strokeWidth={hiForm ? 3.5 : 1.8} />
        <FigCaption x={100} y={26} size={16} color={PALETTE.good}>
          骨をつくる細胞
        </FigCaption>
        <text x={100} y={44} textAnchor="middle" fontSize={12} fill={PALETTE.inkMute}>
          （骨芽細胞）
        </text>
        <rect x="30" y="80" width="140" height="20" rx="4" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="2" />
        <rect x="60" y="70" width="26" height="10" rx="3" fill={PALETTE.boneDark} stroke={PALETTE.boneEdge} strokeWidth="1.5" />
        <rect x="98" y="70" width="26" height="10" rx="3" fill={PALETTE.boneDark} stroke={PALETTE.boneEdge} strokeWidth="1.5" />
        <circle cx="72" cy="58" r="10" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2.5" />
        <circle cx="112" cy="58" r="10" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2.5" />
      </g>

      {/* 傾きの説明 */}
      <text x={125} y={272} textAnchor="middle" fontSize={16} fontWeight={800} fill={PALETTE.warn}>
        こわす方が勝っている
      </text>
      <text x={125} y={293} textAnchor="middle" fontSize={13} fill={PALETTE.inkSoft}>
        → 骨がだんだん減る
      </text>

      {/* 薬の作用 */}
      <g transform="translate(30,318)">
        <rect x="0" y="0" width="270" height="66" rx="12" fill={hiRes ? PALETTE.brand : PALETTE.paper} stroke={PALETTE.brand} strokeWidth="2.5" />
        <text x={135} y={24} textAnchor="middle" fontSize={15} fontWeight={800} fill={hiRes ? '#fff' : PALETTE.brand}>
          ① 骨をこわすのを抑える薬
        </text>
        <text x={135} y={46} textAnchor="middle" fontSize={12.5} fill={hiRes ? '#fff' : PALETTE.inkSoft}>
          ビスホスホネート／デノスマブ／SERM
        </text>
        <text x={135} y={60} textAnchor="middle" fontSize={12} fill={hiRes ? '#e8f2f9' : PALETTE.inkMute}>
          こわす速さをゆっくりにして、減るのを止める
        </text>
      </g>
      <g transform="translate(340,318)">
        <rect x="0" y="0" width="270" height="66" rx="12" fill={hiForm ? PALETTE.good : PALETTE.paper} stroke={PALETTE.good} strokeWidth="2.5" />
        <text x={135} y={24} textAnchor="middle" fontSize={15} fontWeight={800} fill={hiForm ? '#fff' : PALETTE.good}>
          ② 骨をつくるのを増やす薬
        </text>
        <text x={135} y={46} textAnchor="middle" fontSize={12.5} fill={hiForm ? '#fff' : PALETTE.inkSoft}>
          テリパラチド／アバロパラチド／ロモソズマブ
        </text>
        <text x={135} y={60} textAnchor="middle" fontSize={12} fill={hiForm ? '#e6f2ec' : PALETTE.inkMute}>
          新しい骨を積極的に増やす
        </text>
      </g>

      <line x1="165" y1="300" x2="165" y2="314" stroke={PALETTE.brand} strokeWidth="3" markerEnd="url(#arrRem)" />
      <line x1="475" y1="300" x2="475" y2="314" stroke={PALETTE.good} strokeWidth="3" markerEnd="url(#arrRemGood)" />
    </Figure>
  )
}

// ---------------------------------------------------------------- 骨折の連鎖（ドミノ）

/**
 * 「1回骨折するとその後の骨折が起こりやすくなる」という骨折の連鎖を示す図。
 * 治療の必要性をもっとも実感してもらいやすい図。
 */
export function FractureCascadeFigure() {
  const steps = [
    { label: '手首の骨折', sub: '転んで手をついた', age: '50代〜' },
    { label: '背骨の骨折', sub: '気づかないことも', age: '60代〜' },
    { label: '足の付け根の骨折', sub: '入院・手術', age: '70代〜' },
    { label: '歩けなくなる', sub: '介護が必要に', age: '' },
  ]
  return (
    <Figure
      viewBox="0 0 660 300"
      title="骨折の連鎖（ドミノ倒し）"
      desc="1か所の骨折をきっかけに、次の骨折が起こりやすくなる。治療でこの連鎖を止めることができる。"
    >
      <rect x="0" y="0" width="660" height="300" fill={PALETTE.paper} />
      <ArrowDefs id="arrCas" color={PALETTE.warn} />
      <FigCaption x={330} y={26} size={18}>
        1回の骨折が、次の骨折を招きます
      </FigCaption>
      <text x={330} y={48} textAnchor="middle" fontSize={13.5} fill={PALETTE.inkSoft}>
        骨折したことがある人は、次に骨折する危険が約2倍以上になります
      </text>

      {steps.map((s, i) => {
        const x = 34 + i * 158
        const tilt = i * 5
        return (
          <g key={i}>
            <g transform={`translate(${x},${94}) rotate(${tilt} 60 55)`}>
              <rect
                x="0"
                y="0"
                width="120"
                height="110"
                rx="10"
                fill={i === 3 ? PALETTE.warnLight : PALETTE.bg}
                stroke={i === 3 ? PALETTE.warn : PALETTE.line}
                strokeWidth={i === 3 ? 3 : 2}
              />
              <text x="60" y="34" textAnchor="middle" fontSize="15" fontWeight="800" fill={i === 3 ? PALETTE.warn : PALETTE.ink}>
                {s.label.length > 7 ? s.label.slice(0, 5) : s.label}
              </text>
              {s.label.length > 7 && (
                <text x="60" y="54" textAnchor="middle" fontSize="15" fontWeight="800" fill={i === 3 ? PALETTE.warn : PALETTE.ink}>
                  {s.label.slice(5)}
                </text>
              )}
              <text x="60" y={s.label.length > 7 ? 78 : 60} textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
                {s.sub}
              </text>
              <text x="60" y={s.label.length > 7 ? 96 : 84} textAnchor="middle" fontSize="12" fontWeight="700" fill={PALETTE.inkMute}>
                {s.age}
              </text>
            </g>
            {i < 3 && (
              <line
                x1={x + 126}
                y1="148"
                x2={x + 150}
                y2="148"
                stroke={PALETTE.warn}
                strokeWidth="4"
                markerEnd="url(#arrCas)"
              />
            )}
          </g>
        )
      })}

      {/* 治療で止める */}
      <g transform="translate(120,232)">
        <rect x="0" y="0" width="420" height="52" rx="12" fill={PALETTE.brandLight} stroke={PALETTE.brand} strokeWidth="2.5" />
        <text x="210" y="22" textAnchor="middle" fontSize="15" fontWeight="800" fill={PALETTE.brand}>
          治療は、このドミノを途中で止めるためのものです
        </text>
        <text x="210" y="41" textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
          薬・運動・食事・転倒予防の4つを組み合わせます
        </text>
      </g>
    </Figure>
  )
}

// ---------------------------------------------------------------- 骨折しやすい部位

export function FractureSitesFigure({ marked = [] }: { marked?: ('wrist' | 'spine' | 'hip' | 'humerus')[] }) {
  const on = (k: 'wrist' | 'spine' | 'hip' | 'humerus') => marked.includes(k)
  const mark = (k: 'wrist' | 'spine' | 'hip' | 'humerus') => ({
    fill: on(k) ? PALETTE.warn : PALETTE.warnLight,
    stroke: PALETTE.warn,
    strokeWidth: on(k) ? 4 : 2.5,
  })
  return (
    <Figure
      viewBox="0 0 420 420"
      title="骨粗鬆症で折れやすい4つの場所"
      desc="背骨（椎体）、足の付け根（大腿骨近位部）、手首（橈骨遠位端）、肩の付け根（上腕骨近位部）が折れやすい。"
      maxWidth={420}
    >
      <rect x="0" y="0" width="420" height="420" fill={PALETTE.paper} />
      <FigCaption x={210} y={26} size={18}>
        折れやすいのは、この4か所
      </FigCaption>

      {/* 人体のシルエット */}
      <g fill="#e4e7eb" stroke={PALETTE.line} strokeWidth="2">
        <circle cx="210" cy="76" r="26" />
        <path d="M 210 102 L 210 116 M 178 120 q 32 -10 64 0 L 246 210 q -36 12 -72 0 Z" />
        <rect x="174" y="118" width="72" height="96" rx="14" />
        <path d="M 176 122 L 150 178 L 142 236" strokeLinecap="round" fill="none" strokeWidth="14" stroke="#e4e7eb" />
        <path d="M 244 122 L 270 178 L 278 236" strokeLinecap="round" fill="none" strokeWidth="14" stroke="#e4e7eb" />
        <path d="M 186 214 L 180 300 L 178 372" strokeLinecap="round" fill="none" strokeWidth="18" stroke="#e4e7eb" />
        <path d="M 234 214 L 240 300 L 242 372" strokeLinecap="round" fill="none" strokeWidth="18" stroke="#e4e7eb" />
      </g>

      {/* 背骨 */}
      <g>
        {[132, 148, 164, 180, 196].map((y, i) => (
          <rect key={i} x="202" y={y} width="16" height="12" rx="3" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="1.5" />
        ))}
        <circle cx="210" cy="164" r="24" {...mark('spine')} fillOpacity={0.45} />
      </g>
      {/* 足の付け根 */}
      <circle cx="196" cy="216" r="21" {...mark('hip')} fillOpacity={0.45} />
      {/* 手首 */}
      <circle cx="278" cy="238" r="18" {...mark('wrist')} fillOpacity={0.45} />
      {/* 肩 */}
      <circle cx="252" cy="124" r="17" {...mark('humerus')} fillOpacity={0.45} />

      {/* ラベル */}
      <g fontSize="14" fontWeight="700">
        <line x1="238" y1="164" x2="300" y2="150" stroke={PALETTE.warn} strokeWidth="2" />
        <text x="304" y="148" fill={PALETTE.warn}>背骨（せぼね）</text>
        <text x="304" y="166" fill={PALETTE.inkSoft} fontSize="12" fontWeight="400">丸くなる・身長が縮む</text>

        <line x1="176" y1="216" x2="112" y2="204" stroke={PALETTE.warn} strokeWidth="2" />
        <text x="108" y="200" textAnchor="end" fill={PALETTE.warn}>足の付け根</text>
        <text x="108" y="218" textAnchor="end" fill={PALETTE.inkSoft} fontSize="12" fontWeight="400">入院・手術が必要</text>

        <line x1="296" y1="238" x2="330" y2="262" stroke={PALETTE.warn} strokeWidth="2" />
        <text x="334" y="266" fill={PALETTE.warn}>手首</text>
        <text x="334" y="284" fill={PALETTE.inkSoft} fontSize="12" fontWeight="400">最初のサイン</text>

        <line x1="269" y1="124" x2="316" y2="106" stroke={PALETTE.warn} strokeWidth="2" />
        <text x="320" y="104" fill={PALETTE.warn}>肩の付け根</text>
      </g>

      <text x={210} y={402} textAnchor="middle" fontSize="13" fill={PALETTE.inkSoft}>
        背骨の骨折は、痛みがないまま起きていることがあります
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 骨折リスク区分

const TIER_INFO: Record<
  NonNullable<OsteoporosisAssessment['riskTier']>,
  { label: string; color: string; bg: string; note: string }
> = {
  low: { label: '低い', color: PALETTE.good, bg: PALETTE.goodLight, note: '生活習慣で維持' },
  moderate: { label: '中くらい', color: '#a9702a', bg: '#fdf0dc', note: '骨量減少' },
  high: { label: '高い', color: PALETTE.warn, bg: PALETTE.warnLight, note: '薬による治療' },
  veryHigh: { label: 'きわめて高い', color: '#8f2c0d', bg: '#f9d2c2', note: '骨をつくる薬から' },
  unknown: { label: '判定不能', color: PALETTE.inkMute, bg: PALETTE.bg, note: '情報が不足' },
}

export function RiskTierFigure({ tier }: { tier: OsteoporosisAssessment['riskTier'] }) {
  const order: OsteoporosisAssessment['riskTier'][] = ['low', 'moderate', 'high', 'veryHigh']
  return (
    <Figure
      viewBox="0 0 640 300"
      title="骨折の危険度の区分と現在の位置"
      desc="骨折リスクは低い・中くらい・高い・きわめて高いに分けられ、区分に応じて治療の強さを決める。"
    >
      <rect x="0" y="0" width="640" height="300" fill={PALETTE.paper} />
      <FigCaption x={320} y={26} size={18}>
        あなたの「骨折の危険度」はどのくらい？
      </FigCaption>

      {order.map((t, i) => {
        const info = TIER_INFO[t]
        const h = 46 + i * 38
        const x = 44 + i * 142
        const y = 250 - h
        const active = tier === t
        return (
          <g key={t}>
            <rect
              x={x}
              y={y}
              width="126"
              height={h}
              rx="10"
              fill={active ? info.color : info.bg}
              stroke={info.color}
              strokeWidth={active ? 4 : 2}
            />
            <text x={x + 63} y={y + 26} textAnchor="middle" fontSize="16" fontWeight="800" fill={active ? '#fff' : info.color}>
              {info.label}
            </text>
            <text x={x + 63} y={y + 46} textAnchor="middle" fontSize="12" fill={active ? '#fff' : PALETTE.inkSoft}>
              {info.note}
            </text>
            {active && (
              <g>
                <path
                  d={`M ${x + 63} ${y - 26} L ${x + 53} ${y - 8} L ${x + 73} ${y - 8} Z`}
                  fill={PALETTE.ink}
                />
                <Pill x={x - 6} y={y - 60} w={138} h={30} fill={PALETTE.ink} label="あなたはここ" labelColor="#fff" size={15} />
              </g>
            )}
          </g>
        )
      })}
      <line x1="30" y1="252" x2="612" y2="252" stroke={PALETTE.ink} strokeWidth="2.5" />
      <text x="30" y="274" fontSize="13" fill={PALETTE.inkSoft}>骨折しにくい</text>
      <text x="612" y="274" textAnchor="end" fontSize="13" fontWeight="700" fill={PALETTE.warn}>骨折しやすい</text>
      <text x="320" y="292" textAnchor="middle" fontSize="11.5" fill={PALETTE.inkMute}>
        骨密度・骨折の既往・転倒しやすさ・年齢などから判定します（骨粗鬆症GL2025）
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 背骨の骨折と姿勢の変化

export function SpinePostureFigure({ heightLossCm }: { heightLossCm?: number | null }) {
  return (
    <Figure
      viewBox="0 0 720 380"
      title="背骨の骨折による姿勢の変化と身体への影響"
      desc="背骨がつぶれると背中が丸くなり、身長が縮む。胃酸の逆流、息苦しさ、腰背部痛、転倒しやすさにつながる。"
    >
      <rect x="0" y="0" width="720" height="380" fill={PALETTE.paper} />
      <FigCaption x={360} y={26} size={18}>
        背骨の骨折は、体つき全体に影響します
      </FigCaption>

      {/* 正常な背骨と姿勢 */}
      <g transform="translate(56,54)">
        <FigCaption x={70} y={0} size={15} color={PALETTE.good}>
          もとの背骨
        </FigCaption>
        <path d="M 70 16 q -14 60 0 120 q 12 60 0 118" fill="none" stroke={PALETTE.line} strokeWidth="2" strokeDasharray="4 4" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={58 + Math.sin(i / 3) * 10} y={24 + i * 24} width="26" height="18" rx="4" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="2" />
        ))}
        <line x1="16" y1="24" x2="16" y2="266" stroke={PALETTE.good} strokeWidth="2.5" />
        <text x="8" y="150" textAnchor="end" fontSize="13" fontWeight="700" fill={PALETTE.good} transform="rotate(-90 8 150)">
          身長
        </text>
      </g>

      {/* 骨折した背骨 */}
      <g transform="translate(256,54)">
        <FigCaption x={70} y={0} size={15} color={PALETTE.warn}>
          つぶれた背骨（圧迫骨折）
        </FigCaption>
        {Array.from({ length: 10 }).map((_, i) => {
          const crushed = i === 4 || i === 6
          const bend = Math.sin(i / 2.4) * 22
          return (
            <rect
              key={i}
              x={58 + bend}
              y={24 + i * 22 + (i > 4 ? -3 : 0)}
              width="26"
              height={crushed ? 10 : 18}
              rx="4"
              fill={crushed ? PALETTE.warnLight : PALETTE.bone}
              stroke={crushed ? PALETTE.warn : PALETTE.boneEdge}
              strokeWidth={crushed ? 3 : 2}
              transform={crushed ? `rotate(-7 ${71 + bend} ${29 + i * 22})` : undefined}
            />
          )
        })}
        <line x1="16" y1="24" x2="16" y2="228" stroke={PALETTE.warn} strokeWidth="2.5" />
        <path d="M 10 228 L 22 228 M 10 236 L 22 236" stroke={PALETTE.warn} strokeWidth="2.5" />
        <text x="8" y="130" textAnchor="end" fontSize="13" fontWeight="700" fill={PALETTE.warn} transform="rotate(-90 8 130)">
          縮んだ身長
        </text>
        {heightLossCm != null && heightLossCm > 0 && (
          <Pill x={-12} y={244} w={168} h={30} fill={PALETTE.warnLight} stroke={PALETTE.warn} label={`身長が ${heightLossCm}cm 低下`} labelColor={PALETTE.warn} size={14} />
        )}
      </g>

      {/* 影響 */}
      <g transform="translate(468,54)">
        {[
          '背中・腰が痛む',
          '背中が丸くなる',
          '身長が縮む',
          '胸やけ・食欲が落ちる',
          '息が浅くなる',
          'バランスを崩し転びやすい',
          '次の骨折が起こりやすい',
        ].map((t, i) => (
          <g key={i} transform={`translate(0,${i * 40})`}>
            <circle cx="10" cy="14" r="6" fill={PALETTE.warn} />
            <text x="26" y="19" fontSize="14.5" fill={PALETTE.ink} fontWeight={i >= 5 ? 700 : 400}>
              {t}
            </text>
          </g>
        ))}
      </g>
      <text x={360} y={366} textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
        背骨の骨折の約2/3は、はっきりした痛みがないまま起きています（気づかない骨折）
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 治療の3本柱

export function TreatmentPillarsFigure({ highlight }: { highlight?: 'drug' | 'exercise' | 'nutrition' | null }) {
  const pillars = [
    { key: 'drug', label: 'くすり', sub: '骨を強くする', items: ['骨をこわすのを抑える', '骨をつくるのを増やす'], color: PALETTE.brand, bg: PALETTE.brandLight },
    { key: 'exercise', label: '運動', sub: '骨と筋肉を守る', items: ['骨に刺激を与える', '転ばない体をつくる'], color: PALETTE.good, bg: PALETTE.goodLight },
    { key: 'nutrition', label: '食事', sub: '材料をそろえる', items: ['カルシウム・ビタミンD', 'たんぱく質'], color: '#a9702a', bg: '#fdf0dc' },
  ] as const
  return (
    <Figure
      viewBox="0 0 640 340"
      title="骨粗鬆症治療の3本柱"
      desc="くすり・運動・食事の3つで、骨折しない体を支える。当院では運動療法に特に力を入れている。"
    >
      <rect x="0" y="0" width="640" height="340" fill={PALETTE.paper} />
      {/* 屋根＝目標 */}
      <path d="M 40 92 L 320 26 L 600 92 Z" fill={PALETTE.ink} />
      <text x="320" y="74" textAnchor="middle" fontSize="21" fontWeight="800" fill="#fff">
        骨折しない体
      </text>

      {pillars.map((p, i) => {
        const x = 60 + i * 180
        const active = highlight === p.key
        return (
          <g key={p.key}>
            <rect x={x} y="106" width="160" height="180" rx="12" fill={active ? p.color : p.bg} stroke={p.color} strokeWidth={active ? 4 : 2.5} />
            <text x={x + 80} y="146" textAnchor="middle" fontSize="26" fontWeight="800" fill={active ? '#fff' : p.color}>
              {p.label}
            </text>
            <text x={x + 80} y="170" textAnchor="middle" fontSize="13.5" fill={active ? '#fff' : PALETTE.inkSoft}>
              {p.sub}
            </text>
            {p.items.map((it, j) => (
              <text key={j} x={x + 80} y={206 + j * 26} textAnchor="middle" fontSize="13" fill={active ? '#fff' : PALETTE.inkSoft}>
                ・{it}
              </text>
            ))}
          </g>
        )
      })}
      <Floor x1={40} x2={600} y={292} />
      <text x="320" y="326" textAnchor="middle" fontSize="14" fontWeight="700" fill={PALETTE.inkSoft}>
        どれか1本が欠けても、うまく支えられません
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 逐次療法（薬の切り替え）

/**
 * 骨形成促進薬には投与期間の上限があり、
 * 終了後に骨吸収抑制薬へつなぐ必要があることを示す図。
 * 「途中でやめると元に戻る」という最も伝えたい点を可視化する。
 */
export function SequentialTherapyFigure({ firstDrug }: { firstDrug?: string }) {
  const W = 640
  const H = 320
  return (
    <Figure
      viewBox={`0 0 ${W} ${H}`}
      title="骨形成促進薬のあとに続ける治療（逐次療法）"
      desc="骨をつくる薬は投与できる期間に上限がある。終了後に骨をこわすのを抑える薬へ切り替えないと、増えた骨密度が失われる。"
    >
      <rect x="0" y="0" width={W} height={H} fill={PALETTE.paper} />
      <ArrowDefs id="arrSeq" color={PALETTE.inkSoft} />
      <FigCaption x={320} y={26} size={18}>
        「骨をつくる薬」のあとは、必ず次の薬へつなぎます
      </FigCaption>

      {/* 軸 */}
      <line x1="60" y1="250" x2="600" y2="250" stroke={PALETTE.ink} strokeWidth="2" />
      <line x1="60" y1="70" x2="60" y2="250" stroke={PALETTE.ink} strokeWidth="2" />
      <text x="34" y="164" textAnchor="middle" fontSize="13" fontWeight="700" fill={PALETTE.inkSoft} transform="rotate(-90 34 164)">
        骨密度
      </text>
      <text x="330" y="276" textAnchor="middle" fontSize="13" fontWeight="700" fill={PALETTE.inkSoft}>
        時間
      </text>

      {/* 治療期間の帯 */}
      <rect x="60" y="60" width="200" height="190" fill={PALETTE.goodLight} opacity="0.55" />
      <rect x="260" y="60" width="200" height="190" fill={PALETTE.brandLight} opacity="0.55" />
      <text x="160" y="80" textAnchor="middle" fontSize="14" fontWeight="800" fill={PALETTE.good}>
        {firstDrug ? `${firstDrug}` : '骨をつくる薬'}
      </text>
      <text x="160" y="98" textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
        期間の上限あり（12〜24か月）
      </text>
      <text x="360" y="80" textAnchor="middle" fontSize="14" fontWeight="800" fill={PALETTE.brand}>
        骨をこわすのを抑える薬
      </text>
      <text x="360" y="98" textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
        続けて維持する
      </text>

      {/* 良い経過 */}
      <path d="M 60 226 C 130 190 200 140 260 126 C 330 118 420 114 600 112" fill="none" stroke={PALETTE.good} strokeWidth="5" />
      <circle cx="600" cy="112" r="7" fill={PALETTE.good} />
      <text x="592" y="100" textAnchor="end" fontSize="13.5" fontWeight="800" fill={PALETTE.good}>
        続けた場合：保たれる
      </text>

      {/* 中断した場合 */}
      <path d="M 260 126 C 320 150 400 202 600 232" fill="none" stroke={PALETTE.warn} strokeWidth="5" strokeDasharray="9 6" />
      <circle cx="600" cy="232" r="7" fill={PALETTE.warn} />
      <text x="592" y="224" textAnchor="end" fontSize="13.5" fontWeight="800" fill={PALETTE.warn}>
        やめた場合：元に戻る
      </text>

      {/* 切り替え点 */}
      <line x1="260" y1="60" x2="260" y2="250" stroke={PALETTE.ink} strokeWidth="2.5" strokeDasharray="5 4" />
      <Pill x={196} y={252} w={128} h={30} fill={PALETTE.ink} label="ここで切り替え" labelColor="#fff" size={13.5} />
      <text x="330" y="306" textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
        次の薬の予約を、今日いっしょに取ります
      </text>
    </Figure>
  )
}
