import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { insertCommunityReview } from '../lib/communityReviews'
import { useCommunityReviews } from '../hooks/useCommunityReviews'

export function ShareReviewPage() {
  const { reviews, refresh } = useCommunityReviews()
  const [authorName, setAuthorName] = useState('')
  const [roleType, setRoleType] = useState<'student' | 'mentor'>('student')
  const [quote, setQuote] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await insertCommunityReview({ authorName, roleType, quote })
      setDone(true)
      setQuote('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link to="/" className="text-sm font-semibold text-educture-orange hover:underline">
          ← Home
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-6">Share your experience</h1>
        <p className="text-sm text-gray-600 mt-2 mb-8">
          Students and mentors can post a short note. It appears on the home page experiences carousel
          automatically.
        </p>

        {done && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            Thank you! Your story is live on the homepage.
          </p>
        )}

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-3xl border-[3px] border-orange-100 bg-[#fff9f3] p-6 space-y-4 mb-10"
        >
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Your name</label>
            <input
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-educture-orange"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">I am a</label>
            <div className="flex gap-3 mt-2">
              {(['student', 'mentor'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleType(r)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                    roleType === r
                      ? 'border-educture-orange bg-educture-orange text-white'
                      : 'border-orange-100 text-gray-600 hover:border-educture-orange/50'
                  }`}
                >
                  {r === 'student' ? 'Student' : 'Mentor'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Your experience</label>
            <textarea
              required
              rows={4}
              maxLength={400}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="What did you love about connecting, learning, or mentoring on PRIZMA?"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none resize-none focus:border-educture-orange"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60"
          >
            {saving ? 'Posting…' : 'Share experience'}
          </button>
        </form>

        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Recent experiences</h2>
        <ul className="space-y-3">
          {reviews.slice(0, 8).map((r) => (
            <li key={r.id} className="rounded-2xl border-2 border-orange-50 bg-white p-4 text-left">
              <div className="flex items-center gap-2 text-educture-orange text-xs mb-2">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <span className="text-gray-400 ml-2 capitalize">{r.roleType}</span>
              </div>
              <p className="text-sm text-gray-700">&ldquo;{r.quote}&rdquo;</p>
              <p className="text-xs font-semibold text-[#1d1d1d] mt-2">{r.authorName}</p>
            </li>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No experiences yet — be the first!</p>
          )}
        </ul>
      </main>
      <MarketingFooter />
    </div>
  )
}
