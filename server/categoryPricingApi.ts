import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_CATEGORY_PRICING,
  type CategoryPricingMap,
  type PricingCategoryId,
  fetchCategoryPricingMap,
  upsertCategoryPricing,
} from './lib/pricingServer'

type Env = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
}

type Helpers = {
  json: (res: ServerResponse, status: number, body: unknown) => void
  verifyClerkSession: (req: IncomingMessage, clerkSecretKey: string) => Promise<string | null>
  requireSupabaseAdmin: (env: Env) => SupabaseClient | null
  isAdminClerkUser: (clerkId: string, env: Env) => Promise<boolean>
  readBodyJson: (req: IncomingMessage) => Promise<unknown>
}

const CATEGORIES: PricingCategoryId[] = ['skills', 'professional', 'academic']

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

async function handlePublicGet(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 200, { pricing: DEFAULT_CATEGORY_PRICING, source: 'defaults' })
    return
  }
  try {
    const pricing = await fetchCategoryPricingMap(supabase)
    helpers.json(res, 200, { pricing, source: 'database' })
  } catch (err) {
    const error = err as { code?: string; message?: string }
    if (isMissingTable(error)) {
      helpers.json(res, 200, {
        pricing: DEFAULT_CATEGORY_PRICING,
        source: 'defaults',
        hint: 'Run supabase/category-pricing.sql in the Supabase SQL Editor.',
      })
      return
    }
    helpers.json(res, 200, { pricing: DEFAULT_CATEGORY_PRICING, source: 'defaults' })
  }
}

async function handleAdminPut(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  if (!env.clerkSecretKey) {
    helpers.json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }
  const clerkId = await helpers.verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    helpers.json(res, 401, { error: 'Sign in required' })
    return
  }
  if (!(await helpers.isAdminClerkUser(clerkId, env))) {
    helpers.json(res, 403, { error: 'Admin only' })
    return
  }
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const body = (await helpers.readBodyJson(req)) as {
    pricing?: Partial<Record<PricingCategoryId, Partial<CategoryPricingMap[PricingCategoryId]>>>
  }

  const incoming = body.pricing
  if (!incoming || typeof incoming !== 'object') {
    helpers.json(res, 400, { error: 'pricing object is required' })
    return
  }

  const current = await fetchCategoryPricingMap(supabase).catch(() => DEFAULT_CATEGORY_PRICING)
  const next: CategoryPricingMap = {
    skills: { ...current.skills },
    professional: { ...current.professional },
    academic: { ...current.academic },
  }

  for (const id of CATEGORIES) {
    const patch = incoming[id]
    if (!patch) continue
    const monthly = Number(patch.monthlyInr)
    const three = Number(patch.threeMonthInr)
    const six = Number(patch.sixMonthInr)
    if (![monthly, three, six].every((n) => Number.isFinite(n) && n >= 1 && n <= 1_000_000)) {
      helpers.json(res, 400, {
        error: `Invalid amounts for ${id}. Use whole rupees between 1 and 1000000.`,
      })
      return
    }
    next[id] = {
      title: typeof patch.title === 'string' && patch.title.trim() ? patch.title.trim() : next[id].title,
      monthlyInr: Math.round(monthly),
      threeMonthInr: Math.round(three),
      sixMonthInr: Math.round(six),
      image: typeof patch.image === 'string' && patch.image.trim() ? patch.image.trim() : next[id].image,
    }
  }

  try {
    await upsertCategoryPricing(supabase, next, clerkId)
  } catch (err) {
    const error = err as { code?: string; message?: string }
    if (isMissingTable(error)) {
      helpers.json(res, 503, {
        error: 'Pricing table missing. Run supabase/category-pricing.sql in the Supabase SQL Editor.',
      })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not save pricing' })
    return
  }

  helpers.json(res, 200, { ok: true, pricing: next })
}

export function tryHandleCategoryPricingApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/pricing' || path === '/api/pricing/categories') {
    void handlePublicGet(req, res, env, helpers).catch((err) => {
      console.error('[category-pricing] get', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/admin/pricing') {
    void handleAdminPut(req, res, env, helpers).catch((err) => {
      console.error('[category-pricing] put', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  return false
}
