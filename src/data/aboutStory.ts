export const homeStoryPreviewCount = 3

export const prizmaMissionLine =
  'A place for students to connect with peers and seniors, share real experiences, discover opportunities, and grow together — with AI resume review and opportunity matching built in.'

export const aboutPlatformBullets = [
  'Peer learning circles on Google Meet — skills, academics, and career tracks you explore alongside other students.',
  '1-on-1 guidance at ₹199 per call from people who understand your journey — career questions, domain skills, or what comes next.',
  'AI Resume + Profile Review — upload or paste your resume for free gap analysis and improvement tips.',
  'AI Opportunity Matcher — match your profile to internships, scholarships, courses & competitions.',
  'Campus experiences shared by students — honest takes on academics, campus life, and placements across India.',
  'Campus connect (coming soon) — seniors and insiders from SGT, GD Goenka, K.R. Mangalam, Amity & more.',
  'One student space for groups you join, projects you share, and conversations that help you move forward.',
  'Seniors and mentors host discussions, resources, and collaborative sessions — students find each other in one place.',
]

export const whyWeStartedBullets = [
  'College ads were everywhere, but real student voices were hard to find before you chose a path.',
  'Advice lived in random DMs and generic videos — not tied to people who had already been there.',
  'Peer learning sat on one app, campus stories on another, and connections on a third.',
  'We built PRIZMA so connect → discover → grow happens in one flow: people, experiences, then learning together.',
  'Transparent access: ₹199 guidance calls, ₹99 mock interviews, free AI tools, peer sessions with trials — join when you are ready.',
  'Campus connect is launching next so every question about student life has a human answer, not just a brochure.',
]

export type PrizmaPillar = {
  id: string
  title: string
  description: string
  link: string
  linkLabel: string
  badge?: string
  accent: 'orange' | 'sky' | 'violet'
}

export const prizmaPillars: PrizmaPillar[] = [
  {
    id: 'reviews',
    title: 'Campus experiences',
    description:
      'Read what students really say about campus life, faculty, and placements — then share your own for the next batch.',
    link: '/universities',
    linkLabel: 'Browse experiences',
    accent: 'sky',
  },
  {
    id: 'counselling',
    title: 'Peer & mentor guidance',
    description:
      'Stuck between paths? Book a ₹199 live call — Career, Domain, or Future — with people who get your journey.',
    link: '/counselling',
    linkLabel: 'Book ₹199 call',
    accent: 'orange',
  },
  {
    id: 'classes',
    title: 'Learn together',
    description:
      'Build skills with peers and seniors. Live Meet sessions, shared projects, and feedback that helps you grow.',
    link: '/sign-up',
    linkLabel: 'Explore sessions',
    accent: 'orange',
  },
  {
    id: 'ai-tools',
    title: 'PRIZMA AI',
    description:
      'Upload your resume for AI gap analysis, or match your profile to internships, scholarships, courses & competitions.',
    link: '/ai',
    linkLabel: 'Try AI free',
    badge: 'Free',
    accent: 'violet',
  },
  {
    id: 'univ-counseling',
    title: 'Campus connect',
    description:
      'Soon: 1:1 chats with seniors who know specific campuses — fit, culture, and whether that place is right for you.',
    link: '/university-counseling',
    linkLabel: "See what's coming",
    badge: 'Soon',
    accent: 'violet',
  },
]

export type PrizmaJourneyStep = {
  step: string
  title: string
  description: string
  tiesTo: string
}

export const prizmaJourneySteps: PrizmaJourneyStep[] = [
  {
    step: '01',
    title: 'Connect with people',
    description: 'Meet students like you and seniors who have already been there — start with real voices, not ads.',
    tiesTo: 'Peers → Seniors',
  },
  {
    step: '02',
    title: 'Ask & get clarity',
    description: 'Book a guided call for a clear next step — which path, which skills, what to do next.',
    tiesTo: 'Guidance ₹199/call',
  },
  {
    step: '03',
    title: 'Learn & collaborate',
    description: 'Join peer sessions that match your goals. Try first, then monthly or 3-month plans with your group.',
    tiesTo: 'Sessions & projects',
  },
  {
    step: '04',
    title: 'Grow in one place',
    description: 'Your space shows groups, projects, and conversations — the full picture of your student journey.',
    tiesTo: 'Student space',
  },
]

export type AboutHighlight = {
  label: string
  iconName: 'video' | 'rupee' | 'graduation' | 'star' | 'users'
}

export const aboutHeroHighlights: AboutHighlight[] = [
  { iconName: 'users', label: 'Peers & seniors before you decide alone' },
  { iconName: 'rupee', label: '₹199 calls · AI resume & matcher · session plans' },
  { iconName: 'video', label: 'Live Meet circles with students & mentors' },
  { iconName: 'graduation', label: 'One student space for everything you join' },
]

export type AboutValue = {
  title: string
  text: string
  iconName: 'target' | 'users' | 'award'
}

export const aboutProcessValues: AboutValue[] = [
  {
    iconName: 'target',
    title: 'People before pressure',
    text: 'Real student experiences and guided calls help you choose a path — before you commit alone.',
  },
  {
    iconName: 'users',
    title: 'Humans at every step',
    text: 'Peers, seniors, and mentors — not passive videos or anonymous forums. Ask questions. Get real answers.',
  },
  {
    iconName: 'award',
    title: 'Better together',
    text: 'From “who can help?” to “what should I learn next?” — PRIZMA links connections, discovery, and growth.',
  },
]

export const pricingEcosystemIntro =
  'Peer learning plans are one part of PRIZMA. Pair them with ₹199 guidance calls, AI resume review, opportunity matching, and campus experiences — campus connect for specific universities is launching soon.'

export const contactSectionCopy = {
  title: "You don't have to figure out student life alone.",
  body: 'Whether you want to meet peers, read campus experiences, or join a learning circle — tell us where you are and we will point you to the right place on PRIZMA.',
}

export const footerTagline =
  'Connect with students, share experiences, discover opportunities, and grow together — a hub for ambitious students across India.'
