import { Link, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  Video,
  Gift,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { AppButton } from '../components/ui/AppButton'
import { MyCourseCard, type EnrolledCourse } from '../components/student/MyCourseCard'
import { computeDashboardStats } from '../data/studentDashboard'
import {
  StudentOverviewGrid,
  AssignmentsDuePanel,
  ProgressSummaryBar,
} from '../components/student/StudentOverview'
import { useMentorContent } from '../context/MentorContentContext'
import { dashboardCardBorder, dashboardTint, tintedSurface } from '../components/ui/dashboardCardStyles'
import { useStudentEnrollments } from '../hooks/useStudentEnrollments'
import { useStudentCounsellingBookings } from '../hooks/useStudentCounsellingBookings'
import { CounsellingBookingsPanel } from '../components/student/CounsellingBookingsPanel'
import { enrollmentToEnrolledCourse, daysSinceFirstEnrollment } from '../lib/enrolledCourses'
import { isActiveClassEnrollment } from '../lib/classEnrollmentPolicy'
import { counsellingGroups } from '../data/counsellingServices'

export function StudentDashboard() {
  const [searchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('all')
  const { assignments, classes, freeCourses } = useMentorContent()
  const { enrollments, cancelEnrollment, updateEnrollmentProgress, refresh } = useStudentEnrollments()
  const {
    bookings: counsellingBookings,
    loading: counsellingLoading,
    error: counsellingError,
    refresh: refreshCounselling,
  } = useStudentCounsellingBookings()
  const [editCourse, setEditCourse] = useState<EnrolledCourse | null>(null)
  const [editProgress, setEditProgress] = useState(0)

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
    { id: 'completed', label: 'Completed', badge: dashboard.completed },
    { id: 'draft', label: 'Draft', badge: dashboard.draft },
  ]

  const filtered =
    activeFilter === 'all' ? myCourses : myCourses.filter((c) => c.status === activeFilter)

  const nextLive = myCourses.find((c) => c.status === 'ongoing' && c.type === 'online' && c.nextSession)

  return (
    <div className="flex-1">
      <section className="bg-[#fff9f3] border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10 text-left">
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">Student dashboard</p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#1d1d1d] mt-2">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Track classes completed, assignments due, and upcoming Google Meet sessions — everything at a glance.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 text-left">Overview</h2>
          <StudentOverviewGrid stats={dashboard} />
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-left">
                Book counselling
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose a counselling type and continue to schedule + pay.
              </p>
            </div>
            <AppButton to="/counselling" className="shrink-0">
              View all
            </AppButton>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {counsellingGroups.map((group) => (
              <Link
                key={group.id}
                to={`/counselling/${group.id}`}
                className={`group ${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-4 card-lift`}
              >
                <p className="font-bold text-[#1d1d1d]">{group.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{group.subtitle}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-educture-orange">
                  Proceed <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <CounsellingBookingsPanel
          bookings={counsellingBookings}
          loading={counsellingLoading}
          error={counsellingError}
          showSuccess={counsellingBooked}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/student/browse"
                className={`group ${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-5 card-lift flex gap-4 items-center`}
              >
                <Video className="w-11 h-11 shrink-0 text-educture-orange" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1d1d1d]">Browse online classes</p>
                  <p className="text-sm text-gray-600 mt-0.5">Live classes · Google Meet</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 text-educture-orange group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/student/free"
                className={`group ${dashboardCardBorder} ${dashboardTint(1).bg} ${dashboardTint(1).border} rounded-2xl p-5 card-lift flex gap-4 items-center`}
              >
                <Gift className="w-11 h-11 text-educture-orange shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1d1d1d]">Free courses</p>
                  <p className="text-sm text-gray-500 mt-0.5">Self-paced · No payment</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 text-left">
                Your enrolled classes
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        activeFilter === f.id
                          ? 'border-educture-orange text-educture-orange bg-educture-orange/5 shadow-sm'
                          : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                      }`}
                    >
                      {f.label}
                      {f.badge > 0 && (
                        <span className="text-[10px] bg-educture-orange text-white px-1.5 py-0.5 rounded-full font-bold">
                          {f.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <button type="button" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                  Sort: Last active <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className={`${tintedSurface(4)} border-dashed p-10 text-center`}>
                    <p className="text-gray-500 text-sm">No enrolled courses yet. Browse and enroll to see them here.</p>
                    <AppButton to="/student/browse" className="mt-4">Browse classes</AppButton>
                  </div>
                ) : (
                  filtered.map((c) => (
                    <MyCourseCard
                      key={c.enrollmentId}
                      course={c}
                      meetLink={meetForCourse(c.id)}
                      onEdit={() => {
                        setEditCourse(c)
                        setEditProgress(c.progress)
                      }}
                      onCancelClass={
                        c.type === 'online' &&
                        c.status === 'ongoing' &&
                        (c.billingStatus === 'trial' || c.billingStatus === 'active')
                          ? () => void cancelEnrollment(c.enrollmentId)
                          : undefined
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <ProgressSummaryBar
              completed={dashboard.completed}
              inProgress={dashboard.inProgress}
              avgProgress={dashboard.avgProgress}
            />

            <AssignmentsDuePanel assignments={assignments} />

            {nextLive && (
              <div className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-6`}>
                <p className="text-xs font-bold uppercase tracking-wider text-educture-orange">Up next · Live</p>
                <p className="font-bold text-lg mt-2 leading-snug text-[#1d1d1d]">{nextLive.title}</p>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-educture-orange" />
                  {nextLive.nextSession}
                </p>
                <a
                  href={meetForCourse(nextLive.id) || 'https://meet.google.com/'}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-educture-orange text-white font-bold text-sm hover:bg-educture-orange-dark transition-colors border-2 border-orange-300"
                >
                  <Video className="w-4 h-4" />
                  Open Google Meet
                </a>
              </div>
            )}

            <div className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5 text-left`}>
              <p className="font-bold text-sm text-[#1d1d1d]">Enroll in another class</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {dashboard.assignmentsDue} assignments pending · {dashboard.liveSessionsThisWeek} live sessions this week
              </p>
              <AppButton to="/student/browse" size="sm" className="w-full justify-center mt-4">
                Browse classes
              </AppButton>
            </div>
          </aside>
        </div>
      </main>

      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl border-[3px] border-orange-100 p-6 max-w-sm w-full shadow-xl text-left">
            <h3 className="font-bold text-lg">Edit course</h3>
            <p className="text-sm text-gray-600 mt-1">{editCourse.title}</p>
            <label className="text-xs font-bold text-gray-500 uppercase mt-4 block">Progress %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={editProgress}
              onChange={(e) => setEditProgress(Number(e.target.value))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
            />
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold"
                onClick={() => setEditCourse(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold"
                onClick={() => {
                  void updateEnrollmentProgress(editCourse.enrollmentId, editProgress).then(() =>
                    setEditCourse(null),
                  )
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
