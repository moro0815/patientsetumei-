import type { ReactElement, ReactNode } from 'react'
import { ArrowDefs, Figure, Floor, PALETTE, StickPerson } from './common'
import type { ExerciseFigureKey } from '@/types'
import type { StickPose, StickPose as Pose } from './common'

/* =========================================================================
   運動療法のイラスト（第2群）

   腰・首・肩・肘・手・足・スポーツ復帰の運動。
   exercise.tsx と同じ描き味（棒人間＋線画）にそろえ、
   白黒印刷でも動きの向きが分かるように矢印と文字を必ず添える。
   ========================================================================= */

const STAND: Pose = {
  head: [0, 0],
  neck: [0, 15],
  hip: [0, 74],
  elbowL: [-17, 40],
  handL: [-21, 64],
  elbowR: [17, 40],
  handR: [21, 64],
  kneeL: [-11, 114],
  footL: [-11, 152],
  kneeR: [11, 114],
  footR: [11, 152],
}

function pose(over: Partial<Pose>): Pose {
  return { ...STAND, ...over }
}

const FRAME = '0 0 240 220'
const FLOOR_Y = 196

function Frame({
  title,
  desc,
  children,
  caption,
}: {
  title: string
  desc: string
  children: ReactNode
  caption?: string
}) {
  return (
    <Figure viewBox={FRAME} title={title} desc={desc}>
      <rect x="0" y="0" width="240" height="220" fill={PALETTE.paper} />
      <ArrowDefs id="ex2Arr" color={PALETTE.brandMid} size={6} />
      <ArrowDefs id="ex2Warn" color={PALETTE.warn} size={6} />
      {children}
      {caption && (
        <text x="120" y="214" textAnchor="middle" fontSize="12" fontWeight="700" fill={PALETTE.inkSoft}>
          {caption}
        </text>
      )}
    </Figure>
  )
}

/** 横になっている人（マット） */
function Mat({ y = 170 }: { y?: number }) {
  return <rect x={14} y={y} width={212} height={8} rx={4} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.5} />
}

function Note({ x, y, lines, color = PALETTE.brandMid }: { x: number; y: number; lines: string[]; color?: string }) {
  return (
    <g>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + i * 14} fontSize="11.5" fontWeight="700" fill={color}>
          {l}
        </text>
      ))}
    </g>
  )
}

// ================================================================ 腰・体幹

function DrawIn() {
  return (
    <Frame title="ドローイン（おなかを引き込む）" desc="あお向けでひざを立て、おへそを背中に近づけるようにおなかをへこませる。" caption="10秒 × 10回／1日2〜3回">
      <Mat />
      {/* 頭・体幹 */}
      <circle cx={54} cy={140} r={11} fill={PALETTE.ink} />
      <line x1={66} y1={144} x2={140} y2={150} stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 立てたひざ */}
      <path d="M140 150 L162 110 L182 152" fill="none" stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      {/* 腕 */}
      <line x1={82} y1={146} x2={116} y2={132} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* おなかの矢印 */}
      <path d="M112 108 L112 136" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={92} y={96} lines={['おへそを', '背中へ']} />
      <text x={30} y={186} fontSize="10.5" fill={PALETTE.inkSoft}>
        息は止めずに、数えながら
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function KneeToChest() {
  return (
    <Frame title="片ひざ抱え" desc="あお向けで片方のひざを両手で胸に引き寄せ、腰の後ろを伸ばす。" caption="20〜30秒 × 左右各3回">
      <Mat />
      <circle cx={48} cy={140} r={11} fill={PALETTE.ink} />
      <line x1={60} y1={144} x2={128} y2={150} stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 抱えたひざ */}
      <path d="M128 150 L120 106 L150 96" fill="none" stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      {/* 伸ばした脚 */}
      <line x1={128} y1={152} x2={210} y2={158} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 抱える腕 */}
      <path d="M84 146 Q104 118 122 108" fill="none" stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      <path d="M148 84 Q132 74 118 92" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={140} y={74} lines={['胸に引き寄せる']} />
      <text x={150} y={178} fontSize="10.5" fill={PALETTE.inkSoft}>
        反対の脚は伸ばしたまま
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function CatCamel() {
  return (
    <Frame title="四つ這いで背中を丸める・反らす" desc="四つ這いになり、息を吐きながら背中を丸め、吸いながらゆっくり戻す。" caption="ゆっくり10往復／1日2回">
      {/* 丸める（実線） */}
      <g>
        <circle cx={62} cy={116} r={10} fill={PALETTE.ink} />
        <path d="M72 112 Q118 76 168 108" fill="none" stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
        <line x1={76} y1={116} x2={74} y2={162} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={166} y1={110} x2={172} y2={162} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* 反らす（点線） */}
      <path d="M72 118 Q118 132 168 114" fill="none" stroke={PALETTE.brandMid} strokeWidth={4} strokeDasharray="7 5" strokeLinecap="round" />
      <path d="M120 66 Q126 84 120 96" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={128} y={64} lines={['背中を丸める']} />
      <Note x={128} y={140} lines={['→ ゆっくり戻す']} color={PALETTE.inkSoft} />
      <Floor x1={40} x2={210} y={FLOOR_Y - 30} />
      <text x={30} y={188} fontSize="10.5" fill={PALETTE.inkSoft}>
        反らしすぎない（痛みが出ない範囲で）
      </text>
    </Frame>
  )
}

function HamstringStretch() {
  return (
    <Frame title="太ももの裏のばし" desc="あお向けで片脚を上げ、太ももの裏をタオルで引いて伸ばす。ひざは軽く曲げてよい。" caption="20〜30秒 × 左右各3回">
      <Mat />
      <circle cx={44} cy={142} r={11} fill={PALETTE.ink} />
      <line x1={56} y1={146} x2={122} y2={152} stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 上げた脚 */}
      <line x1={122} y1={152} x2={162} y2={72} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={162} y1={72} x2={176} y2={62} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* タオル */}
      <path d="M84 148 Q126 100 164 72" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} strokeDasharray="5 4" />
      <text x={72} y={112} fontSize="11" fontWeight="700" fill={PALETTE.brandMid}>
        タオル
      </text>
      {/* 伸ばす方向 */}
      <path d="M186 96 Q182 76 172 62" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      {/* 伸びている場所 */}
      <ellipse cx={140} cy={116} rx={13} ry={20} fill={PALETTE.warnLight} opacity={0.7} transform="rotate(-25 140 116)" />
      <Note x={150} y={130} lines={['ここが', '伸びる']} color={PALETTE.warn} />
      {/* 伸ばしたままの脚 */}
      <line x1={122} y1={156} x2={206} y2={160} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function McKenzieExtension() {
  return (
    <Frame title="うつ伏せで上体を反らす" desc="うつ伏せで両手を胸の横につき、腰の力を抜いたまま上体だけをゆっくり起こす。" caption="10回 × 1日3〜5回">
      <Mat />
      {/* 反らした上体 */}
      <circle cx={78} cy={96} r={11} fill={PALETTE.ink} />
      <path d="M86 104 Q112 128 152 154" fill="none" stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 支える腕 */}
      <line x1={86} y1={108} x2={82} y2={162} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* 脚 */}
      <line x1={152} y1={158} x2={216} y2={162} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 起こす向き */}
      <path d="M62 142 Q56 116 70 92" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={16} y={80} lines={['上体だけを', 'ゆっくり起こす']} />
      <Note x={124} y={126} lines={['腰・おしりの', '力は抜く']} color={PALETTE.inkSoft} />
      <text x={16} y={188} fontSize="10.5" fontWeight="700" fill={PALETTE.warn}>
        足やおしりへのしびれが強くなったら中止
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function HipFlexorStretch() {
  return (
    <Frame title="股関節の前のばし" desc="片ひざ立ちになり、おしりに力を入れながら体をまっすぐ前に移動させる。" caption="20〜30秒 × 左右各3回">
      <Floor x1={14} x2={226} y={FLOOR_Y} />
      <StickPerson
        x={118}
        y={26}
        pose={pose({
          hip: [0, 78],
          kneeR: [30, 108],
          footR: [30, 150],
          kneeL: [-30, 122],
          footL: [-62, 150],
          elbowL: [-18, 46],
          handL: [-12, 78],
          elbowR: [18, 46],
          handR: [14, 78],
        })}
        color={PALETTE.ink}
      />
      {/* 前に移動する向き */}
      <path d="M138 158 L178 158" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={148} y={148} lines={['体を前へ']} />
      <ellipse cx={94} cy={150} rx={16} ry={11} fill={PALETTE.warnLight} opacity={0.75} />
      <Note x={20} y={136} lines={['後ろ脚のつけ根が', '伸びる']} color={PALETTE.warn} />
      <text x={20} y={188} fontSize="10.5" fill={PALETTE.inkSoft}>
        腰を反らさない（おなかに軽く力を）
      </text>
    </Frame>
  )
}

// ================================================================ 首・肩

function ChinTuck() {
  return (
    <Frame title="あごを引く体操" desc="背すじを伸ばし、あごを水平に後ろへ引いて二重あごを作るように5秒保つ。" caption="5秒 × 10回／1日3回">
      {/* 悪い姿勢（点線） */}
      <g opacity={0.45}>
        <circle cx={148} cy={68} r={17} fill="none" stroke={PALETTE.inkMute} strokeWidth={3} strokeDasharray="5 4" />
        <path d="M138 84 Q126 100 118 122" fill="none" stroke={PALETTE.inkMute} strokeWidth={5} strokeDasharray="5 4" />
        <text x={168} y={62} fontSize="10.5" fill={PALETTE.inkMute}>
          前に出た
        </text>
        <text x={168} y={75} fontSize="10.5" fill={PALETTE.inkMute}>
          姿勢
        </text>
      </g>
      {/* よい姿勢 */}
      <circle cx={116} cy={64} r={17} fill={PALETTE.ink} />
      <line x1={116} y1={82} x2={116} y2={150} stroke={PALETTE.ink} strokeWidth={8} strokeLinecap="round" />
      <line x1={116} y1={150} x2={100} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={116} y1={150} x2={132} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 引く向き */}
      <path d="M152 52 L128 56" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={26} y={44} lines={['あごを水平に', '後ろへ引く']} />
      <text x={22} y={172} fontSize="10.5" fill={PALETTE.inkSoft}>
        上や下を向かない
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function NeckIsometric() {
  return (
    <Frame title="首の等尺性運動（動かさずに力を入れる）" desc="手のひらで頭を支え、首を動かさずに5秒間押し合う。前・横・後ろの3方向。" caption="各方向5秒 × 5回／1日2回">
      <circle cx={116} cy={70} r={20} fill={PALETTE.ink} />
      <line x1={116} y1={90} x2={116} y2={156} stroke={PALETTE.ink} strokeWidth={8} strokeLinecap="round" />
      {/* 手 */}
      <rect x={74} y={58} width={18} height={26} rx={8} fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      <line x1={82} y1={84} x2={98} y2={132} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* 押し合う矢印 */}
      <path d="M96 70 L108 70" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <path d="M138 70 L126 70" stroke={PALETTE.warn} strokeWidth={3} markerEnd="url(#ex2Warn)" />
      <Note x={148} y={62} lines={['首は動かさず', '押し返すだけ']} color={PALETTE.warn} />
      <text x={24} y={116} fontSize="11" fontWeight="700" fill={PALETTE.brandMid}>
        手で軽く押す
      </text>
      <text x={24} y={180} fontSize="10.5" fill={PALETTE.inkSoft}>
        首が動いてしまうほど強く押さない
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function ScapularSqueeze() {
  return (
    <Frame title="肩甲骨を寄せる体操" desc="背すじを伸ばし、左右の肩甲骨を背中の中央に寄せて5秒保つ。" caption="5秒 × 10回／1日3回">
      {/* 背中側から見た図 */}
      <ellipse cx={120} cy={62} rx={19} ry={19} fill={PALETTE.ink} />
      <rect x={92} y={84} width={56} height={78} rx={14} fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={3} />
      {/* 肩甲骨 */}
      <path d="M88 96 L70 106 L78 138 L94 128 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <path d="M152 96 L170 106 L162 138 L146 128 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      {/* 寄せる向き */}
      <path d="M60 116 L86 116" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <path d="M180 116 L154 116" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={20} y={94} lines={['肩甲骨を', '中央へ寄せる']} />
      <text x={20} y={182} fontSize="10.5" fill={PALETTE.inkSoft}>
        肩をすくめない（下げたまま寄せる）
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function Pendulum() {
  return (
    <Frame title="振り子運動（コッドマン体操）" desc="机に片手をつき、痛い方の腕を力を抜いてぶら下げ、体を揺らして腕を振る。" caption="前後・左右・回すを各20回／1日2〜3回">
      <g stroke={PALETTE.line} strokeWidth="3" fill="none">
        <line x1={22} y1={112} x2={82} y2={112} />
        <line x1={28} y1={112} x2={28} y2={FLOOR_Y} />
        <line x1={76} y1={112} x2={76} y2={FLOOR_Y} />
      </g>
      <StickPerson
        x={140}
        y={34}
        pose={pose({
          neck: [0, 16],
          hip: [-4, 76],
          elbowL: [-40, 44],
          handL: [-62, 74],
          elbowR: [10, 58],
          handR: [16, 96],
          kneeL: [-14, 116],
          footL: [-16, 152],
          kneeR: [12, 116],
          footR: [14, 152],
        })}
        color={PALETTE.ink}
      />
      {/* 振り子の軌跡 */}
      <path d="M128 148 Q156 168 184 148" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} strokeDasharray="6 5" />
      <path d="M180 152 L188 144" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={140} y={182} lines={['力を抜いて振る']} />
      <text x={20} y={100} fontSize="10.5" fill={PALETTE.inkSoft}>
        反対の手で支える
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function WallWalk() {
  return (
    <Frame title="壁づたい運動" desc="壁の前に立ち、指を1本ずつ動かして手を少しずつ上へ登らせる。" caption="10回 × 1日2〜3回">
      <rect x={18} y={20} width={16} height={FLOOR_Y - 20} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      {/* 手の軌跡 */}
      {[132, 108, 84, 62].map((y, i) => (
        <g key={y} opacity={i === 3 ? 1 : 0.4}>
          <rect x={36} y={y} width={16} height={13} rx={5} fill={i === 3 ? PALETTE.brandMid : PALETTE.line} />
        </g>
      ))}
      <path d="M62 128 L62 72" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <StickPerson
        x={148}
        y={38}
        pose={pose({
          elbowL: [-42, 22],
          handL: [-96, 26],
          elbowR: [16, 44],
          handR: [20, 70],
        })}
        color={PALETTE.ink}
      />
      <Note x={72} y={54} lines={['指で少しずつ', '上へ登る']} />
      <text x={64} y={182} fontSize="10.5" fill={PALETTE.inkSoft}>
        痛みが強い高さで止め、10秒キープ
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function CrossBodyStretch() {
  return (
    <Frame title="腕を胸の前で抱えるストレッチ" desc="痛い方の腕を胸の前に水平に伸ばし、反対の手でひじを抱えて体に引き寄せる。" caption="20〜30秒 × 3回／1日2回">
      <circle cx={120} cy={54} r={18} fill={PALETTE.ink} />
      <line x1={120} y1={72} x2={120} y2={150} stroke={PALETTE.ink} strokeWidth={8} strokeLinecap="round" />
      {/* 伸ばす腕（水平） */}
      <line x1={120} y1={92} x2={58} y2={92} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 抱える腕 */}
      <path d="M120 100 Q96 122 70 100" fill="none" stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* 引き寄せる向き */}
      <path d="M46 76 L74 84" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={24} y={64} lines={['体に引き寄せる']} />
      <ellipse cx={124} cy={86} rx={16} ry={12} fill={PALETTE.warnLight} opacity={0.75} />
      <Note x={144} y={78} lines={['肩の後ろが', '伸びる']} color={PALETTE.warn} />
      <line x1={120} y1={150} x2={106} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={120} y1={150} x2={134} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function ExternalRotation() {
  return (
    <Frame title="腕を外にひねる運動（チューブ）" desc="ひじを体につけたまま90度に曲げ、ゴムチューブを外向きに引く。" caption="10〜15回 × 2〜3セット／週3回">
      <circle cx={104} cy={56} r={17} fill={PALETTE.ink} />
      <line x1={104} y1={73} x2={104} y2={150} stroke={PALETTE.ink} strokeWidth={8} strokeLinecap="round" />
      {/* ひじを体につけた腕 */}
      <line x1={104} y1={94} x2={104} y2={120} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={104} y1={120} x2={158} y2={116} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* チューブ */}
      <path d="M158 116 Q190 112 208 128" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} strokeDasharray="4 4" />
      <path d="M172 96 Q186 102 192 116" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={148} y={88} lines={['外向きに引く']} />
      {/* ひじの位置 */}
      <rect x={92} y={110} width={22} height={20} rx={6} fill="none" stroke={PALETTE.warn} strokeWidth={2.5} strokeDasharray="4 3" />
      <Note x={20} y={144} lines={['ひじは体から', '離さない']} color={PALETTE.warn} />
      <line x1={104} y1={150} x2={92} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={104} y1={150} x2={116} y2={182} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

// ================================================================ 肘・手

function WristExtStretch() {
  return (
    <Frame title="手首を反らす筋肉のストレッチ" desc="ひじを伸ばし、手のひらを下に向けて手首を下に曲げ、反対の手で押さえて伸ばす。" caption="30秒 × 3回／1日3回">
      {/* 前腕 */}
      <line x1={30} y1={92} x2={140} y2={92} stroke="#e6c9a8" strokeWidth={26} strokeLinecap="round" />
      <line x1={30} y1={92} x2={140} y2={92} stroke={PALETTE.line} strokeWidth={1.5} fill="none" opacity={0.4} />
      <text x={62} y={72} fontSize="11" fill={PALETTE.inkSoft}>
        ひじは伸ばす
      </text>
      {/* 手（下に曲げる） */}
      <path d="M140 84 L160 84 L168 132 L146 130 Z" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      {/* 押さえる手 */}
      <path d="M172 116 Q196 124 190 148 L162 140" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      <path d="M186 100 Q178 114 168 124" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={158} y={64} lines={['下へ押さえる']} />
      {/* 伸びる場所 */}
      <ellipse cx={52} cy={92} rx={20} ry={15} fill={PALETTE.warnLight} opacity={0.8} />
      <Note x={22} y={132} lines={['ひじの外側〜', '前腕が伸びる']} color={PALETTE.warn} />
      <text x={22} y={182} fontSize="10.5" fill={PALETTE.inkSoft}>
        痛みが強い日は無理に伸ばさない
      </text>
    </Frame>
  )
}

function EccentricWrist() {
  return (
    <Frame
      title="手首をゆっくり下ろす運動（エキセントリック）"
      desc="軽いおもりを持ち、反対の手で手首を上げてから、3〜5秒かけてゆっくり下ろす。"
      caption="15回 × 3セット／1日1回"
    >
      {/* 前腕（机の上） */}
      <rect x={16} y={112} width={120} height={10} rx={4} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      <line x1={26} y1={104} x2={132} y2={104} stroke="#e6c9a8" strokeWidth={22} strokeLinecap="round" />
      <text x={30} y={140} fontSize="10.5" fill={PALETTE.inkSoft}>
        前腕は机につけたまま
      </text>
      {/* 上げた位置（点線） */}
      <g opacity={0.45}>
        <path d="M136 96 L162 72" stroke={PALETTE.inkMute} strokeWidth={9} strokeLinecap="round" strokeDasharray="5 4" />
        <rect x={156} y={56} width={22} height={16} rx={4} fill="none" stroke={PALETTE.inkMute} strokeWidth={2} strokeDasharray="4 3" />
        <text x={182} y={62} fontSize="10.5" fill={PALETTE.inkMute}>
          反対の手で上げる
        </text>
      </g>
      {/* 下ろした位置 */}
      <path d="M136 104 L156 136" stroke={PALETTE.ink} strokeWidth={9} strokeLinecap="round" />
      <rect x={148} y={136} width={24} height={18} rx={4} fill={PALETTE.ink} />
      <text x={176} y={150} fontSize="11" fontWeight="700" fill={PALETTE.ink}>
        おもり
      </text>
      {/* 下ろす向き */}
      <path d="M186 84 Q194 108 184 128" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={188} y={104} lines={['3〜5秒', 'かけて']} />
      <text x={20} y={182} fontSize="10.5" fontWeight="700" fill={PALETTE.good}>
        「ゆっくり下ろす」ことがいちばん効きます
      </text>
    </Frame>
  )
}

function TendonGlide() {
  return (
    <Frame title="指の腱すべり運動（テンドングライド）" desc="指をまっすぐ→かぎ形→こぶし→まっすぐ、と形を変えて腱を滑らせる。" caption="各5秒 × 5往復／1日3〜4回">
      {[
        { x: 22, name: 'まっすぐ', d: 'M14 60 L14 18 M26 60 L26 14 M38 60 L38 18 M50 60 L50 24' },
        { x: 78, name: 'かぎ形', d: 'M14 60 L14 34 L24 34 M26 60 L26 30 L36 30 M38 60 L38 34 L48 34 M50 60 L50 38 L58 38' },
        { x: 134, name: 'こぶし', d: 'M14 60 L14 40 L22 48 M26 60 L26 36 L34 46 M38 60 L38 40 L46 48 M50 60 L50 44 L56 50' },
        { x: 190, name: '平らに曲げる', d: 'M14 60 L14 30 L34 30 M26 60 L26 26 L46 26 M38 60 L38 30 L56 30 M50 60 L50 34 L64 34' },
      ].map((s, i) => (
        <g key={s.name} transform={`translate(${s.x - 6},34)`}>
          <rect x={2} y={54} width={54} height={22} rx={6} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
          <path d={s.d} fill="none" stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <text x={28} y={94} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={PALETTE.inkSoft}>
            {s.name}
          </text>
          {i < 3 && <path d="M60 40 L70 40" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />}
        </g>
      ))}
      <text x={120} y={172} textAnchor="middle" fontSize="10.5" fill={PALETTE.inkSoft}>
        引っかかるところで無理に伸ばさず、ゆっくり形を変えます
      </text>
    </Frame>
  )
}

// ================================================================ 足

function PlantarStretch() {
  return (
    <Frame title="足の裏のばし（起き上がる前に）" desc="座って足を組み、手で足の指を足首側へ反らして足の裏のすじを伸ばす。" caption="20〜30秒 × 3回／起床時と日中3回">
      {/* 足 */}
      <path d="M40 132 Q34 106 56 100 L150 118 Q170 122 164 138 L64 146 Q42 146 40 132 Z" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      {/* 反らした指 */}
      <path d="M150 118 L176 92 M158 124 L184 100 M164 130 L190 108" stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* 手 */}
      <path d="M182 70 Q206 78 200 104 L176 96" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      <path d="M198 62 Q186 74 178 86" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={150} y={56} lines={['指を手前に反らす']} />
      {/* 伸びるすじ */}
      <path d="M56 138 Q108 150 156 134" fill="none" stroke={PALETTE.warn} strokeWidth={5} strokeLinecap="round" />
      <Note x={30} y={176} lines={['ここ（足底腱膜）が張るのを感じます']} color={PALETTE.warn} />
      <text x={30} y={96} fontSize="10.5" fill={PALETTE.inkSoft}>
        朝、床に足をつく前にやると効果的
      </text>
    </Frame>
  )
}

function CalfStretch() {
  return (
    <Frame title="ふくらはぎのばし" desc="壁に手をつき、後ろ足のかかとを床につけたまま前足のひざを曲げて体を前へ。" caption="30秒 × 左右各3回／1日2回">
      <rect x={190} y={24} width={16} height={FLOOR_Y - 24} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      <StickPerson
        x={96}
        y={30}
        pose={pose({
          head: [8, 0],
          neck: [6, 16],
          hip: [-10, 78],
          elbowL: [40, 30],
          handL: [86, 26],
          elbowR: [38, 34],
          handR: [84, 32],
          kneeR: [26, 112],
          footR: [40, 150],
          kneeL: [-38, 116],
          footL: [-62, 150],
        })}
        color={PALETTE.ink}
      />
      {/* かかとを強調 */}
      <ellipse cx={34} cy={178} rx={14} ry={8} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={2.5} />
      <Note x={14} y={158} lines={['かかとは', '床につけたまま']} color={PALETTE.warn} />
      <path d="M104 168 L142 168" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={106} y={158} lines={['体を前へ']} />
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function TowelGather() {
  return (
    <Frame title="タオルたぐり寄せ" desc="床のタオルを、足の指だけで手前にたぐり寄せる。" caption="5回 × 1日2回">
      {/* 足 */}
      <path d="M50 106 Q44 84 66 80 L136 96 Q152 100 146 114 L72 120 Q52 120 50 106 Z" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      {/* 曲げた指 */}
      <path d="M136 96 L146 108 L134 112 M142 100 L152 112 L140 116" stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
      {/* タオル */}
      <path d="M148 138 Q176 130 206 138 L206 152 Q176 144 148 152 Z" fill={PALETTE.brandLight} stroke={PALETTE.brandMid} strokeWidth={2} />
      <path d="M170 128 L142 128" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={150} y={120} lines={['指でたぐる']} />
      <text x={40} y={64} fontSize="11" fontWeight="700" fill={PALETTE.inkSoft}>
        かかとは床につけたまま
      </text>
      <text x={40} y={178} fontSize="10.5" fill={PALETTE.inkSoft}>
        土ふまずを支える筋肉を鍛えます
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y} />
    </Frame>
  )
}

function AnkleEversionBand() {
  return (
    <Frame title="足首を外に開く運動（チューブ）" desc="足にゴムチューブをかけ、かかとを支点に足先を外側へゆっくり開く。" caption="15回 × 3セット／1日1回">
      {/* 脚 */}
      <line x1={56} y1={40} x2={64} y2={112} stroke={PALETTE.ink} strokeWidth={9} strokeLinecap="round" />
      {/* 足 */}
      <path d="M60 112 Q54 130 74 136 L138 130 Q154 128 150 116 L86 106 Q64 104 60 112 Z" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      {/* チューブ */}
      <path d="M146 122 Q182 118 202 138" fill="none" stroke={PALETTE.brandMid} strokeWidth={4} strokeDasharray="5 4" />
      <rect x={196} y={132} width={20} height={26} rx={6} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={2} />
      {/* 動く向き */}
      <path d="M156 96 Q176 104 180 118" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={128} y={86} lines={['足先を外へ']} />
      <ellipse cx={70} cy={122} rx={12} ry={10} fill="none" stroke={PALETTE.warn} strokeWidth={2.5} strokeDasharray="4 3" />
      <Note x={16} y={158} lines={['かかとは', '動かさない']} color={PALETTE.warn} />
      <text x={16} y={186} fontSize="10.5" fill={PALETTE.inkSoft}>
        足首の外側の筋肉が、ねんざの再発を防ぎます
      </text>
    </Frame>
  )
}

// ================================================================ スポーツ

function NordicHamstring() {
  return (
    <Frame
      title="ノルディックハムストリング"
      desc="ひざ立ちで足首を支えてもらい、背すじを伸ばしたままゆっくり前に倒れる。"
      caption="3〜5回 × 2〜3セット／週1〜2回"
    >
      {/* 開始（点線） */}
      <g opacity={0.4}>
        <circle cx={80} cy={54} r={11} fill="none" stroke={PALETTE.inkMute} strokeWidth={3} strokeDasharray="4 3" />
        <path d="M80 66 L86 132" stroke={PALETTE.inkMute} strokeWidth={5} strokeDasharray="5 4" />
      </g>
      {/* 倒れた姿勢 */}
      <circle cx={148} cy={92} r={11} fill={PALETTE.ink} />
      <line x1={140} y1={98} x2={90} y2={134} stroke={PALETTE.ink} strokeWidth={7} strokeLinecap="round" />
      {/* すね（床に接地） */}
      <line x1={90} y1={136} x2={44} y2={162} stroke={PALETTE.ink} strokeWidth={6} strokeLinecap="round" />
      {/* 腕（受け身の準備） */}
      <line x1={140} y1={104} x2={168} y2={130} stroke={PALETTE.ink} strokeWidth={5} strokeLinecap="round" />
      {/* 支える手 */}
      <path d="M36 156 Q22 166 34 176 L52 170" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth={2.5} />
      <Note x={16} y={190} lines={['足首を押さえてもらう']} color={PALETTE.inkSoft} />
      {/* 倒れる向き */}
      <path d="M116 62 Q142 68 152 80" fill="none" stroke={PALETTE.brandMid} strokeWidth={3} markerEnd="url(#ex2Arr)" />
      <Note x={92} y={44} lines={['できるだけゆっくり', '前に倒れる']} />
      <ellipse cx={100} cy={148} rx={18} ry={11} fill={PALETTE.warnLight} opacity={0.7} transform="rotate(-30 100 148)" />
      <text x={140} y={166} fontSize="10.5" fontWeight="700" fill={PALETTE.warn}>
        太ももの裏に効く
      </text>
      <Floor x1={14} x2={226} y={FLOOR_Y - 14} />
    </Frame>
  )
}

// ---------------------------------------------------------------- ディスパッチャ

export const EXERCISE2_MAP: Partial<Record<ExerciseFigureKey, () => ReactElement>> = {
  drawIn: DrawIn,
  kneeToChest: KneeToChest,
  catCamel: CatCamel,
  hamstringStretch: HamstringStretch,
  mckenzieExtension: McKenzieExtension,
  hipFlexorStretch: HipFlexorStretch,
  chinTuck: ChinTuck,
  neckIsometric: NeckIsometric,
  scapularSqueeze: ScapularSqueeze,
  pendulum: Pendulum,
  wallWalk: WallWalk,
  crossBodyStretch: CrossBodyStretch,
  externalRotation: ExternalRotation,
  wristExtStretch: WristExtStretch,
  eccentricWrist: EccentricWrist,
  tendonGlide: TendonGlide,
  plantarStretch: PlantarStretch,
  calfStretch: CalfStretch,
  towelGather: TowelGather,
  ankleEversionBand: AnkleEversionBand,
  nordicHamstring: NordicHamstring,
}

export type { StickPose }
