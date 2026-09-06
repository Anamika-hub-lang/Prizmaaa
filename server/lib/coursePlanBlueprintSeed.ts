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

const ALLOWED_LOGO_KEYS = new Set([
  'book',
  'code',
  'flask',
  'palette',
  'calculator',
  'globe',
  'briefcase',
  'lightbulb',
  'music',
  'camera',
])

export type TeachingPlanTopic = {
  title: string
  description: string
  logoKey: string | null
  logoUrl: string | null
}

export function isTeachingPlanTier(value: string): value is TeachingPlanTier {
  return value === 'monthly' || value === 'three-month' || value === 'six-month'
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export function emptyTopic(title = ''): TeachingPlanTopic {
  return { title, description: '', logoKey: null, logoUrl: null }
}

export function seedTopicsForTier(tier: TeachingPlanTier): TeachingPlanTopic[] {
  return teachingPlanSyllabusSeed[tier].map((title) => emptyTopic(title))
}

export function normalizeTopics(raw: unknown): TeachingPlanTopic[] {
  if (!Array.isArray(raw)) return []
  const out: TeachingPlanTopic[] = []
  for (const item of raw) {
    if (out.length >= 40) break
    if (typeof item === 'string') {
      const title = item.trim().slice(0, 200)
      if (!title) continue
      out.push(emptyTopic(title))
      continue
    }
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const title = String(rec.title ?? rec.name ?? '').trim().slice(0, 200)
    if (!title) continue
    const description = String(rec.description ?? '').trim().slice(0, 500)
    const logoKeyRaw = rec.logoKey == null || rec.logoKey === '' ? '' : String(rec.logoKey)
    const logoKey = ALLOWED_LOGO_KEYS.has(logoKeyRaw) ? logoKeyRaw : null
    const logoUrlRaw = rec.logoUrl ? String(rec.logoUrl).trim() : ''
    const logoUrl = logoUrlRaw && isHttpUrl(logoUrlRaw) ? logoUrlRaw.slice(0, 2000) : null
    out.push({
      title,
      description,
      logoKey,
      logoUrl,
    })
  }
  return out
}
