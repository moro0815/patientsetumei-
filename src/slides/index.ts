import type { Session } from '@/types'
import type { Slide } from './types'
import { buildOsteoSlides } from './osteoSlides'
import { buildRaSlides } from './raSlides'
import { buildKneeSlides } from './kneeSlides'
import { buildConditionSlides } from './conditionSlides'

export type { Slide } from './types'

export function getSlides(session: Session): Slide[] {
  switch (session.disease) {
    case 'osteoporosis':
      return buildOsteoSlides(session)
    case 'ra':
      return buildRaSlides(session)
    case 'kneeOA':
      return buildKneeSlides(session)
    default:
      // 症状別疾患は、宣言的な疾患モデルからスライドを生成する
      return buildConditionSlides(session)
  }
}

export const SLIDE_GROUPS: Slide['group'][] = ['現状', '病気のしくみ', '治療', '運動療法', '生活', '見通し']
