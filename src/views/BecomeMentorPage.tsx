import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, GraduationCap, Send } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { submitMentorApplication } from '../lib/communityReviews'

const steps = [
  'Fill the mentor request form below',
  'Admin reviews your profile & expertise',
  'Once approved, sign up with the same email',
  'Choose Mentor role → upload classes & host sessions',
]

export function BecomeMentorPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [expertise, setExpertise] = useState('')
  const [experience, setExperience] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
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
        college,
        expertise,
        experience,
        portfolioUrl,
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
          <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d]">Become a mentor</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Mentors cannot sign up directly. Submit a request — our team will review it and unlock your
          mentor dashboard after approval.
        </p>

        <ol className="mb-8 space-y-2">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="shrink-0 w-6 h-6 rounded-full bg-educture-orange/10 text-educture-orange text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        {done ? (
          <div className="rounded-3xl border-[3px] border-emerald-200 bg-white p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-lg text-[#1d1d1d] mt-4">Request submitted!</p>
            <p className="text-sm text-gray-600 mt-2">
              Thanks {fullName}. We received your mentor request at <strong>{email}</strong>. Once
              admin approves, sign up with the same email and choose <strong>Mentor</strong> during
              onboarding to access your dashboard.
            </p>
            <Link
              to="/sign-up"
              className="inline-block mt-6 text-sm font-semibold text-educture-orange hover:underline"
            >
              Sign up while you wait →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full name *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Use this email to sign up later"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91…"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                College / University
              </label>
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. IIT Delhi, DU, NIT Kurukshetra"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                What will you teach? *
              </label>
              <input
                required
                placeholder="e.g. JEE Maths, UI/UX, Campus guidance, Interview prep"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Experience</label>
              <input
                placeholder="Years mentoring / industry / campus leadership"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                LinkedIn / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Why do you want to mentor?
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What sessions will you run, your schedule, how students will benefit…"
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
              {saving ? 'Submitting…' : 'Submit mentor request'}
            </button>
          </form>
        )}
      </main>
      <MarketingFooter />
    </div>
  )
}
