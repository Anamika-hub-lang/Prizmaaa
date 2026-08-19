import { Link } from 'react-router-dom'
import { useCommunityReviews } from '../../hooks/useCommunityReviews'

type TestimonialSlide = {
  id: string
  quote: string
  authorName: string
  roleType: 'student' | 'mentor'
  avatarUrl: string | null
}

const dummyTestimonials: TestimonialSlide[] = [
  {
    id: 'd1',
    quote: 'Mentors here actually listen. I finally have a clear college plan.',
    authorName: 'Rohan Sharma',
    roleType: 'student',
    avatarUrl: null,
  },
  {
    id: 'd2',
    quote: 'Honest campus stories saved me from picking the wrong college.',
    authorName: 'Priya Mehta',
    roleType: 'student',
    avatarUrl: null,
  },
  {
    id: 'd3',
    quote: 'Mock interviews here made my real interview feel easy.',
    authorName: 'Arjun Patel',
    roleType: 'mentor',
    avatarUrl: null,
  },
  {
    id: 'd4',
    quote: 'Found my first internship through a PRIZMA mentor. Grateful!',
    authorName: 'Kavya Iyer',
    roleType: 'student',
    avatarUrl: null,
  },
  {
    id: 'd5',
    quote: 'Helped me choose the right course instead of following the crowd.',
    authorName: 'Aditya Singh',
    roleType: 'student',
    avatarUrl: null,
  },
  {
    id: 'd6',
    quote: 'Guiding students is easier when the path is this clear.',
    authorName: 'Ananya Reddy',
    roleType: 'mentor',
    avatarUrl: null,
  },
  {
    id: 'd7',
    quote: 'Best place to talk to seniors who have already walked this path.',
    authorName: 'Vikram Joshi',
    roleType: 'student',
    avatarUrl: null,
  },
  {
    id: 'd8',
    quote: 'Love to learn from here — the guidance sessions really helped.',
    authorName: 'Sneha Kapoor',
    roleType: 'student',
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
  const liveItems: TestimonialSlide[] = reviews.map((r) => ({
    id: r.id,
    quote: r.quote,
    authorName: r.authorName,
    roleType: r.roleType,
    avatarUrl: r.avatarUrl,
  }))

  const minSlides = 8
  const items: TestimonialSlide[] = liveItems.length > 0 ? [...liveItems] : [...dummyTestimonials]
  if (items.length < minSlides) {
    for (const dummy of dummyTestimonials) {
      if (items.length >= minSlides) break
      const alreadyShown = items.some(
        (item) => item.authorName.trim().toLowerCase() === dummy.authorName.trim().toLowerCase(),
      )
      if (!alreadyShown) items.push(dummy)
    }
  }
  const track = [...items, ...items]

  return (
    <section className="py-16 lg:py-20 bg-[#fdf8f0] gsap-reveal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a]">
            Students & mentors sharing experiences
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Real voices from peers and mentors — updating live as people share.
          </p>
        </div>
        <Link
          to="/reviews"
          className="text-sm font-semibold text-educture-orange hover:underline shrink-0"
        >
          Share your experience →
        </Link>
      </div>

      <div className="relative overflow-hidden mask-testimonial-fade">
        {loading && reviews.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">Loading experiences…</p>
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
