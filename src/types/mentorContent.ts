import type { OnlineClass } from '../data/classCatalog'

export type AssignmentSubmissionType = 'file' | 'link'

export type MentorAssignment = {
  id: string
  title: string
  course: string
  due: string
  img: string
  description: string
  referenceImages: string[]
  status: 'pending' | 'submitted'
  submittedAt?: string
  studentNote?: string
  submittedBy?: string
  mentorClerkId?: string | null
  submissionType?: AssignmentSubmissionType
  submissionFileUrl?: string
  submissionFileName?: string
  submissionLink?: string
}

export type ManagedClass = OnlineClass & {
  meetLink: string
  nextSessionLabel: string
  published: boolean
  mentorClerkId?: string | null
}
