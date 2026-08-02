import {
  HOW_DID_YOU_FIND_US_OPTIONS,
  STUDENT_EDUCATION_LEVELS,
  type HowDidYouFindUs,
  type StudentEducationLevel,
} from '../../data/onboardingFields'

const inputClass =
  'w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-educture-orange'

export function HowDidYouFindUsFields({
  value,
  detail,
  onChange,
  onDetailChange,
}: {
  value: HowDidYouFindUs | ''
  detail: string
  onChange: (v: HowDidYouFindUs) => void
  onDetailChange: (v: string) => void
}) {
  const needsDetail = value === 'reference' || value === 'other'

  return (
    <div className="space-y-3 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">How did you find us?</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {HOW_DID_YOU_FIND_US_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
              value === opt.value
                ? 'border-educture-orange bg-orange-50'
                : 'border-orange-100 hover:border-educture-orange/40'
            }`}
          >
            <input
              type="radio"
              name="howFind"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-educture-orange"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {needsDetail && (
        <div>
          <label className="text-xs font-semibold text-gray-600">
            {value === 'reference' ? 'Who referred you?' : 'Please specify'}
          </label>
          <input
            required
            value={detail}
            onChange={(e) => onDetailChange(e.target.value)}
            placeholder={value === 'reference' ? 'Name or organisation' : 'Tell us more'}
            className={inputClass}
          />
        </div>
      )}
    </div>
  )
}

export function StudentOnboardingFields({
  educationLevel,
  gradeOrProgram,
  learningGoals,
  onEducationLevel,
  onGradeOrProgram,
  onLearningGoals,
}: {
  educationLevel: StudentEducationLevel | ''
  gradeOrProgram: string
  learningGoals: string
  onEducationLevel: (v: StudentEducationLevel) => void
  onGradeOrProgram: (v: string) => void
  onLearningGoals: (v: string) => void
}) {
  return (
    <div className="space-y-4 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Student details</p>
      <div>
        <label className="text-xs font-semibold text-gray-600">Education level</label>
        <select
          required
          value={educationLevel}
          onChange={(e) => onEducationLevel(e.target.value as StudentEducationLevel)}
          className={inputClass}
        >
          <option value="" disabled>Select</option>
          {STUDENT_EDUCATION_LEVELS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Class / program</label>
        <input
          required
          value={gradeOrProgram}
          onChange={(e) => onGradeOrProgram(e.target.value)}
          placeholder="e.g. Class 12, B.Tech 2nd year, UPSC prep"
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">What do you want to learn?</label>
        <textarea
          required
          rows={3}
          value={learningGoals}
          onChange={(e) => onLearningGoals(e.target.value)}
          placeholder="Skills, subjects, career goals…"
          className={inputClass}
        />
      </div>
    </div>
  )
}

export function MentorOnboardingFields({
  expertise,
  experienceYears,
  qualifications,
  bio,
  portfolioUrl,
  onExpertise,
  onExperienceYears,
  onQualifications,
  onBio,
  onPortfolioUrl,
}: {
  expertise: string
  experienceYears: string
  qualifications: string
  bio: string
  portfolioUrl: string
  onExpertise: (v: string) => void
  onExperienceYears: (v: string) => void
  onQualifications: (v: string) => void
  onBio: (v: string) => void
  onPortfolioUrl: (v: string) => void
}) {
  return (
    <div className="space-y-4 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Mentor details</p>
      <div>
        <label className="text-xs font-semibold text-gray-600">Subjects / expertise</label>
        <input
          required
          value={expertise}
          onChange={(e) => onExpertise(e.target.value)}
          placeholder="e.g. Web development, JEE Maths, Spoken English"
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Years of teaching / industry experience</label>
        <input
          required
          type="number"
          min={0}
          max={60}
          value={experienceYears}
          onChange={(e) => onExperienceYears(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Qualifications</label>
        <input
          required
          value={qualifications}
          onChange={(e) => onQualifications(e.target.value)}
          placeholder="Degrees, certifications"
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Short bio</label>
        <textarea
          required
          rows={3}
          value={bio}
          onChange={(e) => onBio(e.target.value)}
          placeholder="How you teach and what students gain"
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">LinkedIn or portfolio URL</label>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => onPortfolioUrl(e.target.value)}
          placeholder="https://linkedin.com/in/…"
          className={inputClass}
        />
      </div>
    </div>
  )
}

export const onboardingInputClass = inputClass
