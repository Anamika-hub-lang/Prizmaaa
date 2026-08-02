import { useMemo } from 'react'
import { StudentPageHeader } from '../components/layout/StudentLayout'
import { tintedSurfaceKey } from '../components/ui/dashboardCardStyles'
import { useMentorContent } from '../context/MentorContentContext'
import { useStudentEnrollments } from '../hooks/useStudentEnrollments'

type CalendarEvent = {
  id: string
  day: string
  month: string
  title: string
  time: string
  type: string
}

export function StudentCalendarPage() {
  const { classes, assignments } = useMentorContent()
  const { enrollments } = useStudentEnrollments()

  const events = useMemo(() => {
    const list: CalendarEvent[] = []

    for (const en of enrollments) {
      if (en.kind !== 'online' || !en.classId) continue
      const cls = classes.find((c) => c.id === en.classId)
      if (!cls) continue
      const label = cls.nextSessionLabel?.trim()
      if (!label) continue
      list.push({
        id: `live-${en.id}`,
        day: '—',
        month: 'Live',
        title: cls.title,
        time: label,
        type: 'Google Meet',
      })
    }

    for (const a of assignments) {
      if (a.status !== 'pending') continue
      list.push({
        id: `asg-${a.id}`,
        day: '—',
        month: 'Due',
        title: a.title,
        time: a.due,
        type: a.course || 'Assignment',
      })
    }

    return list
  }, [enrollments, classes, assignments])

  return (
    <>
      <StudentPageHeader
        title="Calendar"
        subtitle="Live sessions from your enrolled classes and assignment due dates from your mentor."
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {events.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">
            Nothing scheduled yet. Enroll in a class or wait for your mentor to post assignments.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e.id}
                className={`p-4 flex gap-4 items-center text-left ${tintedSurfaceKey(e.id)}`}
              >
                <div className="text-center shrink-0 w-14">
                  <p className="text-xs text-gray-500 uppercase">{e.month}</p>
                  <p className="text-2xl font-bold text-educture-orange">{e.day}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{e.title}</p>
                  <p className="text-sm text-gray-600">{e.time}</p>
                </div>
                <span className="text-xs font-semibold bg-white/80 border-2 border-orange-200 text-educture-orange px-3 py-1 rounded-full">
                  {e.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
