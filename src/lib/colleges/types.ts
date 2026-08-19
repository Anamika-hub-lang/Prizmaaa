export type College = {
  slug: string
  name: string
  type: string
  state: string
  city: string
  courses: string[]
  fees: number
  averagePackage: number | null
  highestPackage: number | null
  companies: string[]
  entrance: string[]
  hostel: boolean
  ranking: number | null
  placementRate: number | null
  website: string
}

export type OwnershipPreference = 'any' | 'government' | 'private'

export type CollegeFinderPreferences = {
  course: string
  budget: number
  state: string
  city: string
  ownership: OwnershipPreference
  entranceExam: string
  marksOrScore: string
  hostelRequired: boolean
  targetCompanies: string[]
  placementImportance: number
  feesImportance: number
  locationImportance: number
}

export type MatchReason = {
  type: 'positive' | 'warning'
  text: string
}

export type CollegeMatch = {
  college: College
  matchPercent: number
  reasons: MatchReason[]
}

export type CollegeFilters = {
  course: string
  budget: number | null
  state: string
  city: string
  ownership: OwnershipPreference
  company: string
  entrance: string
  hostel: boolean | null
  minPlacementRate: number | null
}

export const GOVERNMENT_TYPES = new Set([
  'IIT',
  'NIT',
  'IIM',
  'Government',
  'Central University',
  'State University',
])

export function isGovernmentCollege(college: College): boolean {
  return GOVERNMENT_TYPES.has(college.type)
}
