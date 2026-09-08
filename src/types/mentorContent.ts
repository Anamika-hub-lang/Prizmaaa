import type { OnlineClass } from '../data/classCatalog'

export type AssignmentSubmissionType = 'file' | 'link'

export type AssignmentStudentSubmission = {
  clerkId: string
  studentName: string
  submittedAt: string
  note?: string
  type: AssignmentSubmissionType
  fileUrl?: string
  fileName?: string
  link?: string
}

export type MentorAssignment = {
  id: string
  title: string
  course: string
  due: string
  img: string
  description: string
  referenceImages: string[]
  classId?: string | null
  pdfUrl?: string | null
  pdfName?: string | null
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
