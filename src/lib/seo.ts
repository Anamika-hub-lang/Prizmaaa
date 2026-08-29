import type { Metadata } from 'next'
import {
  COUNSELLING_PRICE_INR,
  INTERVIEW_PREP_PRICE_INR,
  counsellingGroupById,
  counsellingTopicsByGroup,
  type CounsellingGroupId,
} from '../data/counsellingServices'
import { getCategoryById, type ClassCategoryId } from '../data/classCatalog'

export const SITE_NAME = 'PRIZMA'
export const SITE_HOST = 'prizma.guru'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.PUBLIC_APP_URL?.trim() ||
  `https://${SITE_HOST}`
).replace(/\/$/, '')

export const DEFAULT_OG_IMAGE = '/prizma-logo.png'

export const indexFollow = { index: true, follow: true } as const
export const noIndexRobots = { index: false, follow: false } as const

export function absUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

export function truncateMeta(text: string, max = 160): string {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= max) return compact
  return `${compact.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

type PageSeoInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
  robots?: { index: boolean; follow: boolean }
  absoluteTitle?: boolean
  image?: string
  index?: boolean
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  robots,
  absoluteTitle = false,
  image,
  index,
}: PageSeoInput): Metadata {
  const url = absUrl(path)
  const desc = truncateMeta(description)
  const resolvedRobots = index === false ? noIndexRobots : (robots ?? indexFollow)
  const ogImage = image ? (image.startsWith('http') ? image : absUrl(image)) : DEFAULT_OG_IMAGE
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: url },
    robots: resolvedRobots,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  }
}

export function noIndexMetadata(title = 'PRIZMA', path?: string): Metadata {
  return {
    title,
    robots: noIndexRobots,
    ...(path ? { alternates: { canonical: absUrl(path) } } : {}),
  }
}

/** Homepage uses an absolute title so the root template does not double the brand name. */
export const homeTitleAbsolute = `${SITE_NAME} — Career Counselling, Online Classes & Student Guidance`

export const homeDescription =
  'PRIZMA is a student hub for career counselling, live online classes, college guidance, campus stories, and AI tools — learn with peers, seniors, and mentors.'

export function counsellingGroupSeo(groupId: string) {
  const group = counsellingGroupById(groupId)
  if (!group) return null
  const topics = counsellingTopicsByGroup(group.id as CounsellingGroupId)
    .map((t) => t.title)
    .join(', ')
  const titles: Record<CounsellingGroupId, string> = {
    career: `Career Counselling & Guidance — ₹${COUNSELLING_PRICE_INR} per call`,
    domain: `Domain Skills Counselling — UI/UX, Coding, Data & More`,
    future: `After 10th, 12th & Exam Counselling`,
  }
  return pageMetadata({
    title: titles[group.id],
    description: `${group.description} Book a ₹${COUNSELLING_PRICE_INR} guidance call covering ${topics}.`,
    path: `/counselling/${group.id}`,
    keywords:
      group.id === 'career'
        ? [
            'career counselling',
            'career guidance',
            'online career counselling',
            'career counsellor India',
            'PRIZMA counselling',
          ]
        : group.id === 'domain'
          ? [
              'skill counselling',
              'UI UX career guidance',
              'coding career counselling',
              'domain counselling',
            ]
          : [
              'after 12th counselling',
              'after 10th stream counselling',
              'career guidance after exams',
            ],
  })
}

export function classDetailSeo(input: {
  id: string
  title: string
  description: string
  categoryId: ClassCategoryId
  mentor: string
  duration: string
  sessions: string
  image?: string
}) {
  const category = getCategoryById(input.categoryId)
  const fallback = [
    `${input.title} is a live online class on PRIZMA`,
    input.mentor ? `with ${input.mentor}` : null,
    category ? `in ${category.title}` : null,
    input.duration || null,
    input.sessions || null,
  ]
    .filter(Boolean)
    .join('. ')
  const description = input.description.trim() || fallback
  return pageMetadata({
    title: `${input.title} — Online Class`,
    description,
    path: `/classes/${input.id}`,
    image: input.image,
    keywords: [
      input.title,
      'online class',
      'online course',
      'live class',
      category?.title ?? 'peer session',
    ],
  })
}

export function collegeDetailSeo(input: {
  slug: string
  name: string
  city: string
  state: string
  type: string
  courses: string[]
}) {
  const courseLine = input.courses.slice(0, 6).join(', ')
  return pageMetadata({
    title: `${input.name} — Courses, Fees & Admissions`,
    description: `${input.name} in ${input.city}, ${input.state} (${input.type}). ${
      courseLine ? `Courses include ${courseLine}. ` : ''
    }Compare fees, placements, and get campus guidance on PRIZMA.`,
    path: `/colleges/${input.slug}`,
  })
}

export function universityStorySeo(input: {
  id: string
  name: string
  shortName: string
  location: string
  state: string
}) {
  return pageMetadata({
    title: `${input.name} Student Reviews & Campus Stories`,
    description: `Read honest student reviews and campus stories about ${input.name} (${input.shortName}) in ${input.location}, ${input.state}. Share experiences and explore counselling on PRIZMA.`,
    path: `/universities/${input.id}`,
  })
}

export function universityCounselingSeo(input: {
  id: string
  name: string
  location: string
  state: string
  description: string
}) {
  return pageMetadata({
    title: `${input.name} Campus Counselling`,
    description:
      input.description.trim() ||
      `Talk to seniors and mentors about ${input.name} in ${input.location}, ${input.state}. Campus counselling on PRIZMA.`,
    path: `/university-counseling/${input.id}`,
    keywords: ['campus counselling', 'university counselling', input.name, 'college guidance'],
  })
}

export const staticPublicSeo = {
  classes: pageMetadata({
    title: 'Online Classes & Live Peer Courses',
    description:
      'Browse live online classes and peer courses on PRIZMA — skills, academics, and professional tracks on Google Meet. Enrol when you are ready.',
    path: '/classes',
    keywords: [
      'online classes',
      'online courses',
      'live classes',
      'peer learning',
      'Google Meet classes',
      'PRIZMA classes',
    ],
  }),
  counselling: pageMetadata({
    title: 'Career Counselling & Student Guidance',
    description: `Book 1-on-1 career counselling, domain skill guidance, or after-10th/12th calls for ₹${COUNSELLING_PRICE_INR}. Practical plans from mentors and seniors on PRIZMA.`,
    path: '/counselling',
    keywords: [
      'career counselling',
      'career guidance',
      'online counselling',
      'student counselling',
      'career counsellor',
      'PRIZMA guidance',
    ],
  }),
  interviewPrep: pageMetadata({
    title: `Mock Interview Preparation — ₹${INTERVIEW_PREP_PRICE_INR}`,
    description: `Live mock interviews on Google Meet for ₹${INTERVIEW_PREP_PRICE_INR}. Practise technical and HR rounds with feedback before the real interview.`,
    path: '/counselling/interview-prep',
    keywords: ['mock interview', 'interview preparation', 'interview coaching', 'HR interview practice'],
  }),
  universityCounseling: pageMetadata({
    title: 'University & Campus Counselling',
    description:
      'Campus connect on PRIZMA — talk to seniors and mentors about universities you are considering, from admissions to campus life.',
    path: '/university-counseling',
    keywords: ['university counselling', 'campus counselling', 'college guidance', 'talk to seniors'],
  }),
  universities: pageMetadata({
    title: 'Campus Stories & University Reviews',
    description:
      'Honest campus stories and university reviews from students across India — academics, hostels, placements, and day-to-day life on PRIZMA.',
    path: '/universities',
  }),
  colleges: pageMetadata({
    title: 'Colleges in India — Compare Courses, Fees & Placements',
    description:
      'Explore colleges across India with courses, fees, placements, and entrance exams. Find a fit and get admission-path guidance on PRIZMA.',
    path: '/colleges',
  }),
  collegeFind: pageMetadata({
    title: 'College Finder — Match Courses, Budget & Location',
    description:
      'Answer a few questions about course, budget, and location. PRIZMA matches you with colleges and shows a practical admission path.',
    path: '/colleges/find',
  }),
  pricing: pageMetadata({
    title: 'Pricing — Online Classes, Counselling & Plans',
    description: `See PRIZMA pricing for live peer sessions, ₹${COUNSELLING_PRICE_INR} guidance calls, and ₹${INTERVIEW_PREP_PRICE_INR} mock interviews. Transparent access, join when you are ready.`,
    path: '/pricing',
  }),
  about: pageMetadata({
    title: 'About PRIZMA — Students, Peers & Mentors',
    description:
      'PRIZMA is where students connect with peers and seniors, share campus stories, discover opportunities, and learn together through counselling and live classes.',
    path: '/about',
  }),
  ai: pageMetadata({
    title: 'AI Resume Review & Opportunity Matcher',
    description:
      'Free AI tools on PRIZMA: resume and profile review plus an opportunity matcher for internships, scholarships, courses, and competitions.',
    path: '/ai',
  }),
  reviews: pageMetadata({
    title: 'Share Your Campus or Class Story',
    description:
      'Share a student or mentor story on PRIZMA. Help others learn from real experiences with classes, campuses, and guidance.',
    path: '/reviews',
  }),
  becomeMentor: pageMetadata({
    title: 'Become a Mentor on PRIZMA',
    description:
      'Apply to mentor on PRIZMA. Host live peer sessions, build your student community, and get paid for teaching what you know.',
    path: '/become-mentor',
  }),
} as const
