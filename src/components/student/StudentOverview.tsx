import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import type { MentorAssignment } from '../../types/mentorContent'
import {
  CheckCircle2,
  ClipboardList,
  Video,
  TrendingUp,
  BookOpen,
  Flame,
} from 'lucide-react'
import { dashboardCardBorder, dashboardTint } from '../ui/dashboardCardStyles'

type Stat = {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: boolean
  href?: string
}

export function StudentOverviewGrid({ stats }: {
  stats: ReturnType<typeof import('../../data/studentDashboard').computeDashboardStats>
}) {
  const items: Stat[] = [
    {
      label: 'Classes enrolled',
      value: stats.totalEnrolled,
      sub: `${stats.onlineClasses} online · ${stats.freeCoursesActive} free`,
      icon: BookOpen,
    },
    {
      label: 'Completed',
      value: stats.completed,
      sub: 'Certificates earned',
      icon: CheckCircle2,
      accent: true,
    },
    {
      label: 'In progress',
      value: stats.inProgress,
      sub: `${stats.avgProgress}% avg progress`,
      icon: TrendingUp,
    },
    {
      label: 'Assignments due',
      value: stats.assignmentsDue,
      sub: `${stats.assignmentsDone} submitted`,
      icon: ClipboardList,
      href: '/student/assignments',
    },
    {
      label: 'Live this week',
      value: stats.liveSessionsThisWeek,
      sub: 'Google Meet sessions',
      icon: Video,
    },
    {
      label: 'Days learning',
      value: stats.learningStreakDays === 0 ? '—' : `${stats.learningStreakDays} days`,
      sub: stats.learningStreakDays > 0 ? 'Since first enrollment' : 'Enroll to start',
      icon: Flame,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {items.map((item, index) => {
        const tint = dashboardTint(index)
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <item.icon
                className={`w-5 h-5 shrink-0 ${item.accent ? 'text-educture-orange' : 'text-gray-400'}`}
              />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1d1d1d] mt-3 leading-none">{item.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-2">{item.label}</p>
            {item.sub && <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{item.sub}</p>}
          </>
        )

        if (item.href) {
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`${dashboardCardBorder} ${tint.bg} ${tint.border} p-4 text-left card-lift hover:border-educture-orange/50 transition-colors`}
            >
              {inner}
            </Link>
          )
        }

        return (
          <div
            key={item.label}
            className={`${dashboardCardBorder} ${tint.bg} ${tint.border} p-4 text-left`}
          >
            {inner}
          </div>
        )
      })}
    </div>
  )
}

export function AssignmentsDuePanel({
  assignments,
  max = 3,
}: {
  assignments: MentorAssignment[]
  max?: number
}) {
  const due = assignments.filter((a) => a.status === 'pending').slice(0, max)
  const submitted = assignments.filter((a) => a.status === 'submitted')
  const tint = dashboardTint(3)

  return (
    <div className={`${dashboardCardBorder} ${tint.bg} ${tint.border} p-5 text-left`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-bold text-[#1d1d1d]">Assignments</h2>
        <Link to="/student/assignments" className="text-xs font-semibold text-educture-orange hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-2 mb-4">
        <Link
          to="/student/assignments"
          className="text-xs font-semibold px-3 py-1 rounded-full border-2 border-orange-200 bg-white/80 text-gray-700"
        >
          Due ({due.length})
        </Link>
        <Link
          to="/student/assignments?tab=submitted"
          className="text-xs font-semibold px-3 py-1 rounded-full border-2 border-emerald-200 bg-emerald-50/90 text-emerald-800"
        >
          Submitted ({submitted.length})
        </Link>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">Due soon</p>
      {due.length === 0 ? (
        <p className="text-sm text-gray-500">No pending assignments. Great work!</p>
      ) : (
        <ul className="space-y-3">
          {due.map((a) => (
            <li key={a.id} className="flex gap-3 items-center">
              <img src={a.img} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1d1d1d] truncate">{a.title}</p>
                <p className="text-xs text-educture-orange">{a.course}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Due {a.due}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {submitted.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mt-5 mb-2">Recently submitted</p>
          <ul className="space-y-2">
            {submitted.slice(0, 2).map((a) => (
              <li key={a.id} className="flex gap-2 items-center text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate font-medium text-[#1d1d1d]">{a.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export function ProgressSummaryBar({
  completed,
  inProgress,
  avgProgress,
}: {
  completed: number
  inProgress: number
  avgProgress: number
}) {
  const total = completed + inProgress
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const tint = dashboardTint(4)

  return (
    <div className={`${dashboardCardBorder} ${tint.bg} ${tint.border} p-5 text-left`}>
      <h2 className="font-bold text-[#1d1d1d] mb-4">Learning snapshot</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall course progress</span>
            <span className="font-bold text-[#1d1d1d]">{avgProgress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-educture-orange rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Classes finished vs active</span>
            <span className="font-bold text-[#1d1d1d]">
              {completed} done · {inProgress} active
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500" style={{ width: `${completedPct}%` }} />
            <div className="h-full bg-educture-orange/60 flex-1" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t-2 border-white/80">
        <div className="text-center p-3 rounded-xl bg-white/70 border-2 border-orange-200">
          <p className="text-lg font-bold text-educture-orange">{completed}</p>
          <p className="text-[10px] text-gray-600 font-medium">Classes completed</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/70 border-2 border-sky-200">
          <p className="text-lg font-bold text-[#1d1d1d]">{inProgress}</p>
          <p className="text-[10px] text-gray-600 font-medium">Still learning</p>
        </div>
      </div>
    </div>
  )
}
