'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Check, GripVertical, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { useMentorContent } from '../../context/MentorContentContext'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import {
  coursePlanBlueprintOrder,
  coursePlanBlueprints,
} from '../../data/coursePlanBlueprint'
import type { PricingPaymentTier } from '../../data/pricingPlans'
import {
  fetchMentorTeachingPlans,
  saveMentorTeachingPlan,
  type TeachingPlanRow,
} from '../../lib/classTeachingPlanApi'

const tierLabels: Record<PricingPaymentTier, string> = {
  monthly: '1 Month',
  'three-month': '3 Month',
  'six-month': '6 Month',
}

function emptyPlansFromBlueprint(): TeachingPlanRow[] {
  return coursePlanBlueprintOrder.map((tier) => ({
    tier,
    topics: [...coursePlanBlueprints[tier].syllabusDepth],
    notes: '',
    customized: false,
    updatedAt: null,
  }))
}

export function MentorTeachingPlanPage() {
  const { getToken } = useAuth()
  const { myPublishedClasses, loading: classesLoading } = useMentorContent()
  const [classId, setClassId] = useState('')
  const [classTitle, setClassTitle] = useState('')
  const [plans, setPlans] = useState<TeachingPlanRow[]>(emptyPlansFromBlueprint)
  const [activeTier, setActiveTier] = useState<PricingPaymentTier>('monthly')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupHint, setSetupHint] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!classId && myPublishedClasses.length > 0) {
      setClassId(myPublishedClasses[0]!.id)
    }
  }, [classId, myPublishedClasses])

  const activePlan = useMemo(
    () => plans.find((p) => p.tier === activeTier) ?? plans[0],
    [plans, activeTier],
  )

  const blueprint = coursePlanBlueprints[activeTier]

  const load = useCallback(async () => {
    if (!classId) {
      setPlans(emptyPlansFromBlueprint())
      setClassTitle('')
      return
    }
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const data = await fetchMentorTeachingPlans(getToken, classId)
      setClassTitle(data.classTitle)
      setPlans(data.plans.length > 0 ? data.plans : emptyPlansFromBlueprint())
      setSetupHint(data.setupRequired ? data.error ?? null : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load teaching plans')
      setPlans(emptyPlansFromBlueprint())
    } finally {
      setLoading(false)
    }
  }, [classId, getToken])

  useEffect(() => {
    void load()
  }, [load])

  function updateActivePlan(patch: Partial<TeachingPlanRow>) {
    setPlans((prev) =>
      prev.map((p) => (p.tier === activeTier ? { ...p, ...patch, customized: true } : p)),
    )
    setSaved(false)
  }

  function setTopic(index: number, value: string) {
    if (!activePlan) return
    const next = [...activePlan.topics]
    next[index] = value
    updateActivePlan({ topics: next })
  }

  function addTopic() {
    if (!activePlan) return
    updateActivePlan({ topics: [...activePlan.topics, ''] })
  }

  function removeTopic(index: number) {
    if (!activePlan) return
    updateActivePlan({ topics: activePlan.topics.filter((_, i) => i !== index) })
  }

  function moveTopic(index: number, direction: -1 | 1) {
    if (!activePlan) return
    const target = index + direction
    if (target < 0 || target >= activePlan.topics.length) return
    const next = [...activePlan.topics]
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    updateActivePlan({ topics: next })
  }

  function resetToBlueprint() {
    updateActivePlan({
      topics: [...coursePlanBlueprints[activeTier].syllabusDepth],
      notes: '',
      customized: false,
      updatedAt: null,
    })
  }

  async function save() {
    if (!classId || !activePlan) return
    const topics = activePlan.topics.map((t) => t.trim()).filter(Boolean)
    if (topics.length === 0) {
      setError('Add at least one topic before saving.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const savedPlan = await saveMentorTeachingPlan(getToken, {
        classId,
        planTier: activeTier,
        topics,
        notes: activePlan.notes,
      })
      setPlans((prev) => prev.map((p) => (p.tier === activeTier ? savedPlan : p)))
      setSetupHint(null)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save teaching plan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <MentorPageHeader
        title="Teaching plan"
        subtitle="Set what will be taught for each class, aligned with the 1 / 3 / 6 month plan cards. Co-mentors can edit too."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div
          className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3`}
        >
          <label className="flex-1 text-xs font-semibold text-gray-500">
            Class
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm text-[#1d1d1d] bg-white outline-none"
            >
              {myPublishedClasses.length === 0 ? (
                <option value="">No published classes</option>
              ) : (
                myPublishedClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="sm:self-end inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-semibold text-gray-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {classId ? (
          <div className="flex flex-wrap gap-2">
            {coursePlanBlueprintOrder.map((tier) => {
              const row = plans.find((p) => p.tier === tier)
              const active = activeTier === tier
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    setActiveTier(tier)
                    setSaved(false)
                    setError(null)
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors ${
                    active
                      ? 'border-educture-orange bg-educture-orange text-white'
                      : 'border-orange-100 bg-white text-gray-600 hover:border-orange-200'
                  }`}
                >
                  {tierLabels[tier]}
                  {row?.customized ? ' · saved' : ''}
                </button>
              )
            })}
          </div>
        ) : null}

        {setupHint ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {setupHint}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {(classesLoading || loading) && (
          <p className="text-sm text-gray-500">Loading teaching plan…</p>
        )}

        {!loading && !classesLoading && classId && activePlan ? (
          <div className={`${dashboardCardBorder} border-orange-100 bg-white rounded-2xl p-5 sm:p-6 space-y-5`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-educture-orange">
                {classTitle || 'Class'} · {blueprint.name}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#1d1d1d]">{blueprint.mainPurpose}</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{blueprint.motive}</p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Goal:</span> {blueprint.goal}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Outcome:</span> {blueprint.outcome}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-[#1d1d1d]">What will be taught</h3>
                <button
                  type="button"
                  onClick={resetToBlueprint}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-educture-orange"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to plan card
                </button>
              </div>
              <div className="space-y-2">
                {activePlan.topics.map((topic, index) => (
                  <div key={`${activeTier}-${index}`} className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        aria-label="Move up"
                        onClick={() => moveTopic(index, -1)}
                        className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                        disabled={index === 0}
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      value={topic}
                      onChange={(e) => setTopic(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange"
                    />
                    <button
                      type="button"
                      aria-label="Remove topic"
                      onClick={() => removeTopic(index)}
                      className="p-2 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTopic}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-educture-orange hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add topic
              </button>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Notes for mentors (optional)
              <textarea
                value={activePlan.notes}
                onChange={(e) => updateActivePlan({ notes: e.target.value })}
                rows={3}
                placeholder="Session pacing, tools, guest sessions…"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange resize-y"
              />
            </label>

            {saved ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Saved — enrolled students can see this plan on the class page.
              </p>
            ) : null}

            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="w-full inline-flex items-center justify-center rounded-full bg-educture-orange px-5 py-3 text-sm font-semibold text-white hover:bg-educture-orange-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : `Save ${tierLabels[activeTier]} plan`}
            </button>
          </div>
        ) : null}

        {!classesLoading && myPublishedClasses.length === 0 ? (
          <div
            className={`${dashboardCardBorder} border-dashed border-orange-200 rounded-2xl bg-white p-8 text-center text-sm text-gray-500`}
          >
            Publish a class first, then set its teaching plan here.
          </div>
        ) : null}
      </div>
    </div>
  )
}
