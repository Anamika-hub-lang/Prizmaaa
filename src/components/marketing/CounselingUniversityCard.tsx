import { Link } from 'react-router-dom'
import { ArrowRight, Building2, MapPin } from 'lucide-react'
import type { FeaturedUniversity } from './university-counseling/data'
import { Badge } from './university-counseling/ui'
import { UniversityImage } from '../universities/UniversityImage'

type Props = {
  university: FeaturedUniversity
}

export function CounselingUniversityCard({ university }: Props) {
  return (
    <Link
      to={`/university-counseling/${university.id}`}
      className="group block overflow-hidden rounded-2xl border border-orange-100/80 bg-white shadow-sm text-left hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative h-32 sm:h-36 overflow-hidden">
        <UniversityImage
          src={university.image}
          alt={`${university.name} campus counselling`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <Badge variant="gray" className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm">
          Coming Soon
        </Badge>
        <p className="absolute bottom-3 left-3 font-display text-lg text-white leading-tight">
          {university.shortName}
        </p>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-[#1a1a1a] leading-snug">{university.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {university.location}, {university.state}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-violet-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {university.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full bg-violet-50 border border-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
