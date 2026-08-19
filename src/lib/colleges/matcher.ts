import type { College, CollegeFinderPreferences, CollegeMatch, MatchReason } from './types'
import { isGovernmentCollege } from './types'
import { courseMatches } from './repository'

export function defaultFinderPreferences(): CollegeFinderPreferences {
  return {
    course: '',
    budget: 500000,
    state: '',
    city: '',
    ownership: 'any',
    entranceExam: '',
    marksOrScore: '',
    hostelRequired: false,
    targetCompanies: [],
    placementImportance: 3,
    feesImportance: 3,
    locationImportance: 3,
  }
}

export function matchColleges(
  colleges: College[],
  prefs: CollegeFinderPreferences,
): CollegeMatch[] {
  return colleges
    .map((college) => scoreCollege(college, prefs))
    .filter((m) => m.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
}

function scoreCollege(college: College, prefs: CollegeFinderPreferences): CollegeMatch {
  const reasons: MatchReason[] = []

  if (prefs.course.trim()) {
    const hasCourse = college.courses.some((c) => courseMatches(c, prefs.course))
    if (!hasCourse) {
      return { college, matchPercent: 0, reasons: [{ type: 'warning', text: 'Course not offered' }] }
    }
    reasons.push({ type: 'positive', text: `Offers ${prefs.course}` })
  }

  const wPlacement = prefs.placementImportance / 5
  const wFees = prefs.feesImportance / 5
  const wLocation = prefs.locationImportance / 5

  let score = 0
  let maxScore = 0

  // Course fit (base 20)
  maxScore += 20
  if (!prefs.course.trim() || college.courses.some((c) => courseMatches(c, prefs.course))) {
    score += 20
  }

  // Budget (weight up to 20)
  const budgetWeight = 12 + wFees * 8
  maxScore += budgetWeight
  if (prefs.budget <= 0 || college.fees <= prefs.budget) {
    score += budgetWeight
    reasons.push({ type: 'positive', text: 'Within your budget' })
  } else {
    const over = ((college.fees - prefs.budget) / prefs.budget) * 100
    if (over <= 15) {
      score += budgetWeight * 0.5
      reasons.push({ type: 'warning', text: `Fees slightly above budget (${Math.round(over)}% over)` })
    } else {
      reasons.push({ type: 'warning', text: 'Fees exceed your budget' })
    }
  }

  // Location (weight up to 20)
  const locationWeight = 10 + wLocation * 10
  maxScore += locationWeight
  const stateMatch =
    !prefs.state.trim() || college.state.toLowerCase() === prefs.state.trim().toLowerCase()
  const cityMatch =
    !prefs.city.trim() || college.city.toLowerCase().includes(prefs.city.trim().toLowerCase())
  if (stateMatch && cityMatch) {
    score += locationWeight
    if (prefs.state.trim() || prefs.city.trim()) {
      reasons.push({ type: 'positive', text: 'Matches your location preference' })
    }
  } else if (stateMatch) {
    score += locationWeight * 0.6
    reasons.push({ type: 'warning', text: 'Same state but different city' })
  }

  // Ownership (10)
  maxScore += 10
  if (prefs.ownership === 'any') {
    score += 10
  } else if (prefs.ownership === 'government' && isGovernmentCollege(college)) {
    score += 10
    reasons.push({ type: 'positive', text: 'Government institution' })
  } else if (prefs.ownership === 'private' && !isGovernmentCollege(college)) {
    score += 10
    reasons.push({ type: 'positive', text: 'Private institution' })
  } else {
    reasons.push({ type: 'warning', text: 'Different ownership type than preferred' })
  }

  // Entrance (10)
  maxScore += 10
  if (!prefs.entranceExam.trim()) {
    score += 10
  } else {
    const q = prefs.entranceExam.trim().toLowerCase()
    if (college.entrance.some((e) => e.toLowerCase().includes(q))) {
      score += 10
      reasons.push({ type: 'positive', text: `Accepts ${prefs.entranceExam}` })
    } else {
      reasons.push({ type: 'warning', text: `May not accept ${prefs.entranceExam}` })
    }
  }

  // Hostel (5)
  maxScore += 5
  if (!prefs.hostelRequired) {
    score += 5
  } else if (college.hostel) {
    score += 5
    reasons.push({ type: 'positive', text: 'Hostel available' })
  } else {
    reasons.push({ type: 'warning', text: 'Hostel not available' })
  }

  // Target companies (weight up to 15)
  const companyWeight = 5 + wPlacement * 10
  maxScore += companyWeight
  if (prefs.targetCompanies.length === 0) {
    score += companyWeight * 0.5
  } else {
    const targets = prefs.targetCompanies.map((c) => c.toLowerCase())
    const hits = college.companies.filter((c) =>
      targets.some((t) => c.toLowerCase().includes(t) || t.includes(c.toLowerCase())),
    )
    if (hits.length > 0) {
      const ratio = hits.length / prefs.targetCompanies.length
      score += companyWeight * Math.min(1, 0.4 + ratio * 0.6)
      reasons.push({
        type: 'positive',
        text: `Recruiters include ${hits.slice(0, 3).join(', ')}`,
      })
    }
  }

  // Placement quality (weight up to 15)
  const placementWeight = 5 + wPlacement * 10
  maxScore += placementWeight
  if (college.placementRate != null) {
    score += placementWeight * (college.placementRate / 100)
    if (college.placementRate >= 80) {
      reasons.push({ type: 'positive', text: `Strong placement rate (${college.placementRate}%)` })
    }
  }
  if (college.averagePackage != null && college.averagePackage >= 1000000) {
    reasons.push({ type: 'positive', text: 'Strong average package data' })
  }

  // Ranking bonus (5)
  maxScore += 5
  if (college.ranking != null && college.ranking <= 50) {
    score += 5 * Math.max(0.2, 1 - (college.ranking - 1) / 50)
    if (college.ranking <= 10) {
      reasons.push({ type: 'positive', text: `Top-ranked (NIRF #${college.ranking})` })
    }
  } else {
    score += 2
  }

  const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  return {
    college,
    matchPercent: Math.min(99, Math.max(0, matchPercent)),
    reasons,
  }
}
