import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Calendar, Clock, Video, Users } from 'lucide-react'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import { ActiveEnrollmentBlock } from '../../components/checkout/ActiveEnrollmentBlock'
import { MentorAvatar } from '../../components/ui/MentorAvatar'
import { getCategoryById } from '../../data/classCatalog'

function hasRealMeetLink(link?: string) {
  const href = link?.trim() ?? ''
  return href.startsWith('https://meet.google.com/') && href.length > 'https://meet.google.com/'.length
}

function hasSessionTime(label?: string) {
  const text = label?.trim() ?? ''
  return text.length > 0 && text !== 'Set in Meet tab'
}

export function StudentClassDetailPage() {
  const { classId } = useParams()
  const { getClassById } = useMentorContent()
  const { enrollments } = useStudentEnrollments()
  const item = classId ? getClassById(classId) : undefined
  const activeEnrollment = classId ? getActiveEnrollmentForClass(enrollments, classId) : undefined

  if (!item) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Class not found.</p>
        <AppButton to="/student/browse" className="mt-4">
          Back to browse
        </AppButton>
      </div>
    )
  }

  const category = getCategoryById(item.categoryId)
  const nextSession = hasSessionTime(item.nextSessionLabel) ? item.nextSessionLabel : 'Schedule coming soon'
  const meetHref = item.meetLink?.trim() || 'https://meet.google.com/'
  const canJoin = Boolean(activeEnrollment) && hasRealMeetLink(item.meetLink)

  return (
    <div className="text-left space-y-6">
      <StudentPageHeader title={item.title} backTo="/student/browse" backLabel="Back to classes" />

      <section className="rounded-2xl border border-orange-100 bg-[#fff8f3] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-educture-orange">
          {activeEnrollment ? 'Your next class' : 'Class opening'}
        </p>
        <h2 className="mt-2 text-lg sm:text-xl font-semibold text-gray-900">
          {activeEnrollment ? 'Join the live session on Google Meet' : 'Live sessions with your mentor'}
        </h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {activeEnrollment
            ? 'Open Meet at the scheduled time. Camera is optional — chat stays open for questions.'
            : 'Enroll to get your mentor, session schedule, and the Google Meet link for every live class.'}
        </p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/80 border border-orange-100 px-4 py-3">
            <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-educture-orange" />
              Next session
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{nextSession}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-orange-100 px-4 py-3">
            <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-educture-orange" />
              Duration
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{item.duration}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-orange-100 px-4 py-3">
            <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-educture-orange" />
              Sessions
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{item.sessions}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <MentorAvatar src={item.mentorImage} name={item.mentor} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 flex items-center gap-1 truncate">
              {item.mentor}
              <BadgeCheck className="w-4 h-4 text-educture-orange shrink-0" />
            </p>
            <p className="text-xs text-gray-500">{category?.title ?? 'Mentor'}</p>
          </div>
        </div>
        <span className="hidden sm:block w-px h-8 bg-gray-200" />
        <p className="text-sm text-gray-600 inline-flex items-center gap-2">
          <Video className="w-4 h-4 text-educture-orange shrink-0" />
          Google Meet live
        </p>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
      )}

      {activeEnrollment ? (
        <div className="space-y-4">
          {canJoin ? (
            <a
              href={meetHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-educture-orange text-white text-sm font-semibold hover:bg-educture-orange-dark"
            >
              <Video className="w-4 h-4" />
              Open class on Meet
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              Your mentor will share the Meet link before the first session.
            </p>
          )}
          <ActiveEnrollmentBlock enrollment={activeEnrollment} />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <AppButton to={`/student/checkout/${item.id}`} size="lg">
            Enroll now
          </AppButton>
          <Link to="/student/browse" className="text-sm text-gray-500 hover:text-educture-orange">
            Browse more classes
          </Link>
        </div>
      )}
    </div>
  )
}
