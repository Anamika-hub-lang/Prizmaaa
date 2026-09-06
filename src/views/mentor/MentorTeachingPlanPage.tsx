'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Check, RefreshCw } from 'lucide-react'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { useMentorContent } from '../../context/MentorContentContext'
import { dashboardCardBorder } from '../../components/ui/dashboardCardStyles'
import { ClassPlannerFields } from '../../components/mentor/ClassPlannerFields'
import {
  draftsFromTeachingPlans,
  emptyPlannerDrafts,
  fetchMentorTeachingPlans,
  persistPlannerDrafts,
  type PlannerCardDraft,
  type TeachingPlanTier,
} from '../../lib/classTeachingPlanApi'

export function MentorTeachingPlanPage() {
  const { getToken } = useAuth()
  const { myPublishedClasses, loading: classesLoading } = useMentorContent()
  const [classId, setClassId] = useState('')
  const [classTitle, setClassTitle] = useState('')
  const [planners, setPlanners] = useState(emptyPlannerDrafts)
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

  const patchPlanner = (tier: TeachingPlanTier, patch: Partial<PlannerCardDraft>) => {
    setPlanners((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], ...patch },
    }))
    setSaved(false)
  }

  const load = useCallback(async () => {
    if (!classId) {
      setPlanners(emptyPlannerDrafts())
      setClassTitle('')
      return
    }
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const data = await fetchMentorTeachingPlans(getToken, classId)
      setClassTitle(data.classTitle)
      setPlanners(draftsFromTeachingPlans(data.plans))
      setSetupHint(data.setupRequired ? data.error ?? null : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load teaching plans')
      setPlanners(emptyPlannerDrafts())
    } finally {
      setLoading(false)
    }
  }, [classId, getToken])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    if (!classId) return
    const hasContent = (['monthly', 'three-month', 'six-month'] as const).some((tier) => {
      const draft = planners[tier]
      return draft.topics.some((t) => t.title.trim()) || Boolean(draft.pdfFile)
    })
    if (!hasContent) {
      setError('Add at least one topic or upload a planner PDF before saving.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await persistPlannerDrafts(getToken, classId, planners)
      await load()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save teaching plan')
    } finally {
      setSaving(false)
    }
  }

  const selectedClass = myPublishedClasses.find((c) => c.id === classId)

  return (
    <div>
      <MentorPageHeader
        title="Teaching plan"
        subtitle="Same 1 / 3 / 6 month planners as class create — template PDF, topics with optional description and logo, then save for enrolled students."
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

        {!loading && !classesLoading && classId ? (
          <div className="space-y-5">
            <ClassPlannerFields
              classTitle={classTitle || selectedClass?.title || ''}
              drafts={planners}
              onChange={patchPlanner}
            />

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
              {saving ? 'Saving…' : 'Save planners'}
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
