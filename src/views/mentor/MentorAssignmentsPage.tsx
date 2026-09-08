'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight, Clock, Plus } from 'lucide-react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { EmptyState, StatusBadge } from '../../components/ui/StatusBadge'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'
import { AssignmentFormModal } from '../../components/mentor/AssignmentFormModal'
import { formatSessionLabel } from '../../lib/sessionSchedule'
import type { MentorAssignment } from '../../types/mentorContent'

type MentorTab = 'all' | 'ongoing' | 'expired'

function isExpired(assignment: MentorAssignment): boolean {
  const parsed = Date.parse(assignment.due)
  if (Number.isNaN(parsed)) return false
  return parsed < Date.now()
}

export function MentorAssignmentsPage() {
  const { myAssignments, loading, syncError } = useMentorContent()
  const [tab, setTab] = useState<MentorTab>('all')
  const [creating, setCreating] = useState(false)

  const { ongoing, expired } = useMemo(() => {
    const ongoingList: MentorAssignment[] = []
    const expiredList: MentorAssignment[] = []
    for (const assignment of myAssignments) {
      if (isExpired(assignment)) expiredList.push(assignment)
      else ongoingList.push(assignment)
    }
    return { ongoing: ongoingList, expired: expiredList }
  }, [myAssignments])

  const visible = tab === 'all' ? myAssignments : tab === 'ongoing' ? ongoing : expired

  const tabs: { id: MentorTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: myAssignments.length },
    { id: 'expired', label: 'Expired', count: expired.length },
    { id: 'ongoing', label: 'Ongoing', count: ongoing.length },
  ]

  return (
    <>
      <MentorPageHeader
        title="Assignments"
        subtitle="Open an assignment to see analysis and review each student's work."
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-left">
        {syncError && <p className="text-sm text-red-600 mb-4">{syncError}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const tint = dashboardTint(t.id === 'ongoing' ? 2 : t.id === 'expired' ? 4 : 1)
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${dashboardCardBorder} ${
                    active
                      ? `${tint.bg} ${tint.border} text-[#1d1d1d]`
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {t.label}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 border-2 border-white font-bold">
                    {t.count}
                  </span>
                </button>
              )
            })}
          </div>
          <AppButton onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" />
            New assignment
          </AppButton>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 py-8 text-center">Loading assignments…</p>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No assignments in this view"
            description={
              myAssignments.length === 0
                ? 'Publish your first brief and enrolled students get notified right away.'
                : 'Switch tabs to see your other assignments.'
            }
            action={
              myAssignments.length === 0 ? (
                <AppButton onClick={() => setCreating(true)}>
                  <Plus className="w-4 h-4" />
                  New assignment
                </AppButton>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((a, i) => {
              const tint = dashboardTint(i + 1)
              const past = isExpired(a)
              return (
                <li key={a.id}>
                  <Link
                    to={`/teacher/assignments/${a.id}`}
                    className={`flex gap-4 items-center ${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow`}
                  >
                    {a.img ? (
                      <img
                        src={a.img}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover hidden sm:block border-2 border-white"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{a.title}</p>
                        {past ? (
                          <StatusBadge label="Expired" tone="completed" />
                        ) : (
                          <StatusBadge label="Ongoing" tone="approved" />
                        )}
                      </div>
                      <p className="text-sm text-educture-orange">{a.course}</p>
                      <p className="text-xs text-gray-600 mt-1 inline-flex items-center gap-1.5">
                        {past ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <CalendarClock className="w-3.5 h-3.5" />
                        )}
                        {past ? 'Closed' : 'Due'} {formatSessionLabel(a.due)}
                      </p>
                      {a.description ? (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{a.description}</p>
                      ) : null}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      {creating && <AssignmentFormModal mode="create" onClose={() => setCreating(false)} />}
    </>
  )
}
