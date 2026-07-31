import { FigCaption, Figure, PALETTE, Pill } from './common'

/* =========================================================================
   栄養・転倒予防・通院スケジュールの図
   ========================================================================= */

// ---------------------------------------------------------------- 1日にとりたい食品

/**
 * 「カルシウム700〜800mg」と言われても実感がないため、
 * 具体的な食品の組み合わせで1日分を示す図。
 */
export function DailyFoodFigure() {
  const items = [
    { label: '牛乳', sub: 'コップ1杯', ca: 220, icon: 'milk' },
    { label: 'ヨーグルト', sub: '1個', ca: 120, icon: 'yogurt' },
    { label: '木綿豆腐', sub: '1/2丁', ca: 180, icon: 'tofu' },
    { label: '小松菜', sub: '小鉢1杯', ca: 100, icon: 'greens' },
    { label: 'しらす・小魚', sub: '大さじ2', ca: 52, icon: 'fish' },
  ] as const
  const total = items.reduce((s, i) => s + i.ca, 0)

  const icon = (kind: string, x: number, y: number) => {
    switch (kind) {
      case 'milk':
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M -14 -20 L 14 -20 L 11 22 L -11 22 Z" fill={PALETTE.paper} stroke={PALETTE.ink} strokeWidth="2.5" />
            <path d="M -12 -4 L 12 -4 L 10 22 L -10 22 Z" fill="#e8f1f7" />
          </g>
        )
      case 'yogurt':
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M -15 -8 L 15 -8 L 11 22 L -11 22 Z" fill="#f7f3e8" stroke={PALETTE.ink} strokeWidth="2.5" />
            <rect x="-17" y="-14" width="34" height="7" rx="2" fill={PALETTE.bone} stroke={PALETTE.ink} strokeWidth="2" />
          </g>
        )
      case 'tofu':
        return (
          <g transform={`translate(${x},${y})`}>
            <rect x="-17" y="-10" width="34" height="28" rx="3" fill="#f8f6ee" stroke={PALETTE.ink} strokeWidth="2.5" />
            <line x1="-17" y1="0" x2="17" y2="0" stroke={PALETTE.line} strokeWidth="1.5" />
          </g>
        )
      case 'greens':
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M 0 20 q -20 -14 -14 -34 q 14 6 14 34" fill="#cfe3c4" stroke={PALETTE.good} strokeWidth="2.5" />
            <path d="M 0 20 q 20 -14 14 -34 q -14 6 -14 34" fill="#cfe3c4" stroke={PALETTE.good} strokeWidth="2.5" />
            <line x1="0" y1="20" x2="0" y2="-8" stroke={PALETTE.good} strokeWidth="2.5" />
          </g>
        )
      default:
        return (
          <g transform={`translate(${x},${y})`}>
            <path d="M -18 4 q 14 -16 30 0 q -14 16 -30 0 Z" fill="#e5eef2" stroke={PALETTE.ink} strokeWidth="2.5" />
            <path d="M 12 4 l 8 -7 l 0 14 Z" fill="#e5eef2" stroke={PALETTE.ink} strokeWidth="2.5" />
            <circle cx="-6" cy="1" r="1.8" fill={PALETTE.ink} />
          </g>
        )
    }
  }

  return (
    <Figure
      viewBox="0 0 640 260"
      title="1日にとりたいカルシウムの目安"
      desc="牛乳・ヨーグルト・豆腐・青菜・小魚を組み合わせると1日700〜800mgのカルシウムに届く。"
    >
      <rect x="0" y="0" width="640" height="260" fill={PALETTE.paper} />
      <FigCaption x={320} y={26} size={18}>
        1日にとりたいカルシウム＝700〜800mg
      </FigCaption>
      <text x={320} y={46} textAnchor="middle" fontSize="13" fill={PALETTE.inkSoft}>
        たとえば、この組み合わせでほぼ1日分です
      </text>

      {items.map((it, i) => {
        const x = 62 + i * 122
        return (
          <g key={it.label}>
            <rect x={x - 52} y={64} width="104" height="126" rx="12" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth="1.8" />
            {icon(it.icon, x, 108)}
            <text x={x} y={152} textAnchor="middle" fontSize="14" fontWeight="800" fill={PALETTE.ink}>
              {it.label}
            </text>
            <text x={x} y={169} textAnchor="middle" fontSize="11.5" fill={PALETTE.inkSoft}>
              {it.sub}
            </text>
            <text x={x} y={184} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.brand}>
              {it.ca}mg
            </text>
            {i < items.length - 1 && (
              <text x={x + 61} y={130} textAnchor="middle" fontSize="20" fontWeight="800" fill={PALETTE.inkMute}>
                ＋
              </text>
            )}
          </g>
        )
      })}

      <g transform="translate(150,204)">
        <rect x="0" y="0" width="340" height="42" rx="10" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2.5" />
        <text x="170" y="27" textAnchor="middle" fontSize="16" fontWeight="800" fill={PALETTE.good}>
          合計 約{total}mg ＋ 魚（ビタミンD）＋ 納豆（ビタミンK）
        </text>
      </g>
    </Figure>
  )
}

// ---------------------------------------------------------------- 栄養素の役割

export function NutrientRoleFigure() {
  return (
    <Figure
      viewBox="0 0 620 280"
      title="骨をつくる栄養素の役割"
      desc="カルシウムは材料、ビタミンDは吸収を助ける運び手、ビタミンKは骨に定着させる接着剤、たんぱく質は骨の土台と筋肉。"
    >
      <rect x="0" y="0" width="620" height="280" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        骨づくりは「チーム」で成り立ちます
      </FigCaption>

      {[
        { name: 'カルシウム', role: '骨の材料そのもの', amount: '700〜800mg/日', color: PALETTE.brand, bg: PALETTE.brandLight, ex: '牛乳・豆腐・青菜・小魚' },
        { name: 'ビタミンD', role: '腸から吸収する運び手', amount: '15〜20μg/日', color: PALETTE.good, bg: PALETTE.goodLight, ex: 'さけ・さんま・きのこ・日光' },
        { name: 'ビタミンK', role: '骨に定着させる接着剤', amount: '250〜300μg/日', color: '#a9702a', bg: '#fdf0dc', ex: '納豆・ほうれん草・小松菜' },
        { name: 'たんぱく質', role: '骨の土台と筋肉の材料', amount: '体重1kgに1.0〜1.2g/日', color: PALETTE.purple, bg: PALETTE.purpleLight, ex: '肉・魚・卵・大豆' },
      ].map((n, i) => {
        const y = 48 + i * 56
        return (
          <g key={n.name}>
            <rect x="36" y={y} width="548" height="48" rx="10" fill={n.bg} stroke={n.color} strokeWidth="2" />
            <rect x="36" y={y} width="150" height="48" rx="10" fill={n.color} />
            <text x="111" y={y + 30} textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">
              {n.name}
            </text>
            <text x="200" y={y + 21} fontSize="14" fontWeight="700" fill={PALETTE.ink}>
              {n.role}
            </text>
            <text x="200" y={y + 39} fontSize="12" fill={PALETTE.inkSoft}>
              {n.ex}
            </text>
            <text x="572" y={y + 30} textAnchor="end" fontSize="13.5" fontWeight="800" fill={n.color}>
              {n.amount}
            </text>
          </g>
        )
      })}
      <text x="310" y="272" textAnchor="middle" fontSize="12" fill={PALETTE.inkMute}>
        ワルファリン服用中の方は納豆・青汁・クロレラを避けてください（ビタミンKが薬の効果を弱めます）
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 家の中の転倒危険マップ

export function FallPreventionMapFigure() {
  const rooms = [
    { name: '玄関', x: 40, y: 60, w: 130, h: 92, risk: '段差・靴の履き替え', fix: '腰かけ椅子・手すり' },
    { name: '廊下', x: 178, y: 60, w: 88, h: 200, risk: '暗い・コード', fix: '足元灯・コード整理' },
    { name: '浴室', x: 274, y: 60, w: 130, h: 92, risk: '床が滑る・段差', fix: '滑り止め・手すり' },
    { name: 'トイレ', x: 412, y: 60, w: 148, h: 92, risk: '立ち座りでふらつく', fix: '縦手すり・足元灯' },
    { name: '居間', x: 40, y: 160, w: 130, h: 100, risk: '敷物のめくれ', fix: '端を固定・片付け' },
    { name: '寝室', x: 274, y: 160, w: 286, h: 100, risk: '夜間の暗さ・低いベッド', fix: '足元灯・高めのベッド' },
  ]
  return (
    <Figure
      viewBox="0 0 620 320"
      title="家の中の転ぶ危険と対策"
      desc="玄関・浴室・トイレ・廊下・寝室に転倒の危険が集まる。手すり・足元灯・滑り止めで対策する。"
    >
      <rect x="0" y="0" width="620" height="320" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        骨折の多くは「家の中」で起きています
      </FigCaption>
      <text x={310} y={46} textAnchor="middle" fontSize="12.5" fill={PALETTE.inkSoft}>
        危ないところと、その対策
      </text>

      {rooms.map((r) => (
        <g key={r.name}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth="2" />
          <text x={r.x + 10} y={r.y + 22} fontSize="15" fontWeight="800" fill={PALETTE.ink}>
            {r.name}
          </text>
          <circle cx={r.x + r.w - 18} cy={r.y + 18} r="10" fill={PALETTE.warn} />
          <text x={r.x + r.w - 18} y={r.y + 23} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
            !
          </text>
          <text x={r.x + 10} y={r.y + 44} fontSize="11.5" fill={PALETTE.warn} fontWeight="700">
            {r.risk}
          </text>
          <text x={r.x + 10} y={r.y + 62} fontSize="11.5" fill={PALETTE.good} fontWeight="700">
            → {r.fix}
          </text>
        </g>
      ))}

      <g transform="translate(40,272)">
        <rect x="0" y="0" width="520" height="38" rx="9" fill={PALETTE.brandLight} stroke={PALETTE.brand} strokeWidth="2" />
        <text x="260" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill={PALETTE.brand}>
          室内でもかかとのある靴を。ふらつく薬（睡眠薬・降圧薬）があれば必ずご相談ください
        </text>
      </g>
    </Figure>
  )
}

// ---------------------------------------------------------------- 通院・検査のスケジュール

export function FollowUpScheduleFigure({
  items,
}: {
  items: { month: string; label: string; detail: string }[]
}) {
  const W = 640
  const H = 130 + items.length * 0
  const step = (W - 100) / Math.max(1, items.length - 1)
  return (
    <Figure
      viewBox={`0 0 ${W} ${Math.max(190, H)}`}
      title="これからの通院と検査の予定"
      desc="治療開始後の通院間隔と、必要な検査のタイミング。"
    >
      <rect x="0" y="0" width={W} height={Math.max(190, H)} fill={PALETTE.paper} />
      <FigCaption x={W / 2} y={26} size={17}>
        これからの予定
      </FigCaption>
      <line x1="50" y1="86" x2={W - 50} y2="86" stroke={PALETTE.brand} strokeWidth="4" />
      {items.map((it, i) => {
        const x = 50 + i * step
        return (
          <g key={i}>
            <circle cx={x} cy="86" r="11" fill={PALETTE.paper} stroke={PALETTE.brand} strokeWidth="4" />
            <Pill x={x - 44} y={50} w={88} h={26} fill={PALETTE.brand} label={it.month} labelColor="#fff" size={12.5} />
            <text x={x} y={116} textAnchor="middle" fontSize="13.5" fontWeight="800" fill={PALETTE.ink}>
              {it.label}
            </text>
            <text x={x} y={136} textAnchor="middle" fontSize="11.5" fill={PALETTE.inkSoft}>
              {it.detail}
            </text>
          </g>
        )
      })}
    </Figure>
  )
}

// ---------------------------------------------------------------- 歯科連携

export function DentalCoordinationFigure() {
  return (
    <Figure
      viewBox="0 0 620 230"
      title="骨の薬と歯科治療の関係"
      desc="骨吸収抑制薬の使用中は、まれに顎の骨の障害が起こる。抜歯のために薬を休むことは原則しない。治療前の歯科受診と口腔ケアが最も大切。"
    >
      <rect x="0" y="0" width="620" height="230" fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={18}>
        骨の薬を始める前に、歯科をひとつ済ませましょう
      </FigCaption>

      {[
        { n: '1', label: '開始前', body: ['むし歯・歯周病の治療', '抜歯が必要ならこの時期に', '入れ歯の調整'], color: PALETTE.brand },
        { n: '2', label: '治療中', body: ['3〜6か月ごとの歯科受診', '毎日の歯みがき・口腔ケア', '骨の薬を使っていると伝える'], color: PALETTE.good },
        { n: '3', label: '抜歯が必要になったら', body: ['薬は原則、休みません', '歯科と当院で情報を共有します', '自己判断で中断しないでください'], color: PALETTE.warn },
      ].map((s, i) => {
        const x = 30 + i * 194
        return (
          <g key={s.n}>
            <rect x={x} y="48" width="180" height="132" rx="12" fill={PALETTE.paper} stroke={s.color} strokeWidth="2.5" />
            <circle cx={x + 26} cy="74" r="15" fill={s.color} />
            <text x={x + 26} y="79" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">
              {s.n}
            </text>
            <text x={x + 50} y="80" fontSize="15" fontWeight="800" fill={s.color}>
              {s.label}
            </text>
            {s.body.map((b, j) => (
              <text key={j} x={x + 14} y={110 + j * 22} fontSize="12" fill={PALETTE.inkSoft}>
                ・{b}
              </text>
            ))}
          </g>
        )
      })}
      <text x={310} y={206} textAnchor="middle" fontSize="12" fill={PALETTE.inkSoft}>
        顎の骨の障害はまれですが、口の中を清潔に保つことで危険を大きく減らせます
      </text>
      <text x={310} y={222} textAnchor="middle" fontSize="11" fill={PALETTE.inkMute}>
        出典：顎骨壊死検討委員会ポジションペーパー2023（抜歯時の骨吸収抑制薬の休薬は原則行わない）
      </text>
    </Figure>
  )
}

// ---------------------------------------------------------------- 治療費のイメージ

export function CostFigure({ rows }: { rows: { label: string; monthly: string; note?: string }[] }) {
  return (
    <Figure
      viewBox={`0 0 620 ${70 + rows.length * 44}`}
      title="治療費のめやす"
      desc="薬ごとの1か月の自己負担のめやす（3割負担）。高額療養費制度で実際の負担が下がる場合がある。"
    >
      <rect x="0" y="0" width="620" height={70 + rows.length * 44} fill={PALETTE.paper} />
      <FigCaption x={310} y={26} size={17}>
        治療費のめやす（3割負担・1か月）
      </FigCaption>
      {rows.map((r, i) => {
        const y = 44 + i * 44
        return (
          <g key={i}>
            <rect x="30" y={y} width="560" height="38" rx="8" fill={i % 2 === 0 ? PALETTE.bg : PALETTE.paper} stroke={PALETTE.line} strokeWidth="1.5" />
            <text x="44" y={y + 24} fontSize="13.5" fontWeight="700" fill={PALETTE.ink}>
              {r.label}
            </text>
            <text x="576" y={y + 24} textAnchor="end" fontSize="14" fontWeight="800" fill={PALETTE.brand}>
              {r.monthly}
            </text>
            {r.note && (
              <text x="380" y={y + 24} textAnchor="end" fontSize="11" fill={PALETTE.inkMute}>
                {r.note}
              </text>
            )}
          </g>
        )
      })}
    </Figure>
  )
}
