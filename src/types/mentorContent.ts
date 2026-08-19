import type { OnlineClass } from '../data/classCatalog'

export type MentorAssignment = {
  id: string
  title: string
  course: string
  due: string
  img: string
  status: 'pending' | 'submitted'
  submittedAt?: string
  studentNote?: string
  submittedBy?: string
  mentorClerkId?: string | null
}

export type ManagedClass = OnlineClass & {
  meetLink: string
  nextSessionLabel: string
  published: boolean
  mentorClerkId?: string | null
}
