import { Link } from 'react-router-dom'
import type { OnlineClass } from '../../data/classCatalog'
import type { ClassCategoryId } from '../../data/classCatalog'
import { ArrowRight } from 'lucide-react'
import { tintedSurfaceKey } from '../ui/dashboardCardStyles'

type CardSize = 'compact' | 'medium' | 'large'

export function CategoryBrowseCard({
  id,
  title,
  description,
  image,
}: {
  id: ClassCategoryId
  title: string
  description: string
  image: string
}) {
  return (
    <Link
      to={`/student/browse/${id}`}
      className={`group block overflow-hidden card-lift text-left ${tintedSurfaceKey(id)}`}
    >
      <div className="relative aspect-[16/10] sm:aspect-[5/3] overflow-hidden border-b-2 border-white/70">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl sm:text-2xl leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-5 sm:p-6 flex items-center justify-between gap-3 bg-white/40">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <span className="shrink-0 w-10 h-10 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-educture-orange group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange transition-colors">
          <ArrowRight className="w-5 h-5" />
        </span>
      </div>
    </Link>
  )
}

export function PaidClassCard({
  class: item,
  size = 'medium',
}: {
  class: OnlineClass
  size?: CardSize
}) {
  const imgHeight =
    size === 'large' ? 'h-44 sm:h-52' : size === 'medium' ? 'h-36 sm:h-40' : 'h-24 sm:h-28'
  const padding = size === 'large' ? 'p-5' : size === 'medium' ? 'p-4' : 'p-3'
  const titleClass =
    size === 'large'
      ? 'text-base sm:text-lg font-bold'
      : size === 'medium'
        ? 'text-sm sm:text-base font-semibold'
        : 'text-xs sm:text-sm font-semibold line-clamp-2'

  return (
    <Link
      to={`/student/class/${item.id}`}
      className={`block overflow-hidden card-lift text-left ${tintedSurfaceKey(item.id)}`}
    >
      <div className="relative border-b-2 border-white/70">
        <img src={item.image} alt="" className={`w-full object-cover ${imgHeight}`} />
      </div>
      <div className={padding}>
        <h3 className={`text-[#1d1d1d] leading-snug ${titleClass}`}>{item.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">{item.duration} · {item.sessions}</p>
        <p className="text-sm text-educture-orange font-semibold mt-2">{item.mentor}</p>
      </div>
    </Link>
  )
}

export function FreeCourseCard({
  course,
  onStart,
}: {
  course: import('../../data/classCatalog').FreeCourse
  onStart?: () => void
}) {
  return (
    <div className={`overflow-hidden card-lift text-left ${tintedSurfaceKey(course.id)}`}>
      <div className="relative border-b-2 border-white/70">
        <img src={course.image} alt="" className="w-full h-36 sm:h-40 object-cover" />
        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full border-2 border-emerald-300">
          FREE
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1d] line-clamp-2">{course.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">{course.lessons} lessons · {course.hours} hrs</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full py-2.5 rounded-full text-sm font-semibold bg-white/80 text-educture-orange border-2 border-orange-200 hover:bg-educture-orange hover:text-white hover:border-educture-orange transition-colors"
        >
          Start learning
        </button>
      </div>
    </div>
  )
}
