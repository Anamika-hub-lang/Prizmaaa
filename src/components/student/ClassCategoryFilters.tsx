import { Link } from 'react-router-dom'
import type { ClassCategoryId } from '../../data/classCatalog'

export type ClassCategoryFilter = 'all' | ClassCategoryId

const filters: { id: ClassCategoryFilter; label: string; to: string }[] = [
  { id: 'all', label: 'All', to: '/student/browse' },
  { id: 'skills', label: 'Skills', to: '/student/browse/skills' },
  { id: 'academic', label: 'Academic', to: '/student/browse/academic' },
  { id: 'professional', label: 'Professional', to: '/student/browse/professional' },
]

export function ClassCategoryFilters({ active }: { active: ClassCategoryFilter }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Class categories">
      {filters.map((f) => {
        const isActive = f.id === active
        return (
          <Link
            key={f.id}
            to={f.to}
            role="tab"
            aria-selected={isActive}
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              isActive
                ? 'border-educture-orange bg-educture-orange/10 text-educture-orange'
                : 'border-gray-200 bg-white text-gray-600 hover:border-educture-orange/40 hover:text-educture-orange'
            }`}
          >
            {f.label}
          </Link>
        )
      })}
    </div>
  )
}
