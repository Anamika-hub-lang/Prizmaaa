import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { verifyWebhook } from '@clerk/backend/webhooks'
import type { Plugin } from 'vite'
import { profileRowFromClerkUser, profileRowFromClerkWebhook } from '../lib/profileRow.js'
import { createServiceSupabase, upsertProfile, upsertProfileDetails } from '../lib/supabaseAdmin.js'
import { sendNotifyEmail } from '../lib/sendNotifyEmail.js'
import {
  cashfreeCreateOrder,
  cashfreeFetchOrder,
  isCashfreeConfigured,
  type CashfreeServerConfig,
} from '../lib/cashfreeServer.js'
import { parseOrderNote, upsertEnrollmentAfterPayment } from '../lib/enrollmentAdmin.js'
import { TRIAL_DAYS, serverPaymentAmount } from '../lib/pricingServer.js'
import {
  isActiveEnrollmentRow,
  activeEnrollmentBlockedMessage,
} from '../lib/enrollmentPolicy.js'

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
}

function cashfreeCfg(env: DevApiEnv): CashfreeServerConfig {
  return {
    clientId: env.cashfreeClientId,
    clientSecret: env.cashfreeClientSecret,
    mode: env.cashfreeMode === 'production' ? 'production' : 'sandbox',
  }
}

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host ?? 'localhost:5173'
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) ??
    (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** Cashfree return_url must be https in production; override with PUBLIC_APP_URL when testing locally. */
function paymentReturnBase(env: DevApiEnv, req: IncomingMessage): string {
  const configured = env.publicAppUrl?.trim().replace(/\/$/, '')
  if (configured) {
    if (!configured.startsWith('https://')) {
      throw new Error('PUBLIC_APP_URL must start with https:// (required by Cashfree).')
    }
    return configured
  }

  const origin = requestOrigin(req)
  const mode = env.cashfreeMode === 'production' ? 'production' : 'sandbox'

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
  const phone = String(body.phone ?? '').trim()
  const city = String(body.city ?? '').trim() || null
  const howDidYouFindUs = String(body.howDidYouFindUs ?? '')
  const howDetail = String(body.howDidYouFindUsDetail ?? '').trim() || null

  if (!firstName || !lastName || !phone) {
    json(res, 400, { error: 'First name, last name, and phone are required' })
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
    const edu = String(body.studentEducationLevel ?? '')
    studentGradeOrProgram = String(body.studentGradeOrProgram ?? '').trim()
    studentLearningGoals = String(body.studentLearningGoals ?? '').trim()
    if (!EDU_LEVELS.has(edu) || !studentGradeOrProgram || !studentLearningGoals) {
      json(res, 400, { error: 'Complete all student fields' })
      return
    }
    studentEducationLevel = edu
  } else {
    mentorExpertise = String(body.mentorExpertise ?? '').trim()
    mentorQualifications = String(body.mentorQualifications ?? '').trim()
    mentorBio = String(body.mentorBio ?? '').trim()
    mentorPortfolioUrl = String(body.mentorPortfolioUrl ?? '').trim() || null
    const years = Number(body.mentorExperienceYears)
    if (!mentorExpertise || !mentorQualifications || !mentorBio || Number.isNaN(years)) {
      json(res, 400, { error: 'Complete all mentor fields' })
      return
    }
    mentorExperienceYears = Math.min(60, Math.max(0, Math.floor(years)))
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
    <h2>New mentor application on Educture</h2>
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
    json(res, 409, { error: activeEnrollmentBlockedMessage(activeEnr.plan_tier) })
    return
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
  const returnUrl = `${origin}/student/payment/return?order_id=${encodeURIComponent(orderId)}`

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
    json(res, 200, {
      paymentSessionId: created.paymentSessionId,
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

    const note = parseOrderNote(order.orderNote)
    if (!note || note.clerkId !== clerkId) {
      json(res, 403, { error: 'Order does not match your account' })
      return
    }

    const paymentLabel = `Cashfree · ${orderId}`
    await upsertEnrollmentAfterPayment(supabase, note, paymentLabel, TRIAL_DAYS)

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
  const s = status.toUpperCase()
  return (
    s === 'PAID' ||
    s === 'ACTIVE' ||
    s === 'SUCCESS' ||
    s === 'COMPLETED' ||
    s === 'CAPTURED' ||
    s === 'PAYMENT_SUCCESS'
  )
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

function attachDevApi(
  middlewares: {
    use: (
      handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void
    ) => void
  },
  env: DevApiEnv
) {
  middlewares.use((req, res, next) => {
    if (!handleDevApiRequest(req, res, env)) next()
  })
}

/** Shared router for Vite dev middleware and Vercel serverless. Returns true if route matched. */
export function handleDevApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: DevApiEnv,
): boolean {
  const path = req.url?.split('?')[0]

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
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    notifyEmail: process.env.NOTIFY_EMAIL,
    resendApiKey: process.env.RESEND_API_KEY,
    cashfreeClientId: process.env.CASHFREE_CLIENT_ID,
    cashfreeClientSecret: process.env.CASHFREE_CLIENT_SECRET,
    cashfreeMode: process.env.CASHFREE_MODE === 'production' ? 'production' : 'sandbox',
    publicAppUrl,
  }
}

export function devApiPlugin(env: DevApiEnv): Plugin {
  return {
    name: 'educture-dev-api',
    configureServer(server) {
      attachDevApi(server.middlewares, env)
    },
    configurePreviewServer(server) {
      attachDevApi(server.middlewares, env)
    },
  }
}

/** @deprecated Use devApiPlugin */
export function clerkRoleApiPlugin(clerkSecretKey: string | undefined): Plugin {
  return devApiPlugin({ clerkSecretKey })
}
