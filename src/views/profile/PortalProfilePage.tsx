import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/nextjs'
import { LogOut, Calendar, Pencil } from 'lucide-react'
import { getUserRole } from '../../lib/userRole'
import type { UserRole } from '../../types/auth'
import { fetchUserProfile, saveProfileDetails, type UserProfileRecord } from '../../lib/saveProfileDetails'
import { educationLevelLabel, howDidYouFindUsLabel, type HowDidYouFindUs, type StudentEducationLevel } from '../../data/onboardingFields'
import { buildProfileCompletion } from '../../lib/profileCompletion'
import { ProfileCompletionCard } from '../../components/profile/ProfileCompletionCard'
import { DeleteAccountSection } from '../../components/profile/DeleteAccountSection'
import {
  HowDidYouFindUsFields,
  MentorOnboardingFields,
  StudentOnboardingFields,
  onboardingInputClass,
} from '../../components/onboarding/OnboardingFormFields'

function roleLabel(role: UserRole | null) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'student':
      return 'Student'
    case 'teacher':
      return 'Mentor'
    case 'counsellor':
      return 'Counsellor'
    case 'intern':
      return 'Intern'
    case null:
      return 'Member'
    default: {
      const _exhaustive: never = role
      return _exhaustive
    }
  }
}

function FieldRow({
  label,
  value,
  pending,
}: {
  label: string
  value: string | null | undefined
  pending?: boolean
}) {
  const show = value?.trim()
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-orange-50 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`text-sm mt-1 ${show ? 'font-medium text-[#1d1d1d]' : 'text-gray-400 italic'}`}>
          {show || 'Not added yet'}
        </p>
      </div>
      {pending && (
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-1 rounded-full">
          Pending
        </span>
      )}
    </div>
  )
}

export function PortalProfilePage({ portal }: { portal: 'student' | 'teacher' }) {
  const { user } = useUser()
  const { signOut, getToken } = useAuth()
  const [editing, setEditing] = useState(false)
  const [profileRow, setProfileRow] = useState<UserProfileRecord | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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

  const role = getUserRole(user)
  const accountRole = portal === 'teacher' ? 'teacher' : 'student'
  const home = portal === 'student' ? '/student' : '/teacher'

  const refreshProfile = () => {
    setLoadingProfile(true)
    void fetchUserProfile(getToken).then((row) => {
      setProfileRow(row)
      setLoadingProfile(false)
    })
  }

  useEffect(() => {
    refreshProfile()
  }, [getToken, user?.id])

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
  }, [user])

  function loadFormFromRow(row: UserProfileRecord | null) {
    if (!row) return
    if (row.full_name) {
      const parts = row.full_name.trim().split(/\s+/)
      if (!user?.firstName) setFirstName(parts[0] ?? '')
      if (!user?.lastName) setLastName(parts.slice(1).join(' ') ?? '')
    }
    setPhone(row.phone ?? '')
    setCity(row.city ?? '')
    setHowFind((row.how_did_you_find_us as HowDidYouFindUs) ?? '')
    setHowFindDetail(row.how_did_you_find_us_detail ?? '')
    setEducationLevel((row.student_education_level as StudentEducationLevel) ?? '')
    setGradeOrProgram(row.student_grade_or_program ?? '')
    setLearningGoals(row.student_learning_goals ?? '')
    setExpertise(row.mentor_expertise ?? '')
    setExperienceYears(row.mentor_experience_years != null ? String(row.mentor_experience_years) : '')
    setQualifications(row.mentor_qualifications ?? '')
    setBio(row.mentor_bio ?? '')
    setPortfolioUrl(row.mentor_portfolio_url ?? '')
  }

  function startEdit() {
    loadFormFromRow(profileRow)
    setFirstName(user?.firstName ?? firstName)
    setLastName(user?.lastName ?? lastName)
    setEditing(true)
    setError(null)
  }

  const completionView = useMemo(
    () => buildProfileCompletion(accountRole, user?.firstName, user?.lastName, profileRow),
    [accountRole, user?.firstName, user?.lastName, profileRow],
  )

  const completionEdit = useMemo(() => {
    const mockRow: UserProfileRecord = {
      clerk_id: user?.id ?? '',
      full_name: null,
      email: null,
      role: accountRole,
      phone,
      city,
      how_did_you_find_us: howFind || null,
      how_did_you_find_us_detail: howFindDetail || null,
      student_education_level: educationLevel || null,
      student_grade_or_program: gradeOrProgram || null,
      student_learning_goals: learningGoals || null,
      mentor_expertise: expertise || null,
      mentor_experience_years: experienceYears ? Number(experienceYears) : null,
      mentor_qualifications: qualifications || null,
      mentor_bio: bio || null,
      mentor_portfolio_url: portfolioUrl || null,
      profile_details_complete: false,
    }
    return buildProfileCompletion(accountRole, firstName, lastName, mockRow)
  }, [
    accountRole,
    firstName,
    lastName,
    phone,
    city,
    howFind,
    howFindDetail,
    educationLevel,
    gradeOrProgram,
    learningGoals,
    expertise,
    experienceYears,
    qualifications,
    bio,
    portfolioUrl,
    user?.id,
  ])

  const completion = editing ? completionEdit : completionView
  const pendingMap = new Map(completion.items.map((i) => [i.id, !i.done]))

  const email = user?.primaryEmailAddress?.emailAddress ?? '—'
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!firstName.trim() || !lastName.trim()) {
      setError('Enter your first and last name.')
      return
    }
    if (!howFind) {
      setError('Select how you found PRIZMA.')
      return
    }
    setSaving(true)
    try {
      await saveProfileDetails(getToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        howDidYouFindUs: howFind,
        howDidYouFindUsDetail: howFindDetail.trim() || undefined,
        studentEducationLevel: accountRole === 'student' && educationLevel ? (educationLevel as StudentEducationLevel) : undefined,
        studentGradeOrProgram: accountRole === 'student' ? gradeOrProgram.trim() || undefined : undefined,
        studentLearningGoals: accountRole === 'student' ? learningGoals.trim() || undefined : undefined,
        mentorExpertise: accountRole === 'teacher' ? expertise.trim() || undefined : undefined,
        mentorExperienceYears:
          accountRole === 'teacher' && experienceYears !== '' ? Number(experienceYears) : undefined,
        mentorQualifications: accountRole === 'teacher' ? qualifications.trim() : undefined,
        mentorBio: accountRole === 'teacher' ? bio.trim() : undefined,
        mentorPortfolioUrl: accountRole === 'teacher' ? portfolioUrl.trim() || undefined : undefined,
      })
      await user?.reload()
      refreshProfile()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const howLabel = profileRow?.how_did_you_find_us
    ? `${howDidYouFindUsLabel(profileRow.how_did_you_find_us)}${
        profileRow.how_did_you_find_us_detail ? ` — ${profileRow.how_did_you_find_us_detail}` : ''
      }`
    : null

  return (
    <div className="flex-1">
      <section className="bg-[#fff9f3] border-b border-orange-100/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left">
          <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">
            {portal === 'student' ? 'Student account' : 'Mentor account'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1d1d1d] mt-2">Profile</h1>
          <p className="text-sm text-gray-500 mt-2">
            All signup fields live here. Completion updates in real time as you fill them.
          </p>
          <button
            type="button"
            onClick={() => (editing ? setEditing(false) : startEdit())}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-educture-orange"
          >
            <Pencil className="w-4 h-4" />
            {editing ? 'Cancel edit' : completion.percent < 100 ? 'Complete profile' : 'Edit profile'}
          </button>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <ProfileCompletionCard percent={completion.percent} items={completion.items} />

        {loadingProfile && (
          <p className="text-sm text-gray-500 text-center">Loading your saved details…</p>
        )}

        {!loadingProfile && !profileRow && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Profile fields are not in the database yet. Run{' '}
            <code className="text-xs bg-white px-1 rounded">supabase/profile-onboarding-fields.sql</code> in Supabase,
            then refresh.
          </div>
        )}

        <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-left">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-educture-orange/15"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-educture-orange/10 flex items-center justify-center text-3xl font-bold text-educture-orange">
              {(user?.fullName ?? 'U').charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-bold text-[#1d1d1d]">{user?.fullName ?? '—'}</h2>
            <p className="text-sm text-educture-orange font-semibold mt-1">{roleLabel(role)}</p>
            <p className="text-sm text-gray-500 mt-2">{email}</p>
          </div>
        </div>

        {editing ? (
          <form
            onSubmit={(e) => void handleSaveDetails(e)}
            className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 space-y-5"
          >
            <p className="text-sm font-bold text-[#1d1d1d]">Edit your details</p>
            <div className="grid sm:grid-cols-2 gap-4">
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={onboardingInputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={onboardingInputClass} />
              </div>
            </div>

            {accountRole === 'student' ? (
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
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-educture-orange text-white font-semibold text-sm disabled:opacity-60"
            >
              {saving ? 'Saving…' : `Save profile (${completion.percent}% complete)`}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border-[3px] border-orange-100 bg-white shadow-sm overflow-hidden">
            <p className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 border-b border-orange-50">
              Account
            </p>
            <FieldRow label="Email" value={email} />
            <FieldRow label="Role" value={roleLabel(role)} />
            <FieldRow
              label="First name"
              value={user?.firstName}
              pending={pendingMap.get('firstName')}
            />
            <FieldRow
              label="Last name"
              value={user?.lastName}
              pending={pendingMap.get('lastName')}
            />
            <FieldRow label="Phone (WhatsApp)" value={profileRow?.phone} pending={pendingMap.get('phone')} />
            <FieldRow label="City" value={profileRow?.city} pending={pendingMap.get('city')} />

            <p className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 border-b border-orange-50 bg-[#fff9f3]">
              {accountRole === 'student' ? 'Student information' : 'Mentor information'}
            </p>

            {accountRole === 'student' ? (
              <>
                <FieldRow
                  label="Education level"
                  value={
                    profileRow?.student_education_level
                      ? educationLevelLabel(profileRow.student_education_level)
                      : null
                  }
                  pending={pendingMap.get('education')}
                />
                <FieldRow
                  label="Class / program"
                  value={profileRow?.student_grade_or_program}
                  pending={pendingMap.get('grade')}
                />
                <FieldRow
                  label="Learning goals"
                  value={profileRow?.student_learning_goals}
                  pending={pendingMap.get('goals')}
                />
              </>
            ) : (
              <>
                <FieldRow
                  label="Subjects / expertise"
                  value={profileRow?.mentor_expertise}
                  pending={pendingMap.get('expertise')}
                />
                <FieldRow
                  label="Years of experience"
                  value={
                    profileRow?.mentor_experience_years != null
                      ? String(profileRow.mentor_experience_years)
                      : null
                  }
                  pending={pendingMap.get('experience')}
                />
                <FieldRow
                  label="Qualifications"
                  value={profileRow?.mentor_qualifications}
                  pending={pendingMap.get('qualifications')}
                />
                <FieldRow label="Short bio" value={profileRow?.mentor_bio} pending={pendingMap.get('bio')} />
                <FieldRow label="LinkedIn / portfolio" value={profileRow?.mentor_portfolio_url} />
              </>
            )}

            <p className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-400 border-b border-orange-50 bg-[#fff9f3]">
              How you found us
            </p>
            <FieldRow label="Source" value={howLabel} pending={pendingMap.get('howFind')} />

            <div className="flex items-start gap-3 p-5 border-t border-orange-50">
              <Calendar className="w-5 h-5 text-educture-orange shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Member since</p>
                <p className="text-sm font-medium text-[#1d1d1d] mt-1">{joined}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={home}
            className="inline-flex justify-center px-6 py-3 rounded-full border-[3px] border-orange-100 text-sm font-semibold text-gray-700 hover:border-educture-orange hover:text-educture-orange transition-colors"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: '/' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-educture-orange text-white text-sm font-semibold shadow-[0_8px_24px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        <DeleteAccountSection email={email === '—' ? '' : email} />
      </main>
    </div>
  )
}
