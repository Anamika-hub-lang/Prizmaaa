import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isActiveEnrollmentRow } from './lib/enrollmentPolicy'
import {
  ensureBuiltinOfflineStudentsOnClass,
  offlineDisplayNameForEmail,
} from './lib/offlineEnrollment'

type Env = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
}

type Helpers = {
  json: (res: ServerResponse, status: number, body: unknown) => void
  verifyClerkSession: (req: IncomingMessage, clerkSecretKey: string) => Promise<string | null>
  requireSupabaseAdmin: (env: Env) => SupabaseClient | null
  readBodyJson: (req: IncomingMessage) => Promise<unknown>
}

/** 40 minutes live Meet attendance credit. */
export const MEET_ATTENDANCE_REQUIRED_SECONDS = 40 * 60

const DEFAULT_TOTAL_SESSIONS = 20
const MAX_HEARTBEAT_DELTA_SECONDS = 90
const MISSING_SQL =
  'Attendance tables missing. Run supabase/class-attendance.sql in the Supabase SQL Editor.'

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

function todayIstDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function parseTotalSessions(sessionsLabel: string | null | undefined): number {
  if (!sessionsLabel?.trim()) return DEFAULT_TOTAL_SESSIONS
  const match = sessionsLabel.match(/(\d+)/)
  if (!match) return DEFAULT_TOTAL_SESSIONS
  const n = Number(match[1])
  if (!Number.isFinite(n) || n < 1) return DEFAULT_TOTAL_SESSIONS
  return Math.min(200, Math.floor(n))
}

async function requireAuth(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<string | null> {
  if (!env.clerkSecretKey) {
    helpers.json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return null
  }
  const clerkId = await helpers.verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    helpers.json(res, 401, { error: 'Sign in required' })
    return null
  }
  return clerkId
}

async function canMentorManageClass(
  supabase: SupabaseClient,
  classId: string,
  clerkId: string,
): Promise<{ ok: true; title: string; sessions: string } | { ok: false }> {
  const { data: cls } = await supabase
    .from('classes')
    .select('id, title, sessions, mentor_clerk_id')
    .eq('id', classId)
    .maybeSingle()
  if (!cls) return { ok: false }
  if (String(cls.mentor_clerk_id ?? '') === clerkId) {
    return {
      ok: true,
      title: String(cls.title ?? 'Class'),
      sessions: String(cls.sessions ?? ''),
    }
  }
  const { data: share } = await supabase
    .from('class_co_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_clerk_id', clerkId)
    .maybeSingle()
  if (share) {
    return {
      ok: true,
      title: String(cls.title ?? 'Class'),
      sessions: String(cls.sessions ?? ''),
    }
  }
  return { ok: false }
}

async function requireActiveEnrollment(
  supabase: SupabaseClient,
  clerkId: string,
  classId: string,
): Promise<{ ok: true; enrollmentId: string } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('id, billing_status, status')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .maybeSingle()
  if (error) return { ok: false, error: error.message || 'Could not load enrollment' }
  if (!data || !isActiveEnrollmentRow(data)) {
    return { ok: false, error: 'You must be enrolled in this class to join attendance.' }
  }
  return { ok: true, enrollmentId: String(data.id) }
}

function isRealGoogleMeetLink(link?: string | null): boolean {
  const href = (link ?? '').trim()
  if (!href) return false
  try {
    const u = new URL(href)
    if (!/^meet\.google\.com$/i.test(u.hostname)) return false
    return u.pathname.replace(/\/+$/, '').length > 1
  } catch {
    return false
  }
}

async function fetchClassMeetInfo(
  supabase: SupabaseClient,
  classId: string,
): Promise<{ classTitle: string; meetLink: string }> {
  const { data } = await supabase
    .from('classes')
    .select('title, meet_link')
    .eq('id', classId)
    .maybeSingle()
  const raw = String(data?.meet_link ?? '').trim()
  return {
    classTitle: String(data?.title ?? 'Class'),
    meetLink: isRealGoogleMeetLink(raw) ? raw : '',
  }
}

export async function recalculateEnrollmentProgress(
  supabase: SupabaseClient,
  clerkId: string,
  classId: string,
): Promise<{ progress: number; attended: number; totalSessions: number; completed: boolean }> {
  const { data: cls } = await supabase.from('classes').select('sessions').eq('id', classId).maybeSingle()
  const totalSessions = parseTotalSessions(cls?.sessions as string | undefined)

  const { data: rows, error } = await supabase
    .from('class_attendance')
    .select('id')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .eq('present', true)

  if (error) throw error

  const attended = (rows ?? []).length
  const progress = Math.min(100, Math.round((attended / totalSessions) * 100))
  const completed = progress >= 100

  const patch: Record<string, unknown> = {
    progress,
    status: completed ? 'completed' : 'ongoing',
  }

  const { error: updateError } = await supabase
    .from('student_enrollments')
    .update(patch)
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)

  if (updateError) throw updateError

  return { progress, attended, totalSessions, completed }
}

async function upsertPresentAttendance(
  supabase: SupabaseClient,
  input: {
    classId: string
    clerkId: string
    sessionDate: string
    source: 'meet_timer' | 'mentor'
    markedByClerkId?: string | null
  },
): Promise<void> {
  const { data: existing } = await supabase
    .from('class_attendance')
    .select('id, present')
    .eq('class_id', input.classId)
    .eq('clerk_id', input.clerkId)
    .eq('session_date', input.sessionDate)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('class_attendance')
      .update({
        present: true,
        source: input.source,
        marked_by_clerk_id: input.markedByClerkId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('class_attendance').insert({
    class_id: input.classId,
    clerk_id: input.clerkId,
    session_date: input.sessionDate,
    present: true,
    source: input.source,
    marked_by_clerk_id: input.markedByClerkId ?? null,
  })
  if (error) throw error
}

async function handleStudentStart(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const body = (await helpers.readBodyJson(req)) as { classId?: string }
  const classId = String(body.classId ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }

  const enrolled = await requireActiveEnrollment(supabase, clerkId, classId)
  if (!enrolled.ok) {
    helpers.json(res, 403, { error: enrolled.error })
    return
  }

  const meetInfo = await fetchClassMeetInfo(supabase, classId)
  const sessionDate = todayIstDate()

  const { data: alreadyPresent } = await supabase
    .from('class_attendance')
    .select('id')
    .eq('class_id', classId)
    .eq('clerk_id', clerkId)
    .eq('session_date', sessionDate)
    .eq('present', true)
    .maybeSingle()

  if (alreadyPresent?.id) {
    const progress = await recalculateEnrollmentProgress(supabase, clerkId, classId)
    helpers.json(res, 200, {
      alreadyCredited: true,
      session: null,
      meetLink: meetInfo.meetLink,
      classTitle: meetInfo.classTitle,
      progress,
      message: 'Today’s attendance is already marked for this class.',
    })
    return
  }

  const { data: active } = await supabase
    .from('class_meet_sessions')
    .select('*')
    .eq('class_id', classId)
    .eq('clerk_id', clerkId)
    .eq('session_date', sessionDate)
    .eq('completed', false)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (active?.id) {
    helpers.json(res, 200, {
      alreadyCredited: false,
      meetLink: meetInfo.meetLink,
      classTitle: meetInfo.classTitle,
      session: {
        id: String(active.id),
        classId,
        classTitle: meetInfo.classTitle,
        meetLink: meetInfo.meetLink,
        sessionDate,
        accumulatedSeconds: Number(active.accumulated_seconds ?? 0),
        requiredSeconds: Number(active.required_seconds ?? MEET_ATTENDANCE_REQUIRED_SECONDS),
        completed: false,
      },
      progress: null,
    })
    return
  }

  const { data: created, error } = await supabase
    .from('class_meet_sessions')
    .insert({
      class_id: classId,
      clerk_id: clerkId,
      session_date: sessionDate,
      required_seconds: MEET_ATTENDANCE_REQUIRED_SECONDS,
      accumulated_seconds: 0,
    })
    .select('*')
    .single()

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not start Meet session' })
    return
  }

  helpers.json(res, 200, {
    alreadyCredited: false,
    meetLink: meetInfo.meetLink,
    classTitle: meetInfo.classTitle,
    session: {
      id: String(created.id),
      classId,
      classTitle: meetInfo.classTitle,
      meetLink: meetInfo.meetLink,
      sessionDate,
      accumulatedSeconds: 0,
      requiredSeconds: MEET_ATTENDANCE_REQUIRED_SECONDS,
      completed: false,
    },
    progress: null,
  })
}

async function handleStudentHeartbeat(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const body = (await helpers.readBodyJson(req)) as { sessionId?: string }
  const sessionId = String(body.sessionId ?? '').trim()
  if (!sessionId) {
    helpers.json(res, 400, { error: 'sessionId is required' })
    return
  }

  const { data: session, error } = await supabase
    .from('class_meet_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('clerk_id', clerkId)
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not load session' })
    return
  }
  if (!session) {
    helpers.json(res, 404, { error: 'Session not found' })
    return
  }

  const classId = String(session.class_id)
  const sessionDate = String(session.session_date)
  const required = Number(session.required_seconds ?? MEET_ATTENDANCE_REQUIRED_SECONDS)

  if (session.completed) {
    const progress = await recalculateEnrollmentProgress(supabase, clerkId, classId)
    helpers.json(res, 200, {
      session: {
        id: sessionId,
        classId,
        sessionDate,
        accumulatedSeconds: required,
        requiredSeconds: required,
        completed: true,
      },
      attendanceCredited: true,
      progress,
    })
    return
  }

  const lastHb = new Date(String(session.last_heartbeat_at ?? session.started_at)).getTime()
  const now = Date.now()
  const deltaSec = Math.max(0, Math.min(MAX_HEARTBEAT_DELTA_SECONDS, Math.floor((now - lastHb) / 1000)))
  const nextAccumulated = Math.min(required, Number(session.accumulated_seconds ?? 0) + deltaSec)
  const completed = nextAccumulated >= required

  const { error: updateError } = await supabase
    .from('class_meet_sessions')
    .update({
      accumulated_seconds: nextAccumulated,
      last_heartbeat_at: new Date(now).toISOString(),
      completed,
      completed_at: completed ? new Date(now).toISOString() : null,
    })
    .eq('id', sessionId)

  if (updateError) {
    helpers.json(res, 500, { error: updateError.message || 'Could not update session' })
    return
  }

  let progress: Awaited<ReturnType<typeof recalculateEnrollmentProgress>> | null = null
  let attendanceCredited = false
  if (completed) {
    try {
      await upsertPresentAttendance(supabase, {
        classId,
        clerkId,
        sessionDate,
        source: 'meet_timer',
      })
      progress = await recalculateEnrollmentProgress(supabase, clerkId, classId)
      attendanceCredited = true
    } catch (err) {
      console.error('[attendance] credit after timer', err)
      helpers.json(res, 500, {
        error: err instanceof Error ? err.message : 'Could not credit attendance',
      })
      return
    }
  }

  helpers.json(res, 200, {
    session: {
      id: sessionId,
      classId,
      sessionDate,
      accumulatedSeconds: nextAccumulated,
      requiredSeconds: required,
      completed,
    },
    attendanceCredited,
    progress,
  })
}

async function handleStudentActive(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const classId = (url.searchParams.get('classId') ?? '').trim()

  let query = supabase
    .from('class_meet_sessions')
    .select('*')
    .eq('clerk_id', clerkId)
    .eq('completed', false)
    .eq('session_date', todayIstDate())
    .order('started_at', { ascending: false })
    .limit(1)

  if (classId) query = query.eq('class_id', classId)

  const { data, error } = await query.maybeSingle()
  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 200, { session: null })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not load session' })
    return
  }

  if (!data) {
    helpers.json(res, 200, { session: null })
    return
  }

  const { data: cls } = await supabase
    .from('classes')
    .select('title, meet_link')
    .eq('id', data.class_id)
    .maybeSingle()

  helpers.json(res, 200, {
    session: {
      id: String(data.id),
      classId: String(data.class_id),
      classTitle: String(cls?.title ?? 'Class'),
      meetLink: String(cls?.meet_link ?? ''),
      sessionDate: String(data.session_date),
      accumulatedSeconds: Number(data.accumulated_seconds ?? 0),
      requiredSeconds: Number(data.required_seconds ?? MEET_ATTENDANCE_REQUIRED_SECONDS),
      completed: false,
    },
  })
}

async function handleStudentSummary(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const classId = (url.searchParams.get('classId') ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }

  const { data: cls } = await supabase.from('classes').select('sessions, title').eq('id', classId).maybeSingle()
  const totalSessions = parseTotalSessions(cls?.sessions as string | undefined)

  const { data: rows, error } = await supabase
    .from('class_attendance')
    .select('session_date, present, source')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .order('session_date', { ascending: false })

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 200, {
        classId,
        classTitle: String(cls?.title ?? 'Class'),
        attended: 0,
        totalSessions,
        progress: 0,
        todayPresent: false,
        records: [],
      })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not load attendance' })
    return
  }

  const attended = (rows ?? []).filter((r) => r.present).length
  const progress = Math.min(100, Math.round((attended / totalSessions) * 100))
  const today = todayIstDate()
  const todayPresent = (rows ?? []).some((r) => String(r.session_date) === today && r.present)

  helpers.json(res, 200, {
    classId,
    classTitle: String(cls?.title ?? 'Class'),
    attended,
    totalSessions,
    progress,
    todayPresent,
    records: (rows ?? []).map((r) => ({
      sessionDate: String(r.session_date),
      present: Boolean(r.present),
      source: String(r.source),
    })),
  })
}

async function handleMentorRoster(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const classId = (url.searchParams.get('classId') ?? '').trim()
  const sessionDate = (url.searchParams.get('sessionDate') ?? todayIstDate()).trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }

  const access = await canMentorManageClass(supabase, classId, clerkId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can view attendance' })
    return
  }

  if (env.clerkSecretKey) {
    try {
      await ensureBuiltinOfflineStudentsOnClass({
        supabase,
        clerkSecretKey: env.clerkSecretKey,
        classId,
        classTitle: access.title,
      })
    } catch (err) {
      console.warn('[attendance] offline student sync on roster', err)
    }
  }

  const { data: enrollments, error } = await supabase
    .from('student_enrollments')
    .select('id, clerk_id, progress, status, billing_status, plan_tier, enrolled_at')
    .eq('class_id', classId)
    .order('enrolled_at', { ascending: true })

  if (error) {
    helpers.json(res, 500, { error: error.message || 'Could not load enrollments' })
    return
  }

  const active = (enrollments ?? []).filter((e) => isActiveEnrollmentRow(e))
  const clerkIds = active.map((e) => String(e.clerk_id))

  const profilesByClerk = new Map<string, { fullName: string; email: string }>()
  if (clerkIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('clerk_id, full_name, email')
      .in('clerk_id', clerkIds)
    for (const p of profiles ?? []) {
      profilesByClerk.set(String(p.clerk_id), {
        fullName: String(p.full_name ?? '').trim() || 'Student',
        email: String(p.email ?? ''),
      })
    }
  }

  const attendanceByClerk = new Map<string, { present: boolean; source: string }>()
  if (clerkIds.length > 0) {
    const { data: attRows, error: attError } = await supabase
      .from('class_attendance')
      .select('clerk_id, present, source')
      .eq('class_id', classId)
      .eq('session_date', sessionDate)
      .in('clerk_id', clerkIds)

    if (attError && !isMissingTable(attError)) {
      helpers.json(res, 500, { error: attError.message || 'Could not load attendance' })
      return
    }
    for (const row of attRows ?? []) {
      attendanceByClerk.set(String(row.clerk_id), {
        present: Boolean(row.present),
        source: String(row.source),
      })
    }
  }

  const totalSessions = parseTotalSessions(access.sessions)

  helpers.json(res, 200, {
    classId,
    classTitle: access.title,
    sessionDate,
    totalSessions,
    students: active.map((e) => {
      const id = String(e.clerk_id)
      const profile = profilesByClerk.get(id)
      const att = attendanceByClerk.get(id)
      const email = profile?.email ?? ''
      const offlineName = offlineDisplayNameForEmail(email)
      return {
        clerkId: id,
        enrollmentId: String(e.id),
        fullName: offlineName || profile?.fullName || 'Student',
        email,
        progress: Number(e.progress ?? 0),
        status: String(e.status ?? 'ongoing'),
        planTier: e.plan_tier ? String(e.plan_tier) : null,
        todayPresent: att ? att.present : null,
        todaySource: att?.source ?? null,
      }
    }),
  })
}

async function handleMentorMark(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const mentorId = await requireAuth(req, res, env, helpers)
  if (!mentorId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const body = (await helpers.readBodyJson(req)) as {
    classId?: string
    studentClerkId?: string
    sessionDate?: string
    present?: boolean
  }
  const classId = String(body.classId ?? '').trim()
  const studentClerkId = String(body.studentClerkId ?? '').trim()
  const sessionDate = String(body.sessionDate ?? todayIstDate()).trim()
  const present = body.present !== false

  if (!classId || !studentClerkId) {
    helpers.json(res, 400, { error: 'classId and studentClerkId are required' })
    return
  }

  const access = await canMentorManageClass(supabase, classId, mentorId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can mark attendance' })
    return
  }

  const enrolled = await requireActiveEnrollment(supabase, studentClerkId, classId)
  if (!enrolled.ok) {
    helpers.json(res, 400, { error: 'Student is not enrolled in this class' })
    return
  }

  const { data: existing } = await supabase
    .from('class_attendance')
    .select('id')
    .eq('class_id', classId)
    .eq('clerk_id', studentClerkId)
    .eq('session_date', sessionDate)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('class_attendance')
      .update({
        present,
        source: 'mentor',
        marked_by_clerk_id: mentorId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (error) {
      if (isMissingTable(error)) {
        helpers.json(res, 503, { error: MISSING_SQL })
        return
      }
      helpers.json(res, 500, { error: error.message || 'Could not update attendance' })
      return
    }
  } else {
    const { error } = await supabase.from('class_attendance').insert({
      class_id: classId,
      clerk_id: studentClerkId,
      session_date: sessionDate,
      present,
      source: 'mentor',
      marked_by_clerk_id: mentorId,
    })
    if (error) {
      if (isMissingTable(error)) {
        helpers.json(res, 503, { error: MISSING_SQL })
        return
      }
      helpers.json(res, 500, { error: error.message || 'Could not save attendance' })
      return
    }
  }

  let progress
  try {
    progress = await recalculateEnrollmentProgress(supabase, studentClerkId, classId)
  } catch (err) {
    helpers.json(res, 500, {
      error: err instanceof Error ? err.message : 'Could not update progress',
    })
    return
  }

  helpers.json(res, 200, {
    ok: true,
    present,
    sessionDate,
    progress,
  })
}

export function tryHandleClassAttendanceApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/student/meet-session/start') {
    void handleStudentStart(req, res, env, helpers).catch((err) => {
      console.error('[attendance] start', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/student/meet-session/heartbeat') {
    void handleStudentHeartbeat(req, res, env, helpers).catch((err) => {
      console.error('[attendance] heartbeat', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/student/meet-session/active') {
    void handleStudentActive(req, res, env, helpers).catch((err) => {
      console.error('[attendance] active', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/student/attendance') {
    void handleStudentSummary(req, res, env, helpers).catch((err) => {
      console.error('[attendance] student summary', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/mentor/attendance') {
    if (req.method === 'GET') {
      void handleMentorRoster(req, res, env, helpers).catch((err) => {
        console.error('[attendance] mentor roster', err)
        helpers.json(res, 500, { error: 'Internal server error' })
      })
      return true
    }
    if (req.method === 'POST') {
      void handleMentorMark(req, res, env, helpers).catch((err) => {
        console.error('[attendance] mentor mark', err)
        helpers.json(res, 500, { error: 'Internal server error' })
      })
      return true
    }
  }
  return false
}
