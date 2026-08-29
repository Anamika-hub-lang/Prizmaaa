import type { CategoryPricingMap, PricingCategoryId } from '../data/pricingPlans'

async function authFetch(path: string, getToken: () => Promise<string | null>, init?: RequestInit) {
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

export async function fetchPublicPricing(): Promise<CategoryPricingMap> {
  const res = await fetch('/api/pricing')
  const data = (await res.json()) as { pricing: CategoryPricingMap }
  return data.pricing
}

export async function saveAdminPricing(
  getToken: () => Promise<string | null>,
  pricing: CategoryPricingMap,
): Promise<CategoryPricingMap> {
  const data = await authFetch('/api/admin/pricing', getToken, {
    method: 'PUT',
    body: JSON.stringify({ pricing }),
  })
  return data.pricing as CategoryPricingMap
}

export const ADMIN_PRICING_CATEGORIES: { id: PricingCategoryId; label: string }[] = [
  { id: 'academic', label: 'Academic' },
  { id: 'professional', label: 'Professional' },
  { id: 'skills', label: 'Skills' },
]
