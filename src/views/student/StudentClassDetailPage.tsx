import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Video, Users } from 'lucide-react'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { AppButton } from '../../components/ui/AppButton'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'
import { getActiveEnrollmentForClass } from '../../lib/classEnrollmentPolicy'
import { ActiveEnrollmentBlock } from '../../components/checkout/ActiveEnrollmentBlock'
import { MentorAvatar } from '../../components/ui/MentorAvatar'

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

  return (
    <div className="text-left space-y-6">
      <StudentPageHeader title={item.title} backTo="/student/browse" backLabel="Back to classes" />

      <img
        src={item.image}
        alt=""
        className="w-full rounded-2xl object-cover aspect-[16/9] bg-gray-100"
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <MentorAvatar src={item.mentorImage} name={item.mentor} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 flex items-center gap-1 truncate">
              {item.mentor}
              <BadgeCheck className="w-4 h-4 text-educture-orange shrink-0" />
            </p>
            <p className="text-xs text-gray-500">Mentor</p>
          </div>
        </div>
        <span className="hidden sm:block w-px h-8 bg-gray-200" />
        <p className="text-sm text-gray-600 inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-educture-orange shrink-0" />
          {item.sessions}
        </p>
        <p className="text-sm text-gray-600 inline-flex items-center gap-2">
          <Video className="w-4 h-4 text-educture-orange shrink-0" />
          Google Meet
        </p>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
      )}

      {activeEnrollment ? (
        <ActiveEnrollmentBlock enrollment={activeEnrollment} />
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
