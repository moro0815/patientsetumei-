import type { ReactNode } from 'react'
import type { Session } from '@/types'

/**
 * 説明スライド
 *
 * 設計の考え方
 * - 1枚 = 1メッセージ。診察室で口頭説明しながら見せるので、文字は最小限にする。
 * - figure（図）が主役、points（箇条書き）は補助。
 * - talk は医師用のトークスクリプト。実際の言い方の例を置いておくことで、
 *   説明の質を医師間でそろえられる（研修医・非常勤医にも同じ説明ができる）。
 * - 各スライドは「パンフレットに載せるか」を選べるようにする。
 */
export interface Slide {
  id: string
  /** 画面に大きく出す見出し（患者さん向けのやさしい日本語） */
  title: string
  /** 見出しの下の一文 */
  lead?: string
  /** 図 */
  figure?: ReactNode
  /** 患者さん向けの要点 */
  points?: string[]
  /** 強調して伝えたいこと（枠付きで表示） */
  highlight?: { tone: 'info' | 'warn' | 'good'; text: string }
  /** 医師用トークスクリプト（患者さんに見せたくない場合はトグルで非表示） */
  talk?: string[]
  /** 出典ID */
  cite?: string[]
  /** このスライドを表示する条件 */
  when?: (s: Session) => boolean
  /** カテゴリ（スライド一覧のグルーピング用） */
  group: '現状' | '病気のしくみ' | '治療' | '運動療法' | '生活' | '見通し'
}

export type SlideBuilder = (session: Session) => Slide[]
