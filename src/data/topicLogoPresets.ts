import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Calculator,
  Camera,
  Code,
  FlaskConical,
  Globe,
  Lightbulb,
  Music,
  Palette,
} from 'lucide-react'

export const TOPIC_LOGO_KEYS = [
  'book',
  'code',
  'flask',
  'palette',
  'calculator',
  'globe',
  'briefcase',
  'lightbulb',
  'music',
  'camera',
] as const

export type TopicLogoKey = (typeof TOPIC_LOGO_KEYS)[number]

export const topicLogoIcons: Record<TopicLogoKey, LucideIcon> = {
  book: BookOpen,
  code: Code,
  flask: FlaskConical,
  palette: Palette,
  calculator: Calculator,
  globe: Globe,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  music: Music,
  camera: Camera,
}

export const topicLogoLabels: Record<TopicLogoKey, string> = {
  book: 'Book',
  code: 'Code',
  flask: 'Lab',
  palette: 'Art',
  calculator: 'Math',
  globe: 'World',
  briefcase: 'Career',
  lightbulb: 'Idea',
  music: 'Music',
  camera: 'Media',
}

export function isTopicLogoKey(value: string | null | undefined): value is TopicLogoKey {
  return Boolean(value && (TOPIC_LOGO_KEYS as readonly string[]).includes(value))
}
