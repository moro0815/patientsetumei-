import type { Session } from '@/types'
import type { Slide } from './types'
import { buildOsteoSlides } from './osteoSlides'
import { buildRaSlides } from './raSlides'
import { buildKneeSlides } from './kneeSlides'

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
      return []
  }
}

export const SLIDE_GROUPS: Slide['group'][] = ['現状', '病気のしくみ', '治療', '運動療法', '生活', '見通し']
