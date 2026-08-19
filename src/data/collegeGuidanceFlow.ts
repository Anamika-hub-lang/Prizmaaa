import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  Compass,
  GraduationCap,
  Phone,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR } from './counsellingServices'

export type CollegeGuidanceStep = {
  id: string
  step: string
  title: string
  description: string
  link: string
  linkLabel: string
  icon: LucideIcon
  accent: 'orange' | 'sky' | 'violet' | 'slate'
  badge?: string
}

export const collegeGuidanceIntro =
  'You choose the college — PRIZMA guides what comes next: the path in, real seniors, a clear plan, skills, and opportunities.'

export const collegeGuidanceSteps: CollegeGuidanceStep[] = [
  {
    id: 'choose',
    step: '01',
    title: 'You choose',
    description: 'Browse colleges by course, budget, placements & dream companies — pick what fits your goals.',
    link: '/colleges',
    linkLabel: 'Browse colleges',
    icon: Building2,
    accent: 'slate',
  },
  {
    id: 'path',
    step: '02',
    title: 'Know the path',
    description: 'See which entrance exams, counselling rounds, and steps you need to actually get in.',
    link: '/colleges/find',
    linkLabel: 'Run college matcher',
    icon: Compass,
    accent: 'orange',
  },
  {
    id: 'seniors',
    step: '03',
    title: 'Talk to seniors',
    description: 'Connect with students & seniors who know campus life, courses, and whether it is worth it.',
    link: '/university-counseling',
    linkLabel: 'Talk to seniors',
    icon: Users,
    accent: 'sky',
    badge: 'Real voices',
  },
  {
    id: 'guidance',
    step: '04',
    title: 'Get a clear plan',
    description: `Book a ₹${COUNSELLING_PRICE_INR} ${COUNSELLING_DURATION_LABEL} with a mentor or senior — what to prepare, when, and how.`,
    link: '/counselling',
    linkLabel: `Book guidance call — ₹${COUNSELLING_PRICE_INR}`,
    icon: Phone,
    accent: 'orange',
  },
  {
    id: 'skills',
    step: '05',
    title: 'Build skills',
    description: 'Join peer sessions led by seniors & mentors — academics, domain skills, and interview prep.',
    link: '/classes',
    linkLabel: 'Explore classes',
    icon: GraduationCap,
    accent: 'orange',
  },
  {
    id: 'opportunities',
    step: '06',
    title: 'Find opportunities',
    description: 'Match your profile to internships, scholarships, courses & competitions on the way to your college.',
    link: '/ai?tool=opportunity-matcher#try',
    linkLabel: 'Match opportunities',
    icon: Target,
    accent: 'violet',
    badge: 'Free AI',
  },
]

export function collegeGuidanceHeadline(collegeName?: string): string {
  if (!collegeName) return 'You choose the college. We guide the journey.'
  const short = collegeName.split(',')[0].trim()
  return `Chose ${short}? Here is what to do next.`
}

export function collegeGuidanceSubline(collegeName?: string): string {
  if (!collegeName) return collegeGuidanceIntro
  return `You picked ${collegeName.split(',')[0].trim()} — now let seniors & mentors help you with the path, preparation, skills, and opportunities to get there.`
}
