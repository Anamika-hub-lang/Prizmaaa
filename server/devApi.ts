import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { verifyWebhook } from '@clerk/backend/webhooks'
import { profileRowFromClerkUser, profileRowFromClerkWebhook } from './lib/profileRow'
import { createServiceSupabase, upsertProfile, upsertProfileDetails } from './lib/supabaseAdmin'
import { sendNotifyEmail } from './lib/sendNotifyEmail'
import {
  cashfreeCreateOrder,
  cashfreeFetchOrder,
  isCashfreeConfigured,
  type CashfreeServerConfig,
} from './lib/cashfreeServer'
import { upsertEnrollmentAfterPayment } from './lib/enrollmentAdmin'
import {
  getCashfreeOrderIntent,
  resolvePaymentEnrollmentNote,
  upsertCashfreeOrderIntent,
} from './lib/cashfreeOrderIntent'
import { TRIAL_DAYS, serverPaymentAmount } from './lib/pricingServer'
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
import { validateIndianPhoneServer, validateScheduledDateTime } from './lib/phoneValidation'
import { resolveBookingAssignment } from './lib/counsellorAssign'
import { tryHandleRoleDashboardApi } from './roleDashboardApi'

const TRIAL_VERIFY_INR = 1
const COUNSELLING_PRICE_INR = 200

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
}

function cashfreeCfg(env: DevApiEnv): CashfreeServerConfig {
  return {
    clientId: env.cashfreeClientId,
    clientSecret: env.cashfreeClientSecret,
    mode: env.cashfreeMode === 'production' ? 'production' : 'sandbox',
  }
}

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host ?? 'localhost:3000'
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) ??
    (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** Cashfree return_url must be https in production; stay on same host so Clerk + stored order id match. */
function paymentReturnBase(env: DevApiEnv, req: IncomingMessage): string {
  const origin = requestOrigin(req)
  const configured = env.publicAppUrl?.trim().replace(/\/$/, '')
  const mode = env.cashfreeMode === 'production' ? 'production' : 'sandbox'

  if (origin.startsWith('https://')) {
    return origin
  }

  if (configured?.startsWith('https://')) {
    return configured
  }

  if (mode === 'production' && origin.startsWith('http://')) {
    throw new Error(
      'Cashfree production needs an https return URL. Add PUBLIC_APP_URL=https://your-live-site.com in .env. For local testing use an https tunnel (e.g. ngrok) or Cashfree sandbox keys with CASHFREE_MODE=sandbox.',
    )
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
    json(res, 403, { error: 'Account role is already set' })
    return
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
    json(res, 200, { ok: true })
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
  _env: DevApiEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  json(res, 400, {
    error: 'Direct booking is disabled. Pay ₹200 via Cashfree to confirm your session.',
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
      amount: COUNSELLING_PRICE_INR,
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
      amount_inr: COUNSELLING_PRICE_INR,
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
        amountInr: COUNSELLING_PRICE_INR,
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
      amountInr: Number(row.amount_inr ?? COUNSELLING_PRICE_INR),
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

  const supabase = requireSupabaseAdmin(env)
  if (supabase) {
    const { error } = await supabase.from('mentor_applications').insert({
      full_name: fullName,
      email,
      phone,
      expertise,
      experience,
      message,
    })
    if (error) {
      console.error('[dev-api] mentor apply db', error)
      json(res, 500, { error: 'Could not save application' })
      return
    }
  }

  const html = `
    <h2>New mentor application on PRIZMA</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone ?? '—'}</p>
    <p><strong>Teaches:</strong> ${expertise}</p>
    <p><strong>Experience:</strong> ${experience ?? '—'}</p>
    <p><strong>Message:</strong></p>
    <p>${message ?? '—'}</p>
  `

  try {
    await sendNotifyEmail(env, `Mentor application: ${fullName}`, html)
  } catch {
    if (!supabase) {
      json(res, 503, { error: 'Could not send application — configure Supabase or RESEND_API_KEY' })
      return
    }
  }

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

  let planTier: 'monthly' | 'three-month' | undefined
  if (purpose === 'paid') {
    if (body.planTier !== 'monthly' && body.planTier !== 'three-month') {
      json(res, 400, { error: 'planTier must be monthly or three-month for paid checkout' })
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
    amount = serverPaymentAmount(categoryId, planTier)
  }

  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkId)
  const email = user.emailAddresses[0]?.emailAddress
  const phone = user.phoneNumbers[0]?.phoneNumber

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
      customerName: user.fullName ?? undefined,
      customerEmail: email,
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

  if (path === '/api/admin/counselling-bookings') {
    void handleAdminCounsellingBookings(req, res, env).catch((err) => {
      console.error('[dev-api] admin counselling-bookings', err)
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
    cashfreeMode: process.env.CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
    publicAppUrl,
    adminClerkUserIds: process.env.ADMIN_CLERK_USER_IDS,
  }
}
