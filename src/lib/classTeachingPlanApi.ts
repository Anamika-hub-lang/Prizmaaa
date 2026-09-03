import type { PricingPaymentTier } from '../data/pricingPlans'

export type TeachingPlanTier = PricingPaymentTier

export type TeachingPlanRow = {
  tier: TeachingPlanTier
  topics: string[]
  notes: string
  customized: boolean
  updatedAt: string | null
}

export type TeachingPlanResponse = {
  classId: string
  classTitle: string
  plans: TeachingPlanRow[]
  setupRequired?: boolean
  error?: string
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
          ? row.topics.map((t) => String(t ?? '').trim()).filter(Boolean)
          : [],
        notes: row.notes ? String(row.notes) : '',
        customized: Boolean(row.customized),
        updatedAt: row.updatedAt ? String(row.updatedAt) : null,
      } satisfies TeachingPlanRow
    })
    .filter((row): row is TeachingPlanRow => row !== null)
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
    topics: string[]
    notes?: string
  },
): Promise<TeachingPlanRow> {
  const data = await authFetch('/api/mentor/teaching-plan', getToken, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  const plan = data.plan as Record<string, unknown> | undefined
  if (!plan) throw new Error('Save succeeded but plan was missing in response')
  const tier = String(plan.tier ?? input.planTier)
  if (tier !== 'monthly' && tier !== 'three-month' && tier !== 'six-month') {
    throw new Error('Invalid plan tier in response')
  }
  return {
    tier,
    topics: Array.isArray(plan.topics)
      ? plan.topics.map((t) => String(t ?? '').trim()).filter(Boolean)
      : input.topics,
    notes: plan.notes ? String(plan.notes) : '',
    customized: true,
    updatedAt: plan.updatedAt ? String(plan.updatedAt) : null,
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
