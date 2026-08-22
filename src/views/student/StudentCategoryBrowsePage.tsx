import { Link, useParams } from 'react-router-dom'
import type { ClassCategoryId } from '../../data/classCatalog'
import { useMentorContent } from '../../context/MentorContentContext'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { ClassCategoryFilters } from '../../components/student/ClassCategoryFilters'
import { PaidClassCard } from '../../components/student/ClassCards'

const validIds: ClassCategoryId[] = ['skills', 'academic', 'professional']

function isCategoryId(id: string): id is ClassCategoryId {
  return validIds.includes(id as ClassCategoryId)
}

export function StudentCategoryBrowsePage() {
  const { categoryId } = useParams()
  const { categories, getClassesByCategory } = useMentorContent()
  const category = categoryId ? categories.find((c) => c.id === categoryId) : undefined

  if (!categoryId || !isCategoryId(categoryId) || !category) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 text-sm">Category not found.</p>
        <Link to="/student/browse" className="text-educture-orange font-semibold mt-2 inline-block text-sm">
          Back to browse
        </Link>
      </div>
    )
  }

  const classes = getClassesByCategory(categoryId)

  return (
    <div className="space-y-5">
      <StudentPageHeader title={category.title} />
      <ClassCategoryFilters active={categoryId} />

      {classes.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">No classes in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {classes.map((c) => (
            <PaidClassCard key={c.id} class={c} size="large" />
          ))}
        </div>
      )}
    </div>
  )
}
