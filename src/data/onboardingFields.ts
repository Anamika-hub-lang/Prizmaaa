export const HOW_DID_YOU_FIND_US_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'friends', label: 'Friends / word of mouth' },
  { value: 'social_media', label: 'Social media' },
  { value: 'reference', label: 'Reference' },
  { value: 'marketing', label: 'Marketing / ads' },
  { value: 'other', label: 'Other' },
] as const

export type HowDidYouFindUs = (typeof HOW_DID_YOU_FIND_US_OPTIONS)[number]['value']

export const STUDENT_EDUCATION_LEVELS = [
  { value: 'school', label: 'School' },
  { value: 'college', label: 'College / university' },
  { value: 'working', label: 'Working professional' },
  { value: 'other', label: 'Other' },
] as const

export type StudentEducationLevel = (typeof STUDENT_EDUCATION_LEVELS)[number]['value']

export type ProfileDetailsPayload = {
  firstName: string
  lastName: string
  phone?: string
  city?: string
  howDidYouFindUs: HowDidYouFindUs
  howDidYouFindUsDetail?: string
  studentEducationLevel?: StudentEducationLevel
  studentGradeOrProgram?: string
  studentLearningGoals?: string
  mentorExpertise?: string
  mentorExperienceYears?: number
  mentorQualifications?: string
  mentorBio?: string
  mentorPortfolioUrl?: string
}

export function howDidYouFindUsLabel(value: string | null | undefined): string {
  const hit = HOW_DID_YOU_FIND_US_OPTIONS.find((o) => o.value === value)
  return hit?.label ?? value ?? '—'
}

export function educationLevelLabel(value: string | null | undefined): string {
  const hit = STUDENT_EDUCATION_LEVELS.find((o) => o.value === value)
  return hit?.label ?? value ?? '—'
}
