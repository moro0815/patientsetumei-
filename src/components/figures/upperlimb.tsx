import { ArrowDefs, FigCaption, Figure, MultiText, PALETTE, Pill } from './common'

/**
 * 上肢の図（肩関節周囲炎・上腕骨外側上顆炎・ばね指）
 *
 * この3疾患に共通するのは「時間が味方になる」ことと、
 * 「使い方を変えれば良くなる」ことの2点で、図もそこを狙って描く。
 */

// ================================================================ 肩関節周囲炎

/** 肩の断面：関節包が縮んで硬くなる */
export function FrozenShoulderFigure({ tight = true }: { tight?: boolean }) {
  return (
    <Figure
      viewBox="0 0 560 340"
      title="肩の関節のしくみ（関節包の下のたるみ）"
      desc="正常な肩では関節包の下側にたるみがあり、腕を上げるときに伸びます。拘縮した肩ではこのたるみが厚く縮んでいます"
    >
      <ArrowDefs id="fs-arrow" color={PALETTE.warn} />
      <ArrowDefs id="fs-arrow-b" color={PALETTE.brandMid} />
      <FigCaption x={140} y={26} size={15} color={PALETTE.inkSoft}>
        ゆとりのある肩
      </FigCaption>
      <FigCaption x={420} y={26} size={15} color={PALETTE.warn}>
        いまの肩
      </FigCaption>

      <g transform="translate(20,44)">
        <ShoulderCapsule tight={false} />
      </g>
      <g transform="translate(300,44)">
        <ShoulderCapsule tight={tight} />
      </g>

      <text x={280} y={326} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.ink}>
        腕を上げるとき、関節包の下のたるみが伸びます。ここが厚く縮むと、腕が上がらなくなります
      </text>
    </Figure>
  )
}

/**
 * 肩関節の前後断面（冠状断）。
 *
 * 以前は「大きい袋」と「小さい袋」の対比で描いていたが、
 * 凍結肩で実際に起きているのは袋全体が均一に小さくなることではなく、
 * 関節包の下側（腋窩部）のたるみが厚くなって失われることである。
 * 腕が上がるのはこのたるみが伸びるからで、
 * ここを描き分けないと「なぜ上がらないのか」が伝わらない。
 */
function ShoulderCapsule({ tight }: { tight: boolean }) {
  return (
    <g>
      {/* 肩甲骨の受け皿（関節窩） */}
      <path d="M42 56 Q26 106 42 156 L58 148 Q46 106 58 64 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <text x={8} y={48} fontSize={11.5} fill={PALETTE.inkMute}>
        肩甲骨
      </text>

      {/* 関節包の本体（骨頭を包む部分） */}
      <path
        d="M58 62 Q100 42 134 92 Q140 114 122 128 Q104 140 78 136 Q56 132 56 100 Z"
        fill={tight ? PALETTE.warnLight : PALETTE.brandLight}
        stroke={tight ? PALETTE.warn : PALETTE.brandMid}
        strokeWidth={tight ? 5 : 2.4}
      />

      {/*
        下側のたるみ（腋窩陥凹）。この図の主役。
        ゆとりのある肩では大きく垂れ下がり、ひだが見える。
        拘縮した肩ではほとんど失われ、壁が厚くなる。
      */}
      {tight ? (
        <>
          <path
            d="M76 132 Q72 152 92 156 Q112 154 116 138 Q108 131 100 134 Q88 139 76 132 Z"
            fill={PALETTE.warnLight}
            stroke={PALETTE.warn}
            strokeWidth={6}
          />
          <line x1={100} y1={206} x2={96} y2={162} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#fs-arrow)" />
          <text x={30} y={222} fontSize={11.5} fontWeight={800} fill={PALETTE.warn}>
            下のたるみがなくなり、厚く縮んで
          </text>
          <text x={30} y={237} fontSize={11.5} fontWeight={800} fill={PALETTE.warn}>
            いるため、伸びる余地がありません
          </text>
        </>
      ) : (
        <>
          <path
            d="M72 134 Q60 176 84 190 Q112 196 122 166 Q126 146 116 132 Q94 145 72 134 Z"
            fill={PALETTE.brandLight}
            stroke={PALETTE.brandMid}
            strokeWidth={2.4}
          />
          {/* たるみのひだ */}
          <path d="M78 150 Q94 160 112 151" fill="none" stroke={PALETTE.brandMid} strokeWidth={1.6} />
          <path d="M76 164 Q92 174 116 163" fill="none" stroke={PALETTE.brandMid} strokeWidth={1.6} />
          <line x1={100} y1={206} x2={98} y2={188} stroke={PALETTE.brandMid} strokeWidth={2.5} markerEnd="url(#fs-arrow-b)" />
          <text x={30} y={222} fontSize={11.5} fontWeight={800} fill={PALETTE.brand}>
            下のほうにたるみ（ゆとり）があり
          </text>
          <text x={30} y={237} fontSize={11.5} fontWeight={800} fill={PALETTE.brand}>
            腕を上げるとき、ここが伸びます
          </text>
        </>
      )}

      {/* 上腕骨頭と腕の骨 */}
      <circle cx={96} cy={100} r={32} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <path d="M116 124 L188 178" stroke={PALETTE.boneEdge} strokeWidth={18} strokeLinecap="round" />
      <path d="M116 124 L188 178" stroke={PALETTE.bone} strokeWidth={12} strokeLinecap="round" />
      <text x={194} y={170} fontSize={11.5} fill={PALETTE.inkMute}>
        腕の骨
      </text>

      <Pill
        x={52}
        y={4}
        w={140}
        h={24}
        fill={tight ? PALETTE.warn : PALETTE.brandMid}
        label={tight ? '下の袋が厚く縮む' : '下の袋にゆとりあり'}
        labelColor="#fff"
        size={12}
      />
    </g>
  )
}

/**
 * 肩関節周囲炎の3つの時期。
 * 「今どこにいて、あと何か月か」を示すことが、この疾患の説明の核心。
 */
export function FrozenShoulderPhaseFigure({ phase }: { phase?: 'freezing' | 'frozen' | 'thawing' | null }) {
  const phases = [
    { id: 'freezing', name: '炎症期', period: 'およそ 2〜9か月', pain: 0.92, rom: 0.55, todo: '痛みを抑える\n無理に動かさない' },
    { id: 'frozen', name: '拘縮期', period: 'およそ 4〜12か月', pain: 0.45, rom: 0.3, todo: 'ここが運動の\nいちばん大事な時期' },
    { id: 'thawing', name: '回復期', period: 'およそ 5〜24か月', pain: 0.15, rom: 0.85, todo: '動く範囲が\n戻ってくる' },
  ] as const

  const w = 640
  const left = 70
  const right = w - 30
  const colW = (right - left) / 3
  const top = 62
  const bottom = 176
  const px = (i: number) => left + colW * (i + 0.5)
  const py = (v: number) => bottom - v * (bottom - top)

  return (
    <Figure viewBox={`0 0 ${w} 306`} title="肩関節周囲炎の経過" desc="炎症期・拘縮期・回復期の3つの時期をたどって自然に治っていきます">
      <FigCaption x={w / 2} y={26} size={16}>
        肩関節周囲炎は3つの時期をたどって治っていきます
      </FigCaption>

      {phases.map((p, i) => (
        <rect
          key={p.id}
          x={left + colW * i}
          y={top - 14}
          width={colW}
          height={bottom - top + 14}
          rx={8}
          fill={phase === p.id ? PALETTE.brandLight : i % 2 === 0 ? PALETTE.bg : '#fff'}
          stroke={phase === p.id ? PALETTE.brand : 'none'}
          strokeWidth={phase === p.id ? 2.5 : 0}
        />
      ))}

      {/* 痛み */}
      <polyline
        points={phases.map((p, i) => `${px(i)},${py(p.pain)}`).join(' ')}
        fill="none"
        stroke={PALETTE.warn}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* 動く範囲 */}
      <polyline
        points={phases.map((p, i) => `${px(i)},${py(p.rom)}`).join(' ')}
        fill="none"
        stroke={PALETTE.good}
        strokeWidth={4}
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {phases.map((p, i) => (
        <g key={`pt-${p.id}`}>
          <circle cx={px(i)} cy={py(p.pain)} r={6} fill={PALETTE.warn} stroke="#fff" strokeWidth={2} />
          <circle cx={px(i)} cy={py(p.rom)} r={6} fill={PALETTE.good} stroke="#fff" strokeWidth={2} />
        </g>
      ))}

      <text x={left - 8} y={py(0.92)} textAnchor="end" fontSize={12} fontWeight={700} fill={PALETTE.warn}>
        痛み
      </text>
      <text x={left - 8} y={py(0.3) + 4} textAnchor="end" fontSize={12} fontWeight={700} fill={PALETTE.good}>
        動く範囲
      </text>
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={PALETTE.ink} strokeWidth={2.5} />

      {phases.map((p, i) => (
        <g key={`lb-${p.id}`}>
          <text x={px(i)} y={bottom + 22} textAnchor="middle" fontSize={14} fontWeight={800} fill={phase === p.id ? PALETTE.brand : PALETTE.ink}>
            {p.name}
          </text>
          <text x={px(i)} y={bottom + 40} textAnchor="middle" fontSize={11.5} fill={PALETTE.inkMute}>
            {p.period}
          </text>
          <MultiText x={px(i)} y={bottom + 60} anchor="middle" lines={p.todo.split('\n')} size={11.5} color={PALETTE.inkSoft} weight={600} />
          {phase === p.id && (
            <Pill x={px(i) - 44} y={top - 42} w={88} h={24} fill={PALETTE.brand} label="いまここ" labelColor="#fff" size={12} />
          )}
        </g>
      ))}
      <text x={w / 2} y={298} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        多くの方は1〜2年で自然に良くなります。時期に合った運動が回復を早めます
      </text>
    </Figure>
  )
}

/** 肩の動く範囲（挙上・外旋・結帯）を数値で示す */
export function ShoulderRomFigure({
  flexion,
  abduction,
  externalRotation,
}: {
  flexion?: number | null
  abduction?: number | null
  externalRotation?: number | null
}) {
  const rows = [
    { label: '前から上げる', value: flexion, normal: 180, unit: '°' },
    { label: '横から上げる', value: abduction, normal: 180, unit: '°' },
    { label: '外にひねる', value: externalRotation, normal: 60, unit: '°' },
  ]
  return (
    <Figure viewBox="0 0 560 206" title="肩の動く範囲" desc="いまの可動域を正常と比べています">
      {rows.map((r, i) => {
        const y = 28 + i * 54
        const ratio = r.value != null ? Math.min(1, r.value / r.normal) : null
        return (
          <g key={r.label}>
            <text x={24} y={y + 20} fontSize={13} fontWeight={700} fill={PALETTE.ink}>
              {r.label}
            </text>
            <rect x={150} y={y + 4} width={300} height={24} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} />
            {ratio !== null && (
              <rect
                x={150}
                y={y + 4}
                width={Math.max(6, 300 * ratio)}
                height={24}
                rx={12}
                fill={ratio < 0.6 ? PALETTE.warn : ratio < 0.85 ? '#e0a020' : PALETTE.good}
              />
            )}
            <text x={462} y={y + 21} fontSize={13} fontWeight={800} fill={PALETTE.ink}>
              {r.value != null ? `${r.value}${r.unit}` : '—'}
            </text>
            <text x={150} y={y - 2} fontSize={10.5} fill={PALETTE.inkMute}>
              目安 {r.normal}
              {r.unit}
            </text>
          </g>
        )
      })}
      <text x={280} y={196} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        3か月後にもう一度測って、動く範囲がどれだけ戻ったかを確認します
      </text>
    </Figure>
  )
}

// ================================================================ テニス肘

/** 上腕骨外側上顆炎：手首を反らす筋肉の付け根が傷んでいる */
export function TennisElbowFigure() {
  return (
    <Figure viewBox="0 0 560 300" title="テニス肘（上腕骨外側上顆炎）" desc="手首を反らす筋肉の付け根が、ひじの外側で傷んでいます">
      <ArrowDefs id="te-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={26} size={16}>
        傷んでいるのは「ひじの外側の、筋肉の付け根」です
      </FigCaption>

      {/* 上腕骨 */}
      <path d="M110 60 L160 150" stroke={PALETTE.boneEdge} strokeWidth={30} strokeLinecap="round" />
      <path d="M110 60 L160 150" stroke={PALETTE.bone} strokeWidth={23} strokeLinecap="round" />
      <text x={70} y={70} fontSize={12} fill={PALETTE.inkMute}>
        二の腕の骨
      </text>

      {/* 外側上顆 */}
      <circle cx={166} cy={158} r={20} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.6} />

      {/* 前腕 */}
      <path d="M172 168 L360 214" stroke={PALETTE.boneEdge} strokeWidth={24} strokeLinecap="round" />
      <path d="M172 168 L360 214" stroke={PALETTE.bone} strokeWidth={18} strokeLinecap="round" />
      <path d="M176 186 L358 232" stroke={PALETTE.boneEdge} strokeWidth={18} strokeLinecap="round" />
      <path d="M176 186 L358 232" stroke={PALETTE.bone} strokeWidth={13} strokeLinecap="round" />

      {/* 手首を反らす筋肉（短橈側手根伸筋） */}
      <path
        d="M170 146 Q250 116 340 156 L350 178 Q256 142 176 172 Z"
        fill="#f3d9c4"
        stroke="#c98f60"
        strokeWidth={2}
      />
      <text x={252} y={124} textAnchor="middle" fontSize={12} fontWeight={700} fill="#a06a3c">
        手首を反らす筋肉
      </text>

      {/* 傷んでいる付け根 */}
      <g>
        <circle cx={178} cy={150} r={17} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={3.5} />
        <circle cx={178} cy={150} r={6} fill={PALETTE.warn} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r1 = 22
          const r2 = 32
          const rad = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={178 + r1 * Math.cos(rad)}
              y1={150 + r1 * Math.sin(rad)}
              x2={178 + r2 * Math.cos(rad)}
              y2={150 + r2 * Math.sin(rad)}
              stroke={PALETTE.warn}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )
        })}
      </g>
      <line x1={96} y1={228} x2={158} y2={172} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#te-arrow)" />
      <text x={20} y={246} fontSize={13} fontWeight={800} fill={PALETTE.warn}>
        ここが痛い
      </text>
      <text x={20} y={263} fontSize={11.5} fill={PALETTE.inkSoft}>
        （外側上顆）
      </text>

      {/* 手 */}
      <g transform="translate(360,196)">
        <rect x={0} y={0} width={44} height={40} rx={10} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
        <path d="M44 8 L70 -4 M44 18 L72 12 M44 28 L70 30" stroke={PALETTE.line} strokeWidth={6} strokeLinecap="round" />
      </g>
      <text x={392} y={266} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        物を持つ・タオルを絞る
      </text>
      <text x={392} y={282} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        →筋肉が引っぱられて痛む
      </text>
    </Figure>
  )
}

/** 手首を反らす動作で痛むしくみ（患者さんが自分で確かめられる） */
export function TennisElbowLoadFigure() {
  return (
    <Figure viewBox="0 0 560 220" title="どんな動作で痛むか" desc="手のひらを下にして物を持ち上げる動作でいちばん痛みます">
      <FigCaption x={280} y={24} size={15}>
        こんな動きで痛みが出ます
      </FigCaption>
      {[
        { icon: '🫗', label: 'やかん・鍋を\n持ち上げる' },
        { icon: '🧻', label: 'タオルを\n絞る' },
        { icon: '🖱️', label: 'マウス・キーボード\nを長く使う' },
        { icon: '🎾', label: 'ラケット・道具を\n強く握る' },
      ].map((it, i) => {
        const x = 30 + i * 134
        return (
          <g key={i}>
            <rect x={x} y={40} width={118} height={124} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.6} />
            <text x={x + 59} y={86} textAnchor="middle" fontSize={32}>
              {it.icon}
            </text>
            <MultiText x={x + 59} y={112} anchor="middle" lines={it.label.split('\n')} size={12} color={PALETTE.inkSoft} weight={600} />
          </g>
        )
      })}
      <text x={280} y={196} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        手のひらを上に向けて持つ／両手で持つだけで、ひじへの負担はぐっと減ります
      </text>
    </Figure>
  )
}

// ================================================================ ばね指

/** ばね指：腱と腱鞘（トンネル）の関係 */
export function TriggerFingerFigure({ stage = 2 }: { stage?: 1 | 2 | 3 | 4 }) {
  const swell = [0, 6, 11, 15, 18][stage]
  return (
    <Figure viewBox="0 0 560 300" title="ばね指（狭窄性腱鞘炎）" desc="指を曲げる腱が太くなり、トンネルを通りにくくなっています">
      <ArrowDefs id="tf-arrow" color={PALETTE.warn} />
      <FigCaption x={148} y={26} size={15} color={PALETTE.inkSoft}>
        なめらかに動く指
      </FigCaption>
      <FigCaption x={412} y={26} size={15} color={PALETTE.warn}>
        いまのあなたの指
      </FigCaption>

      <g transform="translate(24,52)">
        <TendonSheath swell={0} />
      </g>
      <g transform="translate(292,52)">
        <TendonSheath swell={swell} />
      </g>

      <text x={280} y={286} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        太くなった腱がトンネルに引っかかり、指がカクンと跳ねます
      </text>
    </Figure>
  )
}

function TendonSheath({ swell }: { swell: number }) {
  const y = 96
  return (
    <g>
      {/* 指の骨 */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={62 + i * 62} y={y - 44} width={52} height={22} rx={8} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2} />
      ))}
      <rect x={4} y={y - 46} width={54} height={26} rx={8} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2} />
      <text x={30} y={y - 56} textAnchor="middle" fontSize={11} fill={PALETTE.inkMute}>
        手のひら
      </text>

      {/* 腱鞘（トンネル） */}
      <rect x={44} y={y - 8} width={44} height={38} rx={8} fill="none" stroke={PALETTE.brandMid} strokeWidth={5} />
      <text x={66} y={y + 52} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={PALETTE.brand}>
        トンネル
      </text>
      <text x={66} y={y + 66} textAnchor="middle" fontSize={10.5} fill={PALETTE.inkMute}>
        （腱鞘）
      </text>

      {/* 腱 */}
      <path
        d={`M10 ${y + 11} L${44} ${y + 11} L${230} ${y + 11}`}
        stroke="#e6c68b"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* こぶ（腫れ） */}
      {swell > 0 && (
        <>
          <ellipse cx={112} cy={y + 11} rx={20 + swell / 2} ry={7 + swell / 2} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={3} />
          <line x1={140} y1={y - 56} x2={118} y2={y - 4} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#tf-arrow)" />
          <text x={146} y={y - 60} fontSize={12} fontWeight={800} fill={PALETTE.warn}>
            腱が太くなる
          </text>
          <text x={146} y={y - 44} fontSize={11} fill={PALETTE.inkSoft}>
            （引っかかる）
          </text>
        </>
      )}
      <text x={232} y={y + 34} textAnchor="end" fontSize={11.5} fontWeight={700} fill={PALETTE.inkSoft}>
        指を曲げる腱
      </text>
    </g>
  )
}

/** ばね指の重症度（Green分類に対応させた患者向けの言い方） */
export function TriggerFingerStageFigure({ stage }: { stage?: 1 | 2 | 3 | 4 | null }) {
  const rows = [
    { id: 1, name: '第1段階', plain: '痛みがあるが、引っかからない' },
    { id: 2, name: '第2段階', plain: 'カクンと引っかかるが、自分で伸ばせる' },
    { id: 3, name: '第3段階', plain: '引っかかると、もう一方の手で伸ばす必要がある' },
    { id: 4, name: '第4段階', plain: '指が曲がったまま伸びない' },
  ]
  return (
    <Figure viewBox="0 0 560 234" title="ばね指の進み具合" desc="4つの段階で治療の選び方が変わります">
      <FigCaption x={280} y={24} size={15}>
        いまの段階と、これからの治療
      </FigCaption>
      {rows.map((r, i) => {
        const on = stage === r.id
        const y = 44 + i * 44
        return (
          <g key={r.id}>
            <rect
              x={24}
              y={y}
              width={512}
              height={36}
              rx={8}
              fill={on ? PALETTE.warnLight : PALETTE.bg}
              stroke={on ? PALETTE.warn : PALETTE.line}
              strokeWidth={on ? 2.6 : 1.2}
            />
            <text x={44} y={y + 23} fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              {r.name}
            </text>
            <text x={124} y={y + 23} fontSize={12.5} fontWeight={on ? 700 : 400} fill={PALETTE.ink}>
              {r.plain}
            </text>
            {on && (
              <text x={520} y={y + 23} textAnchor="end" fontSize={12} fontWeight={800} fill={PALETTE.warn}>
                ← いまここ
              </text>
            )}
          </g>
        )
      })}
      <text x={280} y={226} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        第1〜2段階では注射がよく効きます。伸びなくなった場合は手術を相談します
      </text>
    </Figure>
  )
}

// ================================================================ ドケルバン腱鞘炎

/**
 * ドケルバン腱鞘炎（狭窄性腱鞘炎・母指）。
 *
 * ばね指が「手のひら側で腱が引っかかる」のに対し、
 * こちらは「手首の親指側で腱がトンネルを通れなくなる」病気。
 * 場所がまったく違うので、手首を親指側から見た図で示す。
 */
export function DeQuervainFigure({ swollen = true }: { swollen?: boolean }) {
  return (
    <Figure
      viewBox="0 0 560 310"
      title="ドケルバン腱鞘炎（手首の親指側）"
      desc="親指を動かす2本の腱が、手首のトンネルの中で通りにくくなっています"
    >
      <ArrowDefs id="dq-arrow" color={PALETTE.warn} />
      <FigCaption x={148} y={26} size={15} color={PALETTE.inkSoft}>
        なめらかに動く手首
      </FigCaption>
      <FigCaption x={412} y={26} size={15} color={PALETTE.warn}>
        いまのあなたの手首
      </FigCaption>

      <g transform="translate(20,44)">
        <ThumbCompartment swell={0} />
      </g>
      <g transform="translate(288,44)">
        <ThumbCompartment swell={swollen ? 12 : 0} />
      </g>

      <text x={280} y={296} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        腱とトンネルがこすれて腫れ、親指を動かすたびに手首の親指側が痛みます
      </text>
    </Figure>
  )
}

/** 手首を親指側から見た図。swell が大きいほどトンネルと腱が腫れている */
function ThumbCompartment({ swell }: { swell: number }) {
  const cx = 128
  const cy = 96
  return (
    <g>
      {/* 前腕（橈骨） */}
      <path d="M4 78 L104 72 L118 104 L8 108 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <text x={36} y={128} fontSize={11} fill={PALETTE.inkMute}>
        前腕の骨
      </text>
      {/* 橈骨茎状突起（トンネルが乗る出っぱり） */}
      <ellipse cx={118} cy={92} rx={18} ry={16} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />

      {/* 手の甲 */}
      <path d="M130 74 L206 82 Q222 86 218 102 L134 110 Z" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      <text x={186} y={128} fontSize={11} fill={PALETTE.inkMute}>
        手の甲
      </text>

      {/* 親指 */}
      <path d="M132 78 L176 34 Q186 24 196 34 L156 84 Z" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      <text x={196} y={30} fontSize={11.5} fontWeight={700} fill={PALETTE.inkSoft}>
        親指
      </text>

      {/* 親指を動かす2本の腱 */}
      <path d="M14 92 Q80 88 122 86 Q152 62 184 40" fill="none" stroke="#e6c68b" strokeWidth={8} strokeLinecap="round" />
      <path d="M16 100 Q82 96 126 94 Q154 72 188 50" fill="none" stroke="#e6c68b" strokeWidth={8} strokeLinecap="round" />

      {/* トンネル（伸筋支帯） */}
      <rect
        x={100}
        y={68}
        width={36}
        height={40}
        rx={9}
        fill="none"
        stroke={swell > 0 ? PALETTE.warn : PALETTE.brandMid}
        strokeWidth={swell > 0 ? 6 : 5}
      />
      <text x={118} y={152} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={swell > 0 ? PALETTE.warn : PALETTE.brand}>
        トンネル
      </text>
      <text x={118} y={166} textAnchor="middle" fontSize={10.5} fill={PALETTE.inkMute}>
        （腱鞘）
      </text>

      {/* 腫れ */}
      {swell > 0 && (
        <>
          <ellipse cx={cx - 10} cy={cy - 6} rx={22 + swell / 2} ry={16 + swell / 3} fill={PALETTE.warnLight} opacity={0.75} stroke={PALETTE.warn} strokeWidth={3} />
          <line x1={92} y1={22} x2={112} y2={62} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#dq-arrow)" />
          <text x={2} y={16} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            トンネルが厚くなり
          </text>
          <text x={2} y={32} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            腱も腫れて通りにくい
          </text>
        </>
      )}

      <text x={62} y={186} fontSize={11.5} fontWeight={700} fill="#a06a3c">
        親指を動かす2本の腱
      </text>
    </g>
  )
}

/**
 * 患者さん自身が確かめられる誘発テスト。
 * 診察室で一度やってもらうと、痛みの正体が「この腱」だと納得されやすい。
 */
export function ThumbProvocationFigure() {
  return (
    <Figure viewBox="0 0 560 250" title="この動きで痛むか確かめます" desc="親指を握り込んで、手首を小指側へ倒すと痛みが走ります">
      <ArrowDefs id="dq2-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={26} size={16}>
        この動きで、手首の親指側が痛みますか
      </FigCaption>

      {/* 前腕 */}
      <path d="M40 96 L168 92 L172 138 L44 142 Z" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      {/* こぶし（親指を中に握り込む） */}
      <g transform="rotate(22 190 116)">
        <rect x={168} y={80} width={78} height={68} rx={20} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2.5} />
        <path d="M180 96 L214 96 M180 112 L216 112 M180 128 L212 128" stroke={PALETTE.line} strokeWidth={2} />
        <path d="M188 92 Q206 104 200 130" fill="none" stroke={PALETTE.brandMid} strokeWidth={5} strokeLinecap="round" />
        <text x={252} y={96} fontSize={11.5} fontWeight={700} fill={PALETTE.brandMid}>
          親指を
        </text>
        <text x={252} y={111} fontSize={11.5} fontWeight={700} fill={PALETTE.brandMid}>
          中に握り込む
        </text>
      </g>

      {/* 倒す向き */}
      <path d="M232 176 Q212 200 176 200" fill="none" stroke={PALETTE.warn} strokeWidth={3.5} markerEnd="url(#dq2-arrow)" />
      <text x={244} y={188} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
        手首を小指側へ倒す
      </text>

      {/* 痛む場所 */}
      <circle cx={162} cy={98} r={15} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={3.5} />
      <circle cx={162} cy={98} r={5} fill={PALETTE.warn} />
      <line x1={100} y1={48} x2={148} y2={86} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#dq2-arrow)" />
      <text x={24} y={44} fontSize={13} fontWeight={800} fill={PALETTE.warn}>
        ここが痛む
      </text>

      <text x={280} y={234} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.inkSoft}>
        痛みが走れば、この2本の腱が原因である可能性が高いということです
      </text>
    </Figure>
  )
}

/** 誘因になる日常動作（産後の抱っこ・スマートフォン・家事） */
export function ThumbLoadFigure() {
  return (
    <Figure viewBox="0 0 560 220" title="どんな動作で痛むか" desc="親指を広げて力を入れる動作でいちばん痛みます">
      <FigCaption x={280} y={24} size={15}>
        こんな動きで痛みが出ます
      </FigCaption>
      {[
        { icon: '👶', label: '赤ちゃんを\n抱き上げる' },
        { icon: '📱', label: 'スマートフォンを\n片手で持って操作' },
        { icon: '🧻', label: 'タオル・雑巾を\n絞る' },
        { icon: '🫙', label: 'ふたを開ける\n物をつまみ上げる' },
      ].map((it, i) => {
        const x = 30 + i * 134
        return (
          <g key={i}>
            <rect x={x} y={40} width={118} height={124} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.6} />
            <text x={x + 59} y={86} textAnchor="middle" fontSize={32}>
              {it.icon}
            </text>
            <MultiText x={x + 59} y={112} anchor="middle" lines={it.label.split('\n')} size={11.5} color={PALETTE.inkSoft} weight={600} />
          </g>
        )
      })}
      <text x={280} y={196} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        抱き上げるときは、親指を使わず「手のひら全体ですくう」と負担が減ります
      </text>
    </Figure>
  )
}
