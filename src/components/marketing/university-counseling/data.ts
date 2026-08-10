import { universityImageFor } from '../../../data/universityImages'

export type FeaturedUniversity = {
  id: string
  name: string
  shortName: string
  location: string
  state: string
  image: string
  description: string
  highlights: string[]
}

export type DemoCounselor = {
  id: string
  name: string
  university: string
  experience: string
  image: string
}

export const featuredUniversities: FeaturedUniversity[] = [
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IIT Bombay',
    location: 'Mumbai',
    state: 'Maharashtra',
    image: universityImageFor('iit-bombay', 0),
    description:
      'Get guidance on branches, JEE cutoffs, campus life, and placements at IIT Bombay — from counselors who know the system.',
    highlights: ['Branch fit', 'Placements', 'Campus life'],
  },
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    shortName: 'MIT',
    location: 'Cambridge',
    state: 'USA',
    image: universityImageFor('mit', 1),
    description:
      'Exploring MIT? Understand admissions, majors, and whether an international path fits your goals and budget.',
    highlights: ['Admissions', 'Majors', 'Global path'],
  },
  {
    id: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    location: 'New Delhi',
    state: 'Delhi',
    image: universityImageFor('iit-delhi', 2),
    description:
      'Talk through courses, hostels, and career outcomes at IIT Delhi before you lock your preference list.',
    highlights: ['Courses', 'Hostels', 'Careers'],
  },
  {
    id: 'bits-pilani',
    name: 'Birla Institute of Technology and Science, Pilani',
    shortName: 'BITS Pilani',
    location: 'Pilani',
    state: 'Rajasthan',
    image: universityImageFor('bits-pilani', 3),
    description:
      'BITS vs IIT, dual degree, or campus choice — get clear advice on whether BITS Pilani is right for you.',
    highlights: ['BITSAT', 'Dual degree', 'ROI'],
  },
]

export function counselingUniversityById(id: string): FeaturedUniversity | undefined {
  return featuredUniversities.find((u) => u.id === id)
}

export function counselorsForUniversity(universityName: string): DemoCounselor[] {
  return demoCounselors.filter((c) => c.university === universityName)
}

export const demoCounselors: DemoCounselor[] = [
  {
    id: 'iitb-expert',
    name: 'Career Expert — IIT Bombay',
    university: 'IIT Bombay',
    experience: '8+ years',
    image: universityImageFor('iit-bombay', 18),
  },
  {
    id: 'mit-expert',
    name: 'Admissions Advisor — MIT',
    university: 'MIT',
    experience: '7+ years',
    image: universityImageFor('mit', 19),
  },
  {
    id: 'bits-expert',
    name: 'Placement Mentor — BITS',
    university: 'BITS Pilani',
    experience: '6+ years',
    image: universityImageFor('bits-pilani', 20),
  },
]

export const howItWorksSteps = [
  {
    step: '01',
    title: 'Choose your university',
    description: 'Search or pick from popular colleges you are considering.',
  },
  {
    step: '02',
    title: 'Get matched with a counselor',
    description: 'We connect you with someone who knows that campus inside out.',
  },
  {
    step: '03',
    title: 'Get personalized guidance',
    description: 'Course fit, career path, and whether the college is right for you.',
  },
] as const

export const COMING_SOON_TOAST = 'Counseling feature launching soon 🚀'
