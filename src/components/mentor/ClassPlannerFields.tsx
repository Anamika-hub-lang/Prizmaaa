'use client'

import { Download, Plus, Trash2 } from 'lucide-react'
import {
  coursePlanBlueprintOrder,
  coursePlanBlueprints,
} from '../../data/coursePlanBlueprint'
import type { PricingPaymentTier } from '../../data/pricingPlans'
import {
  emptyTeachingPlanTopic,
  type PlannerCardDraft,
  type PlannerTopicDraft,
  type TeachingPlanTier,
} from '../../lib/classTeachingPlanApi'
import { downloadPlannerTemplatePdf } from '../../lib/plannerTemplatePdf'
import { TopicLogoBar } from './TopicLogoBar'

const tierLabels: Record<TeachingPlanTier, string> = {
  monthly: '1 Month planner',
  'three-month': '3 Month planner',
  'six-month': '6 Month planner',
}

export function ClassPlannerFields({
  classTitle,
  drafts,
  onChange,
}: {
  classTitle: string
  drafts: Record<TeachingPlanTier, PlannerCardDraft>
  onChange: (tier: TeachingPlanTier, patch: Partial<PlannerCardDraft>) => void
}) {
  return (
    <div className="sm:col-span-2 min-w-0 space-y-4">
      <p className="text-xs font-semibold text-gray-600">
        1 / 3 / 6 month planners
        <span className="font-normal text-gray-500">
          {' '}
          — download a template, list topics, then enter them here with an optional description and
          logo.
        </span>
      </p>
      {coursePlanBlueprintOrder.map((tier) => (
        <PlannerCard
          key={tier}
          tier={tier}
          classTitle={classTitle}
          draft={drafts[tier]}
          onChange={(patch) => onChange(tier, patch)}
        />
      ))}
    </div>
  )
}

function PlannerCard({
  tier,
  classTitle,
  draft,
  onChange,
}: {
  tier: PricingPaymentTier
  classTitle: string
  draft: PlannerCardDraft
  onChange: (patch: Partial<PlannerCardDraft>) => void
}) {
  const blueprint = coursePlanBlueprints[tier]

  function updateTopic(index: number, patch: Partial<PlannerTopicDraft>) {
    onChange({
      topics: draft.topics.map((topic, i) => (i === index ? { ...topic, ...patch } : topic)),
    })
  }

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-3 sm:p-4 space-y-3 min-w-0">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1d1d1d]">{tierLabels[tier]}</p>
          <p className="text-xs text-gray-500 mt-0.5">{blueprint.mainPurpose}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            void downloadPlannerTemplatePdf({
              tier,
              classTitle,
            })
          }
          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 sm:py-1.5 text-xs font-semibold text-educture-orange hover:border-educture-orange"
        >
          <Download className="w-3.5 h-3.5" />
          Download template PDF
        </button>
      </div>

      <label className="block text-xs font-semibold text-gray-600 min-w-0">
        Upload filled planner PDF (optional, max 4 MB)
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="mt-1 block w-full max-w-full overflow-hidden text-xs text-gray-700 file:mr-2 file:rounded-md file:border-0 file:bg-orange-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-educture-orange"
          onChange={(e) => {
            onChange({ pdfFile: e.target.files?.[0] ?? null })
          }}
        />
      </label>
      {draft.pdfFile ? (
        <p className="text-[11px] text-gray-500 truncate">Selected: {draft.pdfFile.name}</p>
      ) : draft.plannerPdfName ? (
        <p className="text-[11px] text-gray-500 truncate">
          Saved PDF: {draft.plannerPdfName}
          {draft.plannerPdfUrl ? (
            <>
              {' '}
              ·{' '}
              <a
                href={draft.plannerPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-educture-orange font-semibold hover:underline"
              >
                Open
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="space-y-3">
        {draft.topics.map((topic, index) => (
          <div key={`${tier}-${index}`} className="rounded-xl border border-gray-100 bg-[#fffaf6] p-3 space-y-2 min-w-0">
            <TopicLogoBar
              logoKey={topic.logoKey}
              logoUrl={topic.logoUrl}
              pendingFile={topic.pendingLogoFile}
              onChange={(next) =>
                updateTopic(index, {
                  logoKey: next.logoKey,
                  logoUrl: next.logoUrl,
                  pendingLogoFile: next.pendingFile,
                })
              }
            />
            <div className="flex items-start gap-2 min-w-0">
              <div className="flex-1 space-y-2 min-w-0">
                <input
                  value={topic.title}
                  onChange={(e) => updateTopic(index, { title: e.target.value })}
                  placeholder={`Topic ${index + 1}`}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange"
                />
                <input
                  value={topic.description}
                  onChange={(e) => updateTopic(index, { description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange"
                />
              </div>
              <button
                type="button"
                aria-label="Remove topic"
                onClick={() =>
                  onChange({ topics: draft.topics.filter((_, i) => i !== index) })
                }
                className="p-2 text-gray-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange({ topics: [...draft.topics, emptyTeachingPlanTopic()] })}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-educture-orange hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        Add topic
      </button>

      <label className="block text-xs font-semibold text-gray-600">
        Notes for this plan (optional)
        <textarea
          value={draft.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Session pacing, tools, guest sessions…"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-educture-orange resize-y"
        />
      </label>
    </div>
  )
}
