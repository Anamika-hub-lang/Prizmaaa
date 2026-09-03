import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isActiveEnrollmentRow } from './lib/enrollmentPolicy'
import {
  isTeachingPlanTier,
  normalizeTopics,
  TEACHING_PLAN_TIERS,
  teachingPlanSyllabusSeed,
  type TeachingPlanTier,
} from './lib/coursePlanBlueprintSeed'

type Env = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
}

type Helpers = {
  json: (res: ServerResponse, status: number, body: unknown) => void
  verifyClerkSession: (req: IncomingMessage, clerkSecretKey: string) => Promise<string | null>
  requireSupabaseAdmin: (env: Env) => SupabaseClient | null
  readBodyJson: (req: IncomingMessage) => Promise<unknown>
}

const MISSING_SQL =
  'Teaching plan table missing. Run supabase/class-teaching-plans.sql in the Supabase SQL Editor.'

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

async function requireAuth(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<string | null> {
  if (!env.clerkSecretKey) {
    helpers.json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return null
  }
  const clerkId = await helpers.verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    helpers.json(res, 401, { error: 'Sign in required' })
    return null
  }
  return clerkId
}

async function canMentorManageClass(
  supabase: SupabaseClient,
  classId: string,
  clerkId: string,
): Promise<{ ok: true; title: string } | { ok: false }> {
  const { data: cls } = await supabase
    .from('classes')
    .select('id, title, mentor_clerk_id')
    .eq('id', classId)
    .maybeSingle()
  if (!cls) return { ok: false }
  if (String(cls.mentor_clerk_id ?? '') === clerkId) {
    return { ok: true, title: String(cls.title ?? 'Class') }
  }
  const { data: share } = await supabase
    .from('class_co_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_clerk_id', clerkId)
    .maybeSingle()
  if (share) {
    return { ok: true, title: String(cls.title ?? 'Class') }
  }
  return { ok: false }
}

async function requireActiveEnrollment(
  supabase: SupabaseClient,
  clerkId: string,
  classId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('student_enrollments')
    .select('id, billing_status, status')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .maybeSingle()
  return Boolean(data && isActiveEnrollmentRow(data))
}

type PlanPayload = {
  tier: TeachingPlanTier
  topics: string[]
  notes: string
  customized: boolean
  updatedAt: string | null
}

async function loadPlansForClass(
  supabase: SupabaseClient,
  classId: string,
): Promise<{ plans: PlanPayload[]; missingTable: boolean }> {
  const { data, error } = await supabase
    .from('class_teaching_plans')
    .select('plan_tier, topics, notes, updated_at')
    .eq('class_id', classId)

  if (error) {
    if (isMissingTable(error)) {
      return {
        missingTable: true,
        plans: TEACHING_PLAN_TIERS.map((tier) => ({
          tier,
          topics: [...teachingPlanSyllabusSeed[tier]],
          notes: '',
          customized: false,
          updatedAt: null,
        })),
      }
    }
    throw error
  }

  const byTier = new Map<string, (typeof data)[number]>()
  for (const row of data ?? []) {
    byTier.set(String(row.plan_tier), row)
  }

  const plans: PlanPayload[] = TEACHING_PLAN_TIERS.map((tier) => {
    const row = byTier.get(tier)
    if (!row) {
      return {
        tier,
        topics: [...teachingPlanSyllabusSeed[tier]],
        notes: '',
        customized: false,
        updatedAt: null,
      }
    }
    const topics = normalizeTopics(row.topics)
    return {
      tier,
      topics: topics.length > 0 ? topics : [...teachingPlanSyllabusSeed[tier]],
      notes: row.notes ? String(row.notes) : '',
      customized: true,
      updatedAt: row.updated_at ? String(row.updated_at) : null,
    }
  })

  return { plans, missingTable: false }
}

async function handleMentorGet(
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
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const classId = (url.searchParams.get('classId') ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }

  const access = await canMentorManageClass(supabase, classId, clerkId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can view teaching plans' })
    return
  }

  try {
    const { plans, missingTable } = await loadPlansForClass(supabase, classId)
    helpers.json(res, 200, {
      classId,
      classTitle: access.title,
      plans,
      setupRequired: missingTable,
      error: missingTable ? MISSING_SQL : undefined,
    })
  } catch (err) {
    console.error('[teaching-plan] mentor get', err)
    helpers.json(res, 500, { error: 'Could not load teaching plans' })
  }
}

async function handleMentorPut(
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
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  let body: { classId?: string; planTier?: string; topics?: unknown; notes?: string }
  try {
    body = (await helpers.readBodyJson(req)) as typeof body
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  const classId = String(body.classId ?? '').trim()
  const planTierRaw = String(body.planTier ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }
  if (!isTeachingPlanTier(planTierRaw)) {
    helpers.json(res, 400, { error: 'planTier must be monthly, three-month, or six-month' })
    return
  }

  const access = await canMentorManageClass(supabase, classId, clerkId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can edit teaching plans' })
    return
  }

  const topics = normalizeTopics(body.topics)
  if (topics.length === 0) {
    helpers.json(res, 400, { error: 'Add at least one topic for this plan.' })
    return
  }
  const notes = String(body.notes ?? '').trim().slice(0, 2000)

  const { data, error } = await supabase
    .from('class_teaching_plans')
    .upsert(
      {
        class_id: classId,
        plan_tier: planTierRaw,
        topics,
        notes: notes || null,
        updated_by_clerk_id: clerkId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'class_id,plan_tier' },
    )
    .select('plan_tier, topics, notes, updated_at')
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    console.error('[teaching-plan] mentor put', error)
    helpers.json(res, 500, { error: error.message || 'Could not save teaching plan' })
    return
  }

  helpers.json(res, 200, {
    ok: true,
    classId,
    classTitle: access.title,
    plan: {
      tier: planTierRaw,
      topics: normalizeTopics(data?.topics ?? topics),
      notes: data?.notes ? String(data.notes) : notes,
      customized: true,
      updatedAt: data?.updated_at ? String(data.updated_at) : new Date().toISOString(),
    },
  })
}

async function handleStudentGet(
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
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const classId = (url.searchParams.get('classId') ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }

  const enrolled = await requireActiveEnrollment(supabase, clerkId, classId)
  if (!enrolled) {
    helpers.json(res, 403, { error: 'Enroll in this class to view the teaching plan.' })
    return
  }

  const { data: cls } = await supabase.from('classes').select('title').eq('id', classId).maybeSingle()

  try {
    const { plans, missingTable } = await loadPlansForClass(supabase, classId)
    helpers.json(res, 200, {
      classId,
      classTitle: String(cls?.title ?? 'Class'),
      plans,
      setupRequired: missingTable,
    })
  } catch (err) {
    console.error('[teaching-plan] student get', err)
    helpers.json(res, 500, { error: 'Could not load teaching plan' })
  }
}

export function tryHandleClassTeachingPlanApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/mentor/teaching-plan') {
    if (req.method === 'GET') {
      void handleMentorGet(req, res, env, helpers).catch((err) => {
        console.error('[teaching-plan] mentor get', err)
        helpers.json(res, 500, { error: 'Internal server error' })
      })
      return true
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      void handleMentorPut(req, res, env, helpers).catch((err) => {
        console.error('[teaching-plan] mentor put', err)
        helpers.json(res, 500, { error: 'Internal server error' })
      })
      return true
    }
    res.statusCode = 405
    res.end()
    return true
  }
  if (path === '/api/student/teaching-plan') {
    void handleStudentGet(req, res, env, helpers).catch((err) => {
      console.error('[teaching-plan] student get', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  return false
}
