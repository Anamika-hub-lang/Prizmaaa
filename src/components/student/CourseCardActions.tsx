import { Pencil } from 'lucide-react'
import type { EnrolledCourse } from './MyCourseCard'

function canCancelClass(course: EnrolledCourse): boolean {
  return (
    course.type === 'online' &&
    course.status === 'ongoing' &&
    (course.billingStatus === 'trial' || course.billingStatus === 'active')
  )
}

export function CourseCardActions({
  course,
  onEdit,
  onCancelClass,
}: {
  course: EnrolledCourse
  onEdit: () => void
  onCancelClass?: () => void
}) {
  const showCancel = canCancelClass(course) && onCancelClass

  function handleCancel() {
    if (!onCancelClass) return
    const ok = window.confirm(
      'Cancel this class? Your plan stops and you can choose a different plan later from checkout.',
    )
    if (ok) onCancelClass()
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-orange-100 text-xs font-semibold text-gray-700 hover:border-educture-orange hover:text-educture-orange"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {showCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-red-100 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Cancel class
        </button>
      )}
    </div>
  )
}
