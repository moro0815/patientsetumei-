import { BodyMapFigure, type BodySpot } from './generic'
import { RaJointMapFigure } from './joint'
import { useStore } from '@/state/store'
import type { RaJointRegion } from '@/types'

/**
 * セッションにつないだ図。
 *
 * スライドの組み立て（slides/*.tsx）は session を受け取るだけで、
 * 書き込みの口を持たない。図から直接入力できるようにするために、
 * ここで store につないだ薄い包みを用意する。
 *
 * こうしておけば slides 側の型を変えずに済み、
 * 「図を押して記録する」図を増やすときもこのファイルに1つ足すだけになる。
 */

/** 罹患関節マップ。関節を押すと session.ra.affectedRegions が更新される */
export function RaJointMapConnected() {
  const { session, patch } = useStore()
  const regions = session.ra.affectedRegions

  const toggle = (r: RaJointRegion) => {
    const next = regions.includes(r) ? regions.filter((x) => x !== r) : [...regions, r]
    patch('ra', { affectedRegions: next })
  }

  return <RaJointMapFigure regions={regions} onToggle={toggle} />
}

/**
 * 痛みのある場所（体の地図）。印を押すと session.condition.painSpots が更新される。
 *
 * defaults は疾患から決まる既定の場所。医師が一度も触っていなければ既定を表示し、
 * 押した時点で明示的な集合に切り替える（以後は既定に戻らない）。
 */
export function BodyMapConnected({ defaults, caption }: { defaults: BodySpot[]; caption?: string }) {
  const { session, patch } = useStore()
  const saved = session.condition.painSpots
  const shown = (saved ?? defaults) as BodySpot[]

  const toggle = (s: BodySpot) => {
    const next = shown.includes(s) ? shown.filter((x) => x !== s) : [...shown, s]
    patch('condition', { painSpots: next })
  }

  return <BodyMapFigure spots={shown} caption={caption} onToggle={toggle} />
}
