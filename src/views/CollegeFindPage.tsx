'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { MatchResultCard } from '../components/colleges/MatchResultCard'
import { useColleges } from '../hooks/useColleges'
import {
  defaultFinderPreferences,
  matchColleges,
  POPULAR_COMPANY_SUGGESTIONS,
  uniqueCompanies,
  uniqueCourses,
  uniqueEntrances,
  uniqueStates,
} from '../lib/colleges'
import type { CollegeFinderPreferences, OwnershipPreference } from '../lib/colleges/types'

const STEPS = [
  'course',
  'budget',
  'location',
  'ownership',
  'entrance',
  'hostel',
  'companies',
  'priorities',
  'results',
] as const

type Step = (typeof STEPS)[number]

export function CollegeFindPage() {
  const { colleges, loading } = useColleges()
  const [stepIndex, setStepIndex] = useState(0)
  const [prefs, setPrefs] = useState<CollegeFinderPreferences>(defaultFinderPreferences())
  const [companyInput, setCompanyInput] = useState('')

  const step = STEPS[stepIndex] ?? 'results'
  const courseOptions = useMemo(() => uniqueCourses(colleges), [colleges])
  const stateOptions = useMemo(() => uniqueStates(colleges), [colleges])
  const entranceOptions = useMemo(() => uniqueEntrances(colleges), [colleges])
  const companyOptions = useMemo(() => uniqueCompanies(colleges), [colleges])

  const companySuggestions = useMemo(() => {
    const q = companyInput.trim().toLowerCase()
    if (!q) return []
    return companyOptions
      .filter(
        (c) =>
          c.toLowerCase().includes(q) &&
          !prefs.targetCompanies.some((selected) => selected.toLowerCase() === c.toLowerCase()),
      )
      .slice(0, 5)
  }, [companyInput, companyOptions, prefs.targetCompanies])

  const matches = useMemo(() => {
    if (step !== 'results') return []
    return matchColleges(colleges, prefs)
  }, [colleges, prefs, step])

  function setPref<K extends keyof CollegeFinderPreferences>(
    key: K,
    value: CollegeFinderPreferences[K],
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1)
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  function toggleCompany(name: string) {
    setPrefs((prev) => {
      const has = prev.targetCompanies.includes(name)
      return {
        ...prev,
        targetCompanies: has
          ? prev.targetCompanies.filter((c) => c !== name)
          : [...prev.targetCompanies, name],
      }
    })
  }

  function addCompanyFromInput() {
    const name = companyInput.trim()
    if (!name) return
    if (!prefs.targetCompanies.includes(name)) {
      setPref('targetCompanies', [...prefs.targetCompanies, name])
    }
    setCompanyInput('')
  }

  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main
        className={`flex-1 w-full py-8 sm:py-10 ${
          step === 'results'
            ? 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10'
            : 'max-w-3xl mx-auto px-4 sm:px-6'
        }`}
      >
        <Link
          to="/colleges"
          className="text-sm text-gray-500 hover:text-educture-orange inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          All colleges
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-educture-orange shrink-0" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#1a1a1a]">
              {step === 'results' ? 'Colleges for you' : 'Find your match'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 'results'
                ? "Tap I'm interested — a counsellor will contact you."
                : `Step ${stepIndex + 1} of ${STEPS.length}`}
            </p>
          </div>
        </div>

        {step !== 'results' && (
          <div className="mt-4 h-2 rounded-full bg-orange-100 overflow-hidden">
            <div
              className="h-full bg-educture-orange transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div
          className={
            step === 'results'
              ? 'mt-8 sm:mt-10'
              : 'mt-8 rounded-2xl border-[3px] border-orange-100 bg-white p-6 sm:p-8'
          }
        >
          {loading && step !== 'results' ? (
            <p className="text-gray-500">Loading colleges…</p>
          ) : (
            <>
              {step === 'course' && (
                <StepBlock title="Which course do you want?" subtitle="Pick the programme you're targeting.">
                  <select
                    value={prefs.course}
                    onChange={(e) => setPref('course', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <option value="">Select a course</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type a course name…"
                    value={prefs.course}
                    onChange={(e) => setPref('course', e.target.value)}
                    className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />
                </StepBlock>
              )}

              {step === 'budget' && (
                <StepBlock title="What's your budget?" subtitle="Maximum annual tuition fee (INR).">
                  <input
                    type="range"
                    min={10000}
                    max={3500000}
                    step={10000}
                    value={prefs.budget}
                    onChange={(e) => setPref('budget', Number(e.target.value))}
                    className="w-full accent-educture-orange"
                  />
                  <p className="text-center text-2xl font-bold text-educture-orange mt-4">
                    ₹{prefs.budget.toLocaleString('en-IN')} / year
                  </p>
                </StepBlock>
              )}

              {step === 'location' && (
                <StepBlock title="Preferred location?" subtitle="State and city help us rank nearby options.">
                  <select
                    value={prefs.state}
                    onChange={(e) => setPref('state', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <option value="">Any state</option>
                    {stateOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Preferred city (optional)"
                    value={prefs.city}
                    onChange={(e) => setPref('city', e.target.value)}
                    className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />
                </StepBlock>
              )}

              {step === 'ownership' && (
                <StepBlock title="Government or private?" subtitle="Choose your preferred institution type.">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {(['any', 'government', 'private'] as OwnershipPreference[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPref('ownership', v)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                          prefs.ownership === v
                            ? 'border-educture-orange bg-orange-50 text-educture-orange'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 'entrance' && (
                <StepBlock title="Entrance exam & score" subtitle="Which exam are you taking or have cleared?">
                  <select
                    value={prefs.entranceExam}
                    onChange={(e) => setPref('entranceExam', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <option value="">Not sure / skip</option>
                    {entranceOptions.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Marks, rank, or percentile (optional)"
                    value={prefs.marksOrScore}
                    onChange={(e) => setPref('marksOrScore', e.target.value)}
                    className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />
                </StepBlock>
              )}

              {step === 'hostel' && (
                <StepBlock title="Do you need a hostel?" subtitle="We'll prioritise colleges with on-campus housing.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPref('hostelRequired', true)}
                      className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold ${
                        prefs.hostelRequired
                          ? 'border-educture-orange bg-orange-50 text-educture-orange'
                          : 'border-gray-200'
                      }`}
                    >
                      Yes, hostel required
                    </button>
                    <button
                      type="button"
                      onClick={() => setPref('hostelRequired', false)}
                      className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold ${
                        !prefs.hostelRequired
                          ? 'border-educture-orange bg-orange-50 text-educture-orange'
                          : 'border-gray-200'
                      }`}
                    >
                      No, not required
                    </button>
                  </div>
                </StepBlock>
              )}

              {step === 'companies' && (
                <StepBlock
                  title="Target companies"
                  subtitle="Type a company name or pick from popular ones. We'll find colleges where they recruit."
                >
                  {prefs.targetCompanies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prefs.targetCompanies.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCompany(c)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-educture-orange bg-orange-50 text-educture-orange"
                        >
                          {c}
                          <span aria-hidden>×</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type company name — e.g. Google, TCS, Deloitte…"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCompanyFromInput()
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    />
                    {companySuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        {companySuggestions.map((c) => (
                          <li key={c}>
                            <button
                              type="button"
                              onClick={() => {
                                toggleCompany(c)
                                setCompanyInput('')
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-educture-orange"
                            >
                              {c}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3 mb-2">Popular picks</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_COMPANY_SUGGESTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCompany(c)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                          prefs.targetCompanies.includes(c)
                            ? 'border-educture-orange bg-orange-50 text-educture-orange'
                            : 'border-gray-200 text-gray-600 hover:border-orange-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === 'priorities' && (
                <StepBlock title="What matters most?" subtitle="Slide to set importance (1 = low, 5 = high).">
                  <ImportanceSlider
                    label="Placements"
                    value={prefs.placementImportance}
                    onChange={(v) => setPref('placementImportance', v)}
                  />
                  <ImportanceSlider
                    label="Fees / affordability"
                    value={prefs.feesImportance}
                    onChange={(v) => setPref('feesImportance', v)}
                  />
                  <ImportanceSlider
                    label="Location"
                    value={prefs.locationImportance}
                    onChange={(v) => setPref('locationImportance', v)}
                  />
                </StepBlock>
              )}

              {step === 'results' && (
                <div>
                  {matches.length === 0 ? (
                    <p className="text-gray-600">
                      No colleges found. Try going back and broadening filters.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                      {matches.map((m, index) => (
                        <MatchResultCard key={m.college.slug} match={m} rank={index + 1} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step !== 'results' && (
            <div className="mt-8 flex justify-between gap-4">
              <button
                type="button"
                onClick={back}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={step === 'course' && !prefs.course.trim()}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-educture-orange text-white text-sm font-semibold disabled:opacity-40"
              >
                {stepIndex === STEPS.length - 2 ? 'See matches' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'results' && (
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-orange-100/80 pt-6">
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="text-sm font-semibold text-educture-orange hover:underline"
              >
                Start over
              </button>
              <Link
                to="/colleges"
                className="text-sm font-semibold text-gray-500 hover:text-educture-orange"
              >
                Browse all colleges
              </Link>
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="font-display text-xl text-[#1a1a1a]">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">{subtitle}</p>
      {children}
    </div>
  )
}

function ImportanceSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block mb-6 last:mb-0">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-educture-orange font-bold">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-educture-orange"
      />
    </label>
  )
}
