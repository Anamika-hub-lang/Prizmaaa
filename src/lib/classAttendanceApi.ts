export type MeetSessionState = {
  id: string
  classId: string
  classTitle?: string
  meetLink?: string
  sessionDate: string
  accumulatedSeconds: number
  requiredSeconds: number
  completed: boolean
}

export type AttendanceProgress = {
  progress: number
  attended: number
  totalSessions: number
  completed: boolean
}

export type MentorAttendanceStudent = {
  clerkId: string
  enrollmentId: string
  fullName: string
  email: string
  progress: number
  status: string
  planTier: string | null
  todayPresent: boolean | null
  todaySource: string | null
}

async function authFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    if (!res.ok) throw new Error(text.slice(0, 120) || `API error (${res.status})`)
  }
  if (!res.ok) throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  return data
}

function parseSession(raw: unknown): MeetSessionState | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (!s.id || !s.classId) return null
  return {
    id: String(s.id),
    classId: String(s.classId),
    classTitle: s.classTitle ? String(s.classTitle) : undefined,
    meetLink: s.meetLink ? String(s.meetLink) : undefined,
    sessionDate: String(s.sessionDate ?? ''),
    accumulatedSeconds: Number(s.accumulatedSeconds ?? 0),
    requiredSeconds: Number(s.requiredSeconds ?? 2400),
    completed: Boolean(s.completed),
  }
}

function parseProgress(raw: unknown): AttendanceProgress | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  return {
    progress: Number(p.progress ?? 0),
    attended: Number(p.attended ?? 0),
    totalSessions: Number(p.totalSessions ?? 20),
    completed: Boolean(p.completed),
  }
}

export async function startMeetSession(
  getToken: () => Promise<string | null>,
  classId: string,
): Promise<{
  alreadyCredited: boolean
  session: MeetSessionState | null
  progress: AttendanceProgress | null
  meetLink?: string
  classTitle?: string
  message?: string
}> {
  const data = await authFetch('/api/student/meet-session/start', getToken, {
    method: 'POST',
    body: JSON.stringify({ classId }),
  })
  return {
    alreadyCredited: Boolean(data.alreadyCredited),
    session: parseSession(data.session),
    progress: parseProgress(data.progress),
    meetLink: data.meetLink ? String(data.meetLink) : undefined,
    classTitle: data.classTitle ? String(data.classTitle) : undefined,
    message: data.message ? String(data.message) : undefined,
  }
}

export async function heartbeatMeetSession(
  getToken: () => Promise<string | null>,
  sessionId: string,
): Promise<{
  session: MeetSessionState | null
  attendanceCredited: boolean
  progress: AttendanceProgress | null
}> {
  const data = await authFetch('/api/student/meet-session/heartbeat', getToken, {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
  return {
    session: parseSession(data.session),
    attendanceCredited: Boolean(data.attendanceCredited),
    progress: parseProgress(data.progress),
  }
}

export async function fetchActiveMeetSession(
  getToken: () => Promise<string | null>,
): Promise<MeetSessionState | null> {
  const data = await authFetch('/api/student/meet-session/active', getToken)
  return parseSession(data.session)
}

export async function fetchMentorAttendanceRoster(
  getToken: () => Promise<string | null>,
  classId: string,
  sessionDate?: string,
): Promise<{
  classId: string
  classTitle: string
  sessionDate: string
  totalSessions: number
  students: MentorAttendanceStudent[]
}> {
  const qs = new URLSearchParams({ classId })
  if (sessionDate) qs.set('sessionDate', sessionDate)
  const data = await authFetch(`/api/mentor/attendance?${qs.toString()}`, getToken)
  return {
    classId: String(data.classId ?? classId),
    classTitle: String(data.classTitle ?? 'Class'),
    sessionDate: String(data.sessionDate ?? ''),
    totalSessions: Number(data.totalSessions ?? 20),
    students: Array.isArray(data.students)
      ? (data.students as MentorAttendanceStudent[])
      : [],
  }
}

export async function markMentorAttendance(
  getToken: () => Promise<string | null>,
  input: {
    classId: string
    studentClerkId: string
    sessionDate?: string
    present: boolean
  },
): Promise<{ progress: AttendanceProgress | null }> {
  const data = await authFetch('/api/mentor/attendance', getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return { progress: parseProgress(data.progress) }
}

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
