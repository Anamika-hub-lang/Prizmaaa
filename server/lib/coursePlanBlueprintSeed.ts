/** Syllabus seed for teaching plans — mirrors src/data/coursePlanBlueprint.ts */
export type TeachingPlanTier = 'monthly' | 'three-month' | 'six-month'

export const TEACHING_PLAN_TIERS: TeachingPlanTier[] = ['monthly', 'three-month', 'six-month']

export const teachingPlanSyllabusSeed: Record<TeachingPlanTier, string[]> = {
  monthly: [
    'Core concepts',
    'Important fundamentals',
    'Key practical concepts',
    'Essential tools and techniques',
    'Quick revision of major topics',
    'Limited hands-on work',
    'Minimal advanced topics',
  ],
  'three-month': [
    'Fundamentals → intermediate concepts',
    'Detailed explanation of major topics',
    'Practical implementation',
    'Tools and techniques',
    'Real-world applications',
    'Multiple projects and assignments',
    'Introduction to advanced concepts',
  ],
  'six-month': [
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
}

export function isTeachingPlanTier(value: string): value is TeachingPlanTier {
  return value === 'monthly' || value === 'three-month' || value === 'six-month'
}

export function normalizeTopics(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => String(item ?? '').trim())
    .filter((item) => item.length > 0)
    .slice(0, 40)
}
