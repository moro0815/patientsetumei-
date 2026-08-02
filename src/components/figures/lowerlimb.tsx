import { ArrowDefs, FigCaption, Figure, Floor, MultiText, PALETTE, Pill } from './common'

/**
 * 下肢の図（変形性股関節症・足底腱膜炎・足関節外側靱帯損傷・肉離れ）
 */

// ================================================================ 変形性股関節症

/**
 * 股関節の正面像。
 * 日本では臼蓋形成不全を背景にした二次性股関節症が多いため、
 * 「屋根が浅い → 一点に体重が集中 → すり減る」という流れを描く。
 */
export function HipOaFigure({ grade = 2, dysplasia = false }: { grade?: 0 | 1 | 2 | 3 | 4; dysplasia?: boolean }) {
  // 関節のすき間はグレードが進むほど狭くなる
  const gap = [14, 11, 7, 4, 1.5][grade]
  const roofShort = dysplasia ? 26 : 0

  return (
    <Figure viewBox="0 0 560 320" title="股関節のしくみ" desc="骨盤の受け皿と大腿骨の頭の間の軟骨がすり減っています">
      <ArrowDefs id="hip-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={26} size={16}>
        股関節を正面から見た図
      </FigCaption>

      {/* 骨盤 */}
      <path
        d={`M60 60 Q170 40 250 96 L${268 - roofShort} 150 Q210 118 120 132 Z`}
        fill={PALETTE.bone}
        stroke={PALETTE.boneEdge}
        strokeWidth={2.6}
      />
      <text x={104} y={84} fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
        骨盤
      </text>

      {/* 受け皿（臼蓋）の屋根 */}
      <path
        d={`M${140} ${150} Q${200} ${118} ${268 - roofShort} ${150}`}
        fill="none"
        stroke={dysplasia ? PALETTE.warn : PALETTE.boneEdge}
        strokeWidth={dysplasia ? 6 : 5}
        strokeLinecap="round"
      />
      {dysplasia && (
        <>
          <text x={286} y={126} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            屋根が浅い
          </text>
          <text x={286} y={142} fontSize={11.5} fill={PALETTE.inkSoft}>
            （臼蓋形成不全）
          </text>
        </>
      )}

      {/* 関節のすき間（軟骨） */}
      <path
        d={`M${142} ${152} Q${200} ${124} ${266 - roofShort} ${152}`}
        fill="none"
        stroke={gap > 8 ? PALETTE.brandMid : PALETTE.warn}
        strokeWidth={gap}
        strokeLinecap="round"
        opacity={0.55}
      />

      {/* 大腿骨頭 */}
      <circle cx={200} cy={188} r={44} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.6} />
      {/* 頸部・骨幹 */}
      <path d="M226 218 L268 286" stroke={PALETTE.boneEdge} strokeWidth={30} strokeLinecap="round" />
      <path d="M226 218 L268 286" stroke={PALETTE.bone} strokeWidth={23} strokeLinecap="round" />
      <text x={286} y={274} fontSize={12} fontWeight={700} fill={PALETTE.inkSoft}>
        太ももの骨
      </text>

      {/* 体重の集中 */}
      <line x1={200} y1={40} x2={200} y2={110} stroke={PALETTE.warn} strokeWidth={4} markerEnd="url(#hip-arrow)" />
      <text x={208} y={50} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
        体重
      </text>

      {grade >= 2 && (
        <>
          <circle cx={244 - roofShort / 2} cy={150} r={16} fill="none" stroke={PALETTE.warn} strokeWidth={3} />
          <text x={296} y={186} fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            すき間が狭い
          </text>
          <text x={296} y={202} fontSize={11.5} fill={PALETTE.inkSoft}>
            （軟骨がすり減った）
          </text>
        </>
      )}

      <Pill
        x={380}
        y={44}
        w={158}
        h={30}
        fill={grade >= 3 ? PALETTE.warnLight : PALETTE.brandLight}
        stroke={grade >= 3 ? PALETTE.warn : PALETTE.brandMid}
        label={['前期', '初期', '進行期', '進行期', '末期'][grade]}
        labelColor={grade >= 3 ? PALETTE.warn : PALETTE.brand}
        size={13}
      />
      <text x={280} y={310} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        受け皿が浅いと体重が一点に集中し、軟骨が早くすり減ります
      </text>
    </Figure>
  )
}

/** 股関節にかかる力と、杖・減量の効果 */
export function HipLoadFigure({ weightKg, cane = false }: { weightKg?: number | null; cane?: boolean }) {
  const w = weightKg ?? 60
  const single = Math.round(w * 3)
  const withCane = Math.round(w * 3 * 0.6)
  // 帯の右に「約 ◯◯ kg」を置くため、帯の最大長は数値の幅を残して決める
  const BAR_X = 176
  const BAR_MAX = 250
  return (
    <Figure viewBox="0 0 560 224" title="股関節にかかる力" desc="片脚立ちでは体重の約3倍、杖を使うと約4割減らせます">
      {[
        { label: '両脚で立つ', value: Math.round(w / 2), color: PALETTE.good, note: '' },
        { label: '片脚立ち・歩行', value: single, color: PALETTE.warn, note: '体重の約3倍' },
        {
          label: '杖を使って歩く',
          value: withCane,
          color: PALETTE.brand,
          note: cane ? 'いま使っています' : '約4割 減らせます',
        },
      ].map((r, i) => {
        const y = 22 + i * 58
        const bar = Math.max(24, (BAR_MAX * r.value) / single)
        return (
          <g key={r.label}>
            <text x={22} y={y + 22} fontSize={13} fontWeight={700} fill={PALETTE.ink}>
              {r.label}
            </text>
            <rect x={BAR_X} y={y + 4} width={bar} height={26} rx={6} fill={r.color} opacity={0.85} />
            <text x={BAR_X + bar + 10} y={y + 23} fontSize={14} fontWeight={800} fill={r.color}>
              約 {r.value} kg
            </text>
            {r.note && (
              <text x={BAR_X} y={y - 2} fontSize={10.5} fontWeight={700} fill={PALETTE.inkMute}>
                {r.note}
              </text>
            )}
          </g>
        )
      })}
      <text x={280} y={208} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        杖は「痛い方の反対の手」に持ちます。それだけで負担が約4割減ります
      </text>
    </Figure>
  )
}

// ================================================================ 足底腱膜炎

/** 足底腱膜（かかとから足指の付け根までのすじ）と痛む場所 */
export function PlantarFasciaFigure({ heelSpur = false }: { heelSpur?: boolean }) {
  return (
    <Figure viewBox="0 0 600 290" title="足底腱膜炎" desc="かかとの骨に付く腱膜の付け根が傷んでいます">
      <ArrowDefs id="pf-arrow" color={PALETTE.warn} />
      <FigCaption x={300} y={26} size={16}>
        足を内側から見た図
      </FigCaption>

      {/* 足の輪郭 */}
      <path
        d="M92 176 Q78 128 108 112 Q142 96 176 118 L340 158 Q420 168 486 186 Q520 194 512 214 L120 214 Q92 212 92 176 Z"
        fill={PALETTE.bg}
        stroke={PALETTE.line}
        strokeWidth={2}
      />

      {/* 踵骨 */}
      <ellipse cx={132} cy={166} rx={42} ry={36} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.6} />
      <text x={132} y={170} textAnchor="middle" fontSize={12} fontWeight={700} fill="#8a6a34">
        かかとの骨
      </text>

      {/* 中足骨 */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${252 + i * 8} ${170 + i * 4} L${430 + i * 16} ${190 + i * 4}`}
          stroke={PALETTE.boneEdge}
          strokeWidth={10}
          strokeLinecap="round"
        />
      ))}

      {/* 足底腱膜 */}
      <path
        d="M146 200 Q280 216 470 206"
        fill="none"
        stroke="#e0b98a"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <text x={324} y={244} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#a06a3c">
        足底腱膜（土ふまずを支えるすじ）
      </text>

      {/* 痛む付け根 */}
      <circle cx={152} cy={198} r={18} fill={PALETTE.warnLight} stroke={PALETTE.warn} strokeWidth={3.5} />
      <circle cx={152} cy={198} r={6} fill={PALETTE.warn} />
      <line x1={98} y1={262} x2={140} y2={214} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#pf-arrow)" />
      <text x={22} y={278} fontSize={13} fontWeight={800} fill={PALETTE.warn}>
        ここが痛い（かかとの内側前より）
      </text>

      {/* 踵骨棘 */}
      {heelSpur && (
        <>
          <path d="M154 196 L188 202 L152 208 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2} />
          <text x={200} y={186} fontSize={11.5} fontWeight={700} fill={PALETTE.inkMute}>
            骨のとげ（踵骨棘）
          </text>
          <text x={200} y={200} fontSize={10.5} fill={PALETTE.inkMute}>
            ※あっても痛みの原因とは限りません
          </text>
        </>
      )}

      {/* アキレス腱・ふくらはぎ */}
      <path d="M124 132 Q118 78 130 44" fill="none" stroke="#e0b98a" strokeWidth={12} strokeLinecap="round" />
      <text x={140} y={62} fontSize={11.5} fontWeight={700} fill="#a06a3c">
        アキレス腱
      </text>
      <text x={140} y={78} fontSize={10.5} fill={PALETTE.inkMute}>
        ここが硬いと腱膜が引っぱられます
      </text>
    </Figure>
  )
}

/** 朝の一歩目が痛いしくみ（windlass） */
export function FirstStepPainFigure() {
  return (
    <Figure viewBox="0 0 600 230" title="朝の一歩目がいちばん痛いのはなぜか" desc="寝ている間に縮んだ腱膜が、朝の一歩目で急に引き伸ばされるためです">
      <FigCaption x={300} y={26} size={16}>
        朝の一歩目がいちばん痛いのはなぜ？
      </FigCaption>
      {[
        { t: '寝ている間', d: '足首が伸びた姿勢で\n腱膜が縮む', color: PALETTE.brandLight, stroke: PALETTE.brandMid, icon: '🛌' },
        { t: '朝の一歩目', d: '縮んだ腱膜が\n急に引き伸ばされる', color: PALETTE.warnLight, stroke: PALETTE.warn, icon: '⚡' },
        { t: '歩くうちに', d: '腱膜がほぐれて\n痛みがやわらぐ', color: PALETTE.goodLight, stroke: PALETTE.good, icon: '🚶' },
        { t: '夕方', d: '使いすぎで\nまた痛くなる', color: PALETTE.warnLight, stroke: PALETTE.warn, icon: '🌆' },
      ].map((s, i) => {
        const x = 24 + i * 146
        return (
          <g key={i}>
            <rect x={x} y={46} width={130} height={122} rx={12} fill={s.color} stroke={s.stroke} strokeWidth={2} />
            <text x={x + 65} y={84} textAnchor="middle" fontSize={26}>
              {s.icon}
            </text>
            <text x={x + 65} y={110} textAnchor="middle" fontSize={13} fontWeight={800} fill={PALETTE.ink}>
              {s.t}
            </text>
            <MultiText x={x + 65} y={128} anchor="middle" lines={s.d.split('\n')} size={11} color={PALETTE.inkSoft} weight={600} />
            {i < 3 && (
              <path d={`M${x + 134} 107 L${x + 144} 107`} stroke={PALETTE.inkMute} strokeWidth={3} />
            )}
          </g>
        )
      })}
      <text x={300} y={200} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        だから「朝、起き上がる前のストレッチ」がいちばん効きます
      </text>
    </Figure>
  )
}

// ================================================================ 足関節外側靱帯損傷

/** 足首の外側の靱帯（前距腓靱帯・踵腓靱帯）と、内返し捻挫 */
export function AnkleLigamentFigure({ injured = 'atfl' }: { injured?: 'atfl' | 'atfl-cfl' | 'none' }) {
  const atfl = injured !== 'none'
  const cfl = injured === 'atfl-cfl'
  return (
    <Figure viewBox="0 0 560 320" title="足首の外側の靱帯" desc="足首を内側にひねって、外側の靱帯が伸びたり切れたりしています">
      <ArrowDefs id="al-arrow" color={PALETTE.warn} />
      <FigCaption x={280} y={26} size={16}>
        足首を外側から見た図
      </FigCaption>

      {/* 脛骨・腓骨 */}
      <path d="M198 50 L206 168" stroke={PALETTE.boneEdge} strokeWidth={34} strokeLinecap="round" />
      <path d="M198 50 L206 168" stroke={PALETTE.bone} strokeWidth={26} strokeLinecap="round" />
      <path d="M244 54 L250 178" stroke={PALETTE.boneEdge} strokeWidth={20} strokeLinecap="round" />
      <path d="M244 54 L250 178" stroke={PALETTE.bone} strokeWidth={14} strokeLinecap="round" />
      <text x={148} y={80} fontSize={11.5} fill={PALETTE.inkMute}>
        すねの骨
      </text>
      <text x={266} y={80} fontSize={11.5} fill={PALETTE.inkMute}>
        外くるぶし
      </text>

      {/* 距骨・踵骨・足部 */}
      <ellipse cx={214} cy={196} rx={46} ry={26} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <ellipse cx={192} cy={240} rx={54} ry={30} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      <path d="M250 200 L392 226 Q408 230 404 244 L214 250 Q246 232 250 200 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.2} />
      <text x={330} y={272} textAnchor="middle" fontSize={11.5} fill={PALETTE.inkMute}>
        足の甲
      </text>

      {/* 前距腓靱帯 ATFL */}
      <line
        x1={252}
        y1={182}
        x2={284}
        y2={202}
        stroke={atfl ? PALETTE.warn : PALETTE.good}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={atfl ? '9 6' : undefined}
      />
      <text x={296} y={196} fontSize={12} fontWeight={800} fill={atfl ? PALETTE.warn : PALETTE.good}>
        前距腓靱帯
      </text>
      <text x={296} y={211} fontSize={10.5} fill={PALETTE.inkMute}>
        {atfl ? '← いちばん傷めやすい' : '正常'}
      </text>

      {/* 踵腓靱帯 CFL */}
      <line
        x1={248}
        y1={186}
        x2={230}
        y2={244}
        stroke={cfl ? PALETTE.warn : PALETTE.good}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={cfl ? '9 6' : undefined}
      />
      <text x={92} y={214} fontSize={12} fontWeight={800} fill={cfl ? PALETTE.warn : PALETTE.good}>
        踵腓靱帯
      </text>

      {/* 内返しの向き */}
      <path d="M126 288 Q196 306 300 292" fill="none" stroke={PALETTE.warn} strokeWidth={3} markerEnd="url(#al-arrow)" />
      <text x={130} y={310} fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
        足首を内側にひねると、外側の靱帯が伸ばされます
      </text>

      <Floor x1={120} y={272} x2={420} />
    </Figure>
  )
}

/** 捻挫の重症度（I〜III度） */
export function SprainGradeFigure({ grade }: { grade?: 1 | 2 | 3 | null }) {
  const rows = [
    { id: 1, name: 'Ⅰ度（軽い）', plain: '靱帯が伸びた状態。腫れは軽く、歩ける', weeks: 'およそ 1〜2週' },
    { id: 2, name: 'Ⅱ度（中くらい）', plain: '靱帯が部分的に切れた状態。腫れと内出血あり', weeks: 'およそ 3〜6週' },
    { id: 3, name: 'Ⅲ度（重い）', plain: '靱帯が完全に切れた状態。強く腫れ、体重をかけられない', weeks: 'およそ 8〜12週' },
  ]
  return (
    <Figure viewBox="0 0 560 220" title="ねんざの重さと治るまでの目安" desc="靱帯の傷み具合で、治るまでの期間が変わります">
      <FigCaption x={280} y={24} size={15}>
        ねんざの重さと、スポーツ復帰までの目安
      </FigCaption>
      {rows.map((r, i) => {
        const on = grade === r.id
        const y = 44 + i * 52
        return (
          <g key={r.id}>
            <rect
              x={24}
              y={y}
              width={512}
              height={44}
              rx={8}
              fill={on ? PALETTE.warnLight : PALETTE.bg}
              stroke={on ? PALETTE.warn : PALETTE.line}
              strokeWidth={on ? 2.6 : 1.2}
            />
            <text x={44} y={y + 20} fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              {r.name}
            </text>
            <text x={44} y={y + 37} fontSize={11.5} fill={PALETTE.inkSoft}>
              {r.plain}
            </text>
            <text x={520} y={y + 28} textAnchor="end" fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkSoft}>
              {r.weeks}
            </text>
          </g>
        )
      })}
      <text x={280} y={212} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        期間はあくまで目安です。腫れ・痛み・動きの回復を見ながら段階的に進めます
      </text>
    </Figure>
  )
}

// ================================================================ 肉離れ

/** 肉離れの重症度（筋腱移行部の損傷） */
export function MuscleStrainFigure({ grade = 2 }: { grade?: 1 | 2 | 3 }) {
  return (
    <Figure viewBox="0 0 600 300" title="肉離れ（筋肉の損傷）" desc="筋肉と腱のつなぎ目が引き伸ばされて傷ついています">
      <ArrowDefs id="ms-arrow" color={PALETTE.warn} />
      <FigCaption x={300} y={26} size={16}>
        筋肉と腱のつなぎ目が傷んでいます
      </FigCaption>

      {[1, 2, 3].map((g) => {
        const x = 24 + (g - 1) * 192
        const on = grade === g
        return (
          <g key={g}>
            <rect x={x} y={46} width={176} height={186} rx={12} fill={on ? PALETTE.warnLight : PALETTE.bg} stroke={on ? PALETTE.warn : PALETTE.line} strokeWidth={on ? 3 : 1.4} />
            {/* 腱 */}
            <path d={`M${x + 24} 88 L${x + 24} 118`} stroke="#e0b98a" strokeWidth={14} strokeLinecap="round" />
            <path d={`M${x + 152} 88 L${x + 152} 118`} stroke="#e0b98a" strokeWidth={14} strokeLinecap="round" />
            {/* 筋腹 */}
            <path
              d={`M${x + 24} 100 Q${x + 88} 62 ${x + 152} 100 Q${x + 88} 156 ${x + 24} 100 Z`}
              fill="#e79a8e"
              stroke="#b95f52"
              strokeWidth={2}
            />
            {/* 損傷 */}
            {g === 1 && <line x1={x + 62} y1={100} x2={x + 78} y2={104} stroke={PALETTE.warn} strokeWidth={3} strokeLinecap="round" />}
            {g === 2 && (
              <path d={`M${x + 54} 90 L${x + 74} 106 L${x + 96} 92`} fill="none" stroke={PALETTE.warn} strokeWidth={4} strokeLinecap="round" />
            )}
            {g === 3 && (
              <>
                <path d={`M${x + 78} 66 L${x + 78} 148`} stroke="#fff" strokeWidth={12} />
                <path d={`M${x + 78} 66 L${x + 78} 148`} stroke={PALETTE.warn} strokeWidth={4} strokeDasharray="7 5" />
              </>
            )}
            <text x={x + 88} y={178} textAnchor="middle" fontSize={13} fontWeight={800} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              {['Ⅰ度（軽い）', 'Ⅱ度（中くらい）', 'Ⅲ度（重い）'][g - 1]}
            </text>
            <MultiText
              x={x + 88}
              y={196}
              anchor="middle"
              size={11}
              lines={[
                ['筋線維の\nわずかな傷み', '筋線維が\n部分的に切れる', '筋肉と腱が\n完全に切れる'][g - 1].split('\n')[0],
                ['筋線維の\nわずかな傷み', '筋線維が\n部分的に切れる', '筋肉と腱が\n完全に切れる'][g - 1].split('\n')[1],
              ]}
              color={PALETTE.inkSoft}
              weight={600}
            />
            <text x={x + 88} y={226} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={on ? PALETTE.warn : PALETTE.inkMute}>
              復帰の目安 {['1〜2週', '3〜6週', '2〜3か月以上'][g - 1]}
            </text>
          </g>
        )
      })}

      <text x={300} y={262} textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.ink}>
        急いで復帰すると、同じ場所をもう一度傷めます（再発がいちばん多い）
      </text>
      <text x={300} y={284} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        「痛みが消えた」ではなく「力が戻った」ことを確かめてから復帰します
      </text>
    </Figure>
  )
}

/** 急性期の応急処置（POLICE／PEACE & LOVE の考え方） */
export function AcuteCareFigure() {
  const steps = [
    { k: 'P', icon: '🛡️', title: '守る', d: '痛い動きを\n数日避ける' },
    { k: 'OL', icon: '🚶', title: '早めに動かす', d: '痛くない範囲で\n体重をかけていく' },
    { k: 'I', icon: '🧊', title: '冷やす', d: '15〜20分を\n数回／日' },
    { k: 'C', icon: '🩹', title: '圧迫する', d: '弾性包帯・\nサポーター' },
    { k: 'E', icon: '⬆️', title: '高くする', d: '心臓より高く\n上げて休む' },
  ]
  return (
    <Figure viewBox="0 0 640 220" title="けがをした直後にすること" desc="守る・早めに動かす・冷やす・圧迫・挙上">
      <FigCaption x={320} y={26} size={16}>
        けがをした直後の48時間にすること
      </FigCaption>
      {steps.map((s, i) => {
        const x = 16 + i * 124
        return (
          <g key={s.k}>
            <rect x={x} y={46} width={112} height={124} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.6} />
            <text x={x + 56} y={84} textAnchor="middle" fontSize={28}>
              {s.icon}
            </text>
            <text x={x + 56} y={110} textAnchor="middle" fontSize={13} fontWeight={800} fill={PALETTE.ink}>
              {s.title}
            </text>
            <MultiText x={x + 56} y={128} anchor="middle" lines={s.d.split('\n')} size={11} color={PALETTE.inkSoft} weight={600} />
          </g>
        )
      })}
      <text x={320} y={196} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
        最初の数日は、お酒・熱いお風呂・強いマッサージは腫れを強めるので避けてください
      </text>
    </Figure>
  )
}

/** 段階的なスポーツ復帰 */
export function ReturnToPlayFigure({ current }: { current?: number | null }) {
  const steps = [
    '痛みなく歩ける',
    '軽いジョギング',
    'ダッシュ・方向転換',
    '部分参加（当たりなし）',
    '完全復帰',
  ]
  const w = 640
  return (
    <Figure viewBox={`0 0 ${w} 190`} title="スポーツ復帰までの段階" desc="ひとつずつ、痛みが出ないことを確かめて進みます">
      <FigCaption x={w / 2} y={26} size={16}>
        ここを1段ずつ、痛みが出ないことを確かめて進みます
      </FigCaption>
      {steps.map((s, i) => {
        const x = 18 + i * 124
        const done = current != null && i + 1 < current
        const on = current != null && i + 1 === current
        return (
          <g key={s}>
            <rect
              x={x}
              y={58}
              width={110}
              height={62}
              rx={10}
              fill={on ? PALETTE.brandLight : done ? PALETTE.goodLight : PALETTE.bg}
              stroke={on ? PALETTE.brand : done ? PALETTE.good : PALETTE.line}
              strokeWidth={on ? 3 : 1.5}
            />
            <text x={x + 55} y={82} textAnchor="middle" fontSize={12} fontWeight={800} fill={on ? PALETTE.brand : PALETTE.inkMute}>
              STEP {i + 1}
            </text>
            <MultiText
              x={x + 55}
              y={100}
              anchor="middle"
              lines={s.length > 8 ? [s.slice(0, 7), s.slice(7)] : [s]}
              size={11.5}
              color={PALETTE.ink}
              weight={700}
            />
            {i < steps.length - 1 && <path d={`M${x + 112} 89 L${x + 122} 89`} stroke={PALETTE.inkMute} strokeWidth={3} />}
          </g>
        )
      })}
      <text x={w / 2} y={152} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.warn}>
        1段進むごとに、翌日に痛み・腫れが出ていないかを必ず確認してください
      </text>
      <text x={w / 2} y={172} textAnchor="middle" fontSize={12} fill={PALETTE.inkSoft}>
        出た場合はひとつ前の段階に戻ります。急ぐと再発します
      </text>
    </Figure>
  )
}

// ================================================================ シンスプリント

/**
 * シンスプリント（脛骨過労性骨膜炎）。
 *
 * この疾患の説明でいちばん大事なのは「どこが痛いか」で、
 * すねの内側の下1/3に**広い範囲**の痛みが出るのがシンスプリント、
 * **一点**を押すと激痛なら疲労骨折を疑う、という区別を図で示す。
 */
export function ShinSplintsFigure({ compareStressFracture = true }: { compareStressFracture?: boolean }) {
  const w = compareStressFracture ? 620 : 320
  return (
    <Figure
      viewBox={`0 0 ${w} 372`}
      title="シンスプリント（すねの内側の痛み）"
      desc="すねの骨の内側のふちに沿って、広い範囲に痛みが出ます"
    >
      <ArrowDefs id="ss-arrow" color={PALETTE.warn} />
      <FigCaption x={155} y={26} size={15} color={PALETTE.warn}>
        シンスプリント
      </FigCaption>
      {compareStressFracture && (
        <FigCaption x={465} y={26} size={15} color={PALETTE.inkSoft}>
          疲労骨折（見分けが大事）
        </FigCaption>
      )}

      <g transform="translate(45,40)">
        <ShinBone spread />
      </g>
      {compareStressFracture && (
        <g transform="translate(355,40)">
          <ShinBone spread={false} />
        </g>
      )}

      <text x={w / 2} y={352} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.ink}>
        {compareStressFracture
          ? '「広い範囲がじんわり痛い」のがシンスプリント、「一点が激しく痛い」なら疲労骨折を疑います'
          : 'すねの内側のふちに沿って、広い範囲に痛みが出ます'}
      </text>
    </Figure>
  )
}

/**
 * すね（脛骨）を前から見た図。
 * spread=true で痛みの範囲が広い＝シンスプリント、false で一点＝疲労骨折。
 * 注釈は骨の下にまとめて置き、ラベル同士が重ならないようにしている。
 */
function ShinBone({ spread }: { spread: boolean }) {
  return (
    <g>
      {/* ひざ */}
      <ellipse cx={110} cy={20} rx={32} ry={16} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.4} />
      {/* 脛骨 */}
      <path d="M88 26 L86 200 L128 200 L126 26 Z" fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.6} />
      {/* 腓骨 */}
      <path d="M136 36 L140 196" stroke={PALETTE.boneEdge} strokeWidth={11} strokeLinecap="round" />
      <path d="M136 36 L140 196" stroke={PALETTE.bone} strokeWidth={7} strokeLinecap="round" />
      {/* 足首 */}
      <ellipse cx={104} cy={210} rx={28} ry={12} fill={PALETTE.bone} stroke={PALETTE.boneEdge} strokeWidth={2.2} />
      <text x={110} y={236} textAnchor="middle" fontSize={11.5} fill={PALETTE.inkMute}>
        すねの骨（脛骨）
      </text>

      {spread ? (
        <>
          {/* 内側のふちに沿って、下1/3に広く */}
          <rect x={78} y={116} width={16} height={78} rx={8} fill={PALETTE.warn} opacity={0.3} />
          <rect x={74} y={112} width={24} height={86} rx={12} fill="none" stroke={PALETTE.warn} strokeWidth={3} strokeDasharray="7 4" />
          {/* 矢印は骨の右側から。左側は文字を置かないので重ならない */}
          <line x1={188} y1={132} x2={104} y2={150} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#ss-arrow)" />
          <text x={192} y={128} fontSize={12} fontWeight={800} fill={PALETTE.warn}>
            すねの内側の
          </text>
          <text x={192} y={144} fontSize={12} fontWeight={800} fill={PALETTE.warn}>
            ふちに沿って
          </text>
          {/* 注釈は骨の下にまとめる */}
          <text x={110} y={262} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            5cm以上にわたって
          </text>
          <text x={110} y={280} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            じんわり痛い
          </text>
        </>
      ) : (
        <>
          {/* 一点 */}
          <circle cx={100} cy={150} r={12} fill={PALETTE.warn} opacity={0.5} />
          <circle cx={100} cy={150} r={12} fill="none" stroke={PALETTE.warn} strokeWidth={3} />
          <line x1={186} y1={132} x2={114} y2={146} stroke={PALETTE.warn} strokeWidth={2.5} markerEnd="url(#ss-arrow)" />
          <text x={190} y={136} fontSize={12} fontWeight={800} fill={PALETTE.warn}>
            一点だけ
          </text>
          <text x={110} y={262} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={PALETTE.warn}>
            一点が激しく痛い
          </text>
          <text x={110} y={280} textAnchor="middle" fontSize={11.5} fill={PALETTE.inkSoft}>
            → 画像で確認します
          </text>
        </>
      )}
    </g>
  )
}

/** 発症につながる負荷の増やしすぎ（練習量・路面・シューズ） */
export function OveruseFactorsFigure() {
  const items = [
    { icon: '📈', t: '練習量が急に増えた', d: '距離・回数・強度を\n一度に上げた' },
    { icon: '🛣️', t: '硬い路面', d: 'アスファルト・\n体育館の床' },
    { icon: '👟', t: 'すり減った靴', d: 'クッションが\n効いていない' },
    { icon: '🦶', t: '足のかたち', d: '扁平足・\n回内足' },
  ]
  return (
    <Figure viewBox="0 0 620 230" title="シンスプリントが起きるきっかけ" desc="練習量・路面・靴・足のかたちが重なって起こります">
      <FigCaption x={310} y={26} size={16}>
        こんなときに起こります
      </FigCaption>
      {items.map((it, i) => {
        const x = 22 + i * 148
        return (
          <g key={i}>
            <rect x={x} y={46} width={136} height={124} rx={12} fill={PALETTE.bg} stroke={PALETTE.line} strokeWidth={1.6} />
            <text x={x + 68} y={86} textAnchor="middle" fontSize={28}>
              {it.icon}
            </text>
            <text x={x + 68} y={112} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={PALETTE.ink}>
              {it.t}
            </text>
            <MultiText x={x + 68} y={130} anchor="middle" lines={it.d.split('\n')} size={11} color={PALETTE.inkSoft} weight={600} />
          </g>
        )
      })}
      <text x={310} y={198} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={PALETTE.good}>
        練習量を増やすときは「1週間で1割まで」が目安です
      </text>
    </Figure>
  )
}
