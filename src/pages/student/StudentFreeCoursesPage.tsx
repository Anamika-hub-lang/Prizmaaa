import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { FreeCourseCard } from '../../components/student/ClassCards'
import { useMentorContent } from '../../context/MentorContentContext'
import { useStudentEnrollments } from '../../hooks/useStudentEnrollments'

export function StudentFreeCoursesPage() {
  const { freeCourses } = useMentorContent()
  const { enrollInFreeCourse } = useStudentEnrollments()

  return (
    <>
      <StudentPageHeader
        title="Free courses"
        subtitle="Learn at no cost — self-paced lessons with no payment. For live mentor classes, browse Online Classes (₹1,000 each)."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {freeCourses.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-12">No free courses yet — your mentor will add them soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {freeCourses.map((c) => (
              <FreeCourseCard
                key={c.id}
                course={c}
                onStart={() => void enrollInFreeCourse(c.id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
