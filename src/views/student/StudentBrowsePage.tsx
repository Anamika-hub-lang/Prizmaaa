import { useMentorContent } from '../../context/MentorContentContext'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { ClassCategoryFilters } from '../../components/student/ClassCategoryFilters'
import { PaidClassCard } from '../../components/student/ClassCards'

export function StudentBrowsePage() {
  const { publishedClasses } = useMentorContent()

  return (
    <div className="space-y-5">
      <StudentPageHeader title="Browse classes" />
      <ClassCategoryFilters active="all" />

      {publishedClasses.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">No classes available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {publishedClasses.map((c) => (
            <PaidClassCard key={c.id} class={c} size="large" />
          ))}
        </div>
      )}
    </div>
  )
}
