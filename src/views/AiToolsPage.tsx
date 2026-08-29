'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Brain, FileUp, Loader2, Sparkles, Target, Upload } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { AiFeaturePanel } from '../components/marketing/AiFeaturePanel'
import { AiFeatureToggle } from '../components/marketing/AiFeatureToggle'
import { AiResultMarkdown } from '../components/marketing/AiResultMarkdown'
import {
  aiFeatureById,
  defaultAiFeatureId,
  enabledAiFeatures,
  isAiFeatureId,
  type AiFeatureId,
} from '../data/aiFeatures'
import { OpportunityMatchResults } from '../components/marketing/OpportunityMatchResults'
import { OpportunityVoiceMic } from '../components/marketing/OpportunityVoiceMic'
import {
  matchOpportunitiesWithAi,
  reviewResumeWithAi,
  type OpportunityMatchResult,
  type OpportunityProfile,
} from '../lib/aiToolsApi'

export function AiToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const features = enabledAiFeatures
  const toolParam = searchParams.get('tool') ?? ''
  const initialId = isAiFeatureId(toolParam) && features.some((f) => f.id === toolParam)
    ? toolParam
    : defaultAiFeatureId()

  const [activeId, setActiveId] = useState<AiFeatureId>(initialId)
  const [resumeText, setResumeText] = useState('')
  const [stream, setStream] = useState('')
  const [year, setYear] = useState('')
  const [skills, setSkills] = useState('')
  const [goals, setGoals] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [matchResult, setMatchResult] = useState<OpportunityMatchResult | null>(null)

  const feature = useMemo(
    () => aiFeatureById(activeId) ?? features[0],
    [activeId, features],
  )

  useEffect(() => {
    if (isAiFeatureId(toolParam) && features.some((f) => f.id === toolParam)) {
      setActiveId(toolParam)
    }
  }, [toolParam, features])

  function selectTool(id: AiFeatureId) {
    setActiveId(id)
    setSearchParams({ tool: id }, { replace: true })
    setError(null)
    setResult(null)
    setMatchResult(null)
  }

  async function handleResumeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setMatchResult(null)
    setLoading(true)
    try {
      const { result: text } = await reviewResumeWithAi(resumeText)
      setResult(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleMatchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setMatchResult(null)
    setLoading(true)
    try {
      const payload = await matchOpportunitiesWithAi({ stream, year, skills, goals: goals || undefined })
      setMatchResult(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching failed')
    } finally {
      setLoading(false)
    }
  }

  function applyVoiceProfile(profile: OpportunityProfile) {
    if (profile.stream) setStream(profile.stream)
    if (profile.year) setYear(profile.year)
    if (profile.skills) setSkills(profile.skills)
    if (profile.goals) setGoals(profile.goals)
    setError(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setResumeText(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (features.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <MainNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-sm text-gray-500">AI tools are not enabled on this deployment.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            Back to home
          </Link>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <MainNavbar />

      <main className="flex-1">
        <section className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mt-5">
              <div>
                <p className="text-indigo-300 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  PRIZMA AI · Free
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mt-2 leading-tight">
                  AI tools for your{' '}
                  <span className="font-script text-indigo-400 text-3xl sm:text-4xl">student journey</span>
                </h1>
                <p className="text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
                  Toggle between resume review and opportunity matching — powered by AI, built for Indian students.
                </p>
              </div>
              <AiFeatureToggle features={features} activeId={activeId} onChange={selectTool} />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AiFeaturePanel
              features={features}
              activeId={activeId}
              onChange={selectTool}
              variant="dark"
              showToggle={false}
            />
          </div>
        </section>

        {feature && (
          <section className="py-8 sm:py-10 bg-white" id="try">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              {feature.id === 'resume-review' ? (
                <form
                  onSubmit={(e) => void handleResumeSubmit(e)}
                  className="rounded-3xl border-[3px] border-indigo-100 bg-indigo-50/30 p-6 sm:p-8 text-left space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <FileUp className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl text-[#1a1a1a]">Resume + profile review</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Paste text or upload a .txt file</p>
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-2xl border-2 border-dashed border-indigo-200 bg-white px-6 py-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                  >
                    <Upload className="w-7 h-7 text-indigo-400 mx-auto" />
                    <p className="mt-2 text-sm font-semibold text-gray-800">Upload .txt resume</p>
                    <p className="text-xs text-gray-500 mt-1">Or paste below · PDF? copy-paste text for now</p>
                  </button>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Resume text</label>
                    <textarea
                      required
                      rows={10}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your full resume here — education, projects, skills, experience…"
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none resize-y focus:border-indigo-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || resumeText.trim().length < 80}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing with AI…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze gaps & improvements
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => void handleMatchSubmit(e)}
                  className="rounded-3xl border-[3px] border-indigo-100 bg-indigo-50/30 p-6 sm:p-8 text-left space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Target className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl text-[#1a1a1a]">Opportunity matcher</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Internships · scholarships · courses · competitions
                      </p>
                    </div>
                  </div>
                  <OpportunityVoiceMic onFilled={applyVoiceProfile} disabled={loading} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Stream / degree</label>
                      <input
                        required
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        placeholder="e.g. B.Tech CSE, B.Com"
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Year</label>
                      <input
                        required
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g. 2nd year"
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Skills & interests</label>
                    <textarea
                      required
                      rows={3}
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Python, React, design, startups, research…"
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none resize-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Goals (optional)</label>
                    <input
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      placeholder="e.g. summer internship in product, scholarship for masters"
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Finding matches…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Match opportunities with AI
                      </>
                    )}
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600 rounded-xl border border-red-100 bg-red-50 px-4 py-3" role="alert">
                  {error}
                </p>
              )}

              {matchResult && (
                <div className="mt-6">
                  <OpportunityMatchResults result={matchResult} />
                </div>
              )}

              {result && (
                <div className="mt-6 rounded-3xl border-2 border-indigo-100 bg-white p-6 sm:p-8 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4">AI results</p>
                  <AiResultMarkdown content={result} />
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <MarketingFooter />
    </div>
  )
}
