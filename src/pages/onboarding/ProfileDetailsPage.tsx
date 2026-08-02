import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useState } from 'react'
import { getUserRole, getRoleHomePath } from '../../lib/userRole'
import { saveProfileDetails } from '../../lib/saveProfileDetails'
import type { HowDidYouFindUs, StudentEducationLevel } from '../../data/onboardingFields'
import {
  HowDidYouFindUsFields,
  MentorOnboardingFields,
  StudentOnboardingFields,
  onboardingInputClass,
} from '../../components/onboarding/OnboardingFormFields'

export function ProfileDetailsPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()
  const role = getUserRole(user)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [howFind, setHowFind] = useState<HowDidYouFindUs | ''>('')
  const [howFindDetail, setHowFindDetail] = useState('')

  const [educationLevel, setEducationLevel] = useState<StudentEducationLevel | ''>('')
  const [gradeOrProgram, setGradeOrProgram] = useState('')
  const [learningGoals, setLearningGoals] = useState('')

  const [expertise, setExpertise] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [bio, setBio] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!role) {
    return null
  }

  const isStudent = role === 'student'
  const title = isStudent ? 'Tell us about you as a student' : 'Tell us about you as a mentor'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!howFind) {
      setError('Please select how you found Educture.')
      return
    }
    if ((howFind === 'reference' || howFind === 'other') && !howFindDetail.trim()) {
      setError('Please add a short note for your selection.')
      return
    }

    setSaving(true)
    try {
      await saveProfileDetails(getToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        city: city.trim() || undefined,
        howDidYouFindUs: howFind,
        howDidYouFindUsDetail: howFindDetail.trim() || undefined,
        studentEducationLevel: isStudent ? (educationLevel as StudentEducationLevel) : undefined,
        studentGradeOrProgram: isStudent ? gradeOrProgram.trim() : undefined,
        studentLearningGoals: isStudent ? learningGoals.trim() : undefined,
        mentorExpertise: !isStudent ? expertise.trim() : undefined,
        mentorExperienceYears: !isStudent ? Number(experienceYears) : undefined,
        mentorQualifications: !isStudent ? qualifications.trim() : undefined,
        mentorBio: !isStudent ? bio.trim() : undefined,
        mentorPortfolioUrl: !isStudent ? portfolioUrl.trim() || undefined : undefined,
      })
      await user?.reload()
      if (!role) return
      navigate(getRoleHomePath(role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save details')
    } finally {
      setSaving(false)
    }
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div className="min-h-screen bg-[#fff9f3] flex flex-col">
      <header className="px-4 sm:px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-educture-orange flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </span>
          <span className="font-bold text-lg text-[#1d1d1d]">Educture</span>
        </Link>
      </header>

      <div className="flex-1 px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto text-center mb-8"
        >
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em] mb-3">
            Step 2 of 2
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1d] mb-2">{title}</h1>
          <p className="text-sm text-gray-500">
            Works with Google sign-up too — we still need a few details for your {isStudent ? 'learning' : 'mentor'}{' '}
            profile.
          </p>
        </motion.div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="max-w-xl mx-auto rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-xs font-semibold text-gray-600">First name</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={onboardingInputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Last name</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={onboardingInputClass}
              />
            </div>
          </div>

          <div className="text-left">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input readOnly value={email} className={`${onboardingInputClass} bg-gray-50 text-gray-600`} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-xs font-semibold text-gray-600">Phone (WhatsApp)</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className={onboardingInputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                className={onboardingInputClass}
              />
            </div>
          </div>

          {isStudent ? (
            <StudentOnboardingFields
              educationLevel={educationLevel}
              gradeOrProgram={gradeOrProgram}
              learningGoals={learningGoals}
              onEducationLevel={setEducationLevel}
              onGradeOrProgram={setGradeOrProgram}
              onLearningGoals={setLearningGoals}
            />
          ) : (
            <MentorOnboardingFields
              expertise={expertise}
              experienceYears={experienceYears}
              qualifications={qualifications}
              bio={bio}
              portfolioUrl={portfolioUrl}
              onExpertise={setExpertise}
              onExperienceYears={setExperienceYears}
              onQualifications={setQualifications}
              onBio={setBio}
              onPortfolioUrl={setPortfolioUrl}
            />
          )}

          <HowDidYouFindUsFields
            value={howFind}
            detail={howFindDetail}
            onChange={setHowFind}
            onDetailChange={setHowFindDetail}
          />

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_8px_24px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Complete setup & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
