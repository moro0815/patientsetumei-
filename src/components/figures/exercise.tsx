import type { ReactElement, ReactNode } from 'react'
import { ArrowDefs, Figure, Floor, PALETTE, StickPerson } from './common'
import type { ExerciseFigureKey } from '@/types'
import type { StickPose } from './common'

/* =========================================================================
   運動療法のイラスト
   すべて棒人間ベースの手描きSVG。画面でも印刷（白黒）でも判別できるようにする。
   ========================================================================= */

type Pose = StickPose

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
const ORIGIN = { x: 120, y: 40 }
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
      <ArrowDefs id="exArr" color={PALETTE.brandMid} size={6} />
      <ArrowDefs id="exArrWarn" color={PALETTE.warn} size={6} />
      {children}
      {caption && (
        <text x="120" y="214" textAnchor="middle" fontSize="12" fontWeight="700" fill={PALETTE.inkSoft}>
          {caption}
        </text>
      )}
    </Figure>
  )
}

/** 支えにする机・椅子 */
function Table({ x = 26, y = 120, w = 56 }: { x?: number; y?: number; w?: number }) {
  return (
    <g stroke={PALETTE.line} strokeWidth="3" fill="none">
      <line x1={x} y1={y} x2={x + w} y2={y} />
      <line x1={x + 6} y1={y} x2={x + 6} y2={FLOOR_Y} />
      <line x1={x + w - 6} y1={y} x2={x + w - 6} y2={FLOOR_Y} />
    </g>
  )
}

function Chair({ x = 132, y = 130 }: { x?: number; y?: number }) {
  return (
    <g stroke={PALETTE.line} strokeWidth="3" fill="none">
      <line x1={x} y1={y} x2={x + 58} y2={y} />
      <line x1={x + 56} y1={y} x2={x + 56} y2={y - 52} />
      <line x1={x + 4} y1={y} x2={x + 4} y2={FLOOR_Y} />
      <line x1={x + 52} y1={y} x2={x + 52} y2={FLOOR_Y} />
    </g>
  )
}

// ---------------------------------------------------------------- 各運動

function OneLegStand() {
  return (
    <Frame
      title="開眼片脚立ち"
      desc="片脚を床から浮かせて1分間立つ。転倒しないよう机のそばで行う。"
      caption="左右それぞれ1分 × 1日3回"
    >
      <Table x={22} y={112} w={52} />
      <StickPerson
        x={ORIGIN.x + 26}
        y={ORIGIN.y}
        pose={pose({
          elbowL: [-26, 44],
          handL: [-48, 72],
          kneeR: [26, 100],
          footR: [16, 122],
        })}
        color={PALETTE.ink}
      />
      <Floor x1={16} x2={224} y={FLOOR_Y} />
      <path d="M 168 128 q 16 -8 22 -26" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="196" y="98" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        床に
      </text>
      <text x="196" y="112" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        つかない
      </text>
      <text x="24" y="106" fontSize="11" fill={PALETTE.inkSoft}>
        つかまる物のそばで
      </text>
    </Frame>
  )
}

function Squat() {
  return (
    <Frame
      title="スクワット"
      desc="足を肩幅に開き、お尻を後ろに引くようにひざを曲げる。ひざはつま先より前に出さない。"
      caption="5〜6回 × 1日3セット"
    >
      {/* 開始姿勢（薄く） */}
      <g opacity="0.3">
        <StickPerson x={ORIGIN.x - 44} y={ORIGIN.y} pose={STAND} color={PALETTE.inkMute} />
      </g>
      {/* しゃがんだ姿勢 */}
      <StickPerson
        x={ORIGIN.x + 40}
        y={ORIGIN.y + 26}
        pose={pose({
          hip: [-10, 74],
          elbowL: [-4, 44],
          handL: [12, 58],
          elbowR: [12, 42],
          handR: [28, 56],
          kneeL: [-20, 104],
          footL: [-14, 126],
          kneeR: [2, 104],
          footR: [8, 126],
        })}
        color={PALETTE.ink}
      />
      <Floor x1={16} x2={224} y={FLOOR_Y} />
      <path d="M 108 96 q 20 12 26 34" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="16" y="30" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        3秒かけて下ろす
      </text>
      <text x="16" y="46" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        3秒かけて戻す
      </text>
      <text x="150" y="176" fontSize="11" fontWeight="700" fill={PALETTE.warn}>
        ひざはつま先より
      </text>
      <text x="150" y="189" fontSize="11" fontWeight="700" fill={PALETTE.warn}>
        前に出さない
      </text>
    </Frame>
  )
}

function HeelRaise() {
  return (
    <Frame
      title="かかと上げ"
      desc="机に手をおいて、かかとをゆっくり持ち上げてつま先立ちになる。"
      caption="10〜20回 × 2〜3セット"
    >
      <Table x={22} y={112} w={52} />
      <StickPerson
        x={ORIGIN.x + 22}
        y={ORIGIN.y - 12}
        pose={pose({
          elbowL: [-28, 44],
          handL: [-50, 74],
          footL: [-11, 146],
          footR: [11, 146],
        })}
        color={PALETTE.ink}
      />
      {/* つま先とかかと */}
      <g stroke={PALETTE.ink} strokeWidth="4" strokeLinecap="round">
        <line x1="126" y1="174" x2="146" y2="182" />
        <line x1="148" y1="174" x2="168" y2="182" />
      </g>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
      <path d="M 190 168 L 190 138" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="196" y="156" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        上げる
      </text>
      <text x="120" y="192" textAnchor="middle" fontSize="10.5" fill={PALETTE.inkMute}>
        下ろすとき軽くトンと着ける
      </text>
    </Frame>
  )
}

function BackExtension() {
  return (
    <Frame
      title="背すじを伸ばす運動"
      desc="椅子に深く座り、胸を張って背中をまっすぐ上に伸ばす。5秒キープ。"
      caption="5〜10回 × 2〜3セット"
    >
      <Chair x={128} y={140} />
      {/* 座位で背すじを伸ばす */}
      <g>
        <circle cx="150" cy="56" r="11" fill={PALETTE.ink} />
        <line x1="150" y1="68" x2="150" y2="132" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="132" x2="186" y2="138" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <line x1="186" y1="138" x2="188" y2="176" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        {/* 腕を後ろで組む */}
        <path d="M 150 84 q -22 14 -6 34" fill="none" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
      </g>
      {/* 丸い背中（悪い例） */}
      <g opacity="0.35">
        <circle cx="66" cy="70" r="11" fill={PALETTE.inkMute} />
        <path d="M 66 82 q 18 24 4 50" fill="none" stroke={PALETTE.inkMute} strokeWidth="6" strokeLinecap="round" />
      </g>
      <text x="66" y="150" textAnchor="middle" fontSize="11" fill={PALETTE.inkMute} fontWeight="700">
        丸まった姿勢
      </text>
      <path d="M 96 78 L 126 66" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <path d="M 150 46 L 150 28" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="158" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        上に伸ばす
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function QuadSetting() {
  return (
    <Frame
      title="大腿四頭筋セッティング"
      desc="ひざの下にタオルを置き、押しつぶすようにももの前に力を入れて5秒キープ。"
      caption="5秒キープ × 10回 × 2〜3セット"
    >
      {/* 長座位で横から */}
      <g>
        <circle cx="52" cy="96" r="11" fill={PALETTE.ink} />
        <line x1="62" y1="102" x2="96" y2="128" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="96" y1="128" x2="176" y2="140" stroke={PALETTE.ink} strokeWidth="7" strokeLinecap="round" />
        <line x1="176" y1="140" x2="184" y2="122" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <line x1="62" y1="110" x2="106" y2="140" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
      </g>
      {/* タオル */}
      <ellipse cx="142" cy="152" rx="20" ry="9" fill={PALETTE.brandLight} stroke={PALETTE.brand} strokeWidth="2.5" />
      <text x="142" y="176" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={PALETTE.brand}>
        丸めたタオル
      </text>
      <path d="M 142 122 L 142 140" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="150" y="112" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        押しつぶす
      </text>
      <text x="20" y="40" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        ひざを伸ばしたまま
      </text>
      <text x="20" y="56" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        ももの前に力を入れる
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function StraightLegRaise() {
  return (
    <Frame
      title="脚上げ運動（SLR）"
      desc="あお向けで片ひざを立て、反対の脚をまっすぐのまま10〜20cm持ち上げる。"
      caption="5秒キープ × 10回 × 2〜3セット"
    >
      <g>
        <circle cx="42" cy="150" r="11" fill={PALETTE.ink} />
        <line x1="54" y1="152" x2="118" y2="156" stroke={PALETTE.ink} strokeWidth="7" strokeLinecap="round" />
        {/* 立てたひざ */}
        <line x1="118" y1="156" x2="146" y2="122" stroke={PALETTE.ink} strokeWidth="5.5" strokeLinecap="round" />
        <line x1="146" y1="122" x2="164" y2="160" stroke={PALETTE.ink} strokeWidth="5.5" strokeLinecap="round" />
        {/* 上げた脚 */}
        <line x1="118" y1="152" x2="204" y2="126" stroke={PALETTE.brand} strokeWidth="6" strokeLinecap="round" />
        <line x1="204" y1="126" x2="212" y2="114" stroke={PALETTE.brand} strokeWidth="4.5" strokeLinecap="round" />
      </g>
      {/* 元の位置 */}
      <line x1="118" y1="158" x2="204" y2="162" stroke={PALETTE.line} strokeWidth="3" strokeDasharray="5 4" />
      <path d="M 190 158 L 190 132" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="150" y="98" fontSize="11.5" fontWeight="700" fill={PALETTE.brand}>
        10〜20cm 上げる
      </text>
      <text x="20" y="184" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        ひざは伸ばしたまま／つま先は自分の方へ
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function SideLegRaise() {
  return (
    <Frame
      title="横向き脚上げ"
      desc="横向きに寝て、上の脚をまっすぐのまま30度ほど持ち上げる。"
      caption="3秒キープ × 10回 × 2〜3セット"
    >
      <g>
        <circle cx="40" cy="150" r="11" fill={PALETTE.ink} />
        <line x1="52" y1="152" x2="120" y2="158" stroke={PALETTE.ink} strokeWidth="7" strokeLinecap="round" />
        {/* 下の脚（軽く曲げる） */}
        <line x1="120" y1="160" x2="168" y2="168" stroke={PALETTE.ink} strokeWidth="5.5" strokeLinecap="round" />
        <line x1="168" y1="168" x2="196" y2="158" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        {/* 上の脚 */}
        <line x1="120" y1="154" x2="206" y2="118" stroke={PALETTE.brand} strokeWidth="6" strokeLinecap="round" />
      </g>
      <path d="M 196 152 q 8 -18 4 -30" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="130" y="96" fontSize="11.5" fontWeight="700" fill={PALETTE.brand}>
        30度くらい上げる
      </text>
      <text x="20" y="188" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        体が後ろに倒れないように
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function ChairStand() {
  return (
    <Frame
      title="椅子からの立ち上がり運動"
      desc="腕を組んで、勢いをつけずに椅子から立ち上がり、ゆっくり座る。"
      caption="10回 × 2〜3セット"
    >
      <Chair x={30} y={140} />
      {/* 座位（薄く） */}
      <g opacity="0.32">
        <circle cx="56" cy="66" r="11" fill={PALETTE.inkMute} />
        <line x1="56" y1="78" x2="60" y2="136" stroke={PALETTE.inkMute} strokeWidth="6" strokeLinecap="round" />
        <line x1="60" y1="136" x2="94" y2="140" stroke={PALETTE.inkMute} strokeWidth="5" strokeLinecap="round" />
        <line x1="94" y1="140" x2="96" y2="180" stroke={PALETTE.inkMute} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* 立位 */}
      <StickPerson
        x={ORIGIN.x + 52}
        y={ORIGIN.y}
        pose={pose({
          elbowL: [-18, 40],
          handL: [4, 50],
          elbowR: [18, 40],
          handR: [-4, 50],
        })}
        color={PALETTE.ink}
      />
      <path d="M 96 76 q 34 -16 58 -8" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="20" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        腕を組んで、勢いをつけずに
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function Walking() {
  return (
    <Frame
      title="ウォーキング"
      desc="かかとから着地し、背すじを伸ばして歩く。少し息が上がるくらいの速さで。"
      caption="20〜30分 × 週3〜5回"
    >
      <StickPerson
        x={78}
        y={ORIGIN.y}
        pose={pose({
          elbowL: [-20, 42],
          handL: [-12, 62],
          elbowR: [18, 44],
          handR: [26, 62],
          kneeL: [-20, 112],
          footL: [-26, 150],
          kneeR: [14, 112],
          footR: [24, 150],
        })}
        color={PALETTE.ink}
      />
      <g opacity="0.35">
        <StickPerson
          x={170}
          y={ORIGIN.y}
          pose={pose({
            elbowL: [20, 42],
            handL: [28, 60],
            elbowR: [-18, 44],
            handR: [-10, 62],
            kneeL: [16, 112],
            footL: [22, 150],
            kneeR: [-18, 112],
            footR: [-26, 150],
          })}
          color={PALETTE.inkMute}
        />
      </g>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
      <path d="M 100 176 L 140 176" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="20" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        「少し息が上がるが
      </text>
      <text x="20" y="50" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        　会話はできる」速さ
      </text>
      <text x="150" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        かかとから
      </text>
      <text x="150" y="50" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
        着地する
      </text>
    </Frame>
  )
}

function AnkleRom() {
  return (
    <Frame
      title="足首の運動・ふくらはぎのストレッチ"
      desc="椅子に座って足首を上下に動かす。壁に手をついてふくらはぎを伸ばす。"
      caption="足首20回／ストレッチ20〜30秒"
    >
      <Chair x={22} y={126} />
      <g>
        <circle cx="46" cy="52" r="10" fill={PALETTE.ink} />
        <line x1="46" y1="63" x2="50" y2="122" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="122" x2="86" y2="126" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <line x1="86" y1="126" x2="88" y2="170" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <line x1="88" y1="170" x2="104" y2="176" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
        <line x1="88" y1="170" x2="100" y2="154" stroke={PALETTE.brand} strokeWidth="4.5" strokeLinecap="round" strokeDasharray="4 3" />
      </g>
      <path d="M 114 172 q 10 -14 4 -26" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />

      {/* 壁ストレッチ */}
      <line x1="222" y1="40" x2="222" y2={FLOOR_Y} stroke={PALETTE.line} strokeWidth="4" />
      <g>
        <circle cx="176" cy="60" r="10" fill={PALETTE.inkSoft} />
        <line x1="176" y1="70" x2="164" y2="122" stroke={PALETTE.inkSoft} strokeWidth="5.5" strokeLinecap="round" />
        <line x1="176" y1="78" x2="212" y2="70" stroke={PALETTE.inkSoft} strokeWidth="4.5" strokeLinecap="round" />
        <line x1="164" y1="122" x2="186" y2="156" stroke={PALETTE.inkSoft} strokeWidth="5" strokeLinecap="round" />
        <line x1="186" y1="156" x2="190" y2="184" stroke={PALETTE.inkSoft} strokeWidth="5" strokeLinecap="round" />
        <line x1="164" y1="122" x2="146" y2="160" stroke={PALETTE.inkSoft} strokeWidth="5" strokeLinecap="round" />
        <line x1="146" y1="160" x2="140" y2="188" stroke={PALETTE.warn} strokeWidth="5" strokeLinecap="round" />
      </g>
      <text x="118" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        後ろの脚のかかとを床につけたまま
      </text>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function GripBall() {
  return (
    <Frame
      title="握る力を保つ運動"
      desc="やわらかいスポンジやタオルを軽く握って5秒キープ。硬いものを強く握らない。"
      caption="10回 × 2セット"
    >
      {/* 手のシルエット */}
      <g stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M 70 150 q 26 -34 62 -30" />
        <path d="M 132 120 q 22 4 26 22" />
        <path d="M 90 116 q 4 -22 24 -22" />
        <path d="M 114 94 q 20 -2 26 14" />
        <path d="M 100 104 q 2 -20 22 -22" />
      </g>
      {/* やわらかいボール */}
      <circle cx="126" cy="126" r="26" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="3" />
      <text x="126" y="131" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={PALETTE.good}>
        やわらか
      </text>
      <text x="18" y="34" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        軽く握って5秒キープ
      </text>
      <g>
        <rect x="150" y="164" width="76" height="34" rx="8" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2" />
        <text x="188" y="180" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={PALETTE.warn}>
          硬いボールを
        </text>
        <text x="188" y="192" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={PALETTE.warn}>
          強く握らない
        </text>
      </g>
    </Frame>
  )
}

function WristRom() {
  return (
    <Frame
      title="手指・手首の関節可動域運動"
      desc="グーからパーへ大きく開く。親指を各指の先に合わせる。手首を上下左右へ。"
      caption="各10回（入浴後がおすすめ）"
    >
      {/* グー */}
      <g transform="translate(46,66)">
        <circle cx="0" cy="0" r="24" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth="3.5" />
        <path d="M -12 -6 h 24 M -12 4 h 24" stroke={PALETTE.ink} strokeWidth="3" />
        <text x="0" y="46" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.ink}>
          グー
        </text>
      </g>
      {/* パー */}
      <g transform="translate(160,66)" stroke={PALETTE.ink} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M 0 22 q -4 -20 0 -30" />
        <path d="M -14 20 q -10 -18 -8 -30" />
        <path d="M 12 20 q 10 -18 8 -30" />
        <path d="M -24 26 q -16 -12 -18 -22" />
        <path d="M 22 26 q 16 -12 18 -22" />
        <circle cx="0" cy="32" r="12" fill={PALETTE.bg} />
      </g>
      <text x="160" y="112" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.ink}>
        パー
      </text>
      <path d="M 82 66 L 116 66" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />

      {/* 手首の上下 */}
      <g transform="translate(60,150)">
        <line x1="0" y1="10" x2="44" y2="10" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="44" y1="10" x2="66" y2="-8" stroke={PALETTE.brand} strokeWidth="5" strokeLinecap="round" />
        <line x1="44" y1="10" x2="66" y2="28" stroke={PALETTE.brand} strokeWidth="5" strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M 78 -4 q 8 14 0 28" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
        <text x="94" y="16" fontSize="11.5" fontWeight="700" fill={PALETTE.brandMid}>
          手首を上下に
        </text>
      </g>
      <text x="18" y="196" fontSize="11" fill={PALETTE.warn} fontWeight="700">
        赤く熱をもって腫れている時期は無理に動かさない
      </text>
    </Frame>
  )
}

function ShoulderPulley() {
  return (
    <Frame
      title="肩の可動域運動（振り子・棒体操）"
      desc="腕をぶら下げて小さく振る。両手で棒を持って痛くない範囲で上げる。"
      caption="各10回"
    >
      {/* 振り子 */}
      <g>
        <circle cx="60" cy="52" r="11" fill={PALETTE.ink} />
        <line x1="60" y1="63" x2="66" y2="118" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="62" y1="76" x2="52" y2="130" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
        <line x1="66" y1="118" x2="60" y2="176" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M 34 140 q 18 12 38 0" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
        <text x="52" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fill={PALETTE.inkSoft}>
          力を抜いて振る
        </text>
      </g>
      {/* 棒体操 */}
      <g>
        <circle cx="168" cy="60" r="11" fill={PALETTE.ink} />
        <line x1="168" y1="71" x2="168" y2="126" stroke={PALETTE.ink} strokeWidth="6" strokeLinecap="round" />
        <line x1="168" y1="82" x2="142" y2="52" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
        <line x1="168" y1="82" x2="198" y2="52" stroke={PALETTE.ink} strokeWidth="4.5" strokeLinecap="round" />
        <line x1="130" y1="48" x2="210" y2="48" stroke={PALETTE.brand} strokeWidth="5" strokeLinecap="round" />
        <line x1="168" y1="126" x2="158" y2="176" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <line x1="168" y1="126" x2="180" y2="176" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M 218 52 L 218 30" fill="none" stroke={PALETTE.brandMid} strokeWidth="3" markerEnd="url(#exArr)" />
        <text x="168" y="192" textAnchor="middle" fontSize="11" fontWeight="700" fill={PALETTE.inkSoft}>
          棒を持って上げる
        </text>
      </g>
      <Floor x1={16} x2={224} y={FLOOR_Y} />
    </Frame>
  )
}

function JointProtect() {
  return (
    <Frame
      title="関節を守る使い方"
      desc="指先でつまむのではなく、両手のひら全体で持つ。大きい関節を使う。"
      caption="毎日の生活の中で"
    >
      {/* 良い例 */}
      <g>
        <rect x="18" y="34" width="94" height="150" rx="10" fill={PALETTE.goodLight} stroke={PALETTE.good} strokeWidth="2.5" />
        <text x="65" y="54" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.good}>
          ○ 両手のひらで
        </text>
        {/* 両手で鍋を持つ */}
        <rect x="42" y="96" width="46" height="30" rx="4" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth="2.5" />
        <path d="M 40 100 q -14 6 -4 20" fill="none" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M 90 100 q 14 6 4 20" fill="none" stroke={PALETTE.ink} strokeWidth="5" strokeLinecap="round" />
        <text x="65" y="152" textAnchor="middle" fontSize="11" fill={PALETTE.inkSoft}>
          手のひら全体で
        </text>
        <text x="65" y="168" textAnchor="middle" fontSize="11" fill={PALETTE.inkSoft}>
          支える
        </text>
      </g>
      {/* 悪い例 */}
      <g>
        <rect x="128" y="34" width="94" height="150" rx="10" fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth="2.5" />
        <text x="175" y="54" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={PALETTE.warn}>
          × 指先でつまむ
        </text>
        <rect x="158" y="104" width="34" height="26" rx="4" fill={PALETTE.bg} stroke={PALETTE.ink} strokeWidth="2.5" />
        <path d="M 158 104 q -10 -12 2 -16" fill="none" stroke={PALETTE.warn} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 192 104 q 10 -12 -2 -16" fill="none" stroke={PALETTE.warn} strokeWidth="4.5" strokeLinecap="round" />
        <text x="175" y="152" textAnchor="middle" fontSize="11" fill={PALETTE.warn} fontWeight="700">
          指の関節に
        </text>
        <text x="175" y="168" textAnchor="middle" fontSize="11" fill={PALETTE.warn} fontWeight="700">
          変形を招く
        </text>
      </g>
    </Frame>
  )
}

function Aquatic() {
  return (
    <Frame
      title="水中運動"
      desc="胸の高さの水中でゆっくり歩く。横歩き・後ろ歩きも取り入れる。"
      caption="20〜30分 × 週1〜3回"
    >
      {/* 水面 */}
      <path
        d="M 8 106 q 20 -8 40 0 q 20 8 40 0 q 20 -8 40 0 q 20 8 40 0 q 20 -8 40 0"
        fill="none"
        stroke={PALETTE.brandMid}
        strokeWidth="3"
      />
      <rect x="8" y="106" width="224" height="86" fill={PALETTE.brandLight} opacity="0.6" />
      <StickPerson
        x={96}
        y={ORIGIN.y - 6}
        pose={pose({
          elbowL: [-22, 42],
          handL: [-34, 58],
          elbowR: [20, 44],
          handR: [32, 58],
          kneeL: [-20, 110],
          footL: [-26, 144],
          kneeR: [14, 110],
          footR: [22, 144],
        })}
        color={PALETTE.ink}
      />
      <path d="M 150 150 L 196 150" fill="none" stroke={PALETTE.brand} strokeWidth="3" markerEnd="url(#exArr)" />
      <text x="16" y="30" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        胸の高さの水中で
      </text>
      <text x="16" y="46" fontSize="11.5" fontWeight="700" fill={PALETTE.inkSoft}>
        ゆっくり歩く
      </text>
      <text x="120" y="186" textAnchor="middle" fontSize="10.5" fill={PALETTE.brand} fontWeight="700">
        関節への負担が少ない／骨への刺激は弱い
      </text>
    </Frame>
  )
}

// ---------------------------------------------------------------- ディスパッチャ

const MAP: Record<ExerciseFigureKey, () => ReactElement> = {
  oneLegStand: OneLegStand,
  squat: Squat,
  heelRaise: HeelRaise,
  backExtension: BackExtension,
  quadSetting: QuadSetting,
  straightLegRaise: StraightLegRaise,
  sideLegRaise: SideLegRaise,
  chairStand: ChairStand,
  walking: Walking,
  ankleRom: AnkleRom,
  gripBall: GripBall,
  wristRom: WristRom,
  shoulderPulley: ShoulderPulley,
  jointProtect: JointProtect,
  aquatic: Aquatic,
}

export function ExerciseFigure({ figure }: { figure: ExerciseFigureKey }) {
  const Comp = MAP[figure]
  if (!Comp) return null
  return <Comp />
}

export type { StickPose }
