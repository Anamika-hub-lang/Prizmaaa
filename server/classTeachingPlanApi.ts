import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isActiveEnrollmentRow } from './lib/enrollmentPolicy'
import {
  isTeachingPlanTier,
  normalizeTopics,
  seedTopicsForTier,
  TEACHING_PLAN_TIERS,
  type TeachingPlanTier,
  type TeachingPlanTopic,
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
const MISSING_PLANNER_SQL =
  'Planner storage missing. Run supabase/class-planner-assets.sql in the Supabase SQL Editor.'

const PLANNERS_BUCKET = 'class-planners'
const LOGOS_BUCKET = 'topic-logos'
const MAX_PDF_BYTES = 4 * 1024 * 1024
const MAX_LOGO_BYTES = 1 * 1024 * 1024
const PLAN_SELECT =
  'plan_tier, topics, notes, updated_at, planner_pdf_url, planner_pdf_name'
const PLAN_SELECT_LEGACY = 'plan_tier, topics, notes, updated_at'

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

function isMissingPlannerColumn(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('planner_pdf_url') || msg.includes('planner_pdf_name')
}

function isBucketMissing(error: { message?: string } | null | undefined): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  return msg.includes('bucket') || msg.includes('not found')
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
  topics: TeachingPlanTopic[]
  notes: string
  customized: boolean
  updatedAt: string | null
  plannerPdfUrl: string | null
  plannerPdfName: string | null
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 80)
  if (base.toLowerCase().endsWith(fallbackExt)) return base
  return `${base || 'file'}${fallbackExt}`
}

function decodeBase64Payload(raw: string): Buffer | null {
  const data = raw.includes(',') ? raw.split(',').pop()! : raw
  try {
    const buffer = Buffer.from(data, 'base64')
    return buffer.length > 0 ? buffer : null
  } catch {
    return null
  }
}

async function uploadPlannerPdf(
  supabase: SupabaseClient,
  classId: string,
  planTier: TeachingPlanTier,
  pdfBase64: string,
  pdfFileName: string,
): Promise<{ url: string; name: string } | { error: string }> {
  const buffer = decodeBase64Payload(pdfBase64)
  if (!buffer) return { error: 'Invalid PDF data' }
  if (buffer.length > MAX_PDF_BYTES) return { error: 'PDF must be 4 MB or smaller' }
  if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') {
    return { error: 'Only PDF files are allowed' }
  }

  const safeName = sanitizeFileName(pdfFileName || 'planner.pdf', '.pdf')
  const path = `planners/${classId}/${planTier}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(PLANNERS_BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (upErr) {
    if (isBucketMissing(upErr)) return { error: MISSING_PLANNER_SQL }
    return { error: upErr.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(PLANNERS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Could not resolve PDF URL' }
  return { url: data.publicUrl, name: safeName }
}

function detectImageType(buffer: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

async function uploadTopicLogo(
  supabase: SupabaseClient,
  classId: string,
  planTier: TeachingPlanTier,
  imageBase64: string,
  fileName: string,
): Promise<{ url: string } | { error: string }> {
  const buffer = decodeBase64Payload(imageBase64)
  if (!buffer) return { error: 'Invalid image data' }
  if (buffer.length > MAX_LOGO_BYTES) return { error: 'Logo must be 1 MB or smaller' }
  const contentType = detectImageType(buffer)
  if (!contentType) return { error: 'Logo must be a PNG, JPEG, or WebP image' }

  const ext = contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg'
  const safeName = sanitizeFileName(fileName || `logo${ext}`, ext)
  const path = `logos/${classId}/${planTier}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(LOGOS_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  })
  if (upErr) {
    if (isBucketMissing(upErr)) return { error: MISSING_PLANNER_SQL }
    return { error: upErr.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Could not resolve logo URL' }
  return { url: data.publicUrl }
}

function seedPlan(tier: TeachingPlanTier): PlanPayload {
  return {
    tier,
    topics: seedTopicsForTier(tier),
    notes: '',
    customized: false,
    updatedAt: null,
    plannerPdfUrl: null,
    plannerPdfName: null,
  }
}

async function loadPlansForClass(
  supabase: SupabaseClient,
  classId: string,
): Promise<{ plans: PlanPayload[]; missingTable: boolean }> {
  let rows: {
    plan_tier?: string
    topics?: unknown
    notes?: string | null
    updated_at?: string | null
    planner_pdf_url?: string | null
    planner_pdf_name?: string | null
  }[] | null = null

  const withPdf = await supabase.from('class_teaching_plans').select(PLAN_SELECT).eq('class_id', classId)

  if (withPdf.error) {
    if (isMissingTable(withPdf.error)) {
      return {
        missingTable: true,
        plans: TEACHING_PLAN_TIERS.map((tier) => seedPlan(tier)),
      }
    }
    if (isMissingPlannerColumn(withPdf.error)) {
      const legacy = await supabase
        .from('class_teaching_plans')
        .select(PLAN_SELECT_LEGACY)
        .eq('class_id', classId)
      if (legacy.error) {
        if (isMissingTable(legacy.error)) {
          return {
            missingTable: true,
            plans: TEACHING_PLAN_TIERS.map((tier) => seedPlan(tier)),
          }
        }
        throw legacy.error
      }
      rows = legacy.data
    } else {
      throw withPdf.error
    }
  } else {
    rows = withPdf.data
  }

  const byTier = new Map<string, NonNullable<typeof rows>[number]>()
  for (const row of rows ?? []) {
    byTier.set(String(row.plan_tier), row)
  }

  const plans: PlanPayload[] = TEACHING_PLAN_TIERS.map((tier) => {
    const row = byTier.get(tier)
    if (!row) return seedPlan(tier)
    return {
      tier,
      topics: normalizeTopics(row.topics),
      notes: row.notes ? String(row.notes) : '',
      customized: true,
      updatedAt: row.updated_at ? String(row.updated_at) : null,
      plannerPdfUrl: row.planner_pdf_url ? String(row.planner_pdf_url) : null,
      plannerPdfName: row.planner_pdf_name ? String(row.planner_pdf_name) : null,
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

  let body: {
    classId?: string
    planTier?: string
    topics?: unknown
    notes?: string
    pdfBase64?: string
    pdfFileName?: string
  }
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
  const pdfBase64 = typeof body.pdfBase64 === 'string' ? body.pdfBase64.trim() : ''
  if (topics.length === 0 && !pdfBase64) {
    helpers.json(res, 400, { error: 'Add at least one topic or upload a planner PDF.' })
    return
  }
  const notes = String(body.notes ?? '').trim().slice(0, 2000)

  let plannerPdfUrl: string | undefined
  let plannerPdfName: string | undefined
  if (pdfBase64) {
    const uploaded = await uploadPlannerPdf(
      supabase,
      classId,
      planTierRaw,
      pdfBase64,
      String(body.pdfFileName ?? 'planner.pdf'),
    )
    if ('error' in uploaded) {
      helpers.json(res, 400, { error: uploaded.error })
      return
    }
    plannerPdfUrl = uploaded.url
    plannerPdfName = uploaded.name
  }

  const payload: Record<string, unknown> = {
    class_id: classId,
    plan_tier: planTierRaw,
    topics: topics.length > 0 ? topics : [],
    notes: notes || null,
    updated_by_clerk_id: clerkId,
    updated_at: new Date().toISOString(),
  }
  if (plannerPdfUrl) {
    payload.planner_pdf_url = plannerPdfUrl
    payload.planner_pdf_name = plannerPdfName ?? null
  }

  const { data, error } = await supabase
    .from('class_teaching_plans')
    .upsert(payload, { onConflict: 'class_id,plan_tier' })
    .select(PLAN_SELECT)
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    if (plannerPdfUrl && isMissingPlannerColumn(error)) {
      const retry = await supabase
        .from('class_teaching_plans')
        .upsert(
          {
            class_id: classId,
            plan_tier: planTierRaw,
            topics: topics.length > 0 ? topics : [],
            notes: notes || null,
            updated_by_clerk_id: clerkId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'class_id,plan_tier' },
        )
        .select(PLAN_SELECT_LEGACY)
        .maybeSingle()
      if (retry.error) {
        helpers.json(res, 503, { error: MISSING_PLANNER_SQL })
        return
      }
      helpers.json(res, 200, {
        ok: true,
        classId,
        classTitle: access.title,
        plan: {
          tier: planTierRaw,
          topics: normalizeTopics(retry.data?.topics ?? topics),
          notes: retry.data?.notes ? String(retry.data.notes) : notes,
          customized: true,
          updatedAt: retry.data?.updated_at
            ? String(retry.data.updated_at)
            : new Date().toISOString(),
          plannerPdfUrl: plannerPdfUrl,
          plannerPdfName: plannerPdfName ?? null,
        },
        warning: MISSING_PLANNER_SQL,
      })
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
      plannerPdfUrl: data?.planner_pdf_url ? String(data.planner_pdf_url) : plannerPdfUrl ?? null,
      plannerPdfName: data?.planner_pdf_name ? String(data.planner_pdf_name) : plannerPdfName ?? null,
    },
  })
}

async function handleTopicLogoPost(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'POST') {
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

  let body: {
    classId?: string
    planTier?: string
    imageBase64?: string
    fileName?: string
  }
  try {
    body = (await helpers.readBodyJson(req)) as typeof body
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  const classId = String(body.classId ?? '').trim()
  const planTierRaw = String(body.planTier ?? '').trim()
  const imageBase64 = String(body.imageBase64 ?? '').trim()
  if (!classId) {
    helpers.json(res, 400, { error: 'classId is required' })
    return
  }
  if (!isTeachingPlanTier(planTierRaw)) {
    helpers.json(res, 400, { error: 'planTier must be monthly, three-month, or six-month' })
    return
  }
  if (!imageBase64) {
    helpers.json(res, 400, { error: 'imageBase64 is required' })
    return
  }

  const access = await canMentorManageClass(supabase, classId, clerkId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can upload topic logos' })
    return
  }

  const uploaded = await uploadTopicLogo(
    supabase,
    classId,
    planTierRaw,
    imageBase64,
    String(body.fileName ?? 'logo.png'),
  )
  if ('error' in uploaded) {
    helpers.json(res, 400, { error: uploaded.error })
    return
  }

  helpers.json(res, 200, { ok: true, url: uploaded.url })
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
  if (path === '/api/mentor/topic-logo') {
    void handleTopicLogoPost(req, res, env, helpers).catch((err) => {
      console.error('[topic-logo] post', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
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
