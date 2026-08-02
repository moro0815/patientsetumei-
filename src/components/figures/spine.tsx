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

/** 下肢の皮膚分節（どの神経がやられると、どこがしびれるか） */
export function LegDermatomeFigure({ level }: { level?: 'L4' | 'L5' | 'S1' | null }) {
  const zones: { id: 'L4' | 'L5' | 'S1'; label: string; area: string; d: string; tx: number; ty: number }[] = [
    {
      id: 'L4',
      label: 'L4',
      area: 'すねの内側〜足の内側',
      d: 'M84 150 L96 150 L100 258 L88 292 L76 290 L78 250 Z',
      tx: 26,
      ty: 232,
    },
    {
      id: 'L5',
      label: 'L5',
      area: 'すねの外側〜足の甲・親指',
      d: 'M100 152 L116 154 L120 250 L114 296 L100 296 L100 250 Z',
      tx: 152,
      ty: 210,
    },
    {
      id: 'S1',
      label: 'S1',
      area: 'ふくらはぎ〜足の外側・小指',
      d: 'M118 156 L134 162 L136 254 L128 300 L116 300 L120 250 Z',
      tx: 152,
      ty: 278,
    },
  ]

  return (
    <Figure viewBox="0 0 300 330" title="しびれる場所と神経のつながり" desc="押されている神経によって、しびれる場所が決まります">
      <FigCaption x={150} y={22} size={15}>
        しびれる場所で、どの神経かが分かります
      </FigCaption>
      {/* 脚のシルエット */}
      <path d="M76 60 Q106 48 136 60 L136 156 L132 300 L116 316 L98 316 L84 300 L78 156 Z" fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      <path d="M84 300 L70 316" stroke={PALETTE.line} strokeWidth={8} strokeLinecap="round" />
      <path d="M128 300 L142 316" stroke={PALETTE.line} strokeWidth={8} strokeLinecap="round" />

      {zones.map((z) => {
        const on = level === z.id
        return (
          <g key={z.id}>
            <path d={z.d} fill={on ? PALETTE.warnLight : '#ffffff'} stroke={on ? PALETTE.warn : PALETTE.line} strokeWidth={on ? 3 : 1.4} opacity={on ? 1 : 0.7} />
            <text
              x={z.tx}
              y={z.ty}
              fontSize={13}
              fontWeight={on ? 800 : 700}
              fill={on ? PALETTE.warn : PALETTE.inkMute}
              textAnchor={z.tx < 100 ? 'start' : 'start'}
            >
              {z.label}
            </text>
            <MultiText
              x={z.tx}
              y={z.ty + 16}
              size={10.5}
              lines={z.area.split('〜').map((s, i, arr) => (i < arr.length - 1 ? `${s}〜` : s))}
              color={on ? PALETTE.warn : PALETTE.inkMute}
              weight={on ? 700 : 400}
            />
          </g>
        )
      })}
      {level && (
        <Pill x={92} y={2} w={116} h={0} fill="none" label="" />
      )}
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

/** 上肢の皮膚分節（C5〜C8） */
export function ArmDermatomeFigure({ level }: { level?: 'C5' | 'C6' | 'C7' | 'C8' | null }) {
  const rows: { id: 'C5' | 'C6' | 'C7' | 'C8'; where: string; weak: string }[] = [
    { id: 'C5', where: '肩から二の腕の外側', weak: '腕を横に上げる力' },
    { id: 'C6', where: '前腕の親指側〜親指・人差し指', weak: 'ひじを曲げる／手首を反らす力' },
    { id: 'C7', where: '前腕の後ろ〜中指', weak: 'ひじを伸ばす力' },
    { id: 'C8', where: '前腕の小指側〜薬指・小指', weak: '指を曲げる／握る力' },
  ]
  return (
    <Figure viewBox="0 0 560 260" title="しびれる場所と神経のつながり（腕）" desc="押されている神経によってしびれる場所と弱くなる筋肉が決まります">
      <FigCaption x={280} y={24} size={15}>
        しびれる場所で、どの神経かが分かります
      </FigCaption>
      {rows.map((r, i) => {
        const y = 46 + i * 50
        const on = level === r.id
        return (
          <g key={r.id}>
            <rect
              x={24}
              y={y}
              width={512}
              height={42}
              rx={8}
              fill={on ? PALETTE.warnLight : PALETTE.bg}
              stroke={on ? PALETTE.warn : PALETTE.line}
              strokeWidth={on ? 2.6 : 1.2}
            />
            <text x={48} y={y + 26} fontSize={16} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              {r.id}
            </text>
            <text x={96} y={y + 18} fontSize={12.5} fontWeight={700} fill={PALETTE.ink}>
              しびれ：{r.where}
            </text>
            <text x={96} y={y + 34} fontSize={12} fill={PALETTE.inkSoft}>
              弱くなる動き：{r.weak}
            </text>
            {on && (
              <text x={520} y={y + 26} textAnchor="end" fontSize={12} fontWeight={800} fill={PALETTE.warn}>
                ← あなた
              </text>
            )}
          </g>
        )
      })}
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
