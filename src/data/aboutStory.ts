export const homeStoryPreviewCount = 3

export const prizmaMissionLine =
  'From picking the right college to mastering skills in live classes — PRIZMA connects every step on one orange hub.'

export const aboutPlatformBullets = [
  'Live mentoring classes on Google Meet — Skills, Professional & Academic tracks with trial, monthly, or 3-month plans.',
  '1-on-1 expert counselling at ₹200/hour when you need career, domain, or future clarity before you commit.',
  'University reviews written by students — honest ratings on academics, campus life, and placements across India.',
  'University counseling (coming soon) — verified campus insiders for SGT, GD Goenka, K.R. Mangalam, Amity & more.',
  'One student dashboard for enrolled classes, assignments, and paid counselling sessions after checkout.',
  'Mentors publish classes, free courses, and assignments from a single teacher portal — students see it all in one place.',
]

export const whyWeStartedBullets = [
  'College marketing was loud, but real student voices were hard to find before you paid lakhs in fees.',
  'Career advice lived in random DMs and generic videos — not tied to what you should actually study next.',
  'Live classes existed on one app, college research on another, and counseling agents on a third.',
  'We built PRIZMA so discover → decide → learn happens in one flow: reviews, counselling, then classes.',
  'Transparent pricing: ₹200 counselling sessions, class trials, then monthly plans — pay only when you are ready.',
  'University counseling is launching next so every question before enrollment has a human answer, not just a brochure.',
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
    title: 'University reviews',
    description:
      'Read what students really say about campus, faculty, and placements — then write your own for the next batch.',
    link: '/universities',
    linkLabel: 'Browse reviews',
    accent: 'sky',
  },
  {
    id: 'counselling',
    title: 'Expert counselling',
    description:
      'Stuck between courses or careers? Book a ₹200 live session — Career, Domain, or Future — on Meet or call.',
    link: '/counselling',
    linkLabel: 'Book ₹200 session',
    accent: 'orange',
  },
  {
    id: 'classes',
    title: 'Live classes',
    description:
      'Turn your roadmap into skills. Mentors teach live on Google Meet with assignments you submit on PRIZMA.',
    link: '/sign-up',
    linkLabel: 'Explore classes',
    accent: 'orange',
  },
  {
    id: 'univ-counseling',
    title: 'University counseling',
    description:
      'Soon: 1:1 counselors who know specific campuses — course fit, fees, and whether that college is right for you.',
    link: '/university-counseling',
    linkLabel: 'See what\'s coming',
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
    title: 'Discover honestly',
    description: 'Start with university reviews and our counseling hub — hear from students, not just ads.',
    tiesTo: 'Reviews → Counseling',
  },
  {
    step: '02',
    title: 'Decide with a human',
    description: 'Book expert counselling for a clear roadmap — which course, which path, what to do next.',
    tiesTo: 'Counselling ₹200/hr',
  },
  {
    step: '03',
    title: 'Learn live',
    description: 'Enroll in mentor-led classes that match your goals. Trial first, then monthly or 3-month plans.',
    tiesTo: 'Live classes & dashboard',
  },
  {
    step: '04',
    title: 'Track in one place',
    description: 'Your dashboard shows classes, assignments, and counselling bookings — the full picture.',
    tiesTo: 'Student portal',
  },
]

export type AboutHighlight = {
  label: string
  iconName: 'video' | 'rupee' | 'graduation' | 'star' | 'users'
}

export const aboutHeroHighlights: AboutHighlight[] = [
  { iconName: 'star', label: 'Reviews + counselling before you commit' },
  { iconName: 'rupee', label: '₹200 sessions · class trials & monthly plans' },
  { iconName: 'video', label: 'Live Google Meet classes with mentors' },
  { iconName: 'graduation', label: 'Student dashboard for everything booked' },
]

export type AboutValue = {
  title: string
  text: string
  iconName: 'target' | 'users' | 'award'
}

export const aboutProcessValues: AboutValue[] = [
  {
    iconName: 'target',
    title: 'Clarity before commitment',
    text: 'Reviews and counselling help you pick the right college and course — before you pay semester fees.',
  },
  {
    iconName: 'users',
    title: 'Humans at every step',
    text: 'Student voices, expert counsellors, and live mentors — not passive videos or anonymous forums.',
  },
  {
    iconName: 'award',
    title: 'One connected journey',
    text: 'From “which university?” to “which class?” — PRIZMA links discovery, decisions, and learning on one platform.',
  },
]

export const pricingEcosystemIntro =
  'Class plans are one part of PRIZMA. Pair them with ₹200 counselling when you need direction, and university reviews when you need honesty — university counseling for specific campuses is launching soon.'

export const contactSectionCopy = {
  title: 'Ready to start your journey?',
  body: 'Whether you need a counselling slot, want to read university reviews, or enroll in a live class — tell us where you are and we will point you to the right place on PRIZMA.',
}

export const footerTagline =
  'College clarity, expert counselling, honest reviews, and live mentor classes — connected on one platform for ambitious students across India.'
