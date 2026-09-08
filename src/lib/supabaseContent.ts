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
  type AssignmentRow,
  type ClassRow,
  type FreeCourseRow,
  isMissingReferenceImagesColumn,
  packReferenceImagesFallback,
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
    const [classesRes, freeRes, asgRes] = await Promise.all([
      supabase.from('classes').select('*').order('created_at', { ascending: true }),
      supabase.from('free_courses').select('*').order('created_at', { ascending: true }),
      supabase.from('assignments').select('*').order('created_at', { ascending: true }),
    ])

    if (classesRes.error || freeRes.error || asgRes.error) {
      console.warn('[Supabase] Could not load tables:', {
        classes: classesRes.error?.message,
        freeCourses: freeRes.error?.message,
        assignments: asgRes.error?.message,
      })
      return emptyContent()
    }

    const classes = (classesRes.data ?? []).map((r) => classFromRow(r as ClassRow))
    const freeCourses = (freeRes.data ?? []).map((r) => freeCourseFromRow(r as FreeCourseRow))
    const assignments = (asgRes.data ?? []).map((r) => assignmentFromRow(r as AssignmentRow))

    return { classes, freeCourses, assignments, dataSource: 'supabase' }
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
  const { error } = await supabase.from('assignments').insert(row)
  if (error && isMissingReferenceImagesColumn(error)) {
    const { reference_images, ...rest } = row
    const urls = Array.isArray(reference_images)
      ? reference_images.filter((item): item is string => typeof item === 'string')
      : []
    const fallback = {
      ...rest,
      img: urls.length > 0 ? packReferenceImagesFallback(urls, rest.img) : rest.img,
    }
    const retry = await supabase.from('assignments').insert(fallback)
    if (retry.error) throw retry.error
    return id
  }
  if (error) throw error
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
  if (patch?.submissionType !== undefined) payload.submission_type = patch.submissionType
  if (patch?.submissionFileUrl !== undefined) payload.submission_file_url = patch.submissionFileUrl
  if (patch?.submissionFileName !== undefined) payload.submission_file_name = patch.submissionFileName
  if (patch?.submissionLink !== undefined) payload.submission_link = patch.submissionLink
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
  if (patch.description !== undefined) payload.description = patch.description
  if (patch.referenceImages !== undefined) payload.reference_images = patch.referenceImages
  if (patch.mentorClerkId !== undefined) payload.mentor_clerk_id = patch.mentorClerkId
  const { error } = await supabase.from('assignments').update(payload).eq('id', id)
  if (error && isMissingReferenceImagesColumn(error) && patch.referenceImages !== undefined) {
    const fallback = { ...payload }
    delete fallback.reference_images
    fallback.img = packReferenceImagesFallback(
      patch.referenceImages,
      String(patch.img ?? payload.img ?? ''),
    )
    const retry = await supabase.from('assignments').update(fallback).eq('id', id)
    if (retry.error) throw retry.error
    return
  }
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