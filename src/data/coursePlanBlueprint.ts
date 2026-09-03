import type { PricingPaymentTier } from './pricingPlans'

/** PRIZMA — General Course Plan Blueprint (universal across subjects). */
export type CoursePlanBlueprint = {
  tier: PricingPaymentTier
  name: string
  durationLabel: string
  type: string
  depthLabel: string
  mainPurpose: string
  motive: string
  goal: string
  syllabusDepth: string[]
  outcome: string
  cardHighlights: string[]
}

export const coursePlanBlueprints: Record<PricingPaymentTier, CoursePlanBlueprint> = {
  monthly: {
    tier: 'monthly',
    name: '1 Month Plan',
    durationLabel: '1 month',
    type: 'Crash Course / Revision',
    depthLabel: 'Core',
    mainPurpose: 'Revise & Refresh',
    motive:
      'For students who want to quickly revise a subject, refresh previously learned concepts, or get a complete overview in a short period.',
    goal:
      'Cover the most important concepts and fundamentals of the course without going deeply into every topic.',
    syllabusDepth: [
      'Core concepts',
      'Important fundamentals',
      'Key practical concepts',
      'Essential tools and techniques',
      'Quick revision of major topics',
      'Limited hands-on work',
      'Minimal advanced topics',
    ],
    outcome:
      'Students should understand and revise the complete core syllabus and regain confidence in the subject.',
    cardHighlights: [
      'Crash / revision pace',
      'Core concepts & fundamentals',
      'Quick overview of major topics',
      'Limited hands-on work',
    ],
  },
  'three-month': {
    tier: 'three-month',
    name: '3 Month Plan',
    durationLabel: '3 months',
    type: 'Structured Learning / Intermediate',
    depthLabel: 'Core → Intermediate',
    mainPurpose: 'Learn & Build',
    motive:
      'For students who want to properly learn the subject and gain practical experience through projects, assignments, or activities.',
    goal:
      'Provide complete core learning with enough depth for students to independently work on practical problems.',
    syllabusDepth: [
      'Fundamentals → intermediate concepts',
      'Detailed explanation of major topics',
      'Practical implementation',
      'Tools and techniques',
      'Real-world applications',
      'Multiple projects and assignments',
      'Introduction to advanced concepts',
    ],
    outcome:
      'Students should be able to understand, apply, and build/work independently with the skills taught in the course.',
    cardHighlights: [
      'Structured complete learning',
      'Projects & assignments',
      'Practical implementation',
      'Intro to advanced concepts',
    ],
  },
  'six-month': {
    tier: 'six-month',
    name: '6 Month Plan',
    durationLabel: '6 months',
    type: 'Comprehensive / Advanced / Job-Ready',
    depthLabel: 'Beginner → Advanced',
    mainPurpose: 'Master & Apply',
    motive:
      'For students who want to deeply learn the subject and develop professional-level skills.',
    goal:
      'Provide the most comprehensive version of the course, covering fundamentals, advanced concepts, practical applications, projects, and real-world workflows.',
    syllabusDepth: [
      'Fundamentals in depth',
      'Intermediate concepts',
      'Advanced concepts',
      'Professional tools and techniques',
      'Real-world use cases',
      'Extensive projects',
      'Assignments and practical work',
      'Industry practices',
      'Problem-solving',
      'Advanced applications',
      'Portfolio/career-oriented work where relevant',
    ],
    outcome:
      'Students should be able to confidently apply the subject in real-world/professional scenarios and have a strong foundation for further specialization.',
    cardHighlights: [
      'In-depth / professional track',
      'Advanced concepts & industry practices',
      'Extensive projects',
      'Portfolio & career-oriented work',
    ],
  },
}

export const coursePlanBlueprintOrder: PricingPaymentTier[] = [
  'monthly',
  'three-month',
  'six-month',
]
