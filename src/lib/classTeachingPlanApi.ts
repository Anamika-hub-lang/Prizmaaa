import type { PricingPaymentTier } from '../data/pricingPlans'
import { isTopicLogoKey } from '../data/topicLogoPresets'

export type TeachingPlanTier = PricingPaymentTier

export type TeachingPlanTopic = {
  title: string
  description: string
  logoKey: string | null
  logoUrl: string | null
}

export type PlannerTopicDraft = TeachingPlanTopic & {
  pendingLogoFile?: File | null
}

export type TeachingPlanRow = {
  tier: TeachingPlanTier
  topics: TeachingPlanTopic[]
  notes: string
  customized: boolean
  updatedAt: string | null
  plannerPdfUrl: string | null
  plannerPdfName: string | null
}

export type TeachingPlanResponse = {
  classId: string
  classTitle: string
  plans: TeachingPlanRow[]
  setupRequired?: boolean
  error?: string
}

export function emptyTeachingPlanTopic(title = ''): TeachingPlanTopic {
  return { title, description: '', logoKey: null, logoUrl: null }
}

export function parseTeachingPlanTopic(raw: unknown): TeachingPlanTopic | null {
  if (typeof raw === 'string') {
    const title = raw.trim()
    return title ? emptyTeachingPlanTopic(title) : null
  }
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const title = String(row.title ?? row.name ?? '').trim()
  if (!title) return null
  const logoKeyRaw = row.logoKey == null || row.logoKey === '' ? null : String(row.logoKey)
  return {
    title,
    description: String(row.description ?? '').trim(),
    logoKey: isTopicLogoKey(logoKeyRaw) ? logoKeyRaw : null,
    logoUrl: row.logoUrl ? String(row.logoUrl) : null,
  }
}

async function authFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    if (!res.ok) throw new Error(text.slice(0, 120) || `API error (${res.status})`)
  }
  if (!res.ok) throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  return data
}

function parsePlans(raw: unknown): TeachingPlanRow[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const tier = String(row.tier ?? '')
      if (tier !== 'monthly' && tier !== 'three-month' && tier !== 'six-month') return null
      return {
        tier,
        topics: Array.isArray(row.topics)
          ? row.topics.map(parseTeachingPlanTopic).filter((t): t is TeachingPlanTopic => t !== null)
          : [],
        notes: row.notes ? String(row.notes) : '',
        customized: Boolean(row.customized),
        updatedAt: row.updatedAt ? String(row.updatedAt) : null,
        plannerPdfUrl: row.plannerPdfUrl ? String(row.plannerPdfUrl) : null,
        plannerPdfName: row.plannerPdfName ? String(row.plannerPdfName) : null,
      } satisfies TeachingPlanRow
    })
    .filter((row): row is TeachingPlanRow => row !== null)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export async function fetchMentorTeachingPlans(
  getToken: () => Promise<string | null>,
  classId: string,
): Promise<TeachingPlanResponse> {
  const data = await authFetch(
    `/api/mentor/teaching-plan?classId=${encodeURIComponent(classId)}`,
    getToken,
  )
  return {
    classId: String(data.classId ?? classId),
    classTitle: String(data.classTitle ?? 'Class'),
    plans: parsePlans(data.plans),
    setupRequired: Boolean(data.setupRequired),
    error: data.error ? String(data.error) : undefined,
  }
}

export async function saveMentorTeachingPlan(
  getToken: () => Promise<string | null>,
  input: {
    classId: string
    planTier: TeachingPlanTier
    topics: TeachingPlanTopic[]
    notes?: string
    pdfFile?: File | null
  },
): Promise<TeachingPlanRow> {
  let pdfBase64: string | undefined
  let pdfFileName: string | undefined
  if (input.pdfFile) {
    if (input.pdfFile.type && input.pdfFile.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed')
    }
    if (input.pdfFile.size > 4 * 1024 * 1024) {
      throw new Error('PDF must be 4 MB or smaller')
    }
    pdfBase64 = await fileToBase64(input.pdfFile)
    pdfFileName = input.pdfFile.name || 'planner.pdf'
  }

  const data = await authFetch('/api/mentor/teaching-plan', getToken, {
    method: 'PUT',
    body: JSON.stringify({
      classId: input.classId,
      planTier: input.planTier,
      topics: input.topics,
      notes: input.notes,
      pdfBase64,
      pdfFileName,
    }),
  })
  const plan = data.plan as Record<string, unknown> | undefined
  if (!plan) throw new Error('Save succeeded but plan was missing in response')
  const parsed = parsePlans([plan])[0]
  if (!parsed) throw new Error('Invalid plan in response')
  return parsed
}

export async function uploadMentorTopicLogo(
  getToken: () => Promise<string | null>,
  input: {
    classId: string
    planTier: TeachingPlanTier
    file: File
  },
): Promise<string> {
  if (input.file.size > 1 * 1024 * 1024) {
    throw new Error('Logo must be 1 MB or smaller')
  }
  const type = input.file.type
  if (type && type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/webp') {
    throw new Error('Logo must be a PNG, JPEG, or WebP image')
  }
  const imageBase64 = await fileToBase64(input.file)
  const data = await authFetch('/api/mentor/topic-logo', getToken, {
    method: 'POST',
    body: JSON.stringify({
      classId: input.classId,
      planTier: input.planTier,
      imageBase64,
      fileName: input.file.name || 'logo.png',
    }),
  })
  const url = data.url ? String(data.url) : ''
  if (!url) throw new Error('Upload succeeded but logo URL was missing')
  return url
}

export type PlannerCardDraft = {
  topics: PlannerTopicDraft[]
  notes: string
  pdfFile: File | null
  plannerPdfUrl: string | null
  plannerPdfName: string | null
}

export function emptyPlannerDrafts(): Record<TeachingPlanTier, PlannerCardDraft> {
  return {
    monthly: {
      topics: [emptyTeachingPlanTopic()],
      notes: '',
      pdfFile: null,
      plannerPdfUrl: null,
      plannerPdfName: null,
    },
    'three-month': {
      topics: [emptyTeachingPlanTopic()],
      notes: '',
      pdfFile: null,
      plannerPdfUrl: null,
      plannerPdfName: null,
    },
    'six-month': {
      topics: [emptyTeachingPlanTopic()],
      notes: '',
      pdfFile: null,
      plannerPdfUrl: null,
      plannerPdfName: null,
    },
  }
}

export function draftsFromTeachingPlans(
  plans: TeachingPlanRow[],
): Record<TeachingPlanTier, PlannerCardDraft> {
  const next = emptyPlannerDrafts()
  for (const plan of plans) {
    next[plan.tier] = {
      topics:
        plan.customized && plan.topics.length > 0
          ? plan.topics.map((topic) => ({ ...topic, pendingLogoFile: null }))
          : [emptyTeachingPlanTopic()],
      notes: plan.notes,
      pdfFile: null,
      plannerPdfUrl: plan.plannerPdfUrl,
      plannerPdfName: plan.plannerPdfName,
    }
  }
  return next
}

export async function persistPlannerDrafts(
  getToken: () => Promise<string | null>,
  classId: string,
  drafts: Record<TeachingPlanTier, Pick<PlannerCardDraft, 'topics' | 'notes' | 'pdfFile'>>,
): Promise<void> {
  const errors: string[] = []
  const tiers: TeachingPlanTier[] = ['monthly', 'three-month', 'six-month']
  for (const tier of tiers) {
    const draft = drafts[tier]
    const topics: TeachingPlanTopic[] = []
    for (const topic of draft.topics) {
      const title = topic.title.trim()
      if (!title) continue
      let logoUrl = topic.logoUrl
      let logoKey = topic.logoKey
      if (topic.pendingLogoFile) {
        try {
          logoUrl = await uploadMentorTopicLogo(getToken, {
            classId,
            planTier: tier,
            file: topic.pendingLogoFile,
          })
          logoKey = null
        } catch (err) {
          errors.push(
            `${tier} logo (${title}): ${err instanceof Error ? err.message : 'upload failed'}`,
          )
        }
      }
      topics.push({
        title,
        description: topic.description.trim(),
        logoKey,
        logoUrl,
      })
    }
    if (topics.length === 0 && !draft.pdfFile) continue
    try {
      await saveMentorTeachingPlan(getToken, {
        classId,
        planTier: tier,
        topics,
        notes: draft.notes,
        pdfFile: draft.pdfFile,
      })
    } catch (err) {
      errors.push(`${tier}: ${err instanceof Error ? err.message : 'Could not save plan'}`)
    }
  }
  if (errors.length > 0) {
    throw new Error(`Could not save some planners: ${errors.join('; ')}`)
  }
}

export async function fetchStudentTeachingPlans(
  getToken: () => Promise<string | null>,
  classId: string,
): Promise<TeachingPlanResponse> {
  const data = await authFetch(
    `/api/student/teaching-plan?classId=${encodeURIComponent(classId)}`,
    getToken,
  )
  return {
    classId: String(data.classId ?? classId),
    classTitle: String(data.classTitle ?? 'Class'),
    plans: parsePlans(data.plans),
    setupRequired: Boolean(data.setupRequired),
  }
}
