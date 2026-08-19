import type { College, CollegeFilters } from './types'
import { GOVERNMENT_TYPES, isGovernmentCollege } from './types'

/** Swap this implementation for a DB/API provider later. */
export interface CollegeRepository {
  getAll(): Promise<College[]>
  getBySlug(slug: string): Promise<College | undefined>
  getBySlugs(slugs: string[]): Promise<College[]>
}

export function filterColleges(colleges: College[], filters: CollegeFilters): College[] {
  return colleges.filter((college) => {
    if (filters.course && !college.courses.some((c) => courseMatches(c, filters.course))) {
      return false
    }
    if (filters.budget != null && filters.budget > 0 && college.fees > filters.budget) {
      return false
    }
    if (filters.state && filters.state !== 'all') {
      if (college.state.toLowerCase() !== filters.state.toLowerCase()) return false
    }
    if (filters.city.trim()) {
      if (!college.city.toLowerCase().includes(filters.city.trim().toLowerCase())) return false
    }
    if (filters.ownership === 'government' && !isGovernmentCollege(college)) return false
    if (filters.ownership === 'private' && isGovernmentCollege(college)) return false
    if (filters.company.trim()) {
      const q = filters.company.trim().toLowerCase()
      if (!college.companies.some((c) => c.toLowerCase().includes(q))) return false
    }
    if (filters.entrance.trim()) {
      const q = filters.entrance.trim().toLowerCase()
      if (!college.entrance.some((e) => e.toLowerCase().includes(q))) return false
    }
    if (filters.hostel === true && !college.hostel) return false
    if (filters.minPlacementRate != null && filters.minPlacementRate > 0) {
      if (college.placementRate == null || college.placementRate < filters.minPlacementRate) {
        return false
      }
    }
    return true
  })
}

export function courseMatches(collegeCourse: string, desired: string): boolean {
  const a = collegeCourse.toLowerCase()
  const b = desired.toLowerCase().trim()
  if (!b) return true
  return a.includes(b) || b.includes(a)
}

export function uniqueCourses(colleges: College[]): string[] {
  const set = new Set<string>()
  for (const college of colleges) {
    for (const course of college.courses) set.add(course)
  }
  return [...set].sort((x, y) => x.localeCompare(y))
}

export function uniqueStates(colleges: College[]): string[] {
  return [...new Set(colleges.map((c) => c.state))].sort()
}

export function uniqueEntrances(colleges: College[]): string[] {
  const set = new Set<string>()
  for (const college of colleges) {
    for (const entrance of college.entrance) set.add(entrance)
  }
  return [...set].sort()
}

export function uniqueCompanies(colleges: College[]): string[] {
  const set = new Set<string>()
  for (const college of colleges) {
    for (const company of college.companies) set.add(company)
  }
  return [...set].sort()
}

export function formatInr(amount: number | null): string {
  if (amount == null) return 'Not available'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`
  return `₹${amount}`
}

export function formatFees(fees: number): string {
  return `${formatInr(fees)}/year`
}

export function formatPackage(lpaAmount: number | null): string {
  if (lpaAmount == null) return 'Not available'
  return `${formatInr(lpaAmount)} per annum`
}

export function collegeTypeLabel(type: string): string {
  if (GOVERNMENT_TYPES.has(type)) return 'Government'
  return type
}
