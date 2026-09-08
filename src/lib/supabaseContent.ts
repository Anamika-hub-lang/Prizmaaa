import { getDefaultPriceForCategory } from '../data/classCatalog'
import type { ManagedClass, MentorAssignment } from '../types/mentorContent'
import type { FreeCourse } from '../data/classCatalog'
import { supabase } from './supabase'
import {
  classFromRow,
  classToRow,
  freeCourseFromRow,
  freeCourseToRow,
  assignmentFromRow,
  assignmentToRow,
  assignmentInsertPayload,
  packReferenceImagesFallback,
  type AssignmentRow,
  type ClassRow,
  type FreeCourseRow,
} from './supabaseMappers'

const emptyContent = (): {
  classes: ManagedClass[]
  freeCourses: FreeCourse[]
  assignments: MentorAssignment[]
  dataSource: 'supabase' | 'local'
} => ({
  classes: [],
  freeCourses: [],
  assignments: [],
  dataSource: 'local',
})

export async function fetchAllContent(): Promise<{
  classes: ManagedClass[]
  freeCourses: FreeCourse[]
  assignments: MentorAssignment[]
  dataSource: 'supabase' | 'local'
}> {
  if (!supabase) {
    return emptyContent()
  }

  try {
    const classesRes = await supabase.from('classes').select('*').order('created_at', { ascending: true })
    const freeRes = await supabase.from('free_courses').select('*').order('created_at', { ascending: true })
    const asgRes = await supabase.from('assignments').select('*').order('created_at', { ascending: true })

    if (classesRes.error) console.warn('[Supabase] classes', classesRes.error.message)
    if (freeRes.error) console.warn('[Supabase] free_courses', freeRes.error.message)
    if (asgRes.error) console.warn('[Supabase] assignments', asgRes.error.message)

    const classes = (classesRes.data ?? []).map((r) => classFromRow(r as ClassRow))
    const freeCourses = (freeRes.data ?? []).map((r) => freeCourseFromRow(r as FreeCourseRow))
    const assignments = (asgRes.data ?? []).map((r) => assignmentFromRow(r as AssignmentRow))

    if (classesRes.error && freeRes.error && asgRes.error) {
      return emptyContent()
    }

    return {
      classes,
      freeCourses,
      assignments,
      dataSource: 'supabase',
    }
  } catch (e) {
    console.warn('[Supabase] fetchAllContent failed', e)
    return emptyContent()
  }
}

export async function insertClass(
  input: Omit<ManagedClass, 'id' | 'price'> & { price?: number; mentorClerkId?: string },
  id: string,
) {
  const row = classToRow({
    ...input,
    id,
    price: input.price ?? getDefaultPriceForCategory(input.categoryId),
    published: input.published ?? true,
    mentorClerkId: input.mentorClerkId ?? null,
  } as ManagedClass)
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const { error } = await supabase.from('classes').insert(row)
  if (error) throw error
  return id
}

export async function updateClassRow(id: string, patch: Partial<ManagedClass>) {
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const payload: Record<string, unknown> = {}
  if (patch.title !== undefined) payload.title = patch.title
  if (patch.categoryId !== undefined) payload.category_id = patch.categoryId
  if (patch.image !== undefined) payload.image = patch.image
  if (patch.mentor !== undefined) payload.mentor = patch.mentor
  if (patch.mentorImage !== undefined) payload.mentor_image = patch.mentorImage
  if (patch.duration !== undefined) payload.duration = patch.duration
  if (patch.sessions !== undefined) payload.sessions = patch.sessions
  if (patch.description !== undefined) payload.description = patch.description
  if (patch.price !== undefined) payload.price = patch.price
  if (patch.meetLink !== undefined) payload.meet_link = patch.meetLink
  if (patch.nextSessionLabel !== undefined) payload.next_session_label = patch.nextSessionLabel
  if (patch.published !== undefined) payload.published = patch.published
  if (patch.mentorClerkId !== undefined) payload.mentor_clerk_id = patch.mentorClerkId
  const { error } = await supabase.from('classes').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteClassRow(id: string) {
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const { error } = await supabase.from('classes').delete().eq('id', id)
  if (error) throw error
}

export async function insertFreeCourse(
  input: Omit<FreeCourse, 'id'> & { mentorClerkId?: string },
  id: string,
) {
  const row = freeCourseToRow({ ...input, id, mentorClerkId: input.mentorClerkId ?? null })
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const { error } = await supabase.from('free_courses').insert(row)
  if (error) throw error
  return id
}

export async function updateFreeCourseRow(id: string, patch: Partial<FreeCourse>) {
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const payload: Record<string, unknown> = {}
  if (patch.title !== undefined) payload.title = patch.title
  if (patch.image !== undefined) payload.image = patch.image
  if (patch.instructor !== undefined) payload.instructor = patch.instructor
  if (patch.lessons !== undefined) payload.lessons = patch.lessons
  if (patch.hours !== undefined) payload.hours = patch.hours
  if (patch.description !== undefined) payload.description = patch.description
  if (patch.mentorClerkId !== undefined) payload.mentor_clerk_id = patch.mentorClerkId
  const { error } = await supabase.from('free_courses').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteFreeCourseRow(id: string) {
  if (!supabase) throw new Error('Database not connected. Add Supabase keys to .env.')
  const { error } = await supabase.from('free_courses').delete().eq('id', id)
  if (error) throw error
}

export async function insertAssignment(
  input: Omit<MentorAssignment, 'id' | 'status'> & { id?: string; mentorClerkId?: string },
) {
  const id = input.id?.trim() || `asg-${Date.now()}`
  const row = assignmentToRow({
    ...input,
    id,
    description: input.description ?? '',
    referenceImages: input.referenceImages ?? [],
    status: 'pending',
    mentorClerkId: input.mentorClerkId ?? null,
  })
  if (!supabase) return id
  const payload = assignmentInsertPayload(row)
  const first = await supabase.from('assignments').insert(payload)
  if (first.error && /class_id/i.test(first.error.message ?? '')) {
    const { class_id: _omit, ...rest } = payload
    const retry = await supabase.from('assignments').insert(rest)
    if (retry.error) throw retry.error
    return id
  }
  if (first.error) throw first.error
  return id
}

export async function submitAssignmentRow(
  id: string,
  patch?: {
    studentNote?: string
    submissionType?: 'file' | 'link' | null
    submissionFileUrl?: string | null
    submissionFileName?: string | null
    submissionLink?: string | null
  },
) {
  if (!supabase) return
  const submittedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const payload: Record<string, unknown> = {
    status: 'submitted',
    submitted_at: submittedAt,
    student_note: patch?.studentNote?.trim() || null,
    submitted_by: 'Student',
  }
  const { error } = await supabase.from('assignments').update(payload).eq('id', id)
  if (error) throw error
}

export async function updateAssignmentRow(id: string, patch: Partial<MentorAssignment>) {
  if (!supabase) return
  const payload: Record<string, unknown> = {}
  if (patch.title !== undefined) payload.title = patch.title
  if (patch.course !== undefined) payload.course = patch.course
  if (patch.due !== undefined) payload.due = patch.due
  if (patch.img !== undefined) payload.img = patch.img
  if (patch.referenceImages !== undefined) {
    payload.img = packReferenceImagesFallback(patch.referenceImages, String(patch.img ?? payload.img ?? ''))
  }
  if (patch.description !== undefined) payload.description = patch.description
  if (patch.classId !== undefined) payload.class_id = patch.classId
  if (patch.mentorClerkId !== undefined) payload.mentor_clerk_id = patch.mentorClerkId
  const { error } = await supabase.from('assignments').update(payload).eq('id', id)
  if (error) throw error
}

export function subscribeContentRealtime(onChange: () => void) {
  if (!supabase) return () => {}

  const client = supabase
  const channel = client
    .channel('educture-content')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => onChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'free_courses' }, () => onChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => onChange())
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}