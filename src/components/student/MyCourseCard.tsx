import { Link } from 'react-router-dom'
import { tintedSurfaceKey } from '../ui/dashboardCardStyles'
import { Award, Calendar, Video, ExternalLink, PlayCircle } from 'lucide-react'
import { useLiveMeetSession } from './LiveMeetSession'

export type EnrolledCourse = {
  id: string
  enrollmentId: string
  image: string
  title: string
  mentor: string
  mentorImage: string
  progress: number
  status: 'ongoing' | 'completed' | 'draft'
  nextSession?: string
  category: string
  type: 'online' | 'free'
  billingStatus?: 'trial' | 'active' | 'cancelled' | null
  planTier?: string | null
  trialEndsAt?: string | null
  trialDaysLeft?: number | null
  paymentLabel?: string | null
}

export function MyCourseCard({
  course,
  meetLink,
}: {
  course: EnrolledCourse
  meetLink?: string
}) {
  const { joinMeet, startingClassId } = useLiveMeetSession()
  const statusLabel = {
    ongoing: 'In progress',
    completed: 'Completed',
    draft: 'Draft',
  }[course.status]

  const statusColor = {
    ongoing: 'bg-educture-orange/10 text-educture-orange',
    completed: 'bg-green-50 text-green-600',
    draft: 'bg-gray-100 text-gray-500',
  }[course.status]

  const joining = startingClassId === course.id

  return (
    <article className={`overflow-hidden card-lift flex flex-col sm:flex-row text-left ${tintedSurfaceKey(course.id)}`}>
      <div className="relative sm:w-44 md:w-52 shrink-0">
        <img
          src={course.image}
          alt=""
          className="w-full h-36 sm:h-full sm:min-h-[160px] object-cover"
        />
        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
          {statusLabel}
        </span>
        {course.type === 'online' && (
          <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            LIVE
          </span>
        )}
      </div>

      <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
        <p className="text-xs font-semibold text-educture-orange uppercase tracking-wide">{course.category}</p>
        {course.billingStatus === 'trial' && course.trialDaysLeft != null ? (
          <p className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-3 py-1 mt-2 inline-block">
            Free trial · {course.trialDaysLeft} day(s) left
          </p>
        ) : null}
        <h3 className="font-bold text-[#1d1d1d] text-base sm:text-lg leading-snug mt-1">{course.title}</h3>

        {(course.status === 'ongoing' || course.status === 'completed') && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-semibold text-[#1d1d1d]">{course.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-educture-orange rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            {course.status === 'completed' || course.progress >= 100 ? (
              <p className="mt-2 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Certificate unlocked
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-gray-500">
                Attend live Meet (~40 min) each session to fill progress.
              </p>
            )}
          </div>
        )}

        {course.nextSession && course.status === 'ongoing' && (
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-educture-orange" />
            Next: {course.nextSession}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3 sm:mt-auto pt-2">
          {course.status === 'ongoing' && course.type === 'online' && (
            <button
              type="button"
              disabled={joining}
              onClick={() =>
                void joinMeet({
                  classId: course.id,
                  meetLink,
                  classTitle: course.title,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-educture-orange text-white text-sm font-semibold hover:bg-educture-orange-dark transition-colors disabled:opacity-60"
            >
              <Video className="w-4 h-4" />
              {joining ? 'Starting…' : 'Join Google Meet'}
            </button>
          )}
          {course.status === 'ongoing' && course.type === 'free' && (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-educture-cream text-educture-orange text-sm font-semibold"
            >
              <PlayCircle className="w-4 h-4" />
              Continue learning
            </button>
          )}
          <Link
            to="/student/calendar"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-educture-orange hover:text-educture-orange transition-colors"
          >
            Calendar <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
