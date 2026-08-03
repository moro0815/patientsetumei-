import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDefs, FigCaption, Figure, MultiText, PALETTE, Pill } from './common'

/**
 * 脊椎の図（腰部脊柱管狭窄症・腰椎椎間板ヘルニア・頚椎症性神経根症・脊椎圧迫骨折）
 *
 * 描き方の方針
 * - 解剖学的な正確さより「なぜ症状が出るか」が2秒で伝わることを優先する。
 *   ただし、椎体・椎間板・神経の位置関係だけは間違えない。
 * - 患者さんが自分の姿勢・症状と結びつけられるよう、可能なかぎり
 *   「前かがみだと楽」「反ると痛い」といった動作と一緒に描く。
 */

// ================================================================ 腰部脊柱管狭窄症

/**
 * 腰椎の横断面（輪切り）で、神経の通り道が狭くなる様子を示す。
 * severity 0（正常）〜3（高度）で狭窄の程度が変わる。
 */
export function SpinalCanalCrossFigure({ severity = 2 }: { severity?: 0 | 1 | 2 | 3 }) {
  // 黄色靱帯の厚み・椎間関節の肥大・椎間板の膨隆で狭くする
  const thick = [0, 6, 12, 18][severity]
  const bulge = [0, 5, 10, 15][severity]
  const canalLabel = ['ゆとりがあります', 'すこし狭い', '狭い', 'かなり狭い'][severity]

  return (
    <Figure
      viewBox="0 0 560 320"
      title="背骨の輪切り：神経の通り道（脊柱管）"
      desc={`神経の通り道が${canalLabel}状態です`}
    >
      <ArrowDefs id="canal-arrow" color={PALETTE.warn} />
      <FigCaption x={140} y={26} size={15} color={PALETTE.inkSoft}>
        ゆとりのある背骨
      </FigCaption>
      <FigCaption x={410} y={26} size={15} color={PALETTE.warn}>
        いまのあなたの背骨
      </FigCaption>

      <g transform="translate(20,44)">
        <CanalCross thick={0} bulge={0} />
      </g>
      <g transform="translate(290,44)">
        <CanalCross thick={thick} bulge={bulge} />
      </g>

      <text x={280} y={306} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        神経の通り道（トンネル）が狭くなり、神経が押されて足がしびれます
      </text>
    </Figure>
  )
}

function CanalCross({ thick, bulge }: { thick: number; bulge: number }) {
  const cx = 125
  const cy = 118
  return (
    <g>
      {/* 椎体（前方） */}
      <ellipse cx={cx} cy={cy + 44} rx={78} ry={40} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.5} />
      <text x={cx} y={cy + 50} textAnchor="middle" fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
        背骨の本体
      </text>

      {/* 椎弓（後方のアーチ） */}
      <path
        d={`M${cx - 74} ${cy + 20} Q${cx - 96} ${cy - 60} ${cx} ${cy - 74} Q${cx + 96} ${cy - 60} ${cx + 74} ${cy + 20}`}
        fill="none"
        stroke={PALETTE.boneEdge}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 74} ${cy + 20} Q${cx - 96} ${cy - 60} ${cx} ${cy - 74} Q${cx + 96} ${cy - 60} ${cx + 74} ${cy + 20}`}
        fill="none"
        stroke={PALETTE.bone}
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* 神経の通り道 */}
      <ellipse cx={cx} cy={cy} rx={46} ry={34} fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={2} />

      {/* 黄色靱帯の肥厚（後方から内側へ） */}
      {thick > 0 && (
        <>
          <path
            d={`M${cx - 44} ${cy - 16} Q${cx} ${cy - 34 - thick / 2} ${cx + 44} ${cy - 16} Q${cx} ${cy - 30 + thick} ${cx - 44} ${cy - 16} Z`}
            fill={PALETTE.warnLight}
            stroke={PALETTE.warn}
            strokeWidth={2}
          />
          <text x={cx + 60} y={cy - 40} fontSize={11.5} fontWeight={700} fill={PALETTE.warn}>
            靱帯が厚く
          </text>
        </>
      )}

      {/* 椎間板の膨隆（前方から内側へ） */}
      {bulge > 0 && (
        <>
          <path
            d={`M${cx - 40} ${cy + 18} Q${cx} ${cy + 30 - bulge} ${cx + 40} ${cy + 18} Q${cx} ${cy + 30} ${cx - 40} ${cy + 18} Z`}
            fill={PALETTE.warnLight}
            stroke={PALETTE.warn}
            strokeWidth={2}
          />
          <text x={cx - 118} y={cy + 28} fontSize={11.5} fontWeight={700} fill={PALETTE.warn}>
            椎間板が
          </text>
          <text x={cx - 118} y={cy + 42} fontSize={11.5} fontWeight={700} fill={PALETTE.warn}>
            出っぱる
          </text>
        </>
      )}

      {/* 馬尾神経 */}
      <g>
        {[-26, -13, 0, 13, 26].map((dx, i) => {
          const squeeze = Math.max(0, 1 - (thick + bulge) / 34)
          return (
            <circle
              key={i}
              cx={cx + dx * squeeze}
              cy={cy + (i % 2 === 0 ? -4 : 6) * squeeze}
              r={5.5}
              fill={thick + bulge > 16 ? PALETTE.warn : PALETTE.brand}
              opacity={0.9}
            />
          )
        })}
      </g>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize={0} fill="none">
        神経
      </text>
      <Pill
        x={cx - 52}
        y={cy - 108}
        w={104}
        h={24}
        fill={thick + bulge > 16 ? PALETTE.warnLight : PALETTE.brandLight}
        stroke={thick + bulge > 16 ? PALETTE.warn : PALETTE.brandMid}
        label="神経の通り道"
        labelColor={thick + bulge > 16 ? PALETTE.warn : PALETTE.brand}
        size={12}
      />
    </g>
  )
}

/**
 * 間欠跛行と姿勢の関係。
 * 「前かがみだと歩ける」ことが腰部脊柱管狭窄症の最大の特徴であり、
 * 患者さんが自分の症状と一致するかを確認できる図。
 */
export function NeurogenicClaudicationFigure({ walkableMeters }: { walkableMeters?: number | null }) {
  return (
    <Figure
      viewBox="0 0 620 330"
      title="前かがみになると楽になるしくみ"
      desc="背すじを伸ばすと神経の通り道が狭くなり、前かがみになると広がります"
    >
      <ArrowDefs id="claud-arrow" color={PALETTE.good} />
      <FigCaption x={155} y={26} size={15} color={PALETTE.warn}>
        背すじを伸ばして歩く
      </FigCaption>
      <FigCaption x={465} y={26} size={15} color={PALETTE.good}>
        前かがみ・自転車
      </FigCaption>

      {/* 左：伸展位 */}
      <g transform="translate(60,46)">
        <SpineSide lean={0} narrow />
        <text x={95} y={214} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
          通り道がせまい
        </text>
        <text x={95} y={232} textAnchor="middle" fontSize={12.5} fill={PALETTE.inkSoft}>
          →しびれて休みたくなる
        </text>
      </g>

      {/* 右：屈曲位 */}
      <g transform="translate(370,46)">
        <SpineSide lean={22} narrow={false} />
        <text x={95} y={214} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
          通り道が広がる
        </text>
        <text x={95} y={232} textAnchor="middle" fontSize={12.5} fill={PALETTE.inkSoft}>
          →楽に歩ける・こげる
        </text>
      </g>

      {walkableMeters != null && (
        <Pill
          x={217}
          y={294}
          w={186}
          h={30}
          fill={PALETTE.brandLight}
          stroke={PALETTE.brandMid}
          label={`いまは約${walkableMeters}mで休憩`}
          labelColor={PALETTE.brand}
          size={13}
        />
      )}
    </Figure>
  )
}

/** 側面から見た腰椎（lean が大きいほど前かがみ） */
function SpineSide({ lean, narrow }: { lean: number; narrow: boolean }) {
  const vertebrae = [0, 1, 2, 3, 4]
  return (
    <g>
      {vertebrae.map((i) => {
        const y = 30 + i * 32
        const shift = (lean * (4 - i)) / 4
        return (
          <g key={i} transform={`translate(${shift},0)`}>
            <rect x={40} y={y} width={54} height={22} rx={4} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2} />
            {i < 4 && <rect x={42} y={y + 22} width={50} height={10} rx={4} fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={1.4} />}
            {/* 棘突起 */}
            <path d={`M94 ${y + 6} L${narrow ? 126 : 122} ${y + (narrow ? 2 : 8)} L94 ${y + 18} Z`} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={1.6} />
          </g>
        )
      })}
      {/* 神経の通り道 */}
      <path
        d={vertebrae
          .map((i) => {
            const y = 40 + i * 32
            const shift = (lean * (4 - i)) / 4
            return `${i === 0 ? 'M' : 'L'}${100 + shift} ${y}`
          })
          .join(' ')}
        fill="none"
        stroke={narrow ? PALETTE.warn : PALETTE.good}
        strokeWidth={narrow ? 5 : 12}
        strokeLinecap="round"
        opacity={0.55}
      />
      {narrow && (
        <>
          <circle cx={104} cy={104} r={16} fill="none" stroke={PALETTE.warn} strokeWidth={3} />
          <text x={132} y={100} fontSize={11.5} fontWeight={700} fill={PALETTE.warn}>
            ここで
          </text>
          <text x={132} y={114} fontSize={11.5} fontWeight={700} fill={PALETTE.warn}>
            押される
          </text>
        </>
      )}
    </g>
  )
}

// ================================================================ 椎間板ヘルニア

/**
 * 椎間板ヘルニアの横断面。
 * 「クッションの中身が飛び出して神経に当たる」という一点だけを伝える。
 */
export function DiscHerniaFigure({ side = 'right', size = 2 }: { side?: 'left' | 'right'; size?: 1 | 2 | 3 }) {
  const dir = side === 'right' ? 1 : -1
  const out = [0, 14, 24, 34][size]
  const cx = 280
  const cy = 160

  return (
    <Figure viewBox="0 0 560 320" title="椎間板ヘルニア" desc="椎間板の中身が飛び出して神経を押しています">
      <ArrowDefs id="hernia-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={28} size={16}>
        背骨の輪切り（上から見た図）
      </FigCaption>

      {/* 椎間板（線維輪＋髄核） */}
      <ellipse cx={cx} cy={cy + 26} rx={104} ry={58} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.5} />
      <ellipse cx={cx} cy={cy + 26} rx={62} ry={34} fill="#f6ece0" stroke={PALETTE.boneEdge} strokeWidth={1.6} />
      <ellipse cx={cx} cy={cy + 26} rx={34} ry={20} fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={2} />
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={PALETTE.brand}>
        中身（ゼリー）
      </text>
      <text x={cx - 150} y={cy + 84} fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
        椎間板（背骨のクッション）
      </text>

      {/* 脊柱管 */}
      <ellipse cx={cx} cy={cy - 44} rx={54} ry={36} fill="#eef4f9" stroke={PALETTE.brandMid} strokeWidth={2} />
      <text x={cx} y={cy - 68} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={PALETTE.brand}>
        神経の通り道
      </text>

      {/* 神経根（左右） */}
      {[1, -1].map((s) => {
        const hit = s === dir && out > 0
        return (
          <g key={s}>
            <path
              d={`M${cx + s * 22} ${cy - 44} Q${cx + s * 62} ${cy - 40} ${cx + s * 96} ${cy - 8}`}
              fill="none"
              stroke={hit ? PALETTE.warn : '#e5c98f'}
              strokeWidth={hit ? 11 : 9}
              strokeLinecap="round"
            />
            <text
              x={cx + s * 104}
              y={cy - 2}
              textAnchor={s === 1 ? 'start' : 'end'}
              fontSize={11.5}
              fontWeight={700}
              fill={hit ? PALETTE.warn : PALETTE.inkMute}
            >
              神経
            </text>
          </g>
        )
      })}

      {/* 飛び出した髄核 */}
      {out > 0 && (
        <>
          <path
            d={`M${cx + dir * 12} ${cy + 8} Q${cx + dir * (12 + out)} ${cy - 22} ${cx + dir * 26} ${cy - 40} Q${cx + dir * 4} ${cy - 22} ${cx + dir * 12} ${cy + 8} Z`}
            fill={PALETTE.warnLight}
            stroke={PALETTE.warn}
            strokeWidth={2.5}
          />
          <line
            x1={cx + dir * 74}
            y1={cy - 96}
            x2={cx + dir * 34}
            y2={cy - 40}
            stroke={PALETTE.warn}
            strokeWidth={2.5}
            markerEnd="url(#hernia-arrow)"
          />
          <text x={cx + dir * 80} y={cy - 100} textAnchor={dir === 1 ? 'start' : 'end'} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            飛び出した中身
          </text>
        </>
      )}

      <text x={280} y={308} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        {side === 'right' ? '右' : '左'}の神経が押されるため、
        {side === 'right' ? '右' : '左'}のおしり〜足に痛みやしびれが出ます
      </text>
    </Figure>
  )
}

/* ================================================================ 皮膚分節（デルマトーム）

   患者さんは「すねの外側」「前腕の小指側」と言われても、自分のどこか分からない。
   そこで体の向きを複数並べ、内側／外側・親指側／小指側を図の中に書き込む。

   塗り分けは「体の輪郭でクリップした帯」で行う。
   帯を長方形で置いても輪郭からはみ出さないため、色が体の形に沿う。
   どの神経根を強調するかは呼び出し側（患者さんの入力）が決めるため、
   level を渡すとその範囲だけが色づく仕組みは維持している。
   ================================================================ */

interface DermBand {
  id: string
  /** 帯の範囲（図の座標） */
  x: number
  w: number
  y: number
  h: number
}

/**
 * 体の輪郭の中だけに帯を塗る。
 * shapes は下地・クリップ・輪郭の3役を兼ねるので、1か所に書けば形がずれない。
 */
function DermPanel({
  clipId,
  shapes,
  bands,
  level,
  onPick,
}: {
  clipId: string
  shapes: ReactNode
  bands: DermBand[]
  level?: string | null
  /**
   * 図の範囲を指したときに呼ばれる。
   * 診察室では、患者さんが「ここがしびれる」と言った場所を医師がその場で押して
   * 色を変えられたほうが速い。フォームに戻らずに図の上で完結させるための口。
   */
  onPick?: (id: string) => void
}) {
  return (
    <g>
      <defs>
        <clipPath id={clipId}>{shapes}</clipPath>
        {/*
          該当する範囲は色だけでなく斜線も重ねる。
          パンフレットを白黒で印刷したときにも、どこが該当範囲かが残る。
        */}
        <pattern id={`${clipId}-hatch`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={8} stroke={PALETTE.warn} strokeWidth={2} />
        </pattern>
      </defs>
      {/* 下地 */}
      <g fill={PALETTE.bg} stroke="none">
        {shapes}
      </g>
      {/* 神経根ごとの範囲（輪郭でクリップするので体の形に沿う） */}
      <g clipPath={`url(#${clipId})`}>
        {bands.map((b) => (
          <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} fill={level === b.id ? PALETTE.warnLight : PALETTE.bg} />
        ))}
        {bands
          .filter((b) => level === b.id)
          .map((b) => (
            <rect key={`h${b.id}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${clipId}-hatch)`} opacity={0.45} />
          ))}
        {/* 範囲の区切り。該当範囲の縁だけは太く色をつける */}
        {bands.slice(1).map((b, i) => {
          const on = level === b.id || level === bands[i].id
          return (
            <line
              key={`d${b.id}`}
              x1={b.x}
              y1={b.y}
              x2={b.x}
              y2={b.y + b.h}
              stroke={on ? PALETTE.warn : PALETTE.line}
              strokeWidth={on ? 3 : 1}
            />
          )
        })}
      </g>
      {/* 輪郭を上描き */}
      <g fill="none" stroke={PALETTE.line} strokeWidth={2}>
        {shapes}
      </g>
      {/*
        当たり判定。輪郭でクリップすると細い部分が押しにくくなるため、
        クリップせずに帯と同じ矩形を透明で重ねる。
        タブレットでも指で押せる大きさを確保する。
      */}
      {onPick &&
        bands.map((b) => (
          <rect
            key={`hit${b.id}`}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            /* 患者さんの前で黒い枠が出ないよう、キーボード操作のときだけ枠を出す */
            className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2f7fb0]"
            role="button"
            tabIndex={0}
            aria-label={`${b.id} の範囲`}
            aria-pressed={level === b.id}
            onClick={(e) => {
              // 説明モードは画面の右側タップでスライドが進む。
              // 図を指したときにスライドまで送らないよう、ここで止める。
              e.stopPropagation()
              onPick(b.id)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onPick(b.id)
              }
            }}
          />
        ))}
    </g>
  )
}

/** 図の中の小さな見出し（○○から見た図） */
function ViewLabel({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
      {children}
    </text>
  )
}

/** 内側・外側などの向きを図の中に明示する（左右の取り違えを防ぐ） */
function SideMark({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={10} fill={PALETTE.inkMute}>
      {children}
    </text>
  )
}

/** 凡例の1行（色見本＋神経根＋範囲） */
function DermLegendRow({
  x,
  y,
  id,
  text,
  on,
}: {
  x: number
  y: number
  id: string
  text: string
  on: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y - 11}
        width={18}
        height={14}
        rx={3}
        fill={on ? PALETTE.warnLight : '#ffffff'}
        stroke={on ? PALETTE.warn : PALETTE.line}
        strokeWidth={on ? 2.6 : 1.2}
      />
      <text x={x + 26} y={y} fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
        {id}
      </text>
      <text x={x + 56} y={y} fontSize={11.5} fontWeight={on ? 700 : 400} fill={on ? PALETTE.warn : PALETTE.inkSoft}>
        {text}
      </text>
    </g>
  )
}


/**
 * 「図を指すと色が変わる」ための状態。
 *
 * 診察室では、患者さんが自分の体を指して「ここ」と言う。
 * そのときフォームに戻って選び直すより、図をそのまま押せたほうが速い。
 * 入力から渡された level を初期値にし、押した内容が優先される。
 * 同じ場所をもう一度押すと選択が外れる。
 */
function usePickedLevel<T extends string>(level: T | null | undefined) {
  const [picked, setPicked] = useState<T | null>(null)
  useEffect(() => {
    setPicked(null)
  }, [level])
  const pick = (id: string) => setPicked((prev) => (prev === id ? null : (id as T)))
  return { shown: (picked ?? level ?? null) as T | null, pick, picked }
}

/** 図の下に出す操作の案内（印刷には出さない） */
function PickHint({ x, y, active }: { x: number; y: number; active: boolean }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={PALETTE.brandMid} className="print:hidden">
      {active ? '図を押すと選び直せます（もう一度押すと解除）' : '患者さんが指した場所を、図の上で押してください'}
    </text>
  )
}

const DERM_NOTE = '※ 皮膚分節（しびれる範囲）の分布には個人差があります'

/**
 * 下肢の皮膚分節（L4・L5・S1）。
 *
 * 前からの図だけでは S1（ふくらはぎ・足の裏）が描けないため、
 * 前・後ろ・足の甲・足の裏の4方向を1枚に並べている。
 */
export function LegDermatomeFigure({
  level,
  /** スライドでは見出しが重複するため、既定では図の中に見出しを出さない */
  showTitle = false,
  /** 図を押して神経根を選べるようにする（診察室での指し示し用） */
  interactive = false,
}: {
  level?: 'L4' | 'L5' | 'S1' | null
  showTitle?: boolean
  interactive?: boolean
}) {
  const { shown, pick, picked } = usePickedLevel<'L4' | 'L5' | 'S1'>(level)
  const onPick = interactive ? pick : undefined
  /** 脚の輪郭（腰から足先まで。ひざ・ふくらはぎ・足首のくびれをつける） */
  const leg = (cx: number) => (
    <path
      d={
        `M${cx - 30} 68 Q${cx} 58 ${cx + 30} 68` +
        ` L${cx + 28} 120 L${cx + 20} 168` + // 大腿 → ひざ
        ` Q${cx + 27} 196 ${cx + 24} 232` + // ふくらはぎ
        ` L${cx + 13} 292 L${cx + 12} 306` + // 足首
        ` L${cx + 19} 332 L${cx - 19} 332` + // 足
        ` L${cx - 12} 306 L${cx - 13} 292` +
        ` Q${cx - 27} 196 ${cx - 20} 168` +
        ` L${cx - 28} 120 Z`
      }
    />
  )

  /** 足（つま先を上にした甲／裏の図）。指を分けて描き、親指・小指が分かるようにする */
  const foot = (cx: number) => (
    <>
      <path
        d={
          `M${cx - 19} 226 Q${cx - 27} 190 ${cx - 22} 152 Q${cx - 20} 130 ${cx - 11} 122` +
          ` L${cx + 12} 124 Q${cx + 22} 134 ${cx + 22} 158 Q${cx + 27} 194 ${cx + 17} 226` +
          ` Q${cx} 234 ${cx - 19} 226 Z`
        }
      />
      <ellipse cx={cx - 13} cy={110} rx={9} ry={12} />
      <ellipse cx={cx - 1} cy={107} rx={5.5} ry={9} />
      <ellipse cx={cx + 7} cy={110} rx={5} ry={8.5} />
      <ellipse cx={cx + 14} cy={115} rx={4.5} ry={7.5} />
      <ellipse cx={cx + 20} cy={122} rx={4} ry={6.5} />
    </>
  )

  const FRONT = 82
  const BACK = 186
  const DORSUM = 320
  const SOLE = 430

  return (
    <Figure
      viewBox="0 0 560 390"
      title="しびれる場所と神経のつながり（脚）"
      desc="押されている神経によって、脚と足のどこがしびれるかが決まります。前・後ろ・足の甲・足の裏の4方向で示しています"
    >
      {showTitle && (
        <FigCaption x={280} y={24} size={15}>
          しびれる場所で、どの神経かが分かります
        </FigCaption>
      )}

      <ViewLabel x={FRONT} y={52}>
        前から
      </ViewLabel>
      <ViewLabel x={BACK} y={52}>
        後ろから
      </ViewLabel>
      <ViewLabel x={DORSUM} y={52}>
        足の甲
      </ViewLabel>
      <ViewLabel x={SOLE} y={52}>
        足の裏
      </ViewLabel>

      {/* 前から：ひざより下を内側（L4）と外側（L5）に分ける */}
      <DermPanel
        clipId="derm-leg-front"
        shapes={leg(FRONT)}
        level={shown}
        onPick={onPick}
        bands={[
          { id: 'L4', x: FRONT - 32, w: 32, y: 150, h: 186 },
          { id: 'L5', x: FRONT, w: 32, y: 150, h: 186 },
        ]}
      />
      <line x1={FRONT - 22} y1={168} x2={FRONT + 22} y2={168} stroke={PALETTE.inkMute} strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={FRONT + 26} y={172} fontSize={10} fill={PALETTE.inkMute}>
        ひざ
      </text>
      <SideMark x={FRONT - 30} y={352}>
        内側
      </SideMark>
      <SideMark x={FRONT + 30} y={352}>
        外側
      </SideMark>

      {/* 後ろから：ふくらはぎ〜足の外側（S1） */}
      <DermPanel
        clipId="derm-leg-back"
        shapes={leg(BACK)}
        level={shown}
        onPick={onPick}
        bands={[{ id: 'S1', x: BACK - 32, w: 64, y: 172, h: 164 }]}
      />
      <line x1={BACK - 22} y1={168} x2={BACK + 22} y2={168} stroke={PALETTE.inkMute} strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={BACK + 26} y={172} fontSize={10} fill={PALETTE.inkMute}>
        ひざ裏
      </text>
      <SideMark x={BACK - 30} y={352}>
        外側
      </SideMark>
      <SideMark x={BACK + 30} y={352}>
        内側
      </SideMark>

      {/* 足の甲：内側（L4）／甲と親指（L5）／外側と小指（S1） */}
      <DermPanel
        clipId="derm-foot-dorsum"
        shapes={foot(DORSUM)}
        level={shown}
        onPick={onPick}
        bands={[
          { id: 'L4', x: DORSUM - 30, w: 12, y: 96, h: 144 },
          { id: 'L5', x: DORSUM - 18, w: 28, y: 96, h: 144 },
          { id: 'S1', x: DORSUM + 10, w: 24, y: 96, h: 144 },
        ]}
      />
      <text x={DORSUM - 24} y={94} fontSize={9.5} fill={PALETTE.inkMute}>
        親指
      </text>
      <text x={DORSUM + 16} y={100} fontSize={9.5} fill={PALETTE.inkMute}>
        小指
      </text>
      <SideMark x={DORSUM - 32} y={248}>
        内側
      </SideMark>
      <SideMark x={DORSUM + 32} y={248}>
        外側
      </SideMark>

      {/* 足の裏：内側の帯（L5）と、大部分（S1） */}
      <DermPanel
        clipId="derm-foot-sole"
        shapes={foot(SOLE)}
        level={shown}
        onPick={onPick}
        bands={[
          { id: 'L5', x: SOLE - 30, w: 24, y: 96, h: 144 },
          { id: 'S1', x: SOLE - 6, w: 40, y: 96, h: 144 },
        ]}
      />
      <SideMark x={SOLE - 32} y={248}>
        内側
      </SideMark>
      <SideMark x={SOLE + 32} y={248}>
        外側
      </SideMark>

      {/* 凡例 */}
      {(
        [
          { id: 'L4', area: 'すねの内側 〜 足の内側' },
          { id: 'L5', area: 'すねの外側 〜 足の甲・親指' },
          { id: 'S1', area: 'ふくらはぎ 〜 足の裏・外側・小指' },
        ] as const
      ).map((r, i) => (
        <DermLegendRow key={r.id} x={300} y={286 + i * 24} id={r.id} text={r.area} on={shown === r.id} />
      ))}

      {interactive && <PickHint x={280} y={362} active={picked !== null} />}
      <text x={280} y={378} textAnchor="middle" fontSize={11} fill={PALETTE.inkMute}>
        {DERM_NOTE}
      </text>
    </Figure>
  )
}

/**
 * 上肢の皮膚分節（C5〜C8）。
 *
 * 以前は表だけで示していたが、患者さんは「前腕の小指側」と言われても
 * 自分のどこか分からない。腕を前・後ろから見た図と、手のひら・手の甲の図を
 * 並べ、指のどこまでかを目で確認できるようにした。
 * 「弱くなる動き」は診察での確認と自己観察の手がかりになるため凡例に残している。
 */
export function ArmDermatomeFigure({
  level,
  /** スライドでは見出しが重複するため、既定では図の中に見出しを出さない */
  showTitle = false,
  /** 図を押して神経根を選べるようにする（診察室での指し示し用） */
  interactive = false,
}: {
  level?: 'C5' | 'C6' | 'C7' | 'C8' | null
  showTitle?: boolean
  interactive?: boolean
}) {
  const { shown, pick, picked } = usePickedLevel<'C5' | 'C6' | 'C7' | 'C8'>(level)
  const onPick = interactive ? pick : undefined
  /** 腕の輪郭（肩から手首まで垂らした形。ひじと手首をくびれさせる） */
  const arm = (cx: number) => (
    <path
      d={
        `M${cx - 26} 92 Q${cx} 68 ${cx + 26} 92` +
        ` L${cx + 22} 130 L${cx + 15} 150` + // 二の腕 → ひじ
        ` Q${cx + 20} 186 ${cx + 15} 218` + // 前腕
        ` L${cx + 11} 246 L${cx - 11} 246` + // 手首
        ` L${cx - 15} 218 Q${cx - 20} 186 ${cx - 15} 150` +
        ` L${cx - 22} 130 Z`
      }
    />
  )

  /**
   * 手の輪郭。m = +1 で親指が図の左（手のひらを見た形）、
   * m = −1 で親指が図の右（手の甲を見た形）。
   * u は「親指側からの距離」で、m をかけて実際の x にする。
   */
  const handParts = (cx: number, m: 1 | -1) => {
    const X = (u: number) => cx + m * u
    const fingers = [
      { u: -22, top: 116 }, // 人差し指
      { u: -7, top: 108 }, // 中指
      { u: 8, top: 116 }, // 薬指
      { u: 22, top: 130 }, // 小指
    ]
    const shapes = (
      <>
        <rect x={cx - 31} y={152} width={62} height={62} rx={14} />
        {fingers.map((f) => (
          <rect key={f.u} x={X(f.u) - 6.5} y={f.top} width={13} height={172 - f.top} rx={6} />
        ))}
        <rect
          x={X(-36) - 8}
          y={168}
          width={16}
          height={38}
          rx={8}
          transform={`rotate(${m * -34} ${X(-36)} 188)`}
        />
      </>
    )
    /** 帯の範囲を親指側からの距離で指定し、m の向きに合わせて x に直す */
    const band = (id: string, from: number, to: number): DermBand => {
      const a = X(from)
      const b = X(to)
      return { id, x: Math.min(a, b), w: Math.abs(b - a), y: 100, h: 120 }
    }
    return { X, shapes, band }
  }

  const ARM_F = 78
  const ARM_B = 180
  const PALM = 320
  const DORS = 452

  const palm = handParts(PALM, 1)
  const dors = handParts(DORS, -1)

  return (
    <Figure
      viewBox="0 0 560 400"
      title="しびれる場所と神経のつながり（腕）"
      desc="押されている神経によって、腕と手のどこがしびれるか、どの動きが弱くなるかが決まります"
    >
      {showTitle && (
        <FigCaption x={280} y={24} size={15}>
          しびれる場所で、どの神経かが分かります
        </FigCaption>
      )}

      <ViewLabel x={ARM_F} y={52}>
        腕を前から
      </ViewLabel>
      <ViewLabel x={ARM_B} y={52}>
        腕を後ろから
      </ViewLabel>
      <ViewLabel x={PALM} y={52}>
        手のひら
      </ViewLabel>
      <ViewLabel x={DORS} y={52}>
        手の甲
      </ViewLabel>

      {/* 腕を前から：肩〜二の腕の外側（C5）、前腕の親指側（C6）と小指側（C8） */}
      <DermPanel
        clipId="derm-arm-front"
        shapes={arm(ARM_F)}
        level={shown}
        onPick={onPick}
        bands={[
          { id: 'C5', x: ARM_F - 28, w: 56, y: 64, h: 74 },
          { id: 'C6', x: ARM_F - 22, w: 22, y: 150, h: 100 },
          { id: 'C8', x: ARM_F, w: 22, y: 150, h: 100 },
        ]}
      />
      <line x1={ARM_F - 17} y1={147} x2={ARM_F + 17} y2={147} stroke={PALETTE.inkMute} strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={ARM_F + 21} y={151} fontSize={10} fill={PALETTE.inkMute}>
        ひじ
      </text>
      <SideMark x={ARM_F - 26} y={262}>
        親指側
      </SideMark>
      <SideMark x={ARM_F + 26} y={262}>
        小指側
      </SideMark>

      {/* 腕を後ろから：二の腕の後ろ〜前腕の中央（C7） */}
      <DermPanel
        clipId="derm-arm-back"
        shapes={arm(ARM_B)}
        level={shown}
        onPick={onPick}
        bands={[{ id: 'C7', x: ARM_B - 14, w: 28, y: 96, h: 154 }]}
      />
      <line x1={ARM_B - 17} y1={147} x2={ARM_B + 17} y2={147} stroke={PALETTE.inkMute} strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={ARM_B + 21} y={151} fontSize={10} fill={PALETTE.inkMute}>
        ひじ
      </text>
      <SideMark x={ARM_B - 26} y={262}>
        小指側
      </SideMark>
      <SideMark x={ARM_B + 26} y={262}>
        親指側
      </SideMark>

      {/* 手のひら・手の甲：親指と人差し指（C6）／中指（C7）／薬指と小指（C8） */}
      <DermPanel
        clipId="derm-palm"
        shapes={palm.shapes}
        level={shown}
        onPick={onPick}
        bands={[palm.band('C6', -48, -14), palm.band('C7', -14, 1), palm.band('C8', 1, 33)]}
      />
      <SideMark x={palm.X(-36)} y={262}>
        親指側
      </SideMark>
      <SideMark x={palm.X(30)} y={262}>
        小指側
      </SideMark>

      <DermPanel
        clipId="derm-dorsum"
        shapes={dors.shapes}
        level={shown}
        onPick={onPick}
        bands={[dors.band('C6', -48, -14), dors.band('C7', -14, 1), dors.band('C8', 1, 33)]}
      />
      <SideMark x={dors.X(-36)} y={262}>
        親指側
      </SideMark>
      <SideMark x={dors.X(30)} y={262}>
        小指側
      </SideMark>

      {/* 凡例（しびれる範囲と、弱くなる動き） */}
      {(
        [
          { id: 'C5', where: '肩から二の腕の外側', weak: '腕を横に上げる力' },
          { id: 'C6', where: '前腕の親指側 〜 親指・人差し指', weak: 'ひじを曲げる／手首を反らす力' },
          { id: 'C7', where: '二の腕の後ろ 〜 中指', weak: 'ひじを伸ばす力' },
          { id: 'C8', where: '前腕の小指側 〜 薬指・小指', weak: '指を曲げる／握る力' },
        ] as const
      ).map((r, i) => {
        const y = 276 + i * 28
        const on = shown === r.id
        return (
          <g key={r.id}>
            <rect
              x={24}
              y={y}
              width={512}
              height={24}
              rx={6}
              fill={on ? PALETTE.warnLight : PALETTE.bg}
              stroke={on ? PALETTE.warn : PALETTE.line}
              strokeWidth={on ? 2.4 : 1.2}
            />
            <text x={38} y={y + 17} fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              {r.id}
            </text>
            <text x={70} y={y + 17} fontSize={11} fontWeight={700} fill={PALETTE.ink}>
              しびれ：{r.where}
            </text>
            <text x={296} y={y + 17} fontSize={11} fill={PALETTE.inkSoft}>
              弱くなる動き：{r.weak}
            </text>
          </g>
        )
      })}

      {interactive && <PickHint x={280} y={264} active={picked !== null} />}
      <text x={280} y={394} textAnchor="middle" fontSize={11} fill={PALETTE.inkMute}>
        {DERM_NOTE}
      </text>
    </Figure>
  )
}

// ================================================================ 頚椎症性神経根症

/** 頚椎の側面：椎間孔が狭くなって腕へ行く神経が押される */
export function CervicalForamenFigure({ side = 'right' }: { side?: 'left' | 'right' }) {
  return (
    <Figure viewBox="0 0 560 320" title="首の骨と腕へ行く神経" desc="首の骨のすき間が狭くなり、腕へ行く神経が押されています">
      <ArrowDefs id="cerv-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={26} size={16}>
        首の骨を横から見た図
      </FigCaption>

      {[0, 1, 2, 3].map((i) => {
        const y = 60 + i * 56
        const narrowHere = i === 2
        return (
          <g key={i}>
            {/* 椎体 */}
            <rect x={150} y={y} width={104} height={38} rx={6} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
            {/* 椎間板 */}
            {i < 3 && (
              <rect
                x={152}
                y={y + 38}
                width={100}
                height={narrowHere ? 8 : 18}
                rx={4}
                fill={narrowHere ? PALETTE.warnLight : PALETTE.brandLight}
                stroke={narrowHere ? PALETTE.warn : PALETTE.brandMid}
                strokeWidth={1.6}
              />
            )}
            {/* 後方の椎弓 */}
            <rect x={254} y={y + 4} width={44} height={30} rx={6} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2} />
            {/* 椎間孔から出る神経 */}
            {i < 3 && (
              <g>
                <path
                  d={`M298 ${y + 40} Q350 ${y + 46} 404 ${y + 62}`}
                  fill="none"
                  stroke={narrowHere ? PALETTE.warn : '#e5c98f'}
                  strokeWidth={narrowHere ? 10 : 8}
                  strokeLinecap="round"
                />
                {narrowHere && (
                  <>
                    <circle cx={302} cy={y + 40} r={15} fill="none" stroke={PALETTE.warn} strokeWidth={3} />
                    {/* 吹き出しは骨の左側に置く（右側は腕へのラベルで使うため） */}
                    <line
                      x1={140}
                      y1={y + 74}
                      x2={290}
                      y2={y + 46}
                      stroke={PALETTE.warn}
                      strokeWidth={2}
                      markerEnd="url(#cerv-arrow)"
                    />
                    <text x={22} y={y + 74} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
                      すき間が狭く、
                    </text>
                    <text x={22} y={y + 90} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
                      神経が押される
                    </text>
                  </>
                )}
              </g>
            )}
          </g>
        )
      })}

      {/* 骨のとげ（骨棘） */}
      <path d="M150 176 L128 182 L150 190 Z" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={2} />
      <text x={44} y={180} fontSize={12} fontWeight={700} fill={PALETTE.warn}>
        骨のとげ（骨棘）
      </text>

      {/* 腕 */}
      <text x={412} y={148} fontSize={13} fontWeight={800} fill={PALETTE.warn}>
        {side === 'right' ? '右' : '左'}の腕・手へ
      </text>
      <text x={412} y={166} fontSize={12} fill={PALETTE.inkSoft}>
        痛み・しびれ
      </text>
      <text x={412} y={182} fontSize={12} fill={PALETTE.inkSoft}>
        力の入りにくさ
      </text>

      <text x={280} y={308} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        首を後ろに反らすとすき間がさらに狭くなり、腕のしびれが強くなります
      </text>
    </Figure>
  )
}

// ================================================================ 脊椎圧迫骨折

/**
 * 椎体圧迫骨折。
 * つぶれた椎体と、それが積み重なって背中が丸くなることを1枚で示す。
 */
export function VertebralFractureFigure({ collapsed = 1 }: { collapsed?: number }) {
  const n = 6
  // 図に描けるのは3か所まで。実際の数はキャプションに出す
  const broken = Math.max(1, Math.min(collapsed, 3))
  return (
    <Figure viewBox="0 0 560 372" title="背骨のつぶれ（圧迫骨折）" desc="背骨が前側からつぶれて、くさび形になっています">
      <ArrowDefs id="vf-arrow" color={PALETTE.warn} />
      <FigCaption x={140} y={26} size={15} color={PALETTE.inkSoft}>
        つぶれる前
      </FigCaption>
      <FigCaption x={420} y={26} size={15} color={PALETTE.warn}>
        いまの背骨
      </FigCaption>

      {/* 左：正常 */}
      <g transform="translate(70,46)">
        {Array.from({ length: n }).map((_, i) => (
          <g key={i}>
            <rect x={30} y={i * 42} width={92} height={30} rx={5} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.2} />
            <rect x={32} y={i * 42 + 30} width={88} height={12} rx={4} fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={1.4} />
          </g>
        ))}
        <text x={76} y={n * 42 + 22} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
          四角い形が保たれています
        </text>
      </g>

      {/* 右：圧迫骨折 */}
      <g transform="translate(350,46)">
        {Array.from({ length: n }).map((_, i) => {
          const isBroken = i >= 2 && i < 2 + broken
          const frontH = isBroken ? 14 : 30
          const backH = 30
          const y = i * 42
          return (
            <g key={i}>
              <path
                d={`M30 ${y + (30 - frontH)} L122 ${y + (30 - backH)} L122 ${y + 30} L30 ${y + 30} Z`}
                fill={isBroken ? PALETTE.warnLight : PALETTE.bone}
                stroke={isBroken ? PALETTE.warn : PALETTE.boneEdge}
                strokeWidth={isBroken ? 3 : 2.2}
              />
              <rect x={32} y={y + 30} width={88} height={12} rx={4} fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={1.4} />
              {isBroken && i === 2 && (
                <>
                  <line x1={-6} y1={y + 12} x2={26} y2={y + 16} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#vf-arrow)" />
                  <text x={-104} y={y + 12} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
                    前側がつぶれて
                  </text>
                  <text x={-104} y={y + 27} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
                    くさび形に
                  </text>
                </>
              )}
            </g>
          )
        })}
        <text x={76} y={n * 42 + 22} textAnchor="middle" fontSize={12} fontWeight={700} fill={PALETTE.warn}>
          {collapsed}か所がつぶれています
        </text>
      </g>

      <text x={280} y={358} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        つぶれた分だけ背が縮み、背中が丸くなります
      </text>
    </Figure>
  )
}

/** 圧迫骨折後の姿勢の変化と、それが体に与える影響 */
export function KyphosisImpactFigure() {
  const items = [
    { icon: '🍚', label: '胃が押されて\n食が細くなる' },
    { icon: '🫁', label: '肺がふくらみにくく\n息切れしやすい' },
    { icon: '🚶', label: '重心が前になり\n転びやすい' },
    { icon: '🦴', label: '次の骨折が\n起きやすくなる' },
  ]
  return (
    <Figure viewBox="0 0 620 260" title="背中が丸くなると起こること" desc="円背は消化・呼吸・転倒・次の骨折に影響します">
      <FigCaption x={310} y={26} size={16}>
        背中が丸いままだと、こんな影響があります
      </FigCaption>
      {/* 姿勢 */}
      <g transform="translate(30,50)">
        <path d="M64 20 Q40 60 44 104 L48 160" fill="none" stroke={PALETTE.warn} strokeWidth={9} strokeLinecap="round" />
        <circle cx={70} cy={14} r={15} fill={PALETTE.warn} />
        <path d="M48 160 L36 200 M48 160 L62 200" stroke={PALETTE.warn} strokeWidth={8} strokeLinecap="round" fill="none" />
        <text x={54} y={222} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
          円背
        </text>
      </g>
      {items.map((it, i) => {
        const x = 168 + i * 112
        return (
          <g key={i}>
            <rect x={x} y={62} width={100} height={122} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.6} />
            <text x={x + 50} y={104} textAnchor="middle" fontSize={30}>
              {it.icon}
            </text>
            <MultiText x={x + 50} y={128} anchor="middle" lines={it.label.split('\n')} size={11.5} color={PALETTE.inkSoft} weight={600} />
          </g>
        )
      })}
      <text x={310} y={224} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        だからこそ、背筋の運動と骨粗鬆症の治療をセットで行います
      </text>
    </Figure>
  )
}
