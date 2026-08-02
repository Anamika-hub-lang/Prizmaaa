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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
        <p className="text-center text-sm text-gray-400 mt-10">
          {pricingLine} · Live classes on Google Meet · Plans at checkout (not per-class one-time fees)
        </p>
      </main>
    </>
  )
}
