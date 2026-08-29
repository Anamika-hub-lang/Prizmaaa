import type { University, UniversityType } from './universities'

export type UniversityProgramInfo = {
  name: string
  feesLabel: string
  eligibility: string
}

const byType: Record<UniversityType, { courses: string[]; fees: string; eligibility: string }> = {
  iit: {
    courses: ['B.Tech CSE', 'B.Tech Electrical', 'B.Tech Mechanical', 'M.Tech'],
    fees: '₹2.2–2.5 L / year',
    eligibility: 'JEE Advanced + Class 12 PCM',
  },
  nit: {
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Civil', 'M.Tech'],
    fees: '₹1.5–2 L / year',
    eligibility: 'JEE Main + Class 12 PCM',
  },
  iim: {
    courses: ['MBA / PGP', 'Executive MBA', 'PhD'],
    fees: '₹20–26 L (programme)',
    eligibility: 'CAT / GMAT + graduation',
  },
  deemed: {
    courses: ['B.Tech', 'BBA', 'MBA', 'M.Sc'],
    fees: '₹2–4 L / year',
    eligibility: 'Entrance test or Class 12 merit',
  },
  central: {
    courses: ['B.A.', 'B.Sc', 'B.Com', 'M.A.'],
    fees: '₹15–40k / year',
    eligibility: 'CUET / university entrance',
  },
  state: {
    courses: ['B.Tech', 'B.Sc', 'B.Com', 'MBA'],
    fees: '₹40k–1.5 L / year',
    eligibility: 'State CET / Class 12 merit',
  },
  private: {
    courses: ['B.Tech CSE', 'BBA', 'MBA', 'BCA'],
    fees: '₹1.5–4 L / year',
    eligibility: 'University test / Class 12',
  },
}

export function programsForUniversity(university: University): {
  courses: string[]
  feesLabel: string
  eligibility: string
} {
  const pack = byType[university.type]
  return {
    courses: pack.courses,
    feesLabel: pack.fees,
    eligibility: pack.eligibility,
  }
}

export function courseOptionsForLead(university?: University | null, extra: string[] = []): string[] {
  const fromUni = university ? programsForUniversity(university).courses : []
  return [...new Set([...extra, ...fromUni, 'Undecided / need counselling'])]
}
