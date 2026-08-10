import { Link } from 'react-router-dom'
import { ArrowRight, Building2, MessageSquareQuote, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { universities } from '../../data/universities'
import { averageRating } from '../../lib/universityReviews'
import { useUniversityReviews } from '../../hooks/useUniversityReviews'
import { UniversityCard } from '../universities/UniversityCard'

const featuredIds = ['iit-bombay', 'bits-pilani', 'du', 'vit-vellore']

export function UniversityReviewsSection() {
  const { reviews, loading } = useUniversityReviews()

  const stats = useMemo(() => {
    const byUniversity = new Map<string, typeof reviews>()
    for (const r of reviews) {
      const list = byUniversity.get(r.universityId) ?? []
      list.push(r)
      byUniversity.set(r.universityId, list)
    }
    return { byUniversity, totalReviews: reviews.length }
  }, [reviews])

  const featuredUniversities = featuredIds
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is (typeof universities)[number] => Boolean(u))

  const overallAvg =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length) * 10) / 10
      : null

  return (
    <section
      id="university-reviews"
      className="relative overflow-hidden bg-gradient-to-br from-[#fff9f3] via-white to-sky-50 py-14 sm:py-16 lg:py-20 gsap-reveal"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-educture-orange/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-educture-orange/30 bg-educture-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-educture-orange">
              <Building2 className="w-3.5 h-3.5" />
              University reviews
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] leading-[1.1] mt-4">
              Honest reviews —{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">by students</span>
            </h2>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-md">
              Like Glassdoor, but for colleges. Read real experiences on campus life, academics, and
              placements — or share your own.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-bold text-[#1a1a1a]">{universities.length}+</p>
                <p className="text-[11px] text-gray-500 font-medium">Universities listed</p>
              </div>
              <div className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-bold text-[#1a1a1a]">
                  {loading ? '—' : stats.totalReviews}
                </p>
                <p className="text-[11px] text-gray-500 font-medium">Student reviews</p>
              </div>
              {overallAvg !== null && (
                <div className="rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-educture-orange fill-educture-orange" />
                    <p className="text-2xl font-bold text-[#1a1a1a]">{overallAvg}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Avg. rating</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/universities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.4)] hover:bg-educture-orange-dark transition-colors"
              >
                Explore universities
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/universities?write=1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-orange-200 bg-white text-sm font-semibold text-gray-800 hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                <MessageSquareQuote className="w-4 h-4" />
                Write a review
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-7"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-3">
              Popular universities
            </p>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {featuredUniversities.map((uni) => {
                const uniReviews = stats.byUniversity.get(uni.id) ?? []
                return (
                  <UniversityCard
                    key={uni.id}
                    university={uni}
                    avgRating={averageRating(uniReviews)}
                    reviewCount={uniReviews.length}
                    variant="featured"
                  />
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
