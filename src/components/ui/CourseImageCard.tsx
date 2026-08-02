import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, BadgeCheck, Clock, CheckCircle2 } from 'lucide-react'

type Status = 'ongoing' | 'completed' | 'draft'

type Props = {
  image: string
  title: string
  instructor: string
  instructorAvatar?: string
  students: string
  date: string
  location: string
  status?: Status
  compact?: boolean
  to?: string
}

const statusIcon = {
  ongoing: null,
  completed: CheckCircle2,
  draft: Clock,
}

const statusColor = {
  ongoing: '',
  completed: 'text-green-500 bg-green-50',
  draft: 'text-amber-500 bg-amber-50',
}

export function CourseImageCard({
  image,
  title,
  instructor,
  instructorAvatar,
  students,
  date,
  location,
  status = 'ongoing',
  compact = true,
  to = '/course/full-stack',
}: Props) {
  const Icon = statusIcon[status]
  const imgHeight = compact ? 'h-24 sm:h-28' : 'h-32'

  return (
    <Link
      to={to}
      className="block bg-white rounded-xl shadow-card card-lift overflow-hidden border border-gray-100"
    >
      <div className="relative">
        <img src={image} alt="" className={`w-full ${imgHeight} object-cover`} />
        {Icon && (
          <span
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${statusColor[status]}`}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className={compact ? 'p-3' : 'p-4'}>
        <h3 className={`font-semibold text-gray-800 leading-snug ${compact ? 'text-xs sm:text-sm line-clamp-2' : 'text-sm'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          {instructorAvatar ? (
            <img src={instructorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 text-[10px] flex items-center justify-center font-bold">
              {instructor[0]}
            </span>
          )}
          <span className="text-[11px] text-gray-600 truncate">{instructor}</span>
          <BadgeCheck className="w-3.5 h-3.5 text-konned-purple shrink-0" />
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 gap-1">
          <span className="flex items-center gap-1 truncate">
            <Users className="w-3 h-3 shrink-0" /> {students}
          </span>
          <span className="flex items-center gap-1 truncate">
            <Calendar className="w-3 h-3 shrink-0" /> {date}
          </span>
          <span className="flex items-center gap-1 truncate hidden sm:flex">
            <MapPin className="w-3 h-3 shrink-0" /> {location}
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Smaller feature card for landing (Best Online Course style) */
export function FeatureBadgeCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="bg-educture-cream border border-orange-100 rounded-2xl p-4 shadow-card max-w-[140px] card-lift">
      <div className="w-10 h-10 rounded-xl bg-educture-orange/15 text-educture-orange flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-800 leading-tight">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}
