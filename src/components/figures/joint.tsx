import { ArrowDefs, FigCaption, Figure, PALETTE, Pill } from './common'
import { activityBands, activityRatio } from '@/logic/ra'
import type { RaActivityLevel, RaJointRegion } from '@/types'

/* =========================================================================
   関節リウマチの説明図
   ========================================================================= */

// ---------------------------------------------------------------- 正常な関節と滑膜炎

/**
 * 「リウマチは免疫が自分の関節の内張り（滑膜）を攻撃する病気」であることを、
 * 関節の断面で示す図。骨がとけていく仕組みまでを1枚でつなげる。
 */
export function SynoviumFigure() {
  const joint = (x: number, inflamed: boolean) => (
    <g transform={`translate(${x},70)`}>
      {/* 上の骨 */}
      <path d="M 60 0 L 60 46 q -34 6 -34 34 q 0 24 34 26 q 34 -2 34 -26 q 0 -28 -34 -34 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="2.5" />
      {/* 下の骨 */}
      <path d="M 60 200 L 60 152 q -34 -6 -34 -32 q 0 -22 34 -24 q 34 2 34 24 q 0 26 -34 32 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth="2.5" />
      {/* 軟骨 */}
      <path d="M 28 104 q 32 -12 64 0 l 0 6 q -32 -12 -64 0 Z" fill={inflamed ? '#e2e8ec' : '#cfe3ee'} stroke={inflamed ? PALETTE.line : PALETTE.brandMid} strokeWidth="2" />
      <path d="M 28 122 q 32 12 64 0 l 0 -6 q -32 12 -64 0 Z" fill={inflamed ? '#e2e8ec' : '#cfe3ee'} stroke={inflamed ? PALETTE.line : PALETTE.brandMid} strokeWidth="2" />

      {/* 関節を包む膜（滑膜） */}
      <path
        d="M 24 84 q -18 30 0 58"
        fill="none"
        stroke={inflamed ? PALETTE.inflame : PALETTE.good}
        strokeWidth={inflamed ? 13 : 4}
        strokeLinecap="round"
      />
      <path
        d="M 96 84 q 18 30 0 58"
        fill="none"
        stroke={inflamed ? PALETTE.inflame : PALETTE.good}
        strokeWidth={inflamed ? 13 : 4}
        strokeLinecap="round"
      />

      {inflamed && (
        <>
          {/* 炎症細胞 */}
          {[
            [40, 96], [52, 112], [68, 100], [80, 116], [46, 128], [74, 130], [60, 118],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill={PALETTE.inflame} opacity="0.85" />
          ))}
          {/* 骨のふちが溶けている（骨びらん） */}
          <path d="M 30 96 q 8 8 0 14" fill="none" stroke={PALETTE.warn} strokeWidth="3" />
          <path d="M 90 130 q -8 -8 0 -14" fill="none" stroke={PALETTE.warn} strokeWidth="3" />
        </>
      )}
    </g>
  )

  return (
    <Figure
      viewBox="0 0 640 350"
      title="正常な関節とリウマチの関節（滑膜炎）の比較"
      desc="関節の内張りである滑膜が厚く腫れ、炎症細胞が集まって関節液が増え、軟骨と骨が溶けていく。"
    >
      <rect x="0" y="0" width="640" height="350" fill={PALETTE.paper} />
      <FigCaption x={320} y={26} size={18}>
        リウマチは、関節の「内張り」が腫れる病気です
      </FigCaption>

      <g>
        <rect x="34" y="46" width="248" height="252" rx="14" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth="2" />
        <FigCaption x={158} y={68} size={16} color={PALETTE.good}>
          正常な関節
        </FigCaption>
        {joint(98, false)}
      </g>
      <g>
        <rect x="358" y="46" width="248" height="252" rx="14" fill={PALETTE.inflameLight} stroke={PALETTE.inflame} strokeWidth="2.5" />
        <FigCaption x={482} y={68} size={16} color={PALETTE.inflame}>
          リウマチの関節
        </FigCaption>
        {joint(422, true)}
      </g>

      <ArrowDefs id="arrSyn" color={PALETTE.inflame} />
      <line x1="292" y1="172" x2="348" y2="172" stroke={PALETTE.inflame} strokeWidth="4" markerEnd="url(#arrSyn)" />

      <g fontSize="13">
        <text x="158" y="292" textAnchor="middle" fill={PALETTE.inkSoft}>
          内張りは薄く、軟骨がクッションになる
        </text>
        <text x="482" y="278" textAnchor="middle" fill={PALETTE.inflame} fontWeight="700">
          内張りが厚く腫れ、水がたまる
        </text>
        <text x="482" y="294" textAnchor="middle" fill={PALETTE.warn} fontWeight="700">
          軟骨と骨がとけていく（骨びらん）
        </text>
      </g>
      <text x="320" y="330" textAnchor="middle" fontSize="14" fontWeight="700" fill={PALETTE.ink}>
        だから「腫れ」と「朝のこわばり」が出ます。腫れを早く止めることが治療の目的です。
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 関節破壊の進行段階

export function JointDestructionFigure({ current }: { current?: 1 | 2 | 3 | 4 | null }) {
  const stages = [
    { n: 1, label: '腫れ・痛み', sub: '骨はまだ無事', gap: 24, erosion: 0, deform: 0 },
    { n: 2, label: '骨がとけ始める', sub: '骨びらん', gap: 20, erosion: 1, deform: 0 },
    { n: 3, label: 'すき間が狭くなる', sub: '軟骨が失われる', gap: 11, erosion: 2, deform: 1 },
    { n: 4, label: '関節がこわれる', sub: '変形・固まる', gap: 3, erosion: 3, deform: 2 },
  ]
  return (
    <Figure
      viewBox="0 0 660 300"
      title="関節リウマチの関節破壊の進行段階"
      desc="炎症が続くと、骨のふちがとけ、軟骨が失われ、最終的に関節が変形して動かなくなる。壊れた関節は元に戻らない。"
    >
      <rect x="0" y="0" width="660" height="300" fill={PALETTE.paper} />
      <FigCaption x={330} y={26} size={18}>
        炎症を止めないと、関節はこの順にこわれます
      </FigCaption>
      <text x={330} y={47} textAnchor="middle" fontSize="13.5" fill={PALETTE.warn} fontWeight={700}>
        一度こわれた関節は、薬では元に戻りません
      </text>

      {stages.map((s, i) => {
        const x = 26 + i * 160
        const active = current === s.n
        return (
          <g key={s.n}>
            <rect x={x} y="60" width="142" height="180" rx="12" fill={active ? PALETTE.inflameLight : PALETTE.bg} stroke={active ? PALETTE.inflame : PALETTE.line} strokeWidth={active ? 3.5 : 1.8} />
            <text x={x + 71} y="84" textAnchor="middle" fontSize="14" fontWeight="800" fill={active ? PALETTE.inflame : PALETTE.inkSoft}>
              ステージ{s.n}
            </text>

            {/* 関節の模式図 */}
            <g transform={`translate(${x + 71},152)`}>
              {/* 上の骨 */}
              <path
                d={`M -30 -58 L 30 -58 L 30 ${-s.gap / 2} q -30 ${s.erosion >= 2 ? 8 : 5} -60 0 Z`}
                fill={PALETTE.bone}
                stroke={PALETTE.boneEdge}
                strokeWidth="2"
                transform={s.deform >= 2 ? 'rotate(-8)' : undefined}
              />
              {/* 下の骨 */}
              <path
                d={`M -30 58 L 30 58 L 30 ${s.gap / 2} q -30 ${s.erosion >= 2 ? -8 : -5} -60 0 Z`}
                fill={PALETTE.bone}
                stroke={PALETTE.boneEdge}
                strokeWidth="2"
                transform={s.deform >= 2 ? 'rotate(6)' : undefined}
              />
              {/* 炎症した滑膜 */}
              <ellipse cx="0" cy="0" rx={s.n === 1 ? 30 : 26} ry={Math.max(4, s.gap / 2 + 4)} fill={PALETTE.inflame} opacity={s.n === 4 ? 0.25 : 0.55} />
              {/* 骨びらん */}
              {s.erosion > 0 &&
                Array.from({ length: s.erosion }).map((_, k) => (
                  <circle key={k} cx={-20 + k * 20} cy={-s.gap / 2 - 4} r="4.5" fill={PALETTE.paper} stroke={PALETTE.warn} strokeWidth="2" />
                ))}
            </g>

            <text x={x + 71} y="216" textAnchor="middle" fontSize="14" fontWeight="700" fill={PALETTE.ink}>
              {s.label}
            </text>
            <text x={x + 71} y="233" textAnchor="middle" fontSize="12" fill={PALETTE.inkMute}>
              {s.sub}
            </text>
            {active && <Pill x={x + 6} y={248} w={130} h={28} fill={PALETTE.ink} label="いまここ" labelColor="#fff" size={13} />}
          </g>
        )
      })}
      <text x={330} y={292} textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
        だから「痛みが軽いうちに、しっかり炎症を止める」ことがいちばん大切です
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 罹患関節マップ

const REGION_POS: Record<RaJointRegion, { x: number; y: number; r: number; label: string }> = {
  cervical: { x: 150, y: 62, r: 12, label: '首' },
  shoulderR: { x: 112, y: 96, r: 14, label: '右肩' },
  shoulderL: { x: 188, y: 96, r: 14, label: '左肩' },
  elbowR: { x: 92, y: 152, r: 12, label: '右ひじ' },
  elbowL: { x: 208, y: 152, r: 12, label: '左ひじ' },
  wristR: { x: 76, y: 208, r: 11, label: '右手首' },
  wristL: { x: 224, y: 208, r: 11, label: '左手首' },
  mcpR: { x: 66, y: 238, r: 10, label: '右MCP' },
  mcpL: { x: 234, y: 238, r: 10, label: '左MCP' },
  pipR: { x: 58, y: 264, r: 9, label: '右PIP' },
  pipL: { x: 242, y: 264, r: 9, label: '左PIP' },
  hipR: { x: 126, y: 224, r: 13, label: '右股' },
  hipL: { x: 174, y: 224, r: 13, label: '左股' },
  kneeR: { x: 122, y: 306, r: 14, label: '右ひざ' },
  kneeL: { x: 178, y: 306, r: 14, label: '左ひざ' },
  ankleR: { x: 120, y: 372, r: 11, label: '右足首' },
  ankleL: { x: 180, y: 372, r: 11, label: '左足首' },
  mtpR: { x: 116, y: 398, r: 10, label: '右MTP' },
  mtpL: { x: 184, y: 398, r: 10, label: '左MTP' },
}

export function RaJointMapFigure({ regions }: { regions: RaJointRegion[] }) {
  const set = new Set(regions)
  return (
    <Figure
      viewBox="0 0 300 430"
      title="炎症のある関節の分布"
      desc="リウマチは左右対称に、手足の小さな関節から始まりやすい。"
      maxWidth={330}
    >
      <rect x="0" y="0" width="300" height="430" fill={PALETTE.paper} />

      {/* 人体シルエット */}
      <g fill="#e4e7eb" stroke={PALETTE.line} strokeWidth="1.5">
        <circle cx="150" cy="42" r="22" />
        <rect x="120" y="76" width="60" height="110" rx="16" />
        <path d="M 122 84 L 96 148 L 80 206" fill="none" strokeWidth="15" stroke="#e4e7eb" strokeLinecap="round" />
        <path d="M 178 84 L 204 148 L 220 206" fill="none" strokeWidth="15" stroke="#e4e7eb" strokeLinecap="round" />
        <path d="M 132 186 L 124 300 L 121 370" fill="none" strokeWidth="18" stroke="#e4e7eb" strokeLinecap="round" />
        <path d="M 168 186 L 176 300 L 179 370" fill="none" strokeWidth="18" stroke="#e4e7eb" strokeLinecap="round" />
        <ellipse cx="66" cy="248" rx="14" ry="20" />
        <ellipse cx="234" cy="248" rx="14" ry="20" />
        <ellipse cx="116" cy="400" rx="15" ry="10" />
        <ellipse cx="184" cy="400" rx="15" ry="10" />
      </g>

      {/* 関節マーカー */}
      {(Object.keys(REGION_POS) as RaJointRegion[]).map((k) => {
        const p = REGION_POS[k]
        const on = set.has(k)
        return (
          <circle
            key={k}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={on ? PALETTE.inflame : PALETTE.paper}
            fillOpacity={on ? 0.85 : 0.9}
            stroke={on ? PALETTE.inflame : PALETTE.line}
            strokeWidth={on ? 3 : 1.5}
          />
        )
      })}

      <g fontSize="11.5" fill={PALETTE.inkSoft}>
        <circle cx="18" cy="18" r="7" fill={PALETTE.inflame} />
        <text x="30" y="22">炎症あり</text>
        <circle cx="18" cy="40" r="7" fill={PALETTE.paper} stroke={PALETTE.line} strokeWidth="1.5" />
        <text x="30" y="44">問題なし</text>
      </g>
      <text x="150" y="424" textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
        手足の小さな関節・左右対称がリウマチの特徴です
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 疾患活動性メーター

const LEVEL_COLOR: Record<RaActivityLevel, string> = {
  remission: PALETTE.good,
  low: '#7aa03f',
  moderate: '#d99125',
  high: PALETTE.warn,
  unknown: PALETTE.inkMute,
}

const LEVEL_TEXT: Record<RaActivityLevel, string> = {
  remission: '寛解',
  low: '軽い',
  moderate: '中くらい',
  high: '強い',
  unknown: '—',
}

/**
 * 疾患活動性を「炎症の強さメーター」として見せる図。
 * 数値そのものより「どのゾーンにいるか」「目標はどこか」を伝える。
 */
export function ActivityMeterFigure({
  name,
  value,
  level,
}: {
  name: string
  value: number | null
  level: RaActivityLevel
}) {
  const W = 620
  const H = 250
  const cx = W / 2
  const cy = 190
  const R = 130
  const ratio = activityRatio(name, value)
  const bands = activityBands(name)

  // 半円メーター（左＝寛解、右＝高活動性）
  const angleOf = (t: number) => Math.PI - t * Math.PI
  const pt = (t: number, r: number) => [cx + Math.cos(angleOf(t)) * r, cy - Math.sin(angleOf(t)) * r]

  const arc = (from: number, to: number, r: number, rw: number, color: string, key: string) => {
    const [x1, y1] = pt(from, r)
    const [x2, y2] = pt(to, r)
    const [x3, y3] = pt(to, r - rw)
    const [x4, y4] = pt(from, r - rw)
    const large = to - from > 0.5 ? 1 : 0
    return (
      <path
        key={key}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r - rw} ${r - rw} 0 ${large} 0 ${x4} ${y4} Z`}
        fill={color}
      />
    )
  }

  const bandColors = [PALETTE.good, '#a8c46a', '#eec06a', '#e8763c']
  let prev = 0

  return (
    <Figure
      viewBox={`0 0 ${W} ${H}`}
      title="いまの炎症の強さ（疾患活動性）"
      desc="関節の腫れと痛み、患者と医師の評価、血液検査の炎症の数値から計算した指標。左に行くほど炎症が静まっている。"
    >
      <rect x="0" y="0" width={W} height={H} fill={PALETTE.paper} />
      <FigCaption x={cx} y={26} size={18}>
        いまの炎症の強さ
      </FigCaption>

      {bands.map((b, i) => {
        const seg = arc(prev, b.upto, R, 34, bandColors[i] ?? PALETTE.line, `b${i}`)
        prev = b.upto
        return seg
      })}

      {/* 目標ゾーンの明示。メーターの帯ラベルと重ならないよう、左下の空き領域に置く */}
      <g>
        <ArrowDefs id="arrMeter" color={PALETTE.good} size={6} />
        <text x={22} y={cy - 4} fontSize="13.5" fontWeight="800" fill={PALETTE.good}>
          治療の目標は
        </text>
        <text x={22} y={cy + 14} fontSize="13.5" fontWeight="800" fill={PALETTE.good}>
          このゾーン
        </text>
        {(() => {
          const [ax, ay] = pt(bands[0].upto / 2, R - 17)
          return (
            <path
              d={`M 116 ${cy + 2} Q ${(116 + ax) / 2 - 6} ${cy + 10} ${ax - 6} ${ay + 6}`}
              fill="none"
              stroke={PALETTE.good}
              strokeWidth="2.5"
              markerEnd="url(#arrMeter)"
            />
          )
        })()}
      </g>

      {/* 目盛りラベル */}
      {bands.map((b, i) => {
        const start = i === 0 ? 0 : bands[i - 1].upto
        const mid = (start + b.upto) / 2
        const [lx, ly] = pt(mid, R - 17)
        return (
          <text key={`l${i}`} x={lx} y={ly + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
            {b.label}
          </text>
        )
      })}

      {/* 針 */}
      {ratio !== null ? (
        <g>
          {(() => {
            const [nx, ny] = pt(ratio, R - 42)
            return <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
          })()}
          <circle cx={cx} cy={cy} r="12" fill={PALETTE.ink} />
        </g>
      ) : (
        <text x={cx} y={cy - 30} textAnchor="middle" fontSize="15" fill={PALETTE.inkMute}>
          評価に必要な項目が未入力です
        </text>
      )}

      {/* 数値表示 */}
      {value !== null && (
        <g>
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="15" fill={PALETTE.inkSoft}>
            {name}
          </text>
          <text x={cx} y={cy + 60} textAnchor="middle" fontSize="26" fontWeight="800" fill={LEVEL_COLOR[level]}>
            {value.toFixed(1)}
            <tspan fontSize="16" fill={PALETTE.inkSoft}>
              {' '}
              （{LEVEL_TEXT[level]}）
            </tspan>
          </text>
        </g>
      )}
    </Figure>
  )
}

// ---------------------------------------------------------------- T2T のタイムライン

/**
 * Treat to Target（目標を決めて治療する）の考え方を示す図。
 * 「3か月ごとに評価し、6か月で目標に届かなければ治療を変える」を明示する。
 */
export function T2TFigure({ monthsOnTherapy }: { monthsOnTherapy?: number | null }) {
  const W = 660
  const H = 300
  const marks = [0, 3, 6, 9, 12]
  const x = (m: number) => 70 + (m / 12) * 520
  return (
    <Figure
      viewBox={`0 0 ${W} ${H}`}
      title="治療の目標と見直しのタイミング（Treat to Target）"
      desc="3か月ごとに炎症の強さを測り、6か月で目標（寛解または低疾患活動性）に届かなければ治療内容を変更する。"
    >
      <rect x="0" y="0" width={W} height={H} fill={PALETTE.paper} />
      <ArrowDefs id="arrT2T" color={PALETTE.brand} />
      <FigCaption x={330} y={26} size={18}>
        目標を決めて、期限を決めて治療します
      </FigCaption>

      {/* 目標ライン */}
      <rect x="60" y="60" width="540" height="46" rx="10" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2" />
      <text x="330" y="80" textAnchor="middle" fontSize="14.5" fontWeight="800" fill={PALETTE.good}>
        目標：炎症がほぼない状態（寛解）。むずかしい場合は「炎症が弱い状態」を目標にします
      </text>
      <text x="330" y="98" textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
        （長く患っている方・ご高齢の方・他の病気がある方では、低疾患活動性を現実的な目標とします）
      </text>

      {/* 時間軸 */}
      <line x1="60" y1="180" x2="614" y2="180" stroke={PALETTE.ink} strokeWidth="3" markerEnd="url(#arrT2T)" />
      {marks.map((m) => (
        <g key={m}>
          <line x1={x(m)} y1="172" x2={x(m)} y2="188" stroke={PALETTE.ink} strokeWidth="3" />
          <text x={x(m)} y="208" textAnchor="middle" fontSize="14" fontWeight="700" fill={PALETTE.ink}>
            {m === 0 ? '開始' : `${m}か月`}
          </text>
        </g>
      ))}

      {/* 評価ポイント */}
      {[3, 6, 9, 12].map((m) => (
        <g key={`e${m}`}>
          <circle cx={x(m)} cy="180" r="9" fill={PALETTE.brand} />
          <text x={x(m)} y="152" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={PALETTE.brand}>
            評価
          </text>
        </g>
      ))}

      {/* 6か月の判断 */}
      <g>
        <line x1={x(6)} y1="188" x2={x(6)} y2="234" stroke={PALETTE.warn} strokeWidth="2.5" strokeDasharray="5 4" />
        <rect x={x(6) - 118} y="234" width="236" height="46" rx="10" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2" />
        <text x={x(6)} y="254" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={PALETTE.warn}>
          6か月で目標に届かなければ
        </text>
        <text x={x(6)} y="271" textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
          薬の量・種類を見直します
        </text>
      </g>

      {/* 現在位置 */}
      {monthsOnTherapy != null && monthsOnTherapy >= 0 && monthsOnTherapy <= 12 && (
        <g>
          <path d={`M ${x(monthsOnTherapy)} 128 L ${x(monthsOnTherapy) - 9} 114 L ${x(monthsOnTherapy) + 9} 114 Z`} fill={PALETTE.ink} />
          <Pill x={x(monthsOnTherapy) - 52} y={86} w={104} h={28} fill={PALETTE.ink} label="いまここ" labelColor="#fff" size={13} />
        </g>
      )}
    </Figure>
  )
}

// ---------------------------------------------------------------- 薬物治療アルゴリズム

/**
 * 関節リウマチ診療ガイドライン2024改訂の薬物治療アルゴリズムを、
 * 患者さんに「これからの道すじ」として示すための簡略図。
 */
export function RaAlgorithmFigure({ currentPhase }: { currentPhase?: 1 | 2 | 3 | null }) {
  const phases = [
    {
      n: 1,
      title: 'フェーズ I',
      head: 'メトトレキサート（MTX）',
      body: ['リウマチ治療の基本となる薬', '飲み薬または皮下注射', '効果が出るまで4〜8週'],
      note: 'MTXが使えない場合は他の抗リウマチ薬から始めます',
    },
    {
      n: 2,
      title: 'フェーズ II',
      head: '生物学的製剤 または JAK阻害薬を追加',
      body: ['MTXで炎症が十分に収まらないとき', 'まず生物学的製剤（注射）を検討', '飲み薬のJAK阻害薬も選択肢'],
      note: 'ガイドライン2024では生物学的製剤の使用が優先されます',
    },
    {
      n: 3,
      title: 'フェーズ III',
      head: '別の生物学的製剤／JAK阻害薬へ変更',
      body: ['効果が不十分・副作用が出たとき', '作用のしくみが違う薬に切り替える', '選択肢は複数あります'],
      note: '効かない薬に固執せず、次の手に進みます',
    },
  ]
  return (
    <Figure
      viewBox="0 0 660 400"
      title="関節リウマチの薬物治療の進め方"
      desc="メトトレキサートから始め、効果が不十分なら生物学的製剤またはJAK阻害薬を追加・変更していく。"
    >
      <rect x="0" y="0" width="660" height="400" fill={PALETTE.paper} />
      <ArrowDefs id="arrAlg" color={PALETTE.brand} />
      <FigCaption x={330} y={26} size={18}>
        治療は「段階を追って」進めます
      </FigCaption>
      <text x={330} y={46} textAnchor="middle" fontSize="13" fill={PALETTE.inkSoft}>
        どの段階でも、少量のステロイドを一時的な「つなぎ」として使うことがあります
      </text>

      {phases.map((p, i) => {
        const y = 62 + i * 110
        const active = currentPhase === p.n
        return (
          <g key={p.n}>
            <rect x="46" y={y} width="568" height="94" rx="12" fill={active ? PALETTE.brandLight : PALETTE.bg} stroke={active ? PALETTE.brand : PALETTE.line} strokeWidth={active ? 3.5 : 1.8} />
            <rect x="46" y={y} width="112" height="94" rx="12" fill={active ? PALETTE.brand : '#dfe3e8'} />
            <text x="102" y={y + 42} textAnchor="middle" fontSize="16" fontWeight="800" fill={active ? '#fff' : PALETTE.inkSoft}>
              {p.title}
            </text>
            {active && (
              <text x="102" y={y + 66} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff">
                いまここ
              </text>
            )}
            <text x="176" y={y + 28} fontSize="16" fontWeight="800" fill={PALETTE.ink}>
              {p.head}
            </text>
            {p.body.map((b, j) => (
              <text key={j} x="176" y={y + 50 + j * 17} fontSize="12.8" fill={PALETTE.inkSoft}>
                ・{b}
              </text>
            ))}
            <text x="604" y={y + 88} textAnchor="end" fontSize="11.5" fill={PALETTE.brand} fontWeight="700">
              {p.note}
            </text>
            {i < 2 && (
              <g>
                <line x1="330" y1={y + 94} x2="330" y2={y + 108} stroke={PALETTE.brand} strokeWidth="3.5" markerEnd="url(#arrAlg)" />
                <text x="344" y={y + 106} fontSize="11.5" fill={PALETTE.brand} fontWeight="700">
                  6か月で目標に届かなければ
                </text>
              </g>
            )}
          </g>
        )
      })}
      <text x={330} y={390} textAnchor="middle" fontSize="12" fill={PALETTE.inkMute}>
        出典：関節リウマチ診療ガイドライン2024改訂（日本リウマチ学会）を簡略化した説明図
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- MTX の週間カレンダー

/**
 * メトトレキサートの「週1回」を絶対に間違えないための図。
 * 誤って連日服用する事故を防ぐことが目的。
 */
export function MtxCalendarFigure({
  mtxDays = ['土', '日'],
  folateDay = '月',
  mtxDoseText = '朝・夕',
}: {
  mtxDays?: string[]
  folateDay?: string
  mtxDoseText?: string
}) {
  const week = ['月', '火', '水', '木', '金', '土', '日']
  return (
    <Figure
      viewBox="0 0 660 260"
      title="メトトレキサートと葉酸の飲み方（週間カレンダー）"
      desc="メトトレキサートは週1回だけ。飲まない日には葉酸を飲む。毎日飲んではいけない。"
    >
      <rect x="0" y="0" width="660" height="260" fill={PALETTE.paper} />
      <FigCaption x={330} y={26} size={18}>
        メトトレキサートは「週に1回だけ」
      </FigCaption>
      <text x={330} y={48} textAnchor="middle" fontSize="14" fontWeight="800" fill={PALETTE.warn}>
        毎日は絶対に飲みません
      </text>

      {week.map((d, i) => {
        const x = 40 + i * 84
        const isMtx = mtxDays.includes(d)
        const isFolate = d === folateDay
        return (
          <g key={d}>
            <rect
              x={x}
              y="62"
              width="76"
              height="124"
              rx="10"
              fill={isMtx ? PALETTE.brandLight : isFolate ? PALETTE.goodLight : PALETTE.bg}
              stroke={isMtx ? PALETTE.brand : isFolate ? PALETTE.good : PALETTE.line}
              strokeWidth={isMtx ? 3.5 : isFolate ? 2.5 : 1.5}
            />
            <text x={x + 38} y="86" textAnchor="middle" fontSize="17" fontWeight="800" fill={PALETTE.ink}>
              {d}
            </text>
            {isMtx && (
              <g>
                <circle cx={x + 24} cy="118" r="9" fill={PALETTE.brand} />
                <circle cx={x + 52} cy="118" r="9" fill={PALETTE.brand} />
                <text x={x + 38} y="150" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.brand}>
                  MTX
                </text>
                <text x={x + 38} y="168" textAnchor="middle" fontSize="11.5" fill={PALETTE.inkSoft}>
                  {mtxDoseText}
                </text>
              </g>
            )}
            {isFolate && (
              <g>
                <circle cx={x + 38} cy="118" r="9" fill={PALETTE.good} />
                <text x={x + 38} y="150" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.good}>
                  葉酸
                </text>
                <text x={x + 38} y="168" textAnchor="middle" fontSize="11.5" fill={PALETTE.inkSoft}>
                  1回
                </text>
              </g>
            )}
            {!isMtx && !isFolate && (
              <text x={x + 38} y="130" textAnchor="middle" fontSize="13" fill={PALETTE.inkMute}>
                お休み
              </text>
            )}
          </g>
        )
      })}

      <g transform="translate(40,200)">
        <rect x="0" y="0" width="580" height="46" rx="10" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2" />
        <text x="290" y="20" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={PALETTE.warn}>
          飲み忘れたら：翌日までなら飲めます。それ以降は飛ばして次の週に。2回分をまとめて飲まないでください
        </text>
        <text x="290" y="38" textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
          口内炎・のどの痛み・発熱・息切れ・空咳が出たら、飲まずにすぐご連絡ください
        </text>
      </g>
    </Figure>
  )
}

// ---------------------------------------------------------------- 早期治療の重要性

export function WindowOfOpportunityFigure() {
  const W = 640
  const H = 300
  const x0 = 66
  const x1 = 600
  const y0 = 60
  const y1 = 236
  const sx = (m: number) => x0 + (m / 60) * (x1 - x0)
  return (
    <Figure
      viewBox={`0 0 ${W} ${H}`}
      title="早く治療を始めることの意味"
      desc="発症からの最初の2年で関節破壊が最も進む。早期に炎症を抑えれば関節の変形を防げる。"
    >
      <rect x="0" y="0" width={W} height={H} fill={PALETTE.paper} />
      <FigCaption x={W / 2} y={26} size={18}>
        最初の2年が勝負です
      </FigCaption>

      {/* 最初の2年を強調 */}
      <rect x={x0} y={y0} width={sx(24) - x0} height={y1 - y0} fill={PALETTE.brandLight} opacity="0.7" />
      <text x={(x0 + sx(24)) / 2} y={y0 + 20} textAnchor="middle" fontSize="13.5" fontWeight="800" fill={PALETTE.brand}>
        治療の効果が最も大きい時期
      </text>

      {/* 軸 */}
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke={PALETTE.ink} strokeWidth="2.5" />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={PALETTE.ink} strokeWidth="2.5" />
      {[0, 12, 24, 36, 48, 60].map((m) => (
        <g key={m}>
          <line x1={sx(m)} y1={y1} x2={sx(m)} y2={y1 + 6} stroke={PALETTE.ink} strokeWidth="1.5" />
          <text x={sx(m)} y={y1 + 24} textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
            {m === 0 ? '発症' : `${m / 12}年`}
          </text>
        </g>
      ))}
      <text x={30} y={(y0 + y1) / 2} textAnchor="middle" fontSize="13" fontWeight="700" fill={PALETTE.inkSoft} transform={`rotate(-90 30 ${(y0 + y1) / 2})`}>
        関節のこわれ具合
      </text>

      {/* 治療しない場合 */}
      <path d={`M ${sx(0)} ${y1} C ${sx(10)} ${y1 - 70} ${sx(24)} ${y0 + 60} ${sx(40)} ${y0 + 26} L ${sx(60)} ${y0 + 12}`} fill="none" stroke={PALETTE.warn} strokeWidth="5" />
      <text x={sx(58)} y={y0 + 4} textAnchor="end" fontSize="13" fontWeight="800" fill={PALETTE.warn}>
        治療しない場合
      </text>

      {/* 早期治療 */}
      <path d={`M ${sx(0)} ${y1} C ${sx(6)} ${y1 - 22} ${sx(14)} ${y1 - 34} ${sx(24)} ${y1 - 38} L ${sx(60)} ${y1 - 44}`} fill="none" stroke={PALETTE.good} strokeWidth="5" />
      <text x={sx(58)} y={y1 - 52} textAnchor="end" fontSize="13" fontWeight="800" fill={PALETTE.good}>
        すぐに治療を始めた場合
      </text>

      <text x={W / 2} y={288} textAnchor="middle" fontSize="13" fill={PALETTE.inkSoft}>
        いま痛みが軽くても、関節の中では炎症が進んでいることがあります
      </text>
    </Figure>
  )
}
