import type { IncomingMessage, ServerResponse } from 'node:http'
import { after } from 'next/server'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { verifyWebhook } from '@clerk/backend/webhooks'
import { profileRowFromClerkUser, profileRowFromClerkWebhook } from './lib/profileRow'
import { createServiceSupabase, upsertProfile, upsertProfileDetails } from './lib/supabaseAdmin'
import { sendNotifyEmail } from './lib/sendNotifyEmail'
import {
  CASHFREE_PRODUCTION_ORIGIN,
  cashfreeCreateOrder,
  cashfreeFetchOrder,
  isCashfreeConfigured,
  parseCashfreeMode,
  type CashfreeServerConfig,
} from './lib/cashfreeServer'
import { upsertEnrollmentAfterPayment } from './lib/enrollmentAdmin'
import {
  getCashfreeOrderIntent,
  resolvePaymentEnrollmentNote,
  upsertCashfreeOrderIntent,
} from './lib/cashfreeOrderIntent'
import { TRIAL_DAYS, resolveServerPaymentAmount } from './lib/pricingServer'
import {
  isActiveEnrollmentRow,
  activeEnrollmentBlockedMessage,
} from './lib/enrollmentPolicy'
import { purgeUserDataFromSupabase } from './lib/purgeUserData'
import {
  deleteCounsellingBookingIntent,
  getCounsellingBookingIntent,
  upsertCounsellingBookingIntent,
} from './lib/counsellingBookingIntent'
import {
  firstIndianMobile,
  validateIndianPhoneServer,
  validateScheduledDateTime,
} from './lib/phoneValidation'
import { resolveBookingAssignment } from './lib/counsellorAssign'
import { tryHandleRoleDashboardApi } from './roleDashboardApi'
import { tryHandleUniversityLeadApi } from './universityLeadApi'
import { tryHandleMentorClassShareApi } from './mentorClassShareApi'
import { tryHandleClassNotificationsApi } from './classNotificationsApi'
import { tryHandleClassAttendanceApi } from './classAttendanceApi'
import { tryHandleClassTeachingPlanApi } from './classTeachingPlanApi'
import { tryHandleCategoryPricingApi } from './categoryPricingApi'
import { counsellingPriceInr } from './lib/counsellingPricing'
import { isMentorEmailAllowed, isMissingTableError, normalizeMentorEmail } from './lib/mentorAllowlist'
import {
  applyOfflineEnrollmentGrants,
  findClerkUserByEmail,
  type OfflinePlanTier,
} from './lib/offlineEnrollment'
import {
  builtinMentorAllowlistEntries,
  ensureBuiltinMentorAccess,
  isBuiltinMentorEmail,
} from './lib/builtinMentors'
import {
  generateGeminiParts,
  generateGeminiText,
  parseOpportunityMatchPayload,
  parseVoiceProfilePayload,
  truncateForAi,
  type GeminiPart,
  OPPORTUNITY_MATCH_SYSTEM,
  RESUME_REVIEW_SYSTEM,
  VOICE_PROFILE_SYSTEM,
} from './lib/geminiClient'

const TRIAL_VERIFY_INR = 1

export type DevApiEnv = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
  clerkWebhookSecret?: string
  notifyEmail?: string
  resendApiKey?: string
  cashfreeClientId?: string
  cashfreeClientSecret?: string
  cashfreeMode?: 'sandbox' | 'production'
  publicAppUrl?: string
  /** Comma-separated Clerk user ids allowed to use /admin APIs */
  adminClerkUserIds?: string
  geminiApiKey?: string
}

function headerFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]?.split(',')[0]?.trim()
  return value?.split(',')[0]?.trim()
}

function cashfreeCfg(env: DevApiEnv): CashfreeServerConfig {
  return {
    clientId: env.cashfreeClientId,
    clientSecret: env.cashfreeClientSecret,
    mode: parseCashfreeMode(env.cashfreeMode, env.cashfreeClientSecret),
  }
}

function requestOrigin(req: IncomingMessage): string {
  const host =
    headerFirst(req.headers['x-forwarded-host']) ||
    headerFirst(req.headers.host) ||
    'localhost:3000'
  const proto =
    headerFirst(req.headers['x-forwarded-proto']) ||
    (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** Cashfree return_url must be the merchant-whitelisted https origin. */
function paymentReturnBase(env: DevApiEnv, req: IncomingMessage): string {
  const origin = requestOrigin(req)
  const configured = env.publicAppUrl?.trim().replace(/\/$/, '')
  const mode = parseCashfreeMode(env.cashfreeMode, env.cashfreeClientSecret)

  if (mode === 'production') {
    // JS checkout + return_url stay on vercel.app until prizma.guru is approved in Cashfree.
    return CASHFREE_PRODUCTION_ORIGIN
  }

  if (origin.startsWith('https://')) {
    return origin
  }

  if (configured?.startsWith('https://')) {
    return configured
  }

  return origin
}

function readBodyBuffer(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readBodyJson(req: IncomingMessage): Promise<unknown> {
  const raw = await readBodyBuffer(req)
  return JSON.parse(raw.toString('utf8'))
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function verifyClerkSession(
  req: IncomingMessage,
  clerkSecretKey: string
): Promise<string | null> {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  try {
    const verified = await verifyToken(token, { secretKey: clerkSecretKey })
    return verified.sub
  } catch {
    return null
  }
}

function requireSupabaseAdmin(env: DevApiEnv): ReturnType<typeof createServiceSupabase> | null {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null
  return createServiceSupabase(env.supabaseUrl, env.supabaseServiceRoleKey)
}

function parseAdminClerkUserIds(env: DevApiEnv): Set<string> {
  const raw = env.adminClerkUserIds ?? ''
  return new Set(
    raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )
}

function isAdminClerkUserAllowlist(clerkId: string, env: DevApiEnv): boolean {
  return parseAdminClerkUserIds(env).has(clerkId)
}

async function isAdminClerkUser(clerkId: string, env: DevApiEnv): Promise<boolean> {
  if (isAdminClerkUserAllowlist(clerkId, env)) return true
  if (!env.clerkSecretKey) return false
  try {
    const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
    const user = await clerk.users.getUser(clerkId)
    return user.publicMetadata?.role === 'admin'
  } catch {
    return false
  }
}

function clerkPrimaryEmail(user: {
  emailAddresses: Array<{ id: string; emailAddress: string }>
  primaryEmailAddressId: string | null
}): string {
  const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
  return (primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? '').trim()
}

async function applyOfflineGrantsForClerkId(
  clerkId: string,
  env: DevApiEnv,
  supabase: NonNullable<ReturnType<typeof requireSupabaseAdmin>>,
) {
  if (!env.clerkSecretKey) {
    return { matched: false, roleUpdated: false, enrolledClassIds: [] as string[], classMissing: false }
  }
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkId)
  // Primary mentors first — never let offline student grants override them.
  try {
    await ensureBuiltinMentorAccess({ supabase, clerk, user })
  } catch (err) {
    console.warn('[dev-api] builtin mentor access', err)
  }
  const refreshed = await clerk.users.getUser(clerkId)
  return applyOfflineEnrollmentGrants({ supabase, clerk, user: refreshed })
}

async function requireAdminApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<{ clerkId: string; supabase: NonNullable<ReturnType<typeof requireSupabaseAdmin>> } | null> {
  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return null
  }
  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return null
  }
  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required' })
    return null
  }
  if (!(await isAdminClerkUser(clerkId, env))) {
    json(res, 403, { error: 'Admin access required' })
    return null
  }
  return { clerkId, supabase }
}

async function syncClerkUserIdToSupabase(clerkUserId: string, env: DevApiEnv): Promise<void> {
  const supabase = requireSupabaseAdmin(env)
  if (!supabase || !env.clerkSecretKey) {
    throw new Error('Server missing Supabase or Clerk configuration')
  }
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkUserId)
  const row = profileRowFromClerkUser(user)
  await upsertProfile(supabase, row)
}

async function handleDeleteAccount(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  let body: { confirm?: string }
  try {
    body = (await readBodyJson(req)) as { confirm?: string }
  } catch {
    json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  if (body.confirm !== 'DELETE') {
    json(res, 400, { error: 'Type DELETE to confirm account deletion' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  let dataPurgeFailed = false
  try {
    await purgeUserDataFromSupabase(supabase, userId)
  } catch (err) {
    console.error('[dev-api] delete-account supabase', err)
    dataPurgeFailed = true
  }

  try {
    const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
    await clerk.users.deleteUser(userId)
  } catch (err) {
    console.error('[dev-api] delete-account clerk', err)
    json(res, 500, {
      error: dataPurgeFailed
        ? 'Could not fully delete your account. Try again or contact support.'
        : 'Could not delete your login account',
    })
    return
  }

  if (dataPurgeFailed) {
    json(res, 200, {
      ok: true,
      warning: 'Your login was removed. You can sign up again with the same email.',
    })
    return
  }

  json(res, 200, { ok: true })
}

async function handleSetRole(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, {
      error: 'Server missing CLERK_SECRET_KEY. Add it to .env for role onboarding.',
    })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  let body: { role?: string }
  try {
    body = (await readBodyJson(req)) as { role?: string }
  } catch {
    json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  const role = body.role
  if (role !== 'student' && role !== 'teacher') {
    json(res, 400, { error: 'Role must be student or teacher' })
    return
  }

  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(userId)
  const existingRole = user.publicMetadata?.role
  const complete = user.publicMetadata?.onboardingComplete === true

  if (existingRole && existingRole !== role) {
    json(res, 403, { error: 'Account role is already set' })
    return
  }

  if (complete && existingRole && existingRole !== role) {
    const upgradingToMentor = role === 'teacher' && existingRole === 'student'
    if (!upgradingToMentor) {
      json(res, 403, { error: 'Account role is already set' })
      return
    }
  }

  if (role === 'teacher' && existingRole !== 'teacher') {
    const supabase = requireSupabaseAdmin(env)
    if (!supabase) {
      json(res, 503, { error: 'Server missing Supabase service configuration.' })
      return
    }
    const email = clerkPrimaryEmail(user)
    let allowed = false
    try {
      allowed = await isMentorEmailAllowed(supabase, email)
    } catch (err) {
      console.error('[dev-api] mentor allowlist check', err)
      json(res, 500, { error: 'Could not verify mentor access' })
      return
    }
    if (!allowed) {
      json(res, 403, {
        error: 'Mentor access requires admin approval. Submit a request at /become-mentor first, then sign up with the same email.',
      })
      return
    }
  }

  await clerk.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      role,
      onboardingComplete: false,
    },
  })

  try {
    await syncClerkUserIdToSupabase(userId, env)
  } catch (err) {
    console.error('[dev-api] profile sync after role', err)
  }

  const supabaseAfterRole = requireSupabaseAdmin(env)
  if (supabaseAfterRole) {
    try {
      await applyOfflineGrantsForClerkId(userId, env, supabaseAfterRole)
    } catch (err) {
      console.warn('[dev-api] offline enrollment after role', err)
    }
  }

  json(res, 200, { ok: true })
}

const FIND_US = new Set(['linkedin', 'friends', 'social_media', 'reference', 'marketing', 'other'])
const EDU_LEVELS = new Set(['school', 'college', 'working', 'other'])

async function handleProfileDetails(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await readBodyJson(req)) as Record<string, unknown>
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(userId)
  const role = user.publicMetadata?.role
  if (role !== 'student' && role !== 'teacher') {
    json(res, 400, { error: 'Choose student or mentor role first' })
    return
  }

  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()
  const phone = String(body.phone ?? '').trim() || null
  const city = String(body.city ?? '').trim() || null
  const howDidYouFindUs = String(body.howDidYouFindUs ?? '')
  const howDetail = String(body.howDidYouFindUsDetail ?? '').trim() || null

  if (!firstName || !lastName) {
    json(res, 400, { error: 'First name and last name are required' })
    return
  }
  if (!FIND_US.has(howDidYouFindUs)) {
    json(res, 400, { error: 'Invalid how did you find us value' })
    return
  }
  if ((howDidYouFindUs === 'reference' || howDidYouFindUs === 'other') && !howDetail) {
    json(res, 400, { error: 'Please add details for your selection' })
    return
  }

  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null

  let studentEducationLevel: string | null = null
  let studentGradeOrProgram: string | null = null
  let studentLearningGoals: string | null = null
  let mentorExpertise: string | null = null
  let mentorExperienceYears: number | null = null
  let mentorQualifications: string | null = null
  let mentorBio: string | null = null
  let mentorPortfolioUrl: string | null = null

  if (role === 'student') {
    const edu = String(body.studentEducationLevel ?? '').trim()
    studentGradeOrProgram = String(body.studentGradeOrProgram ?? '').trim() || null
    studentLearningGoals = String(body.studentLearningGoals ?? '').trim() || null
    if (edu) {
      if (!EDU_LEVELS.has(edu)) {
        json(res, 400, { error: 'Invalid education level' })
        return
      }
      studentEducationLevel = edu
    }
  } else {
    mentorExpertise = String(body.mentorExpertise ?? '').trim() || null
    mentorQualifications = String(body.mentorQualifications ?? '').trim() || null
    mentorBio = String(body.mentorBio ?? '').trim() || null
    mentorPortfolioUrl = String(body.mentorPortfolioUrl ?? '').trim() || null
    const yearsRaw = body.mentorExperienceYears
    if (yearsRaw !== undefined && yearsRaw !== '' && yearsRaw !== null) {
      const years = Number(yearsRaw)
      if (!Number.isNaN(years)) {
        mentorExperienceYears = Math.min(60, Math.max(0, Math.floor(years)))
      }
    }
  }

  const fullName = `${firstName} ${lastName}`.trim()

  await clerk.users.updateUser(userId, {
    firstName,
    lastName,
    publicMetadata: {
      ...user.publicMetadata,
      role,
      onboardingComplete: true,
    },
  })

  try {
    await upsertProfileDetails(supabase, {
      clerk_id: userId,
      full_name: fullName,
      email,
      role,
      phone,
      city,
      how_did_you_find_us: howDidYouFindUs,
      how_did_you_find_us_detail: howDetail,
      student_education_level: studentEducationLevel,
      student_grade_or_program: studentGradeOrProgram,
      student_learning_goals: studentLearningGoals,
      mentor_expertise: mentorExpertise,
      mentor_experience_years: mentorExperienceYears,
      mentor_qualifications: mentorQualifications,
      mentor_bio: mentorBio,
      mentor_portfolio_url: mentorPortfolioUrl,
      profile_details_complete: true,
    })
  } catch (err) {
    console.error('[dev-api] profile details db', err)
    json(res, 500, { error: 'Could not save profile to database' })
    return
  }

  json(res, 200, { ok: true })
}

async function handleGetProfile(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('clerk_id', userId).maybeSingle()

  if (error) {
    console.error('[dev-api] get profile', error)
    json(res, 500, { error: 'Could not load profile' })
    return
  }

  json(res, 200, { profile: data ?? null })
}

async function handleGetEnrollments(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  try {
    await applyOfflineGrantsForClerkId(userId, env, supabase)
  } catch (err) {
    console.warn('[dev-api] offline enrollment before list', err)
  }

  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('clerk_id', userId)
    .order('enrolled_at', { ascending: true })

  if (error) {
    console.error('[dev-api] enrollments list', error)
    json(res, 500, { error: 'Could not load enrollments' })
    return
  }

  const enrollments = (data ?? []).filter((row) => isActiveEnrollmentRow(row))
  json(res, 200, { enrollments })
}

async function handleProfileSync(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, {
      error: 'Server missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL.',
    })
    return
  }

  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  try {
    await syncClerkUserIdToSupabase(userId, env)
    let roleUpdated = false
    try {
      const applied = await applyOfflineGrantsForClerkId(userId, env, supabase)
      roleUpdated = applied.roleUpdated
    } catch (err) {
      console.warn('[dev-api] offline enrollment during profile-sync', err)
    }
    json(res, 200, { ok: true, roleUpdated })
  } catch (err) {
    console.error('[dev-api] profile-sync', err)
    json(res, 500, { error: 'Could not sync profile' })
  }
}

async function handleClerkWebhook(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkWebhookSecret) {
    json(res, 503, { error: 'Server missing CLERK_WEBHOOK_SECRET.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const rawBody = await readBodyBuffer(req)
  const host = req.headers.host ?? 'localhost'
  const request = new Request(`http://${host}${req.url ?? ''}`, {
    method: 'POST',
    headers: new Headers(req.headers as Record<string, string>),
    body: new Uint8Array(rawBody),
  })

  try {
    const evt = await verifyWebhook(request, { signingSecret: env.clerkWebhookSecret })

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const data = evt.data as unknown as Record<string, unknown>
      const row = profileRowFromClerkWebhook(data)
      await upsertProfile(supabase, row)
      if (row.clerk_id) {
        try {
          await applyOfflineGrantsForClerkId(row.clerk_id, env, supabase)
        } catch (err) {
          console.warn('[dev-api] offline enrollment from clerk webhook', err)
        }
      }
    }

    json(res, 200, { ok: true })
  } catch (err) {
    console.error('[dev-api] clerk webhook', err)
    json(res, 400, { error: 'Webhook verification failed' })
  }
}

async function handleCounsellingBook(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required to book counselling' })
    return
  }

  let body: {
    fullName?: string
    email?: string
    phone?: string
    categoryId?: string
    groupId?: string
    preferredMode?: string
    note?: string
    scheduledDate?: string
    scheduledTime?: string
  }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const fullName = body.fullName?.trim()
  const email = body.email?.trim()
  const categoryId = body.categoryId?.trim()
  const groupId = body.groupId?.trim() || null
  const preferredMode = body.preferredMode === 'call' ? 'call' : body.preferredMode === 'meet' ? 'meet' : null
  const note = body.note?.trim() || null
  const scheduledDate = body.scheduledDate?.trim()
  const scheduledTime = body.scheduledTime?.trim()

  if (!fullName || !email || !categoryId || !preferredMode || !scheduledDate || !scheduledTime) {
    json(res, 400, { error: 'Name, email, session type, format, date, and time slot are required' })
    return
  }

  const phoneResult = validateIndianPhoneServer(body.phone ?? '')
  if (phoneResult.ok === false) {
    json(res, 400, { error: phoneResult.error })
    return
  }

  const scheduleError = validateScheduledDateTime(scheduledDate, scheduledTime)
  if (scheduleError) {
    json(res, 400, { error: scheduleError })
    return
  }

  const amountInr = counsellingPriceInr(categoryId)

  const { error: insertErr } = await supabase.from('counselling_requests').insert({
    full_name: fullName,
    email,
    phone: phoneResult.digits,
    category_id: categoryId,
    preferred_mode: preferredMode,
    note,
    payment_status: 'pending',
    cashfree_order_id: null,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    clerk_id: clerkId,
    group_id: groupId,
  })

  if (insertErr) {
    console.error('[dev-api] counselling book upi', insertErr)
    json(res, 500, { error: 'Could not save booking. Please try again.' })
    return
  }

  const modeLabel = preferredMode === 'meet' ? 'Google Meet' : 'Phone call'
  const scheduleLabel = `${scheduledDate} ${scheduledTime} IST`
  const html = `
    <h2>Counselling booking — UPI payment pending</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phoneResult.digits}</p>
    <p><strong>Session:</strong> ${categoryId}</p>
    <p><strong>Format:</strong> ${modeLabel}</p>
    <p><strong>Scheduled:</strong> ${scheduleLabel}</p>
    <p><strong>Amount:</strong> ₹${amountInr} (verify UPI payment)</p>
    <p><strong>Note:</strong></p>
    <p>${note ?? '—'}</p>
  `

  after(async () => {
    try {
      await sendNotifyEmail(env, `Counselling UPI pending: ${fullName}`, html)
    } catch (err) {
      console.error('[dev-api] counselling book notify', err)
    }
  })

  json(res, 200, {
    ok: true,
    redirect: '/student?counselling=booked',
    scheduledDate,
    scheduledTime,
    groupId: groupId ?? 'career',
  })
}

async function handleCounsellingCreateOrder(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const cfg = cashfreeCfg(env)
  if (!isCashfreeConfigured(cfg)) {
    json(res, 503, { error: 'Online payment is not configured yet.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required to book counselling' })
    return
  }

  let body: {
    fullName?: string
    email?: string
    phone?: string
    categoryId?: string
    groupId?: string
    preferredMode?: string
    note?: string
    scheduledDate?: string
    scheduledTime?: string
  }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const fullName = body.fullName?.trim()
  const email = body.email?.trim()
  const categoryId = body.categoryId?.trim()
  const groupId = body.groupId?.trim() || null
  const preferredMode = body.preferredMode === 'call' ? 'call' : body.preferredMode === 'meet' ? 'meet' : null
  const note = body.note?.trim() || null
  const scheduledDate = body.scheduledDate?.trim()
  const scheduledTime = body.scheduledTime?.trim()

  if (!fullName || !email || !categoryId || !preferredMode || !scheduledDate || !scheduledTime) {
    json(res, 400, { error: 'Name, email, session type, format, date, and time slot are required' })
    return
  }

  const phoneResult = validateIndianPhoneServer(body.phone ?? '')
  if (phoneResult.ok === false) {
    json(res, 400, { error: phoneResult.error })
    return
  }

  const scheduleError = validateScheduledDateTime(scheduledDate, scheduledTime)
  if (scheduleError) {
    json(res, 400, { error: scheduleError })
    return
  }

  const amountInr = counsellingPriceInr(categoryId)

  let orderId: string
  let returnUrl: string
  try {
    orderId = `coun_${Date.now()}`
    const origin = paymentReturnBase(env, req)
    returnUrl = `${origin}/counselling/payment/return?order_id={order_id}`
  } catch (err) {
    json(res, 400, {
      error: err instanceof Error ? err.message : 'Could not build payment return URL',
    })
    return
  }

  const orderNote = JSON.stringify({
    v: 1,
    type: 'counselling',
    clerkId,
    categoryId,
    groupId,
  })

  try {
    const created = await cashfreeCreateOrder(cfg, {
      orderId,
      amount: amountInr,
      customerId: clerkId,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phoneResult.digits,
      returnUrl,
      orderNote,
    })

    await upsertCounsellingBookingIntent(supabase, {
      order_id: orderId,
      clerk_id: clerkId,
      full_name: fullName,
      email,
      phone: phoneResult.digits,
      category_id: categoryId,
      group_id: groupId,
      preferred_mode: preferredMode,
      note,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      amount_inr: amountInr,
    })

    json(res, 200, {
      paymentSessionId: created.paymentSessionId,
      orderId,
      mode: cfg.mode === 'production' ? 'production' : 'sandbox',
    })
  } catch (err) {
    console.error('[dev-api] counselling create-order', err)
    json(res, 500, {
      error: err instanceof Error ? err.message : 'Could not start payment',
    })
  }
}

async function handleCounsellingConfirm(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const cfg = cashfreeCfg(env)
  if (!isCashfreeConfigured(cfg)) {
    json(res, 503, { error: 'Cashfree not configured' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required' })
    return
  }

  let body: { orderId?: string }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const orderId = body.orderId?.trim()
  if (!orderId) {
    json(res, 400, { error: 'orderId required' })
    return
  }

  try {
    const order = await fetchPaidCashfreeOrder(cfg, orderId)

    if (order.customerId && order.customerId !== clerkId) {
      json(res, 403, { error: 'This payment belongs to a different account.' })
      return
    }

    const intent = await getCounsellingBookingIntent(supabase, orderId)
    if (!intent) {
      json(res, 400, { error: 'Booking details not found for this order. Contact support with your order id.' })
      return
    }

    if (intent.clerk_id !== clerkId) {
      json(res, 403, { error: 'This booking was started under a different account.' })
      return
    }

    const { data: existing } = await supabase
      .from('counselling_requests')
      .select('id')
      .eq('cashfree_order_id', orderId)
      .maybeSingle()

    if (!existing) {
      const baseRow = {
        full_name: intent.full_name,
        email: intent.email,
        phone: intent.phone,
        category_id: intent.category_id,
        preferred_mode: intent.preferred_mode,
        note: intent.note,
        payment_status: 'paid',
        cashfree_order_id: orderId,
        scheduled_date: intent.scheduled_date,
        scheduled_time: intent.scheduled_time,
        clerk_id: intent.clerk_id,
        group_id: intent.group_id,
      }

      let insertErr: { code?: string; message?: string } | null = null
      try {
        const assignment = await resolveBookingAssignment(supabase, intent.group_id)
        const withAssign = await supabase.from('counselling_requests').insert({
          ...baseRow,
          type_id: assignment.typeId,
          counsellor_clerk_id: assignment.counsellorClerkId,
          assignment_status: assignment.assignmentStatus,
          session_status: assignment.sessionStatus,
        })
        insertErr = withAssign.error
        if (insertErr?.code === '42703') {
          const legacy = await supabase.from('counselling_requests').insert(baseRow)
          insertErr = legacy.error
        }
      } catch (assignErr) {
        console.warn('[dev-api] counselling assign skipped', assignErr)
        const legacy = await supabase.from('counselling_requests').insert(baseRow)
        insertErr = legacy.error
      }

      if (insertErr && insertErr.code !== '42P01' && insertErr.code !== 'PGRST205') {
        console.error('[dev-api] counselling confirm insert', insertErr)
        json(res, 500, { error: 'Could not save confirmed booking' })
        return
      }

      const modeLabel = intent.preferred_mode === 'meet' ? 'Google Meet' : 'Phone call'
      const scheduleLabel = `${intent.scheduled_date} ${intent.scheduled_time} IST`
      const html = `
        <h2>Counselling booked & paid on PRIZMA</h2>
        <p><strong>Order:</strong> ${orderId}</p>
        <p><strong>Name:</strong> ${intent.full_name}</p>
        <p><strong>Email:</strong> ${intent.email}</p>
        <p><strong>Phone:</strong> ${intent.phone}</p>
        <p><strong>Session:</strong> ${intent.category_id}</p>
        <p><strong>Format:</strong> ${modeLabel}</p>
        <p><strong>Scheduled:</strong> ${scheduleLabel}</p>
        <p><strong>Amount:</strong> ₹${intent.amount_inr}</p>
        <p><strong>Note:</strong></p>
        <p>${intent.note ?? '—'}</p>
      `
      try {
        await sendNotifyEmail(env, `Counselling paid: ${intent.full_name}`, html)
      } catch {
        /* email optional if row saved */
      }
    }

    await deleteCounsellingBookingIntent(supabase, orderId).catch(() => {})

    const redirectGroup = intent.group_id ?? 'career'
    json(res, 200, {
      ok: true,
      redirect: '/student?counselling=booked',
      scheduledDate: intent.scheduled_date,
      scheduledTime: intent.scheduled_time,
      groupId: redirectGroup,
    })
  } catch (err) {
    console.error('[dev-api] counselling confirm', err)
    const message = err instanceof Error ? err.message : 'Could not confirm payment'
    const status = message.includes('not completed yet') ? 400 : 500
    json(res, status, { error: message })
  }
}

async function handleCounsellingMyBookings(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required' })
    return
  }

  try {
    const { data, error } = await supabase
      .from('counselling_requests')
      .select(
        'id, full_name, email, phone, category_id, group_id, preferred_mode, note, payment_status, scheduled_date, scheduled_time, created_at',
      )
      .eq('clerk_id', clerkId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        json(res, 200, { bookings: [] })
        return
      }
      console.error('[dev-api] counselling my-bookings', error)
      json(res, 500, { error: 'Could not load counselling bookings' })
      return
    }

    const bookings = (data ?? []).map((row) => ({
      id: row.id as string,
      fullName: row.full_name as string,
      email: row.email as string,
      phone: row.phone as string,
      categoryId: row.category_id as string,
      groupId: (row.group_id as string | null) ?? null,
      preferredMode: row.preferred_mode as 'meet' | 'call',
      note: (row.note as string | null) ?? null,
      paymentStatus: (row.payment_status as string | null) ?? 'paid',
      scheduledDate: (row.scheduled_date as string | null) ?? null,
      scheduledTime: (row.scheduled_time as string | null) ?? null,
      createdAt: row.created_at as string,
    }))

    json(res, 200, { bookings })
  } catch (err) {
    console.error('[dev-api] counselling my-bookings', err)
    json(res, 500, { error: 'Could not load counselling bookings' })
  }
}

async function handleAdminCounsellingBookings(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Sign in required' })
    return
  }

  if (!(await isAdminClerkUser(clerkId, env))) {
    json(res, 403, { error: 'Admin access required' })
    return
  }

  try {
    const paidSelectWithAssign =
      'id, full_name, email, phone, category_id, group_id, preferred_mode, note, payment_status, scheduled_date, scheduled_time, cashfree_order_id, clerk_id, counsellor_clerk_id, assignment_status, session_status, created_at'
    const paidSelectLegacy =
      'id, full_name, email, phone, category_id, group_id, preferred_mode, note, payment_status, scheduled_date, scheduled_time, cashfree_order_id, clerk_id, created_at'

    let paidRows: Array<Record<string, unknown>> | null = null
    let paidError: { code?: string; message?: string } | null = null

    {
      const first = await supabase
        .from('counselling_requests')
        .select(paidSelectWithAssign)
        .order('created_at', { ascending: false })
        .limit(500)
      paidRows = (first.data as Array<Record<string, unknown>> | null) ?? null
      paidError = first.error

      // Schema not migrated yet — new assignment columns missing (Postgres 42703).
      if (paidError?.code === '42703') {
        const second = await supabase
          .from('counselling_requests')
          .select(paidSelectLegacy)
          .order('created_at', { ascending: false })
          .limit(500)
        paidRows = (second.data as Array<Record<string, unknown>> | null) ?? null
        paidError = second.error
      }
    }

    if (paidError && paidError.code !== '42P01' && paidError.code !== 'PGRST205') {
      console.error('[dev-api] admin counselling paid', paidError)
      json(res, 500, { error: 'Could not load counselling bookings' })
      return
    }

    const { data: pendingRows, error: pendingError } = await supabase
      .from('counselling_booking_intents')
      .select(
        'order_id, clerk_id, full_name, email, phone, category_id, group_id, preferred_mode, note, scheduled_date, scheduled_time, amount_inr, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(500)

    if (pendingError && pendingError.code !== '42P01' && pendingError.code !== 'PGRST205') {
      console.error('[dev-api] admin counselling pending', pendingError)
      json(res, 500, { error: 'Could not load pending counselling checkouts' })
      return
    }

    type AdminBooking = {
      id: string
      source: 'paid' | 'pending'
      fullName: string
      email: string
      phone: string
      categoryId: string
      groupId: string | null
      preferredMode: 'meet' | 'call'
      note: string | null
      paymentStatus: 'pending' | 'paid' | 'failed'
      scheduledDate: string | null
      scheduledTime: string | null
      cashfreeOrderId: string | null
      clerkId: string | null
      counsellorClerkId: string | null
      assignmentStatus: 'assigned' | 'unassigned' | null
      sessionStatus: 'upcoming' | 'completed' | null
      amountInr: number
      createdAt: string
    }

    const paid: AdminBooking[] = (paidRows ?? []).map((row) => {
      const rawStatus = (row.payment_status as string | null) ?? 'paid'
      const paymentStatus: AdminBooking['paymentStatus'] =
        rawStatus === 'pending' || rawStatus === 'failed' ? rawStatus : 'paid'
      const assignmentRaw = (row.assignment_status as string | null | undefined) ?? null
      const sessionRaw = (row.session_status as string | null | undefined) ?? null
      return {
        id: row.id as string,
        source: 'paid' as const,
        fullName: row.full_name as string,
        email: row.email as string,
        phone: row.phone as string,
        categoryId: row.category_id as string,
        groupId: (row.group_id as string | null) ?? null,
        preferredMode: row.preferred_mode as 'meet' | 'call',
        note: (row.note as string | null) ?? null,
        paymentStatus,
        scheduledDate: (row.scheduled_date as string | null) ?? null,
        scheduledTime: (row.scheduled_time as string | null) ?? null,
        cashfreeOrderId: (row.cashfree_order_id as string | null) ?? null,
        clerkId: (row.clerk_id as string | null) ?? null,
        counsellorClerkId: (row.counsellor_clerk_id as string | null | undefined) ?? null,
        assignmentStatus:
          assignmentRaw === 'assigned' || assignmentRaw === 'unassigned' ? assignmentRaw : null,
        sessionStatus: sessionRaw === 'upcoming' || sessionRaw === 'completed' ? sessionRaw : null,
        amountInr: counsellingPriceInr(row.category_id as string),
        createdAt: row.created_at as string,
      }
    })

    const pending: AdminBooking[] = (pendingRows ?? []).map((row) => ({
      id: row.order_id as string,
      source: 'pending',
      fullName: row.full_name as string,
      email: row.email as string,
      phone: row.phone as string,
      categoryId: row.category_id as string,
      groupId: (row.group_id as string | null) ?? null,
      preferredMode: row.preferred_mode as 'meet' | 'call',
      note: (row.note as string | null) ?? null,
      paymentStatus: 'pending',
      scheduledDate: (row.scheduled_date as string | null) ?? null,
      scheduledTime: (row.scheduled_time as string | null) ?? null,
      cashfreeOrderId: row.order_id as string,
      clerkId: (row.clerk_id as string | null) ?? null,
      counsellorClerkId: null,
      assignmentStatus: null,
      sessionStatus: null,
      amountInr: Number(row.amount_inr ?? counsellingPriceInr(row.category_id as string)),
      createdAt: (row.created_at as string | null) ?? new Date().toISOString(),
    }))

    const bookings = [...paid, ...pending].sort((a, b) => {
      const aKey = `${a.scheduledDate ?? '9999'}-${a.scheduledTime ?? '99:99'}-${a.createdAt}`
      const bKey = `${b.scheduledDate ?? '9999'}-${b.scheduledTime ?? '99:99'}-${b.createdAt}`
      return aKey.localeCompare(bKey)
    })

    json(res, 200, { bookings })
  } catch (err) {
    console.error('[dev-api] admin counselling-bookings', err)
    json(res, 500, { error: 'Could not load admin counselling bookings' })
  }
}

async function handleMentorEligible(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }
  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Sign in required' })
    return
  }
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(userId)
  const email = clerkPrimaryEmail(user)
  const existingRole = user.publicMetadata?.role
  const supabase = requireSupabaseAdmin(env)
  let allowed = existingRole === 'teacher'
  if (!allowed && supabase) {
    try {
      allowed = await isMentorEmailAllowed(supabase, email)
    } catch (err) {
      console.error('[dev-api] mentor-eligible', err)
      json(res, 500, { error: 'Could not verify mentor access' })
      return
    }
  }
  json(res, 200, { allowed, email })
}

async function handleMentorApplicationPrefill(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }
  const userId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!userId) {
    json(res, 401, { error: 'Sign in required' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(userId)
  const email = normalizeMentorEmail(clerkPrimaryEmail(user))
  if (!email) {
    json(res, 200, { application: null })
    return
  }

  const { data, error } = await supabase
    .from('mentor_applications')
    .select('full_name, email, phone, college, expertise, experience, message, portfolio_url, status')
    .ilike('email', email)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && !isMissingTableError(error)) {
    console.error('[dev-api] mentor application prefill', error)
    json(res, 500, { error: 'Could not load mentor application' })
    return
  }

  if (!data) {
    json(res, 200, { application: null })
    return
  }

  json(res, 200, {
    application: {
      fullName: String(data.full_name ?? ''),
      email: String(data.email ?? email),
      phone: data.phone ? String(data.phone) : null,
      college: data.college ? String(data.college) : null,
      expertise: String(data.expertise ?? ''),
      experience: data.experience ? String(data.experience) : null,
      message: data.message ? String(data.message) : null,
      portfolioUrl: data.portfolio_url ? String(data.portfolio_url) : null,
    },
  })
}

async function handleAdminEnrollments(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  const ctx = await requireAdminApi(req, res, env)
  if (!ctx) return
  const { supabase } = ctx

  if (req.method === 'POST') {
    if (!env.clerkSecretKey) {
      json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
      return
    }
    let body: { email?: string; classId?: string; classTitleQuery?: string; planTier?: string }
    try {
      body = (await readBodyJson(req)) as typeof body
    } catch {
      json(res, 400, { error: 'Invalid JSON' })
      return
    }
    const email = normalizeMentorEmail(body.email ?? '')
    if (!email || !email.includes('@')) {
      json(res, 400, { error: 'A valid student email is required' })
      return
    }
    const classId = String(body.classId ?? '').trim()
    const classTitleQuery =
      String(body.classTitleQuery ?? '').trim() || (classId ? undefined : 'full stack')
    const planRaw = String(body.planTier ?? 'monthly').trim()
    const planTier: OfflinePlanTier =
      planRaw === 'three-month' || planRaw === 'six-month' ? planRaw : 'monthly'

    let user = await findClerkUserByEmail(env.clerkSecretKey, email)
    if (!user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('clerk_id')
        .ilike('email', email)
        .maybeSingle()
      if (profile?.clerk_id) {
        const clerkLookup = createClerkClient({ secretKey: env.clerkSecretKey })
        try {
          user = await clerkLookup.users.getUser(String(profile.clerk_id))
        } catch {
          user = null
        }
      }
    }
    if (!user) {
      json(res, 404, {
        error:
          'This email has not signed up yet. Ask them to sign in with this Gmail — student dashboard and Full Stack will unlock automatically.',
      })
      return
    }

    const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
    try {
      const result = await applyOfflineEnrollmentGrants({
        supabase,
        clerk,
        user,
        extraGrants: [
          {
            email,
            classId: classId || undefined,
            classTitleQuery,
            planTier,
            paymentLabel: 'Offline / personal payment',
          },
        ],
      })
      if (result.classMissing) {
        json(res, 404, {
          error: classId
            ? 'That class was not found.'
            : 'No live class matching Full Stack was found. Pick the class from the list.',
        })
        return
      }
      json(res, 200, {
        ok: true,
        roleUpdated: result.roleUpdated,
        enrolledClassIds: result.enrolledClassIds,
      })
    } catch (err) {
      console.error('[dev-api] admin offline enroll', err)
      json(res, 500, { error: err instanceof Error ? err.message : 'Could not grant enrollment' })
    }
    return
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }

  const { data: rows, error } = await supabase
    .from('student_enrollments')
    .select(
      'id, clerk_id, class_id, free_course_id, kind, progress, status, plan_tier, billing_status, enrolled_at',
    )
    .order('enrolled_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[dev-api] admin enrollments', error)
    json(res, 500, { error: 'Could not load class enrollments' })
    return
  }

  const clerkIds = [...new Set((rows ?? []).map((row) => String(row.clerk_id ?? '')).filter(Boolean))]
  const classIds = [...new Set((rows ?? []).map((row) => String(row.class_id ?? '')).filter(Boolean))]
  const freeIds = [...new Set((rows ?? []).map((row) => String(row.free_course_id ?? '')).filter(Boolean))]

  const profilesByClerk = new Map<string, { fullName: string; email: string; phone: string }>()
  if (clerkIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('clerk_id, full_name, email, phone')
      .in('clerk_id', clerkIds)
    for (const profile of profiles ?? []) {
      profilesByClerk.set(String(profile.clerk_id), {
        fullName: String(profile.full_name ?? '').trim() || 'Student',
        email: String(profile.email ?? ''),
        phone: String(profile.phone ?? ''),
      })
    }
  }

  const classTitleById = new Map<string, string>()
  if (classIds.length > 0) {
    const { data: classes } = await supabase.from('classes').select('id, title').in('id', classIds)
    for (const item of classes ?? []) {
      classTitleById.set(String(item.id), String(item.title ?? item.id))
    }
  }

  const freeTitleById = new Map<string, string>()
  if (freeIds.length > 0) {
    const { data: freeCourses } = await supabase.from('free_courses').select('id, title').in('id', freeIds)
    for (const item of freeCourses ?? []) {
      freeTitleById.set(String(item.id), String(item.title ?? item.id))
    }
  }

  const enrollments = (rows ?? []).map((row) => {
    const clerkId = String(row.clerk_id ?? '')
    const profile = profilesByClerk.get(clerkId)
    const classId = String(row.class_id ?? '')
    const freeCourseId = String(row.free_course_id ?? '')
    return {
      id: String(row.id),
      clerkId,
      fullName: profile?.fullName ?? 'Student',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      classId: classId || freeCourseId,
      classTitle:
        classTitleById.get(classId) ||
        freeTitleById.get(freeCourseId) ||
        classId ||
        freeCourseId ||
        'Class',
      kind: String(row.kind ?? 'online'),
      status: String(row.status ?? 'ongoing'),
      planTier: row.plan_tier ? String(row.plan_tier) : null,
      billingStatus: row.billing_status ? String(row.billing_status) : null,
      progress: Number(row.progress ?? 0),
      enrolledAt: String(row.enrolled_at ?? ''),
    }
  })

  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, title, category_id, published')
    .order('title', { ascending: true })
    .limit(200)

  json(res, 200, {
    enrollments,
    classes: (allClasses ?? []).map((item) => ({
      id: String(item.id),
      title: String(item.title ?? item.id),
      categoryId: String(item.category_id ?? ''),
      published: Boolean(item.published),
    })),
  })
}

async function handleAdminMentorAllowlist(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  const ctx = await requireAdminApi(req, res, env)
  if (!ctx) return
  const { supabase } = ctx

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('mentor_allowlist')
      .select('id, email, note, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      if (isMissingTableError(error)) {
        json(res, 200, {
          emails: builtinMentorAllowlistEntries(),
          setupRequired: true,
          error: 'Run supabase/mentor-allowlist.sql in the Supabase SQL editor first.',
        })
        return
      }
      console.error('[dev-api] mentor allowlist list', error)
      json(res, 500, { error: 'Could not load mentor emails' })
      return
    }
    const fromDb = (data ?? []).map((row) => ({
      id: String(row.id),
      email: String(row.email),
      note: row.note ? String(row.note) : '',
      createdAt: String(row.created_at),
      permanent: isBuiltinMentorEmail(String(row.email)),
    }))
    const seen = new Set(fromDb.map((e) => normalizeMentorEmail(e.email)))
    for (const builtin of builtinMentorAllowlistEntries()) {
      if (seen.has(normalizeMentorEmail(builtin.email))) continue
      fromDb.unshift(builtin)
    }
    json(res, 200, { emails: fromDb })
    return
  }

  if (req.method === 'POST') {
    let body: { email?: string; note?: string }
    try {
      body = (await readBodyJson(req)) as typeof body
    } catch {
      json(res, 400, { error: 'Invalid JSON' })
      return
    }
    const email = normalizeMentorEmail(body.email ?? '')
    if (!email || !email.includes('@')) {
      json(res, 400, { error: 'A valid email is required' })
      return
    }
    const { error } = await supabase.from('mentor_allowlist').upsert(
      { email, note: body.note?.trim() || null },
      { onConflict: 'email' },
    )
    if (error) {
      if (isMissingTableError(error)) {
        json(res, 503, { error: 'Run supabase/mentor-allowlist.sql in the Supabase SQL editor first.' })
        return
      }
      console.error('[dev-api] mentor allowlist add', error)
      json(res, 500, { error: 'Could not add mentor email' })
      return
    }
    json(res, 200, { ok: true, email })
    return
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url ?? '', 'http://localhost')
    const email = normalizeMentorEmail(url.searchParams.get('email') ?? '')
    if (!email) {
      json(res, 400, { error: 'Email is required' })
      return
    }
    if (isBuiltinMentorEmail(email)) {
      json(res, 403, { error: 'This mentor email is permanent and cannot be removed.' })
      return
    }
    const { error } = await supabase.from('mentor_allowlist').delete().eq('email', email)
    if (error) {
      console.error('[dev-api] mentor allowlist delete', error)
      json(res, 500, { error: 'Could not remove mentor email' })
      return
    }
    json(res, 200, { ok: true })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleAdminMentorApplications(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  const ctx = await requireAdminApi(req, res, env)
  if (!ctx) return

  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('mentor_applications')
      .select(
        'id, full_name, email, phone, expertise, experience, message, college, portfolio_url, status, admin_note, reviewed_at, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) {
      if (isMissingTableError(error)) {
        json(res, 200, { applications: [] })
        return
      }
      console.error('[dev-api] mentor applications', error)
      json(res, 500, { error: 'Could not load mentor applications' })
      return
    }
    json(res, 200, {
      applications: (data ?? []).map((row) => ({
        id: String(row.id),
        fullName: String(row.full_name ?? ''),
        email: String(row.email ?? ''),
        phone: String(row.phone ?? ''),
        expertise: String(row.expertise ?? ''),
        experience: String(row.experience ?? ''),
        message: String(row.message ?? ''),
        college: String(row.college ?? ''),
        portfolioUrl: String(row.portfolio_url ?? ''),
        status: String(row.status ?? 'pending'),
        adminNote: String(row.admin_note ?? ''),
        reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
        createdAt: String(row.created_at ?? ''),
      })),
    })
    return
  }

  if (req.method === 'POST') {
    let body: { applicationId?: string; action?: string; adminNote?: string }
    try {
      body = (await readBodyJson(req)) as typeof body
    } catch {
      json(res, 400, { error: 'Invalid JSON' })
      return
    }

    const applicationId = body.applicationId?.trim()
    const action = body.action?.trim()
    if (!applicationId || (action !== 'approve' && action !== 'reject')) {
      json(res, 400, { error: 'applicationId and action (approve|reject) are required' })
      return
    }

    const { data: appRow, error: fetchError } = await ctx.supabase
      .from('mentor_applications')
      .select('id, full_name, email, expertise, status')
      .eq('id', applicationId)
      .maybeSingle()

    if (fetchError || !appRow) {
      json(res, 404, { error: 'Application not found' })
      return
    }

    const currentStatus = String(appRow.status ?? 'pending')
    if (currentStatus !== 'pending') {
      json(res, 409, { error: `Application is already ${currentStatus}` })
      return
    }

    const adminNote = body.adminNote?.trim() || null
    const reviewedAt = new Date().toISOString()
    const email = normalizeMentorEmail(String(appRow.email ?? ''))

    if (action === 'approve') {
      const { error: allowError } = await ctx.supabase.from('mentor_allowlist').upsert(
        {
          email,
          note: String(appRow.expertise ?? '').trim() || String(appRow.full_name ?? 'Approved mentor'),
        },
        { onConflict: 'email' },
      )
      if (allowError) {
        if (isMissingTableError(allowError)) {
          json(res, 503, { error: 'Run supabase/mentor-allowlist.sql in the Supabase SQL editor first.' })
          return
        }
        console.error('[dev-api] mentor approve allowlist', allowError)
        json(res, 500, { error: 'Could not add mentor to allowlist' })
        return
      }
    }

    const { error: updateError } = await ctx.supabase
      .from('mentor_applications')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: reviewedAt,
        admin_note: adminNote,
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('[dev-api] mentor application review', updateError)
      json(res, 500, { error: 'Could not update application' })
      return
    }

    json(res, 200, { ok: true, status: action === 'approve' ? 'approved' : 'rejected' })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleMentorApply(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  let body: {
    fullName?: string
    email?: string
    phone?: string
    expertise?: string
    experience?: string
    message?: string
    college?: string
    portfolioUrl?: string
  }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const fullName = body.fullName?.trim()
  const email = body.email?.trim()
  const expertise = body.expertise?.trim()
  if (!fullName || !email || !expertise) {
    json(res, 400, { error: 'Name, email, and expertise are required' })
    return
  }

  const phone = body.phone?.trim() || null
  const experience = body.experience?.trim() || null
  const message = body.message?.trim() || null
  const college = body.college?.trim() || null
  const portfolioUrl = body.portfolioUrl?.trim() || null
  const normalizedEmail = normalizeMentorEmail(email)

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Could not save application — configure Supabase.' })
    return
  }

  const { data: existingPending, error: pendingError } = await supabase
    .from('mentor_applications')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingError && !isMissingTableError(pendingError)) {
    console.error('[dev-api] mentor apply pending check', pendingError)
    json(res, 500, { error: 'Could not verify application status' })
    return
  }
  if (existingPending?.id) {
    json(res, 409, {
      error: 'You already have a pending mentor request. We will email you once admin reviews it.',
    })
    return
  }

  let alreadyApproved = false
  try {
    alreadyApproved = await isMentorEmailAllowed(supabase, normalizedEmail)
  } catch (err) {
    console.error('[dev-api] mentor apply allowlist', err)
    json(res, 500, { error: 'Could not verify mentor access' })
    return
  }
  if (alreadyApproved) {
    json(res, 409, {
      error: 'This email is already approved. Sign up and choose Mentor during onboarding.',
    })
    return
  }

  const { error } = await supabase.from('mentor_applications').insert({
    full_name: fullName,
    email: normalizedEmail,
    phone,
    expertise,
    experience,
    message,
    college,
    portfolio_url: portfolioUrl,
    status: 'pending',
  })
  if (error) {
    console.error('[dev-api] mentor apply db', error)
    const msg = error.message ?? ''
    if (/status|portfolio_url|college/i.test(msg) && /does not exist|could not find/i.test(msg)) {
      json(res, 503, {
        error:
          'Database needs an update — run supabase/mentor-applications-v2.sql in the Supabase SQL editor, then try again.',
      })
      return
    }
    json(res, 500, { error: 'Could not save application. Please try again in a moment.' })
    return
  }

  const html = `
    <h2>New mentor application on PRIZMA</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone ?? '—'}</p>
    <p><strong>Teaches:</strong> ${expertise}</p>
    <p><strong>College:</strong> ${college ?? '—'}</p>
    <p><strong>Experience:</strong> ${experience ?? '—'}</p>
    <p><strong>Portfolio:</strong> ${portfolioUrl ?? '—'}</p>
    <p><strong>Message:</strong></p>
    <p>${message ?? '—'}</p>
  `

  after(async () => {
    try {
      await sendNotifyEmail(env, `Mentor application: ${fullName}`, html)
    } catch (err) {
      console.error('[dev-api] mentor apply notify', err)
    }
  })

  json(res, 200, { ok: true })
}

async function handleCashfreeCreateOrder(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const cfg = cashfreeCfg(env)
  if (!isCashfreeConfigured(cfg)) {
    json(res, 503, {
      error: 'Cashfree not configured. Add CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET to .env',
    })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  let body: {
    classId?: string
    purpose?: string
    planTier?: string
    phone?: string
  }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const classId = body.classId?.trim()
  const purpose = body.purpose
  if (!classId || (purpose !== 'paid' && purpose !== 'trial')) {
    json(res, 400, { error: 'classId and purpose (paid|trial) required' })
    return
  }

  let planTier: 'monthly' | 'three-month' | 'six-month' | undefined
  if (purpose === 'paid') {
    if (
      body.planTier !== 'monthly' &&
      body.planTier !== 'three-month' &&
      body.planTier !== 'six-month'
    ) {
      json(res, 400, { error: 'planTier must be monthly, three-month, or six-month for paid checkout' })
      return
    }
    planTier = body.planTier
  }

  const { data: classRow, error: classErr } = await supabase
    .from('classes')
    .select('category_id')
    .eq('id', classId)
    .maybeSingle()

  if (classErr || !classRow?.category_id) {
    json(res, 404, { error: 'Class not found' })
    return
  }

  const { data: activeEnr } = await supabase
    .from('student_enrollments')
    .select('billing_status, status, plan_tier')
    .eq('clerk_id', clerkId)
    .eq('class_id', classId)
    .maybeSingle()

  if (activeEnr && isActiveEnrollmentRow(activeEnr)) {
    const upgradingFromTrial =
      purpose === 'paid' &&
      activeEnr.billing_status === 'trial' &&
      activeEnr.plan_tier === 'trial'
    if (!upgradingFromTrial) {
      json(res, 409, { error: activeEnrollmentBlockedMessage(activeEnr.plan_tier) })
      return
    }
  }

  const categoryId = classRow.category_id as string
  if (categoryId !== 'skills' && categoryId !== 'professional' && categoryId !== 'academic') {
    json(res, 400, { error: 'Invalid class category for pricing' })
    return
  }

  let amount = TRIAL_VERIFY_INR
  if (purpose === 'paid' && planTier) {
    amount = await resolveServerPaymentAmount(supabase, categoryId, planTier)
  }

  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkId)
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    undefined

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('phone, email, full_name')
    .eq('clerk_id', clerkId)
    .maybeSingle()

  const phone = firstIndianMobile(
    profileRow?.phone as string | null | undefined,
    user.primaryPhoneNumber?.phoneNumber,
    ...user.phoneNumbers.map((p) => p.phoneNumber),
    body.phone,
  )
  const customerEmail =
    email ??
    (typeof profileRow?.email === 'string' && profileRow.email.includes('@')
      ? profileRow.email.trim()
      : undefined)

  if (!phone) {
    json(res, 400, {
      error:
        'Add your 10-digit WhatsApp number on Profile before paying, or enter it at checkout.',
      code: 'missing_customer_phone',
    })
    return
  }
  if (!customerEmail) {
    json(res, 400, {
      error: 'Your account is missing an email address. Add one on Profile, then try again.',
      code: 'missing_customer_email',
    })
    return
  }

  if (body.phone && !profileRow?.phone) {
    const { error: phoneSaveErr } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('clerk_id', clerkId)
    if (phoneSaveErr) {
      console.warn('[dev-api] cashfree create-order phone save failed', phoneSaveErr.message)
    }
  }

  const orderId = `edu_${Date.now()}`
  const origin = paymentReturnBase(env, req)
  const returnUrl = `${origin}/student/payment/return?order_id={order_id}`

  const note = {
    v: 1 as const,
    clerkId,
    classId,
    purpose: purpose as 'paid' | 'trial',
    planTier: purpose === 'paid' ? planTier : undefined,
  }

  try {
    const created = await cashfreeCreateOrder(cfg, {
      orderId,
      amount,
      customerId: clerkId,
      customerName:
        user.fullName?.trim() ||
        (typeof profileRow?.full_name === 'string' ? profileRow.full_name.trim() : '') ||
        undefined,
      customerEmail,
      customerPhone: phone,
      returnUrl,
      orderNote: JSON.stringify(note),
    })

    try {
      await upsertCashfreeOrderIntent(supabase, {
        order_id: orderId,
        clerk_id: clerkId,
        class_id: classId,
        purpose: purpose as 'paid' | 'trial',
        plan_tier: purpose === 'paid' ? planTier ?? null : null,
      })
    } catch (intentErr) {
      console.warn('[dev-api] cashfree create-order intent save failed', {
        orderId,
        clerkId,
        error: intentErr instanceof Error ? intentErr.message : intentErr,
      })
    }

    console.info('[dev-api] cashfree create-order ok', {
      orderId,
      clerkId,
      classId,
      purpose,
      planTier: planTier ?? null,
      customerId: clerkId,
      customerEmailSet: Boolean(customerEmail),
      customerPhoneLast4: phone.slice(-4),
      mode: cfg.mode,
      returnUrl,
    })

    json(res, 200, {
      paymentSessionId: created.paymentSessionId,
      orderId,
      returnUrl,
      mode: cfg.mode === 'production' ? 'production' : 'sandbox',
    })
  } catch (err) {
    console.error('[dev-api] cashfree create', err)
    json(res, 500, {
      error: err instanceof Error ? err.message : 'Cashfree order failed',
    })
  }
}

async function handleCashfreeConfirm(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.clerkSecretKey) {
    json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
    return
  }

  const cfg = cashfreeCfg(env)
  if (!isCashfreeConfigured(cfg)) {
    json(res, 503, { error: 'Cashfree not configured' })
    return
  }

  const supabase = requireSupabaseAdmin(env)
  if (!supabase) {
    json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const clerkId = await verifyClerkSession(req, env.clerkSecretKey)
  if (!clerkId) {
    json(res, 401, { error: 'Missing or invalid session token' })
    return
  }

  let body: { orderId?: string }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const orderId = body.orderId?.trim()
  if (!orderId) {
    json(res, 400, { error: 'orderId required' })
    return
  }

  try {
    const order = await fetchPaidCashfreeOrder(cfg, orderId)
    const intent = await getCashfreeOrderIntent(supabase, orderId).catch((err) => {
      console.warn('[dev-api] cashfree confirm intent load failed', {
        orderId,
        error: err instanceof Error ? err.message : err,
      })
      return null
    })

    const resolved = resolvePaymentEnrollmentNote({
      clerkId,
      orderId,
      rawOrderNote: order.orderNoteRaw ?? order.orderNote,
      cashfreeCustomerId: order.customerId,
      intent,
    })

    console.info('[dev-api] cashfree confirm identity', {
      orderId,
      sessionClerkId: clerkId,
      orderStatus: order.orderStatus,
      cashfreeCustomerId: order.customerId ?? null,
      hasIntent: Boolean(intent),
      resolved: resolved.ok ? { source: resolved.source, classId: resolved.note.classId } : resolved,
    })

    if (resolved.ok === false) {
      const status =
        resolved.code === 'order_note_unreadable' || resolved.code === 'missing_cashfree_customer'
          ? 400
          : 403
      console.warn('[dev-api] cashfree confirm rejected', {
        orderId,
        sessionClerkId: clerkId,
        code: resolved.code,
        details: resolved.details,
      })
      json(res, status, { error: resolved.message, code: resolved.code })
      return
    }

    const note = resolved.note
    const paymentLabel = `Cashfree · ${orderId}`
    await upsertEnrollmentAfterPayment(supabase, note, paymentLabel, TRIAL_DAYS)

    console.info('[dev-api] cashfree confirm enrolled', {
      orderId,
      clerkId: note.clerkId,
      classId: note.classId,
      purpose: note.purpose,
      planTier: note.planTier ?? null,
    })

    const redirect =
      note.purpose === 'paid'
        ? `/student/enrolled/${note.classId}?plan=${note.planTier ?? 'monthly'}`
        : '/student'

    json(res, 200, { ok: true, redirect })
  } catch (err) {
    console.error('[dev-api] cashfree confirm', err)
    const message = err instanceof Error ? err.message : 'Could not confirm payment'
    const status = message.includes('not completed yet') ? 400 : 500
    json(res, status, { error: message })
  }
}

function isCashfreeOrderPaid(status: string): boolean {
  const s = status.toUpperCase().trim()
  // Cashfree order_status: only PAID means money collected. ACTIVE = checkout started, not paid.
  return s === 'PAID'
}

async function fetchPaidCashfreeOrder(cfg: CashfreeServerConfig, orderId: string) {
  const delays = [0, 1500, 3000, 5000]
  let lastStatus = ''
  for (const delay of delays) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay))
    const order = await cashfreeFetchOrder(cfg, orderId)
    lastStatus = order.orderStatus
    if (isCashfreeOrderPaid(lastStatus)) return order
  }
  throw new Error(
    `Payment not completed yet (status: ${lastStatus || 'unknown'}). Wait a moment and open this page again from your dashboard.`,
  )
}

async function handleAiResumeReview(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.geminiApiKey) {
    json(res, 503, {
      error: 'AI is not configured. Add GEMINI_API_KEY in server environment (free at Google AI Studio).',
    })
    return
  }

  let body: { resumeText?: string }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const resumeText = body.resumeText?.trim()
  if (!resumeText || resumeText.length < 80) {
    json(res, 400, { error: 'Paste at least 80 characters of resume text to analyze.' })
    return
  }

  try {
    const result = await generateGeminiText(
      env.geminiApiKey,
      `Review this student resume:\n\n${truncateForAi(resumeText)}`,
      RESUME_REVIEW_SYSTEM,
    )
    json(res, 200, { result })
  } catch (err) {
    console.error('[dev-api] ai resume-review', err)
    json(res, 500, {
      error: err instanceof Error ? err.message : 'AI analysis failed',
    })
  }
}

async function handleAiOpportunityMatch(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.geminiApiKey) {
    json(res, 503, {
      error: 'AI is not configured. Add GEMINI_API_KEY in server environment (free at Google AI Studio).',
    })
    return
  }

  let body: { stream?: string; year?: string; skills?: string; goals?: string }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const stream = body.stream?.trim()
  const year = body.year?.trim()
  const skills = body.skills?.trim()
  const goals = body.goals?.trim() ?? ''

  if (!stream || !year || !skills) {
    json(res, 400, { error: 'Stream, year, and skills are required.' })
    return
  }

  const prompt = `Today's date: ${new Date().toISOString().slice(0, 10)}
Student profile:
- Stream/degree: ${stream}
- Year: ${year}
- Skills & interests: ${truncateForAi(skills, 2000)}
- Goals: ${goals ? truncateForAi(goals, 1000) : 'Not specified'}

Search official careers pages for 8 DIFFERENT companies (not only Google). Mix Microsoft, Amazon, Adobe, Zoho, Freshworks, Flipkart, Swiggy, Razorpay, PhonePe, Uber. Each applyUrl must be that company's own careers/jobs page — never Unstop, Internshala, LinkedIn, or Naukri. Return one JSON object only.`

  try {
    let raw: string
    try {
      raw = await generateGeminiText(env.geminiApiKey, prompt, OPPORTUNITY_MATCH_SYSTEM, {
        search: true,
        maxOutputTokens: 4096,
        temperature: 0.45,
      })
    } catch (searchErr) {
      console.error('[dev-api] ai opportunity-match search fallback', searchErr)
      raw = await generateGeminiText(env.geminiApiKey, prompt, OPPORTUNITY_MATCH_SYSTEM, {
        maxOutputTokens: 4096,
        temperature: 0.45,
      })
    }
    const payload = parseOpportunityMatchPayload(raw)
    json(res, 200, {
      snapshot: payload.snapshot,
      matches: payload.matches,
      next: payload.next,
    })
  } catch (err) {
    console.error('[dev-api] ai opportunity-match', err)
    json(res, 500, {
      error: err instanceof Error ? err.message : 'AI matching failed',
    })
  }
}

async function handleAiOpportunityVoice(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  if (!env.geminiApiKey) {
    json(res, 503, {
      error: 'AI is not configured. Add GEMINI_API_KEY in server environment (free at Google AI Studio).',
    })
    return
  }

  let body: { transcript?: string; audioBase64?: string; mimeType?: string }
  try {
    body = (await readBodyJson(req)) as typeof body
  } catch {
    json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const transcript = body.transcript?.trim() ?? ''
  const audioBase64 = body.audioBase64?.trim() ?? ''
  const mimeType = body.mimeType?.trim() || 'audio/webm'

  if (!transcript && !audioBase64) {
    json(res, 400, { error: 'Speak something, or type a short note about yourself.' })
    return
  }

  if (audioBase64.length > 6_000_000) {
    json(res, 400, { error: 'Voice clip is too long. Keep it under 40 seconds.' })
    return
  }

  const parts: GeminiPart[] = []
  if (audioBase64) {
    parts.push({ inlineData: { mimeType, data: audioBase64 } })
  }
  parts.push({
    text: transcript
      ? `Extract the student profile from this spoken note:\n\n${truncateForAi(transcript, 4000)}`
      : 'Extract the student profile from this voice recording. The student may speak Hindi, English, or Hinglish.',
  })

  try {
    const raw = await generateGeminiParts(env.geminiApiKey, parts, VOICE_PROFILE_SYSTEM, {
      json: true,
      maxOutputTokens: 512,
      temperature: 0.2,
    })
    const profile = parseVoiceProfilePayload(raw)
    if (!profile.stream && !profile.year && !profile.skills && !profile.goals) {
      json(res, 422, {
        error: 'Could not catch your details. Try again, a bit slower.',
      })
      return
    }
    json(res, 200, profile)
  } catch (err) {
    console.error('[dev-api] ai opportunity-voice', err)
    json(res, 500, {
      error: err instanceof Error ? err.message : 'Could not read your voice note',
    })
  }
}

/** Shared API router for Next.js Route Handlers. Returns true if route matched. */
export function handleDevApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): boolean {
  const path = req.url?.split('?')[0]

  if (
    path &&
    tryHandleRoleDashboardApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      isAdminClerkUser,
      readBodyJson,
      syncClerkUserIdToSupabase,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleUniversityLeadApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      isAdminClerkUser,
      readBodyJson,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleMentorClassShareApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      readBodyJson,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleClassNotificationsApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      readBodyJson,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleClassAttendanceApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      readBodyJson,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleClassTeachingPlanApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      readBodyJson,
    })
  ) {
    return true
  }

  if (
    path &&
    tryHandleCategoryPricingApi(path, req, res, env, {
      json,
      verifyClerkSession,
      requireSupabaseAdmin,
      isAdminClerkUser,
      readBodyJson,
    })
  ) {
    return true
  }

  if (path === '/api/user/role') {
    void handleSetRole(req, res, env).catch((err) => {
      console.error('[dev-api] role', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/profile-sync') {
    void handleProfileSync(req, res, env).catch((err) => {
      console.error('[dev-api] profile-sync', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/profile-details') {
    void handleProfileDetails(req, res, env).catch((err) => {
      console.error('[dev-api] profile-details', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/profile') {
    void handleGetProfile(req, res, env).catch((err) => {
      console.error('[dev-api] profile get', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/delete-account') {
    void handleDeleteAccount(req, res, env).catch((err) => {
      console.error('[dev-api] delete-account', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/enrollments') {
    void handleGetEnrollments(req, res, env).catch((err) => {
      console.error('[dev-api] enrollments', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/webhooks/clerk') {
    void handleClerkWebhook(req, res, env).catch((err) => {
      console.error('[dev-api] webhook', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/mentor/apply') {
    void handleMentorApply(req, res, env).catch((err) => {
      console.error('[dev-api] mentor apply', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/counselling/book') {
    void handleCounsellingBook(req, res, env).catch((err) => {
      console.error('[dev-api] counselling book', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/counselling/create-order') {
    void handleCounsellingCreateOrder(req, res, env).catch((err) => {
      console.error('[dev-api] counselling create-order', err)
      json(res, 500, {
        error: err instanceof Error ? err.message : 'Internal server error',
      })
    })
    return true
  }

  if (path === '/api/counselling/confirm') {
    void handleCounsellingConfirm(req, res, env).catch((err) => {
      console.error('[dev-api] counselling confirm', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/counselling/my-bookings') {
    void handleCounsellingMyBookings(req, res, env).catch((err) => {
      console.error('[dev-api] counselling my-bookings', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/mentor-eligible') {
    void handleMentorEligible(req, res, env).catch((err) => {
      console.error('[dev-api] mentor-eligible', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/user/mentor-application') {
    void handleMentorApplicationPrefill(req, res, env).catch((err) => {
      console.error('[dev-api] mentor-application', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/admin/counselling-bookings') {
    void handleAdminCounsellingBookings(req, res, env).catch((err) => {
      console.error('[dev-api] admin counselling-bookings', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/admin/enrollments') {
    void handleAdminEnrollments(req, res, env).catch((err) => {
      console.error('[dev-api] admin enrollments', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/admin/mentor-allowlist') {
    void handleAdminMentorAllowlist(req, res, env).catch((err) => {
      console.error('[dev-api] admin mentor-allowlist', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/admin/mentor-applications') {
    void handleAdminMentorApplications(req, res, env).catch((err) => {
      console.error('[dev-api] admin mentor-applications', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/cashfree/create-order') {
    void handleCashfreeCreateOrder(req, res, env).catch((err) => {
      console.error('[dev-api] cashfree create-order', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/cashfree/confirm') {
    void handleCashfreeConfirm(req, res, env).catch((err) => {
      console.error('[dev-api] cashfree confirm', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/ai/resume-review') {
    void handleAiResumeReview(req, res, env).catch((err) => {
      console.error('[dev-api] ai resume-review', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/ai/opportunity-match') {
    void handleAiOpportunityMatch(req, res, env).catch((err) => {
      console.error('[dev-api] ai opportunity-match', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  if (path === '/api/ai/opportunity-voice') {
    void handleAiOpportunityVoice(req, res, env).catch((err) => {
      console.error('[dev-api] ai opportunity-voice', err)
      json(res, 500, { error: 'Internal server error' })
    })
    return true
  }

  return false
}

export function devApiEnvFromProcess(): DevApiEnv {
  const vercelHost = process.env.VERCEL_URL?.trim()
  const publicAppUrl =
    process.env.PUBLIC_APP_URL?.trim() ||
    (vercelHost ? `https://${vercelHost.replace(/^https?:\/\//, '')}` : undefined)

  return {
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      process.env.VITE_SUPABASE_URL ??
      process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    notifyEmail: process.env.NOTIFY_EMAIL,
    resendApiKey: process.env.RESEND_API_KEY,
    cashfreeClientId: process.env.CASHFREE_CLIENT_ID,
    cashfreeClientSecret: process.env.CASHFREE_CLIENT_SECRET,
    cashfreeMode: parseCashfreeMode(process.env.CASHFREE_MODE, process.env.CASHFREE_CLIENT_SECRET),
    publicAppUrl,
    adminClerkUserIds: process.env.ADMIN_CLERK_USER_IDS,
    geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  }
}
