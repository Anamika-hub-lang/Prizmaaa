import { Link, useParams } from 'react-router-dom'
import { formatCategoryPlanPrices, type ClassCategoryId } from '../../data/classCatalog'
import { useMentorContent } from '../../context/MentorContentContext'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
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
      <div className="p-8 text-center">
        <p className="text-gray-500">Category not found.</p>
        <Link to="/student/browse" className="text-educture-orange font-semibold mt-2 inline-block">
          Back to categories
        </Link>
      </div>
    )
  }

  const classes = getClassesByCategory(categoryId)

  return (
    <>
      <StudentPageHeader
        title={category.title}
        subtitle={`${category.description} · Plans: ${formatCategoryPlanPrices(categoryId)}`}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/student/browse"
          className="inline-flex items-center text-sm font-medium text-educture-orange hover:underline mb-8"
        >
          ← All categories
        </Link>

        {classes.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">
            No classes in this category yet. Your mentor will add them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {classes.map((c) => (
              <PaidClassCard key={c.id} class={c} size="large" />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
