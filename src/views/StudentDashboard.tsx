import { Link, useSearchParams } from 'react-router-dom'
import { Video, Clock, ClipboardList } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { AppButton } from '../components/ui/AppButton'
import { MyCourseCard, type EnrolledCourse } from '../components/student/MyCourseCard'
import { computeDashboardStats } from '../data/studentDashboard'
import { StudentOverviewCompact } from '../components/student/StudentOverview'
import { useMentorContent } from '../context/MentorContentContext'
import { tintedSurface } from '../components/ui/dashboardCardStyles'
import { useStudentEnrollments } from '../hooks/useStudentEnrollments'
import { useStudentCounsellingBookings } from '../hooks/useStudentCounsellingBookings'
import { CounsellingBookingsPanel } from '../components/student/CounsellingBookingsPanel'
import { enrollmentToEnrolledCourse, daysSinceFirstEnrollment } from '../lib/enrolledCourses'
import { isActiveClassEnrollment } from '../lib/classEnrollmentPolicy'
import { useLiveMeetSession } from '../components/student/LiveMeetSession'

export function StudentDashboard() {
  const [searchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('all')
  const { assignments, classes, freeCourses } = useMentorContent()
  const { enrollments, refresh } = useStudentEnrollments()
  const { joinMeet, startingClassId } = useLiveMeetSession()
  const {
    bookings: counsellingBookings,
    loading: counsellingLoading,
    error: counsellingError,
    refresh: refreshCounselling,
  } = useStudentCounsellingBookings()
  const counsellingBooked = searchParams.get('counselling') === 'booked'

  useEffect(() => {
    if (searchParams.get('enrolled') === '1') {
      void refresh()
    }
    if (counsellingBooked) {
      void refreshCounselling()
    }
  }, [searchParams, refresh, counsellingBooked, refreshCounselling])

  const visibleEnrollments = useMemo(
    () => enrollments.filter(isActiveClassEnrollment),
    [enrollments],
  )

  const myCourses = useMemo(() => {
    const list: EnrolledCourse[] = []
    for (const en of visibleEnrollments) {
      const classItem = en.classId ? classes.find((c) => c.id === en.classId) : undefined
      const freeItem = en.freeCourseId
        ? freeCourses.find((f) => f.id === en.freeCourseId)
        : undefined
      const course = enrollmentToEnrolledCourse(en, classItem, freeItem)
      if (course) list.push(course)
    }
    return list
  }, [visibleEnrollments, classes, freeCourses])

  const learningDays = daysSinceFirstEnrollment(visibleEnrollments)
  const dashboard = useMemo(
    () => computeDashboardStats(myCourses, assignments, learningDays),
    [myCourses, assignments, learningDays],
  )

  const meetForCourse = (courseId: string) => classes.find((c) => c.id === courseId)?.meetLink

  const filters = [
    { id: 'all', label: 'All', badge: myCourses.length },
    { id: 'ongoing', label: 'Ongoing', badge: dashboard.inProgress },
    { id: 'completed', label: 'Done', badge: dashboard.completed },
  ]

  const filtered =
    activeFilter === 'all' ? myCourses : myCourses.filter((c) => c.status === activeFilter)

  const nextLive = myCourses.find((c) => c.status === 'ongoing' && c.type === 'online' && c.nextSession)

  const hasCounselling =
    counsellingBooked || counsellingBookings.length > 0 || counsellingLoading || counsellingError

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
        <AppButton to="/student/browse" size="sm">
          Browse classes
        </AppButton>
      </div>

      <StudentOverviewCompact stats={dashboard} />

      {nextLive && (
        <div className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-educture-orange uppercase tracking-wide">Next live class</p>
            <p className="font-semibold text-gray-900 mt-1 truncate">{nextLive.title}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 shrink-0" />
              {nextLive.nextSession}
            </p>
          </div>
          <button
            type="button"
            disabled={startingClassId === nextLive.id}
            onClick={() =>
              void joinMeet({
                classId: nextLive.id,
                meetLink: meetForCourse(nextLive.id),
                classTitle: nextLive.title,
              })
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold hover:bg-educture-orange-dark transition-colors shrink-0 disabled:opacity-60"
          >
            <Video className="w-4 h-4" />
            {startingClassId === nextLive.id ? 'Starting…' : 'Join Meet'}
          </button>
        </div>
      )}

      {dashboard.assignmentsDue > 0 && (
        <Link
          to="/student/assignments"
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm hover:border-educture-orange/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <ClipboardList className="w-4 h-4 text-educture-orange" />
            {dashboard.assignmentsDue} assignment{dashboard.assignmentsDue === 1 ? '' : 's'} due
          </span>
          <span className="text-educture-orange font-medium">View</span>
        </Link>
      )}

      {hasCounselling && (
        <CounsellingBookingsPanel
          bookings={counsellingBookings}
          loading={counsellingLoading}
          error={counsellingError}
          showSuccess={counsellingBooked}
        />
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">My classes</h2>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeFilter === f.id
                    ? 'border-educture-orange text-educture-orange bg-educture-orange/5'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}
              >
                {f.label}
                {f.badge > 0 && <span className="text-[10px] opacity-70">({f.badge})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`${tintedSurface(4)} border-dashed p-8 text-center`}>
              <p className="text-gray-500 text-sm">No classes yet.</p>
              <AppButton to="/student/browse" className="mt-4" size="sm">
                Browse classes
              </AppButton>
            </div>
          ) : (
            filtered.map((c) => (
              <MyCourseCard key={c.enrollmentId} course={c} meetLink={meetForCourse(c.id)} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
