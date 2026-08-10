import { Link } from 'react-router-dom'
import { useCommunityReviews } from '../../hooks/useCommunityReviews'

const fallback = [
  {
    id: 'f1',
    quote: 'Join PRIZMA — share your learning story on the reviews page!',
    authorName: 'Community',
    roleType: 'student' as const,
    avatarUrl: null,
  },
]

function roleLabel(role: 'student' | 'mentor') {
  return role === 'mentor' ? 'Mentor' : 'Student'
}

function ReviewCard({
  quote,
  authorName,
  roleType,
  avatarUrl,
}: {
  quote: string
  authorName: string
  roleType: 'student' | 'mentor'
  avatarUrl: string | null
}) {
  return (
    <article
      className="shrink-0 w-[min(100%,320px)] sm:w-[360px] bg-white rounded-3xl border-[3px] border-orange-100 p-6 shadow-sm"
    >
      <span className="text-4xl font-display text-sky-400 leading-none">&ldquo;</span>
      <p className="text-sm text-gray-600 leading-relaxed mt-2 line-clamp-4">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-3 mt-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-orange-100" />
        ) : (
          <span className="w-11 h-11 rounded-full bg-educture-orange/15 text-educture-orange font-bold flex items-center justify-center">
            {authorName.charAt(0)}
          </span>
        )}
        <div>
          <p className="font-bold text-sm">{authorName}</p>
          <p className="text-xs text-gray-500">{roleLabel(roleType)}</p>
        </div>
        <div className="ml-auto text-educture-orange text-xs">★★★★★</div>
      </div>
    </article>
  )
}

export function TestimonialsMarquee() {
  const { reviews, loading } = useCommunityReviews()
  const items =
    reviews.length > 0
      ? reviews.map((r) => ({
          id: r.id,
          quote: r.quote,
          authorName: r.authorName,
          roleType: r.roleType,
          avatarUrl: r.avatarUrl,
        }))
      : fallback

  const minSlides = 8
  let expanded = [...items]
  while (expanded.length < minSlides) {
    expanded = [...expanded, ...items]
  }
  const track = [...expanded, ...expanded]

  return (
    <section className="py-16 lg:py-20 bg-[#fdf8f0] gsap-reveal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a]">
            Happy students & mentors
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Real reviews from students and mentors — auto-updating live.
          </p>
        </div>
        <Link
          to="/reviews"
          className="text-sm font-semibold text-educture-orange hover:underline shrink-0"
        >
          Share your review →
        </Link>
      </div>

      <div className="relative overflow-hidden mask-testimonial-fade">
        {loading && reviews.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">Loading reviews…</p>
        ) : (
          <div className="flex gap-6 animate-testimonial-marquee hover:[animation-play-state:paused] py-2 will-change-transform">
            {track.map((t, i) => (
              <ReviewCard
                key={`${t.id}-${i}`}
                quote={t.quote}
                authorName={t.authorName}
                roleType={t.roleType}
                avatarUrl={t.avatarUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
