import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Send } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { submitMentorApplication } from '../lib/communityReviews'

export function BecomeMentorPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [expertise, setExpertise] = useState('')
  const [experience, setExperience] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await submitMentorApplication({
        fullName,
        email,
        phone,
        expertise,
        experience,
        message,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f3]">
      <MainNavbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <Link to="/" className="text-sm font-semibold text-educture-orange hover:underline">
          ← Back to home
        </Link>
        <div className="flex items-center gap-2 mt-6 mb-2">
          <span className="w-10 h-10 rounded-full bg-educture-orange flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d]">Mentor application</h1>
        </div>
        <p className="text-sm text-gray-600 mb-8">
          Tell us about your expertise. We&apos;ll review your application and contact you to onboard on
          Educture.
        </p>

        {done ? (
          <div className="rounded-3xl border-[3px] border-emerald-200 bg-white p-8 text-center">
            <p className="font-bold text-lg text-[#1d1d1d]">Application sent!</p>
            <p className="text-sm text-gray-600 mt-2">
              Thanks {fullName}. We&apos;ve received your details and will reach out at {email}.
            </p>
            <Link
              to="/sign-up"
              className="inline-block mt-6 text-sm font-semibold text-educture-orange hover:underline"
            >
              Create your account while you wait →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full name</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                What will you teach?
              </label>
              <input
                required
                placeholder="e.g. UI/UX, Mathematics, Full Stack"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Experience</label>
              <input
                placeholder="Years teaching / industry"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Links to portfolio, preferred schedule, etc."
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-educture-orange"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-educture-orange text-white font-semibold text-sm hover:bg-educture-orange-dark disabled:opacity-60 transition-colors"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Sending…' : 'Submit application'}
            </button>
          </form>
        )}
      </main>
      <MarketingFooter />
    </div>
  )
}
