import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Cloud,
  Code2,
  Compass,
  Database,
  FileText,
  GraduationCap,
  Layers,
  Layout,
  LineChart,
  MessageSquare,
  Monitor,
  Palette,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'

export const COUNSELLING_PRICE_INR = 200
export const COUNSELLING_DURATION_LABEL = '1 hour'

export type CounsellingGroupId = 'career' | 'domain' | 'future'

export type CounsellingGroup = {
  id: CounsellingGroupId
  title: string
  subtitle: string
  description: string
  image: string
  topicCount: number
}

export type CounsellingTopic = {
  id: string
  groupId: CounsellingGroupId
  title: string
  tagline: string
  icon: LucideIcon
  accent: string
  highlights: string[]
}

export const counsellingIncludes = [
  'Personalised roadmap for the next 3–12 months',
  'Tools, resources & learning order that actually work',
  'Honest fit check — what to pursue and what to skip',
  'Q&A on call or Google Meet with a mentor',
  'Written summary points shared after the session',
] as const

export const counsellingGroups: CounsellingGroup[] = [
  {
    id: 'career',
    title: 'Career',
    subtitle: 'Jobs, growth & direction',
    description:
      'Clarity on roles, switching paths, interviews, portfolios, and long-term career moves — with a practical 90-day plan.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    topicCount: 0,
  },
  {
    id: 'domain',
    title: 'Domain',
    subtitle: 'Skills & industry tracks',
    description:
      'UI/UX, frontend, backend, data, marketing, and more — pick your field and get a mentor-built learning roadmap.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    topicCount: 0,
  },
  {
    id: 'future',
    title: 'Future',
    subtitle: 'Education & next steps',
    description:
      'After 10th, 12th, JEE, NEET, study plans, freelancing, and balancing exams with modern skills.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    topicCount: 0,
  },
]

export const counsellingTopics: CounsellingTopic[] = [
  // —— Career ——
  {
    id: 'career-general',
    groupId: 'career',
    title: 'Career counselling',
    tagline: 'Roles, salary paths & long-term growth',
    icon: Briefcase,
    accent: 'from-orange-500 to-amber-500',
    highlights: ['Role mapping', 'Industry fit', '5-year view'],
  },
  {
    id: 'career-first-job',
    groupId: 'career',
    title: 'First job & internships',
    tagline: 'Break in with the right projects and applications',
    icon: Rocket,
    accent: 'from-sky-500 to-blue-600',
    highlights: ['Internship targets', 'Application strategy', 'LinkedIn setup'],
  },
  {
    id: 'career-switch',
    groupId: 'career',
    title: 'Career switch',
    tagline: 'Move into tech, design, or a new industry',
    icon: TrendingUp,
    accent: 'from-violet-500 to-purple-600',
    highlights: ['Transition timeline', 'Skill bridge plan', 'Risk check'],
  },
  {
    id: 'career-portfolio',
    groupId: 'career',
    title: 'Resume & portfolio',
    tagline: 'Stand out on paper and in your GitHub / Behance',
    icon: FileText,
    accent: 'from-rose-500 to-pink-500',
    highlights: ['Portfolio structure', 'Project picks', 'ATS-friendly CV'],
  },
  {
    id: 'career-interview',
    groupId: 'career',
    title: 'Interview preparation',
    tagline: 'Technical + HR rounds with a clear prep plan',
    icon: MessageSquare,
    accent: 'from-indigo-500 to-violet-600',
    highlights: ['Mock structure', 'Common questions', 'Confidence tips'],
  },
  {
    id: 'career-salary',
    groupId: 'career',
    title: 'Salary & negotiation',
    tagline: 'Know your worth and how to ask for it',
    icon: LineChart,
    accent: 'from-emerald-500 to-teal-500',
    highlights: ['Market ranges', 'Offer comparison', 'Negotiation scripts'],
  },
  {
    id: 'career-special',
    groupId: 'career',
    title: 'Special focus session',
    tagline: 'Gaps, breaks, or unique situations',
    icon: Sparkles,
    accent: 'from-educture-orange to-[#e85d04]',
    highlights: ['Custom agenda', 'Mentor-matched', 'Flexible format'],
  },

  // —— Domain ——
  {
    id: 'domain-ui-ux',
    groupId: 'domain',
    title: 'UI / UX design',
    tagline: 'Figma, portfolios & product design careers',
    icon: Layout,
    accent: 'from-violet-500 to-purple-500',
    highlights: ['Tool stack', 'Case studies', 'Internship path'],
  },
  {
    id: 'domain-frontend',
    groupId: 'domain',
    title: 'Frontend development',
    tagline: 'HTML → React → job-ready projects',
    icon: Monitor,
    accent: 'from-sky-500 to-blue-500',
    highlights: ['Tech order', 'GitHub plan', 'Job projects'],
  },
  {
    id: 'domain-backend',
    groupId: 'domain',
    title: 'Backend development',
    tagline: 'APIs, databases & server-side careers',
    icon: Database,
    accent: 'from-slate-600 to-slate-800',
    highlights: ['Node / Python path', 'DB basics', 'System intro'],
  },
  {
    id: 'domain-fullstack',
    groupId: 'domain',
    title: 'Full-stack development',
    tagline: 'End-to-end web apps from zero to deploy',
    icon: Code2,
    accent: 'from-cyan-500 to-sky-600',
    highlights: ['Stack choice', 'Project roadmap', 'Deploy basics'],
  },
  {
    id: 'domain-mobile',
    groupId: 'domain',
    title: 'Mobile app development',
    tagline: 'React Native, Flutter & app store path',
    icon: Smartphone,
    accent: 'from-fuchsia-500 to-pink-500',
    highlights: ['Framework pick', 'App ideas', 'Store checklist'],
  },
  {
    id: 'domain-data-ai',
    groupId: 'domain',
    title: 'Data science & AI',
    tagline: 'Python, ML basics & analyst roles',
    icon: Brain,
    accent: 'from-indigo-500 to-blue-700',
    highlights: ['Math level needed', 'Project path', 'Role types'],
  },
  {
    id: 'domain-marketing',
    groupId: 'domain',
    title: 'Digital marketing',
    tagline: 'SEO, ads, social & growth careers',
    icon: BarChart3,
    accent: 'from-amber-500 to-orange-500',
    highlights: ['Channel mix', 'Certifications', 'Freelance start'],
  },
  {
    id: 'domain-graphic',
    groupId: 'domain',
    title: 'Graphic design',
    tagline: 'Branding, Illustrator & creative freelance',
    icon: Palette,
    accent: 'from-rose-400 to-red-500',
    highlights: ['Software stack', 'Client work', 'Portfolio tips'],
  },
  {
    id: 'domain-devops',
    groupId: 'domain',
    title: 'DevOps & cloud',
    tagline: 'AWS, Docker, CI/CD career path',
    icon: Cloud,
    accent: 'from-teal-500 to-emerald-600',
    highlights: ['Cert roadmap', 'Linux basics', 'First cloud project'],
  },
  {
    id: 'domain-security',
    groupId: 'domain',
    title: 'Cybersecurity',
    tagline: 'Ethical hacking & security analyst roles',
    icon: Shield,
    accent: 'from-gray-600 to-gray-800',
    highlights: ['Entry certs', 'Lab setup', 'Career ladder'],
  },
  {
    id: 'domain-content',
    groupId: 'domain',
    title: 'Content & copywriting',
    tagline: 'Writing, video scripts & personal brand',
    icon: Video,
    accent: 'from-orange-400 to-amber-500',
    highlights: ['Niche finding', 'Platform strategy', 'Income paths'],
  },

  // —— Future ——
  {
    id: 'future-after-10th',
    groupId: 'future',
    title: 'After 10th',
    tagline: 'Science, commerce, arts — pick the right stream',
    icon: Compass,
    accent: 'from-emerald-500 to-teal-500',
    highlights: ['Stream compare', 'Coaching fit', 'Early skills'],
  },
  {
    id: 'future-after-12th',
    groupId: 'future',
    title: 'After 12th',
    tagline: 'Degree vs diploma vs skill-first paths',
    icon: GraduationCap,
    accent: 'from-rose-500 to-pink-500',
    highlights: ['College logic', 'Backup plans', 'Parallel skills'],
  },
  {
    id: 'future-after-jee',
    groupId: 'future',
    title: 'After JEE',
    tagline: 'Branches, colleges, drop-year & Plan B',
    icon: Target,
    accent: 'from-indigo-500 to-violet-600',
    highlights: ['Branch vs college', 'Counselling rounds', 'Coding side path'],
  },
  {
    id: 'future-after-neet',
    groupId: 'future',
    title: 'After NEET',
    tagline: 'Medical colleges, alternatives & gap year',
    icon: BookOpen,
    accent: 'from-green-500 to-emerald-600',
    highlights: ['College options', 'Allied health', 'Reattempt plan'],
  },
  {
    id: 'future-study-abroad',
    groupId: 'future',
    title: 'Study abroad',
    tagline: 'Countries, exams, scholarships & timelines',
    icon: Users,
    accent: 'from-blue-500 to-indigo-600',
    highlights: ['Country shortlist', 'Exam prep', 'Budget reality'],
  },
  {
    id: 'future-skills-academic',
    groupId: 'future',
    title: 'Skills + academics',
    tagline: 'Balance boards, exams & modern skills',
    icon: Layers,
    accent: 'from-cyan-500 to-sky-500',
    highlights: ['Weekly timetable', 'Free resources', 'Burnout prevention'],
  },
  {
    id: 'future-freelance',
    groupId: 'future',
    title: 'Freelance & remote',
    tagline: 'First clients, pricing & online income',
    icon: Rocket,
    accent: 'from-amber-500 to-orange-600',
    highlights: ['Platform picks', 'Proposals', 'Pricing your time'],
  },
  {
    id: 'future-govt-exams',
    groupId: 'future',
    title: 'Government exams',
    tagline: 'UPSC, SSC, banking & long-prep strategy',
    icon: BookOpen,
    accent: 'from-stone-500 to-stone-700',
    highlights: ['Exam pick', 'Syllabus plan', 'Attempt strategy'],
  },
]

// Fill topic counts on groups
for (const group of counsellingGroups) {
  group.topicCount = counsellingTopics.filter((t) => t.groupId === group.id).length
}

export function counsellingGroupById(id: string): CounsellingGroup | undefined {
  return counsellingGroups.find((g) => g.id === id)
}

export function counsellingTopicsByGroup(groupId: CounsellingGroupId): CounsellingTopic[] {
  return counsellingTopics.filter((t) => t.groupId === groupId)
}

export function counsellingTopicById(id: string): CounsellingTopic | undefined {
  return counsellingTopics.find((t) => t.id === id)
}

/** @deprecated use counsellingTopicById */
export function counsellingCategoryById(id: string): CounsellingTopic | undefined {
  return counsellingTopicById(id)
}

/** @deprecated use counsellingTopics */
export const counsellingCategories = counsellingTopics
