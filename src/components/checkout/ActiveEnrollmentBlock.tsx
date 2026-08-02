import { Link } from 'react-router-dom'
import type { StudentEnrollment } from '../../types/enrollment'
import { enrollmentBlockedMessage } from '../../lib/classEnrollmentPolicy'

export function ActiveEnrollmentBlock({ enrollment }: { enrollment: StudentEnrollment }) {
  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-left text-sm text-amber-950">
      <p className="font-bold">Plan change not available</p>
      <p className="mt-2 leading-relaxed">{enrollmentBlockedMessage(enrollment)}</p>
      <Link
        to="/student"
        className="inline-flex mt-4 px-5 py-2.5 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark"
      >
        Go to dashboard to cancel
      </Link>
    </div>
  )
}
