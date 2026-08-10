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
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 text-sm">Category not found.</p>
        <Link to="/student/browse" className="text-educture-orange font-semibold mt-2 inline-block text-sm">
          Back to categories
        </Link>
      </div>
    )
  }

  const classes = getClassesByCategory(categoryId)
  const planPrices = formatCategoryPlanPrices(categoryId)

  return (
    <>
      <StudentPageHeader title={category.title} subtitle={category.description} />
      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-5 sm:py-8">
        <Link
          to="/student/browse"
          className="inline-flex items-center text-xs sm:text-sm font-medium text-educture-orange hover:underline mb-4 sm:mb-6"
        >
          ← All categories
        </Link>

        <p className="text-[11px] sm:text-xs text-gray-500 mb-5 sm:mb-8 leading-relaxed break-words border-l-2 border-educture-orange/40 pl-3">
          <span className="font-semibold text-gray-600">Plans: </span>
          {planPrices}
        </p>

        {classes.length === 0 ? (
          <p className="text-center text-xs sm:text-sm text-gray-500 py-10 sm:py-12 px-2">
            No classes in this category yet. Your mentor will add them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {classes.map((c) => (
              <PaidClassCard key={c.id} class={c} size="large" />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
