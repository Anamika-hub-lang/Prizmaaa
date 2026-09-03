'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Check, RefreshCw, UserX, Users } from 'lucide-react'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { useMentorContent } from '../../context/MentorContentContext'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import {
  fetchMentorAttendanceRoster,
  markMentorAttendance,
  type MentorAttendanceStudent,
} from '../../lib/classAttendanceApi'

function todayIstInputValue(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function MentorAttendancePage() {
  const { getToken } = useAuth()
  const { myPublishedClasses, loading: classesLoading } = useMentorContent()
  const [classId, setClassId] = useState('')
  const [sessionDate, setSessionDate] = useState(todayIstInputValue)
  const [students, setStudents] = useState<MentorAttendanceStudent[]>([])
  const [classTitle, setClassTitle] = useState('')
  const [totalSessions, setTotalSessions] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!classId && myPublishedClasses.length > 0) {
      setClassId(myPublishedClasses[0]!.id)
    }
  }, [classId, myPublishedClasses])

  const load = useCallback(async () => {
    if (!classId) {
      setStudents([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMentorAttendanceRoster(getToken, classId, sessionDate)
      setStudents(data.students)
      setClassTitle(data.classTitle)
      setTotalSessions(data.totalSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load attendance')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [classId, sessionDate, getToken])

  useEffect(() => {
    void load()
  }, [load])

  const presentCount = useMemo(
    () => students.filter((s) => s.todayPresent === true).length,
    [students],
  )

  async function mark(student: MentorAttendanceStudent, present: boolean) {
    setBusyId(student.clerkId)
    setError(null)
    try {
      const result = await markMentorAttendance(getToken, {
        classId,
        studentClerkId: student.clerkId,
        sessionDate,
        present,
      })
      setStudents((prev) =>
        prev.map((row) =>
          row.clerkId === student.clerkId
            ? {
                ...row,
                todayPresent: present,
                todaySource: 'mentor',
                progress: result.progress?.progress ?? row.progress,
                status: result.progress?.completed ? 'completed' : row.status,
              }
            : row,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark attendance')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <MentorPageHeader
        title="Attendance"
        subtitle="Mark who attended today’s live class. Students who stay on Meet for 40 minutes also get auto-credit — progress fills toward their certificate."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3`}>
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Class
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm text-[#1d1d1d] bg-white outline-none"
            >
              {myPublishedClasses.length === 0 ? (
                <option value="">No published classes</option>
              ) : (
                myPublishedClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="sm:w-44 text-xs font-semibold text-gray-500">
            Session date
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm text-[#1d1d1d] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="sm:self-end inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-semibold text-gray-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {classId ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1d1d1d]">
              <Users className="w-4 h-4 text-educture-orange" />
              {classTitle || 'Class'}
            </span>
            <span>
              Present today: {presentCount}/{students.length}
            </span>
            <span>Track length: {totalSessions} sessions → certificate at 100%</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {(classesLoading || loading) && (
          <p className="text-sm text-gray-500">Loading students…</p>
        )}

        {!loading && !classesLoading && classId && students.length === 0 && (
          <div className={`${dashboardCardBorder} border-dashed border-orange-200 rounded-2xl bg-white p-8 text-center text-sm text-gray-500`}>
            No enrolled students in this class yet.
          </div>
        )}

        <div className="space-y-3">
          {students.map((student) => {
            const present = student.todayPresent === true
            const absent = student.todayPresent === false
            const busy = busyId === student.clerkId
            return (
              <article
                key={student.clerkId}
                className={`${dashboardCardBorder} border-orange-100 rounded-2xl bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1d1d1d]">{student.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{student.email || student.clerkId}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Progress {student.progress}%
                    {student.status === 'completed' ? ' · Certificate unlocked' : ''}
                    {student.todaySource ? ` · marked via ${student.todaySource === 'meet_timer' ? 'Meet timer' : 'mentor'}` : ''}
                  </p>
                  <div className="mt-2 h-1.5 max-w-xs rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-educture-orange rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || present}
                    onClick={() => void mark(student, true)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold border ${
                      present
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-orange-100 text-gray-700 hover:border-emerald-200 hover:text-emerald-800'
                    } disabled:opacity-50`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Present
                  </button>
                  <button
                    type="button"
                    disabled={busy || absent}
                    onClick={() => void mark(student, false)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold border ${
                      absent
                        ? 'border-rose-200 bg-rose-50 text-rose-800'
                        : 'border-orange-100 text-gray-700 hover:border-rose-200 hover:text-rose-800'
                    } disabled:opacity-50`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Absent
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
