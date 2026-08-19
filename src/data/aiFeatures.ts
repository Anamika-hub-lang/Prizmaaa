export type AiFeatureId = 'resume-review' | 'opportunity-matcher'

export type AiFeature = {
  id: AiFeatureId
  title: string
  shortTitle: string
  tagline: string
  description: string
  image: string
  highlights: string[]
  steps: string[]
  enabled: boolean
}

function envEnabled(key: string, defaultValue = true): boolean {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return defaultValue
  return raw === 'true' || raw === '1'
}

export const aiFeatureFlags = {
  resumeReview: envEnabled('NEXT_PUBLIC_AI_RESUME_REVIEW_ENABLED', true),
  opportunityMatcher: envEnabled('NEXT_PUBLIC_AI_OPPORTUNITY_MATCHER_ENABLED', true),
} as const

export const aiFeatures: AiFeature[] = [
  {
    id: 'resume-review',
    title: 'AI Resume + Profile Review',
    shortTitle: 'Resume review',
    tagline: 'Upload → AI finds gaps → get improvements',
    description:
      'Upload your resume or profile. AI scans for missing skills, weak sections, and formatting issues — then suggests concrete fixes recruiters notice.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
    highlights: ['Gap analysis', 'Section-by-section tips', 'ATS-friendly fixes'],
    steps: [
      'Upload PDF or paste your resume',
      'AI maps skills, projects & experience',
      'Get a prioritized improvement list',
    ],
    enabled: aiFeatureFlags.resumeReview,
  },
  {
    id: 'opportunity-matcher',
    title: 'AI Opportunity Matcher',
    shortTitle: 'Opportunity match',
    tagline: 'Profile matched to internships, scholarships & more',
    description:
      'Speak or type your stream, skills, and goals. AI matches you with internships, scholarships, courses, and competitions.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    highlights: ['Internships', 'Scholarships', 'Courses & competitions'],
    steps: [
      'Speak or type your student profile',
      'AI scores fit across opportunity types',
      'See ranked matches with next steps',
    ],
    enabled: aiFeatureFlags.opportunityMatcher,
  },
]

export const enabledAiFeatures = aiFeatures.filter((feature) => feature.enabled)

export function aiFeatureById(id: string): AiFeature | undefined {
  return aiFeatures.find((feature) => feature.id === id)
}

export function defaultAiFeatureId(): AiFeatureId {
  return enabledAiFeatures[0]?.id ?? 'resume-review'
}

export function isAiFeatureId(value: string): value is AiFeatureId {
  return value === 'resume-review' || value === 'opportunity-matcher'
}
