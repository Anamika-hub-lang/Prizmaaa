import type { FreeCourse } from '../data/classCatalog'
import type { ManagedClass, MentorAssignment } from '../types/mentorContent'
import { pickClassCoverImage } from './classCoverImages'
export type ClassRow = {
  id: string
  title: string
  category_id: string
  image: string
  mentor: string
  mentor_image: string
  duration: string
  sessions: string
  description: string
  price: number
  meet_link: string
  next_session_label: string
  published: boolean
  mentor_clerk_id?: string | null
}

export type FreeCourseRow = {
  id: string
  title: string
  image: string
  instructor: string
  lessons: number
  hours: number
  description: string
  mentor_clerk_id?: string | null
}

export type AssignmentRow = {
  id: string
  title: string
  course: string
  due: string
  img: string
  status: 'pending' | 'submitted'
  submitted_at: string | null
  student_note: string | null
  submitted_by: string | null
  mentor_clerk_id?: string | null
}

export function classFromRow(row: ClassRow): ManagedClass {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id as ManagedClass['categoryId'],
    image: pickClassCoverImage({
      id: row.id,
      categoryId: row.category_id as ManagedClass['categoryId'],
      title: row.title,
      image: row.image,
    }),
    mentor: row.mentor,
    mentorImage: row.mentor_image,
    duration: row.duration,
    sessions: row.sessions,
    description: row.description,
    price: row.price,
    meetLink: row.meet_link,
    nextSessionLabel: row.next_session_label,
    published: row.published,
    mentorClerkId: row.mentor_clerk_id ?? null,
  }
}

export function classToRow(c: ManagedClass): ClassRow {
  return {
    id: c.id,
    title: c.title,
    category_id: c.categoryId,
    image: c.image,
    mentor: c.mentor,
    mentor_image: c.mentorImage,
    duration: c.duration,
    sessions: c.sessions,
    description: c.description,
    price: c.price,
    meet_link: c.meetLink,
    next_session_label: c.nextSessionLabel,
    published: c.published,
    mentor_clerk_id: c.mentorClerkId ?? null,
  }
}

export function freeCourseFromRow(row: FreeCourseRow): FreeCourse {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    instructor: row.instructor,
    lessons: row.lessons,
    hours: row.hours,
    description: row.description,
    mentorClerkId: row.mentor_clerk_id ?? null,
  }
}

export function freeCourseToRow(c: FreeCourse): FreeCourseRow {
  return {
    id: c.id,
    title: c.title,
    image: c.image,
    instructor: c.instructor,
    lessons: c.lessons,
    hours: c.hours,
    description: c.description,
    mentor_clerk_id: c.mentorClerkId ?? null,
  }
}

export function assignmentFromRow(row: AssignmentRow): MentorAssignment {
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    due: row.due,
    img: row.img,
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    studentNote: row.student_note ?? undefined,
    submittedBy: row.submitted_by ?? undefined,
    mentorClerkId: row.mentor_clerk_id ?? null,
  }
}

export function assignmentToRow(a: MentorAssignment): AssignmentRow {
  return {
    id: a.id,
    title: a.title,
    course: a.course,
    due: a.due,
    img: a.img,
    status: a.status,
    submitted_at: a.submittedAt ?? null,
    student_note: a.studentNote ?? null,
    submitted_by: a.submittedBy ?? null,
    mentor_clerk_id: a.mentorClerkId ?? null,
  }
}
