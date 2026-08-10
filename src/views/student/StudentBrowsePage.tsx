import { classCategories, formatBrowsePricingSummary } from '../../data/classCatalog'
import { StudentPageHeader } from '../../components/layout/StudentLayout'
import { CategoryBrowseCard } from '../../components/student/ClassCards'

export function StudentBrowsePage() {
  const pricingLine = formatBrowsePricingSummary()

  return (
    <>
      <StudentPageHeader
        title="Browse online classes"
        subtitle={`Official plan prices: ${pricingLine}. Choose Starter trial, monthly Growth, or 3-month Premium at checkout.`}
      />
      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {classCategories.map((cat) => (
            <CategoryBrowseCard
              key={cat.id}
              id={cat.id}
              title={cat.title}
              description={cat.description}
              image={cat.image}
            />
          ))}
        </div>
        <p className="text-center text-[11px] sm:text-sm text-gray-400 mt-8 sm:mt-10 px-2 leading-relaxed break-words">
          {pricingLine} · Live classes on Google Meet · Plans at checkout (not per-class one-time fees)
        </p>
      </main>
    </>
  )
}
