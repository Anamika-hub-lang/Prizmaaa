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

    const classes = (classesRes.data ?? []).map((r) =>
      classFromRow(r as import('./supabaseMappers').ClassRow),
    )
    const freeCourses = (freeRes.data ?? []).map((r) =>
      freeCourseFromRow(r as import('./supabaseMappers').FreeCourseRow),
    )
    const assignments = (asgRes.data ?? []).map((r) =>
      assignmentFromRow(r as import('./supabaseMappers').AssignmentRow),
    )

    return { classes, freeCourses, assignments, dataSource: 'supabase' }
  } catch (e) {
    console.warn('[Supabase] fetchAllContent failed', e)
    return emptyContent()
  }
}

export async function insertClass(input: Omit<ManagedClass, 'id' | 'price'> & { price?: number }) {
  const id = `class-${Date.now()}`
  const row = classToRow({
    ...input,
    id,
    price: input.price ?? getDefaultPriceForCategory(input.categoryId),
    published: input.published ?? true,
  } as ManagedClass)
  if (!supabase) return row.id
  const { error } = await supabase.from('classes').insert(row)
  if (error) throw error
  return id
}

export async function updateClassRow(id: string, patch: Partial<ManagedClass>) {
  if (!supabase) return
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
  const { error } = await supabase.from('classes').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteClassRow(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('classes').delete().eq('id', id)
  if (error) throw error
}

export async function insertFreeCourse(input: Omit<FreeCourse, 'id'>) {
  const id = `free-${Date.now()}`
  const row = freeCourseToRow({ ...input, id })
  if (!supabase) return id
  const { error } = await supabase.from('free_courses').insert(row)
  if (error) throw error
  return id
}

export async function deleteFreeCourseRow(id: string) {
  if (!supabase) return
  const { error } = await supabase.from('free_courses').delete().eq('id', id)
  if (error) throw error
}

export async function insertAssignment(input: Omit<MentorAssignment, 'id' | 'status'>) {
  const id = `asg-${Date.now()}`
  const row = assignmentToRow({ ...input, id, status: 'pending' })
  if (!supabase) return id
  const { error } = await supabase.from('assignments').insert(row)
  if (error) throw error
  return id
}

export async function submitAssignmentRow(id: string, studentNote?: string) {
  if (!supabase) return
  const submittedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const { error } = await supabase
    .from('assignments')
    .update({
      status: 'submitted',
      submitted_at: submittedAt,
      student_note: studentNote?.trim() || null,
      submitted_by: 'Student',
    })
    .eq('id', id)
  if (error) throw error
}

export async function updateAssignmentRow(id: string, patch: Partial<MentorAssignment>) {
  if (!supabase) return
  const payload: Record<string, unknown> = {}
  if (patch.title !== undefined) payload.title = patch.title
  if (patch.course !== undefined) payload.course = patch.course
  if (patch.due !== undefined) payload.due = patch.due
  if (patch.img !== undefined) payload.img = patch.img
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