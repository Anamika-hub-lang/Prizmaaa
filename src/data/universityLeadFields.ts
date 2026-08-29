export const UNIVERSITY_LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'COUNSELLING',
  'INTERESTED',
  'APPLICATION_STARTED',
  'ADMITTED',
  'CLOSED',
] as const

export type UniversityLeadStatus = (typeof UNIVERSITY_LEAD_STATUSES)[number]

export const UNIVERSITY_LEAD_SOURCES = ['counselling', 'interested', 'apply'] as const
export type UniversityLeadSource = (typeof UNIVERSITY_LEAD_SOURCES)[number]

export const UNIVERSITY_LEAD_SOURCE_LABELS: Record<UniversityLeadSource, string> = {
  counselling: 'Get counselling',
  interested: "I'm interested",
  apply: 'Apply / request info',
}

export const UNIVERSITY_LEAD_STATUS_LABELS: Record<UniversityLeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  COUNSELLING: 'Counselling',
  INTERESTED: 'Interested',
  APPLICATION_STARTED: 'Application started',
  ADMITTED: 'Admitted',
  CLOSED: 'Closed',
}

export const QUALIFICATION_OPTIONS = [
  'Class 10',
  'Class 12',
  'Diploma',
  'Undergraduate',
  'Graduate',
  'Working professional',
] as const

export function isUniversityLeadStatus(value: unknown): value is UniversityLeadStatus {
  return UNIVERSITY_LEAD_STATUSES.includes(value as UniversityLeadStatus)
}

export function isUniversityLeadSource(value: unknown): value is UniversityLeadSource {
  return UNIVERSITY_LEAD_SOURCES.includes(value as UniversityLeadSource)
}
