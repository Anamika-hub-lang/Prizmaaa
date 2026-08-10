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
      className={`group block w-full min-w-0 overflow-hidden card-lift text-left rounded-xl sm:rounded-2xl ${tintedSurfaceKey(id)}`}
    >
      <div className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-[5/3] overflow-hidden border-b-2 border-white/70">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-snug break-words">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white/40 min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words min-w-0 flex-1">
          {description}
        </p>
        <span className="self-end sm:self-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-educture-orange group-hover:bg-educture-orange group-hover:text-white group-hover:border-educture-orange transition-colors">
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
    size === 'large' ? 'h-40 sm:h-44 md:h-52' : size === 'medium' ? 'h-32 sm:h-36 md:h-40' : 'h-24 sm:h-28'
  const padding = size === 'large' ? 'p-4 sm:p-5' : size === 'medium' ? 'p-3 sm:p-4' : 'p-3'
  const titleClass =
    size === 'large'
      ? 'text-sm sm:text-base md:text-lg font-bold'
      : size === 'medium'
        ? 'text-sm sm:text-base font-semibold'
        : 'text-xs sm:text-sm font-semibold line-clamp-2'

  return (
    <Link
      to={`/student/class/${item.id}`}
      className={`block w-full min-w-0 overflow-hidden card-lift text-left rounded-xl sm:rounded-2xl ${tintedSurfaceKey(item.id)}`}
    >
      <div className="relative border-b-2 border-white/70">
        <img src={item.image} alt="" className={`w-full object-cover ${imgHeight}`} />
      </div>
      <div className={padding}>
        <h3 className={`text-[#1d1d1d] leading-snug break-words ${titleClass}`}>{item.title}</h3>
        <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mt-1.5 sm:mt-2 break-words">
          {item.duration} · {item.sessions}
        </p>
        <p className="text-xs sm:text-sm text-educture-orange font-semibold mt-1.5 sm:mt-2 truncate">
          {item.mentor}
        </p>
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
    <div className={`w-full min-w-0 overflow-hidden card-lift text-left rounded-xl sm:rounded-2xl ${tintedSurfaceKey(course.id)}`}>
      <div className="relative border-b-2 border-white/70">
        <img src={course.image} alt="" className="w-full h-32 sm:h-36 md:h-40 object-cover" />
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border-2 border-emerald-300">
          FREE
        </span>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1d] line-clamp-2 break-words">{course.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">{course.lessons} lessons · {course.hours} hrs</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-3 sm:mt-4 w-full py-2.5 rounded-full text-sm font-semibold bg-white/80 text-educture-orange border-2 border-orange-200 hover:bg-educture-orange hover:text-white hover:border-educture-orange transition-colors"
        >
          Start learning
        </button>
      </div>
    </div>
  )
}
