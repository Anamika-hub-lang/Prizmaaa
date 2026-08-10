import { BadgeCheck } from 'lucide-react'
import type { UniversityReview } from '../../lib/universityReviews'
import { StarRating } from './StarRating'

type Props = {
  review: UniversityReview
  compact?: boolean
}

export function UniversityReviewCard({ review, compact = false }: Props) {
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="rounded-2xl border-2 border-orange-100 bg-white p-4 sm:p-5 text-left shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating value={review.overallRating} size="sm" />
            {review.reviewTitle && (
              <h3 className="text-sm font-bold text-[#1a1a1a]">{review.reviewTitle}</h3>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {review.program && <span>{review.program}</span>}
            {review.program && review.graduationYear && <span> · </span>}
            {review.graduationYear && <span>Class of {review.graduationYear}</span>}
            {(review.program || review.graduationYear) && <span> · </span>}
            <span>{date}</span>
          </p>
        </div>
        {review.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {!compact && (review.pros || review.cons || review.advice) && (
        <div className="mt-4 space-y-3 text-sm text-gray-700 leading-relaxed">
          {review.pros && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-1">Pros</p>
              <p>{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-500 mb-1">Cons</p>
              <p>{review.cons}</p>
            </div>
          )}
          {review.advice && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600 mb-1">Advice</p>
              <p>{review.advice}</p>
            </div>
          )}
        </div>
      )}

      {compact && review.pros && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">{review.pros}</p>
      )}

      <p className="mt-3 text-xs font-semibold text-[#1a1a1a]">— {review.authorName}</p>
    </article>
  )
}
