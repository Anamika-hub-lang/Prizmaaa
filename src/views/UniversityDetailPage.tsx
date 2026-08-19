import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, MapPin } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { UniversityReviewCard } from '../components/universities/UniversityReviewCard'
import { UniversityImage } from '../components/universities/UniversityImage'
import { StarRating, StarRatingInput } from '../components/universities/StarRating'
import { universityById, universityTypeLabels } from '../data/universities'
import {
  averageRating,
  insertUniversityReview,
  ratingBreakdown,
} from '../lib/universityReviews'
import { useUniversityReviews } from '../hooks/useUniversityReviews'

export function UniversityDetailPage() {
  const { universityId = '' } = useParams()
  const university = universityById(universityId)
  const { user } = useUser()
  const { reviews, refresh } = useUniversityReviews(universityId)

  const [authorName, setAuthorName] = useState(user?.fullName ?? '')
  const [program, setProgram] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [overallRating, setOverallRating] = useState(0)
  const [academicsRating, setAcademicsRating] = useState(0)
  const [campusRating, setCampusRating] = useState(0)
  const [placementRating, setPlacementRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [advice, setAdvice] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!university) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <MainNavbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Campus not found.</p>
          <Link to="/universities" className="text-educture-orange font-semibold mt-4 inline-block">
            ← Back to campus stories
          </Link>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  const avg = averageRating(reviews)
  const breakdown = ratingBreakdown(reviews)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (overallRating < 1) {
      setError('Please give an overall rating.')
      return
    }
    if (!pros.trim() && !cons.trim() && !advice.trim()) {
      setError('Please write at least pros, cons, or advice.')
      return
    }

    setSaving(true)
    try {
      await insertUniversityReview({
        universityId,
        authorName: authorName.trim() || 'Anonymous',
        program: program.trim() || undefined,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        overallRating,
        academicsRating: academicsRating || undefined,
        campusRating: campusRating || undefined,
        placementRating: placementRating || undefined,
        reviewTitle: reviewTitle.trim() || undefined,
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        advice: advice.trim() || undefined,
        clerkId: user?.id,
      })
      setDone(true)
      setPros('')
      setCons('')
      setAdvice('')
      setReviewTitle('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <Link
              to="/universities"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All campuses
            </Link>

            <div className="mt-6 flex flex-col md:flex-row gap-6 md:items-end md:justify-between">
              <div className="flex gap-4 items-start">
                <UniversityImage
                  src={university.image}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-educture-orange">
                    {universityTypeLabels[university.type]}
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl leading-tight mt-1">
                    {university.shortName}
                  </h1>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {university.location}, {university.state}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{university.name}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left shrink-0">
                {avg !== null ? (
                  <>
                    <div className="flex items-center gap-3">
                      <p className="text-4xl font-bold text-white">{avg.toFixed(1)}</p>
                      <div>
                        <StarRating value={avg} size="md" />
                        <p className="text-xs text-gray-400 mt-1">
                          {reviews.length} review{reviews.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No stories yet — be the first!</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4 space-y-6">
              {reviews.length > 0 && (
                <div className="rounded-2xl border-2 border-orange-100 bg-white p-5 shadow-sm text-left">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                    Rating breakdown
                  </h2>
                  <ul className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = breakdown[stars] ?? 0
                      const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                      return (
                        <li key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-gray-600">{stars} ★</span>
                          <div className="flex-1 h-2 rounded-full bg-orange-50 overflow-hidden">
                            <div
                              className="h-full bg-educture-orange rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-400">{count}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="rounded-3xl border-[3px] border-orange-100 bg-white p-5 sm:p-6 space-y-4 shadow-sm text-left sticky top-24"
              >
                <h2 className="font-display text-lg text-[#1a1a1a]">Share your campus story</h2>
                <p className="text-xs text-gray-500 -mt-2">
                  Honest experiences help the next student decide with confidence.
                </p>

                {done && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    Thank you! Your story is live.
                  </p>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Your name</label>
                  <input
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Program</label>
                    <input
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      placeholder="B.Tech CSE"
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Grad year</label>
                    <input
                      type="number"
                      min={2000}
                      max={2035}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2026"
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                    />
                  </div>
                </div>

                <StarRatingInput label="Overall rating *" value={overallRating} onChange={setOverallRating} />
                <StarRatingInput label="Academics" value={academicsRating} onChange={setAcademicsRating} />
                <StarRatingInput label="Campus life" value={campusRating} onChange={setCampusRating} />
                <StarRatingInput label="Placements" value={placementRating} onChange={setPlacementRating} />

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Story title</label>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Great academics, lively campus"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Pros</label>
                  <textarea
                    rows={2}
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-educture-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Cons</label>
                  <textarea
                    rows={2}
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-educture-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Advice to juniors</label>
                  <textarea
                    rows={2}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-educture-orange"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60"
                >
                  {saving ? 'Posting…' : 'Share story'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 text-left">
                Student experiences ({reviews.length})
              </h2>
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <UniversityReviewCard review={review} />
                  </li>
                ))}
                {reviews.length === 0 && (
                  <li className="rounded-2xl border-2 border-dashed border-orange-200 bg-white/60 p-8 text-center text-sm text-gray-500">
                    No stories yet for {university.shortName}. Be the first to share your experience!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
