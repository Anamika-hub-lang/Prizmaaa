import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendNotifyEmail } from './lib/sendNotifyEmail'
import { validateIndianPhoneServer } from './lib/phoneValidation'
import {
  isUniversityLeadSource,
  isUniversityLeadStatus,
  MISSING_LEADS_SQL,
  isMissingUniversityLeadsTable,
  leadMatchesPartner,
  mapLeadRow,
} from './lib/universityLeads'
import { QUALIFICATION_OPTIONS } from '../src/data/universityLeadFields'

type Env = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
  adminClerkUserIds?: string
  notifyEmail?: string
  resendApiKey?: string
}

type Helpers = {
  json: (res: ServerResponse, status: number, body: unknown) => void
  verifyClerkSession: (req: IncomingMessage, clerkSecretKey: string) => Promise<string | null>
  requireSupabaseAdmin: (env: Env) => SupabaseClient | null
  isAdminClerkUser: (clerkId: string, env: Env) => Promise<boolean>
  readBodyJson: (req: IncomingMessage) => Promise<unknown>
}

const LEAD_SELECT =
  'id, clerk_id, full_name, phone, email, course, preferred_location, qualification, university_id, university_name, source, status, assigned_counsellor_clerk_id, share_consent, follow_up_at, created_at, updated_at'

function missingTable(helpers: Helpers, res: ServerResponse, error: { code?: string; message?: string } | null) {
  if (!isMissingUniversityLeadsTable(error)) return false
  helpers.json(res, 503, { error: MISSING_LEADS_SQL })
  return true
}

async function optionalClerkId(req: IncomingMessage, env: Env, helpers: Helpers): Promise<string | null> {
  if (!env.clerkSecretKey) return null
  return helpers.verifyClerkSession(req, env.clerkSecretKey)
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

async function requireAdmin(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<string | null> {
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return null
  if (!(await helpers.isAdminClerkUser(clerkId, env))) {
    helpers.json(res, 403, { error: 'Admin access required' })
    return null
  }
  return clerkId
}

async function clerkRole(env: Env, clerkId: string): Promise<string | null> {
  if (!env.clerkSecretKey) return null
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkId)
  const role = user.publicMetadata?.role
  return typeof role === 'string' ? role : null
}

async function requireAdminOrCounsellor(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<{ clerkId: string; isAdmin: boolean } | null> {
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId) return null
  const isAdmin = await helpers.isAdminClerkUser(clerkId, env)
  if (isAdmin) return { clerkId, isAdmin: true }
  const role = await clerkRole(env, clerkId)
  if (role === 'counsellor') return { clerkId, isAdmin: false }
  helpers.json(res, 403, { error: 'Admin or counsellor access required' })
  return null
}

async function pickCounsellor(supabase: SupabaseClient): Promise<string | null> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('clerk_id')
    .eq('role', 'counsellor')
    .limit(80)
  const ids = [...new Set((profiles ?? []).map((p) => String(p.clerk_id)).filter(Boolean))]
  if (ids.length === 0) return null

  const { data: leads } = await supabase
    .from('university_leads')
    .select('assigned_counsellor_clerk_id')
    .in('assigned_counsellor_clerk_id', ids)
    .not('status', 'eq', 'CLOSED')

  const counts = new Map<string, number>(ids.map((id) => [id, 0]))
  for (const row of leads ?? []) {
    const id = row.assigned_counsellor_clerk_id as string | null
    if (id && counts.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  let best = ids[0]
  let bestCount = counts.get(best) ?? 0
  for (const id of ids) {
    const n = counts.get(id) ?? 0
    if (n < bestCount) {
      best = id
      bestCount = n
    }
  }
  return best
}

async function syncCommission(
  supabase: SupabaseClient,
  lead: {
    id: string
    status: string
    university_id: string
  },
): Promise<void> {
  const { data: partner } = await supabase
    .from('university_partners')
    .select('id, lead_commission_inr, admission_commission_inr')
    .eq('university_id', lead.university_id)
    .maybeSingle()

  const partnerId = (partner?.id as string | undefined) ?? null
  const leadFee = Number(partner?.lead_commission_inr ?? 0)
  const admitFee = Number(partner?.admission_commission_inr ?? 0)

  if (lead.status === 'CLOSED') {
    await supabase
      .from('university_commissions')
      .update({
        commission_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('lead_id', lead.id)
      .eq('commission_status', 'pending')
    return
  }

  if (lead.status !== 'APPLICATION_STARTED' && lead.status !== 'ADMITTED') return

  const admitted = lead.status === 'ADMITTED'
  await supabase.from('university_commissions').upsert(
    {
      lead_id: lead.id,
      partner_id: partnerId,
      university_id: lead.university_id,
      application_status: admitted ? 'offered' : 'started',
      admission_status: admitted ? 'admitted' : 'pending',
      commission_amount_inr: admitted ? admitFee || leadFee : leadFee,
      commission_status: 'pending',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'lead_id' },
  )
}

async function handleCreateLead(
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
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const fullName = String(body.fullName ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const course = String(body.course ?? '').trim()
  const preferredLocation = String(body.preferredLocation ?? '').trim() || null
  const qualification = String(body.qualification ?? '').trim()
  const universityId = String(body.universityId ?? '').trim()
  const universityName = String(body.universityName ?? '').trim()
  const source = body.source
  const shareConsent = body.shareConsent === true

  if (!fullName || !email || !email.includes('@') || !course || !qualification || !universityId || !universityName) {
    helpers.json(res, 400, { error: 'Name, email, course, qualification, and university are required' })
    return
  }
  if (!QUALIFICATION_OPTIONS.includes(qualification as (typeof QUALIFICATION_OPTIONS)[number])) {
    helpers.json(res, 400, { error: 'Invalid qualification' })
    return
  }
  if (!isUniversityLeadSource(source)) {
    helpers.json(res, 400, { error: 'Invalid lead source' })
    return
  }

  const phoneResult = validateIndianPhoneServer(String(body.phone ?? ''))
  if (phoneResult.ok === false) {
    helpers.json(res, 400, { error: phoneResult.error })
    return
  }

  const clerkId = await optionalClerkId(req, env, helpers)
  const assigned = await pickCounsellor(supabase)

  const payload = {
    clerk_id: clerkId,
    full_name: fullName,
    phone: phoneResult.digits,
    email,
    course,
    preferred_location: preferredLocation,
    qualification,
    university_id: universityId,
    university_name: universityName,
    source,
    status: 'NEW',
    assigned_counsellor_clerk_id: assigned,
    share_consent: shareConsent,
  }

  const { data, error } = await supabase
    .from('university_leads')
    .insert(payload)
    .select(LEAD_SELECT)
    .maybeSingle()

  if (error) {
    if (missingTable(helpers, res, error)) return
    if (error.code === '23505') {
      let existingQuery = supabase.from('university_leads').select(LEAD_SELECT).eq('university_id', universityId)
      existingQuery = clerkId
        ? existingQuery.eq('clerk_id', clerkId)
        : existingQuery.ilike('email', email)
      const { data: existing } = await existingQuery.maybeSingle()
      if (existing) {
        helpers.json(res, 200, {
          duplicate: true,
          lead: mapLeadRow(existing as Record<string, unknown>, true),
          message: 'You already requested counselling for this campus. A counsellor will contact you.',
        })
        return
      }
    }
    helpers.json(res, 500, { error: error.message || 'Could not save lead' })
    return
  }

  afterNotify(env, fullName, universityName, source, course)

  helpers.json(res, 201, {
    duplicate: false,
    lead: mapLeadRow((data ?? {}) as Record<string, unknown>, true),
    message: 'Thanks — a PRIZMA counsellor will contact you shortly.',
  })
}

function afterNotify(
  env: Env,
  fullName: string,
  universityName: string,
  source: string,
  course: string,
) {
  void sendNotifyEmail(
    env,
    `University lead: ${universityName}`,
    `<p><strong>${fullName}</strong> requested <em>${source}</em> for <strong>${universityName}</strong> (${course}).</p><p>Open Admin → University leads.</p>`,
  ).catch((err) => {
    console.warn('[university-leads] notify failed', err)
  })
}

async function handleMyLeads(
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
  const { data, error } = await supabase
    .from('university_leads')
    .select(LEAD_SELECT)
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false })
  if (error) {
    if (missingTable(helpers, res, error)) return
    helpers.json(res, 500, { error: 'Could not load leads' })
    return
  }
  helpers.json(res, 200, {
    leads: (data ?? []).map((row) => mapLeadRow(row as Record<string, unknown>, false)),
  })
}

async function handleStaffListLeads(
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
  const auth = await requireAdminOrCounsellor(req, res, env, helpers)
  if (!auth) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  let query = supabase.from('university_leads').select(LEAD_SELECT).order('created_at', { ascending: false }).limit(500)
  if (!auth.isAdmin) query = query.eq('assigned_counsellor_clerk_id', auth.clerkId)

  const { data, error } = await query
  if (error) {
    if (missingTable(helpers, res, error)) return
    helpers.json(res, 500, { error: 'Could not load leads' })
    return
  }

  const clerkIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.assigned_counsellor_clerk_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ]
  const nameByClerk = new Map<string, string>()
  if (clerkIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('clerk_id, full_name')
      .in('clerk_id', clerkIds)
    for (const p of profiles ?? []) {
      nameByClerk.set(String(p.clerk_id), String(p.full_name ?? ''))
    }
  }

  const leadIds = (data ?? []).map((row) => String(row.id))
  const sharedIds = new Set<string>()
  if (leadIds.length > 0) {
    const { data: shares } = await supabase
      .from('university_lead_shares')
      .select('lead_id')
      .in('lead_id', leadIds)
    for (const share of shares ?? []) sharedIds.add(String(share.lead_id))
  }

  helpers.json(res, 200, {
    leads: (data ?? []).map((row) => ({
      ...mapLeadRow(row as Record<string, unknown>, true),
      assignedCounsellorName: nameByClerk.get(String(row.assigned_counsellor_clerk_id ?? '')) || null,
      sharedWithPartner: sharedIds.has(String(row.id)),
    })),
  })
}

async function handleStaffPatchLead(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  leadId: string,
): Promise<void> {
  if (req.method !== 'PATCH') {
    res.statusCode = 405
    res.end()
    return
  }
  const auth = await requireAdminOrCounsellor(req, res, env, helpers)
  if (!auth) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const { data: current, error: loadErr } = await supabase
    .from('university_leads')
    .select(LEAD_SELECT)
    .eq('id', leadId)
    .maybeSingle()
  if (loadErr) {
    if (missingTable(helpers, res, loadErr)) return
    helpers.json(res, 500, { error: 'Could not load lead' })
    return
  }
  if (!current) {
    helpers.json(res, 404, { error: 'Lead not found' })
    return
  }
  if (!auth.isAdmin && current.assigned_counsellor_clerk_id !== auth.clerkId) {
    helpers.json(res, 403, { error: 'This lead is not assigned to you' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status !== undefined) {
    if (!isUniversityLeadStatus(body.status)) {
      helpers.json(res, 400, { error: 'Invalid status' })
      return
    }
    patch.status = body.status
  }
  if (body.followUpAt !== undefined) {
    patch.follow_up_at = body.followUpAt ? String(body.followUpAt) : null
  }
  if (auth.isAdmin && body.assignedCounsellorClerkId !== undefined) {
    patch.assigned_counsellor_clerk_id = body.assignedCounsellorClerkId
      ? String(body.assignedCounsellorClerkId)
      : null
  }

  const { data: updated, error } = await supabase
    .from('university_leads')
    .update(patch)
    .eq('id', leadId)
    .select(LEAD_SELECT)
    .maybeSingle()
  if (error) {
    helpers.json(res, 500, { error: error.message || 'Could not update lead' })
    return
  }

  const next = updated ?? current
  await syncCommission(supabase, {
    id: String(next.id),
    status: String(next.status),
    university_id: String(next.university_id),
  })

  helpers.json(res, 200, { lead: mapLeadRow(next as Record<string, unknown>, true) })
}

async function handleAddNote(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  leadId: string,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const auth = await requireAdminOrCounsellor(req, res, env, helpers)
  if (!auth) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }
  const note = String(body.body ?? '').trim()
  if (!note) {
    helpers.json(res, 400, { error: 'Note is required' })
    return
  }

  const { data, error } = await supabase
    .from('university_lead_notes')
    .insert({ lead_id: leadId, author_clerk_id: auth.clerkId, body: note })
    .select('id, lead_id, author_clerk_id, body, created_at')
    .maybeSingle()
  if (error) {
    if (missingTable(helpers, res, error)) return
    helpers.json(res, 500, { error: error.message || 'Could not save note' })
    return
  }
  helpers.json(res, 201, { note: data })
}

async function handleListNotes(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  leadId: string,
): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end()
    return
  }
  const auth = await requireAdminOrCounsellor(req, res, env, helpers)
  if (!auth) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }
  const { data, error } = await supabase
    .from('university_lead_notes')
    .select('id, lead_id, author_clerk_id, body, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) {
    if (missingTable(helpers, res, error)) return
    helpers.json(res, 500, { error: 'Could not load notes' })
    return
  }
  helpers.json(res, 200, { notes: data ?? [] })
}

async function handleShareLead(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  leadId: string,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  const { data: lead, error: leadErr } = await supabase
    .from('university_leads')
    .select(LEAD_SELECT)
    .eq('id', leadId)
    .maybeSingle()
  if (leadErr) {
    if (missingTable(helpers, res, leadErr)) return
    helpers.json(res, 500, { error: 'Could not load lead' })
    return
  }
  if (!lead) {
    helpers.json(res, 404, { error: 'Lead not found' })
    return
  }
  if (!lead.share_consent) {
    helpers.json(res, 403, {
      error: 'Student has not consented to share contact details with a university.',
    })
    return
  }

  const { data: partner } = await supabase
    .from('university_partners')
    .select('id, university_id, location, state, is_active')
    .eq('university_id', lead.university_id as string)
    .eq('is_active', true)
    .maybeSingle()
  if (!partner) {
    helpers.json(res, 400, { error: 'No active partner matched this campus.' })
    return
  }

  const { data: programs } = await supabase
    .from('university_programs')
    .select('name')
    .eq('partner_id', partner.id)
  const names = (programs ?? []).map((p) => String(p.name))
  if (
    !leadMatchesPartner(
      {
        university_id: String(lead.university_id),
        course: String(lead.course),
        preferred_location: (lead.preferred_location as string | null) ?? null,
      },
      {
        university_id: String(partner.university_id),
        location: (partner.location as string | null) ?? null,
        state: (partner.state as string | null) ?? null,
      },
      names,
    )
  ) {
    helpers.json(res, 400, {
      error: 'Lead course or location does not match this partner. Not shared.',
    })
    return
  }

  const { error } = await supabase.from('university_lead_shares').upsert(
    {
      lead_id: leadId,
      partner_id: partner.id as string,
      shared_by_clerk_id: adminId,
    },
    { onConflict: 'lead_id,partner_id' },
  )
  if (error) {
    helpers.json(res, 500, { error: error.message || 'Could not share lead' })
    return
  }
  helpers.json(res, 200, { ok: true })
}

async function handlePartners(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method === 'GET') {
    const { data: partners, error } = await supabase
      .from('university_partners')
      .select(
        'id, university_id, name, short_name, location, state, website, admission_info, is_active, clerk_id, lead_commission_inr, admission_commission_inr, created_at',
      )
      .order('name')
    if (error) {
      if (missingTable(helpers, res, error)) return
      helpers.json(res, 500, { error: 'Could not load partners' })
      return
    }

    const { data: leads } = await supabase.from('university_leads').select('university_id, status')
    const { data: shares } = await supabase.from('university_lead_shares').select('partner_id')
    const stats = new Map<string, { leads: number; applications: number; admissions: number; shared: number }>()
    for (const p of partners ?? []) {
      stats.set(p.id as string, { leads: 0, applications: 0, admissions: 0, shared: 0 })
    }
    for (const lead of leads ?? []) {
      const partner = (partners ?? []).find((p) => p.university_id === lead.university_id)
      if (!partner) continue
      const s = stats.get(partner.id as string)
      if (!s) continue
      s.leads += 1
      if (lead.status === 'APPLICATION_STARTED' || lead.status === 'ADMITTED') s.applications += 1
      if (lead.status === 'ADMITTED') s.admissions += 1
    }
    for (const share of shares ?? []) {
      const s = stats.get(share.partner_id as string)
      if (s) s.shared += 1
    }

    helpers.json(res, 200, {
      partners: (partners ?? []).map((p) => ({
        ...p,
        stats: stats.get(p.id as string) ?? { leads: 0, applications: 0, admissions: 0, shared: 0 },
      })),
    })
    return
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = (await helpers.readBodyJson(req)) as Record<string, unknown>
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON' })
      return
    }
    const universityId = String(body.universityId ?? '').trim()
    const name = String(body.name ?? '').trim()
    if (!universityId || !name) {
      helpers.json(res, 400, { error: 'universityId and name are required' })
      return
    }
    const { data, error } = await supabase
      .from('university_partners')
      .insert({
        university_id: universityId,
        name,
        short_name: String(body.shortName ?? '').trim() || null,
        location: String(body.location ?? '').trim() || null,
        state: String(body.state ?? '').trim() || null,
        website: String(body.website ?? '').trim() || null,
        admission_info: String(body.admissionInfo ?? '').trim() || null,
        clerk_id: String(body.clerkId ?? '').trim() || null,
        lead_commission_inr: Number(body.leadCommissionInr ?? 0) || 0,
        admission_commission_inr: Number(body.admissionCommissionInr ?? 0) || 0,
        is_active: body.isActive !== false,
      })
      .select()
      .maybeSingle()
    if (error) {
      if (missingTable(helpers, res, error)) return
      helpers.json(res, 500, { error: error.message || 'Could not create partner' })
      return
    }
    helpers.json(res, 201, { partner: data })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handlePartnerPatch(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  partnerId: string,
): Promise<void> {
  if (req.method !== 'PATCH') {
    res.statusCode = 405
    res.end()
    return
  }
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }
  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) patch.name = String(body.name).trim()
  if (body.shortName !== undefined) patch.short_name = String(body.shortName).trim() || null
  if (body.location !== undefined) patch.location = String(body.location).trim() || null
  if (body.state !== undefined) patch.state = String(body.state).trim() || null
  if (body.website !== undefined) patch.website = String(body.website).trim() || null
  if (body.admissionInfo !== undefined) patch.admission_info = String(body.admissionInfo).trim() || null
  if (body.clerkId !== undefined) patch.clerk_id = String(body.clerkId).trim() || null
  if (body.leadCommissionInr !== undefined) patch.lead_commission_inr = Number(body.leadCommissionInr) || 0
  if (body.admissionCommissionInr !== undefined) {
    patch.admission_commission_inr = Number(body.admissionCommissionInr) || 0
  }
  if (body.isActive !== undefined) patch.is_active = Boolean(body.isActive)

  const { data, error } = await supabase
    .from('university_partners')
    .update(patch)
    .eq('id', partnerId)
    .select()
    .maybeSingle()
  if (error) {
    helpers.json(res, 500, { error: error.message || 'Could not update partner' })
    return
  }
  helpers.json(res, 200, { partner: data })
}

async function handlePartnerPrograms(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  partnerId: string,
): Promise<void> {
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('university_programs')
      .select('id, partner_id, name, fees_inr, eligibility, duration, created_at')
      .eq('partner_id', partnerId)
      .order('name')
    if (error) {
      if (missingTable(helpers, res, error)) return
      helpers.json(res, 500, { error: 'Could not load programs' })
      return
    }
    helpers.json(res, 200, { programs: data ?? [] })
    return
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = (await helpers.readBodyJson(req)) as Record<string, unknown>
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON' })
      return
    }
    const name = String(body.name ?? '').trim()
    if (!name) {
      helpers.json(res, 400, { error: 'Program name is required' })
      return
    }
    const { data, error } = await supabase
      .from('university_programs')
      .insert({
        partner_id: partnerId,
        name,
        fees_inr: body.feesInr != null && body.feesInr !== '' ? Number(body.feesInr) : null,
        eligibility: String(body.eligibility ?? '').trim() || null,
        duration: String(body.duration ?? '').trim() || null,
      })
      .select()
      .maybeSingle()
    if (error) {
      helpers.json(res, 500, { error: error.message || 'Could not add program' })
      return
    }
    helpers.json(res, 201, { program: data })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleCommissions(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.statusCode = 405
    res.end()
    return
  }
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('university_commissions')
      .select(
        'id, lead_id, partner_id, university_id, application_status, admission_status, commission_amount_inr, commission_status, payment_received_at, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) {
      if (missingTable(helpers, res, error)) return
      helpers.json(res, 500, { error: 'Could not load commissions' })
      return
    }
    helpers.json(res, 200, { commissions: data ?? [] })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }
  const id = String(body.id ?? '').trim()
  if (!id) {
    helpers.json(res, 400, { error: 'Commission id is required' })
    return
  }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.commissionStatus) patch.commission_status = String(body.commissionStatus)
  if (body.paymentReceivedAt !== undefined) {
    patch.payment_received_at = body.paymentReceivedAt ? String(body.paymentReceivedAt) : null
  }
  if (body.commissionAmountInr !== undefined) patch.commission_amount_inr = Number(body.commissionAmountInr) || 0
  const { data, error } = await supabase.from('university_commissions').update(patch).eq('id', id).select().maybeSingle()
  if (error) {
    helpers.json(res, 500, { error: error.message || 'Could not update commission' })
    return
  }
  helpers.json(res, 200, { commission: data })
}

async function handlePartnerMe(
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
  const { data, error } = await supabase
    .from('university_partners')
    .select(
      'id, university_id, name, short_name, location, state, website, admission_info, is_active, lead_commission_inr, admission_commission_inr, created_at',
    )
    .eq('clerk_id', clerkId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) {
    if (missingTable(helpers, res, error)) return
    helpers.json(res, 500, { error: 'Could not load partner profile' })
    return
  }
  if (!data) {
    helpers.json(res, 403, { error: 'No partner campus is linked to this account' })
    return
  }
  const { data: programs } = await supabase
    .from('university_programs')
    .select('id, name, fees_inr, eligibility, duration')
    .eq('partner_id', data.id)
    .order('name')
  helpers.json(res, 200, { partner: data, programs: programs ?? [] })
}

async function handlePartnerLeads(
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
  const { data: partner } = await supabase
    .from('university_partners')
    .select('id, university_id, name')
    .eq('clerk_id', clerkId)
    .eq('is_active', true)
    .maybeSingle()
  if (!partner) {
    helpers.json(res, 403, { error: 'No partner campus is linked to this account' })
    return
  }

  const { data: allLeads } = await supabase
    .from('university_leads')
    .select('id, status, university_id')
    .eq('university_id', partner.university_id)
  const { data: shares } = await supabase
    .from('university_lead_shares')
    .select('lead_id')
    .eq('partner_id', partner.id)

  const sharedIds = new Set((shares ?? []).map((s) => s.lead_id as string))
  const { data: sharedLeads, error } = await supabase
    .from('university_leads')
    .select(LEAD_SELECT)
    .in('id', sharedIds.size > 0 ? [...sharedIds] : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false })
  if (error) {
    helpers.json(res, 500, { error: 'Could not load shared leads' })
    return
  }

  const totals = { leads: 0, applications: 0, admissions: 0, shared: sharedIds.size }
  for (const row of allLeads ?? []) {
    totals.leads += 1
    if (row.status === 'APPLICATION_STARTED' || row.status === 'ADMITTED') totals.applications += 1
    if (row.status === 'ADMITTED') totals.admissions += 1
  }

  helpers.json(res, 200, {
    stats: totals,
    leads: (sharedLeads ?? []).map((row) => mapLeadRow(row as Record<string, unknown>, true)),
  })
}

function leadIdFrom(path: string, prefix: string): string | null {
  if (!path.startsWith(prefix)) return null
  const rest = path.slice(prefix.length)
  if (!rest || rest.includes('/')) return null
  return rest
}

/** Returns true if the request path was handled. */
export function tryHandleUniversityLeadApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  const run = (fn: () => Promise<void>) => {
    void fn().catch((err) => {
      console.error('[university-leads]', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
  }

  if (path === '/api/university-leads') {
    run(() => handleCreateLead(req, res, env, helpers))
    return true
  }
  if (path === '/api/university-leads/mine') {
    run(() => handleMyLeads(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/university-leads' || path === '/api/counsellor/university-leads') {
    run(() => handleStaffListLeads(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/university-partners') {
    run(() => handlePartners(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/university-commissions') {
    run(() => handleCommissions(req, res, env, helpers))
    return true
  }
  if (path === '/api/partner/me') {
    run(() => handlePartnerMe(req, res, env, helpers))
    return true
  }
  if (path === '/api/partner/leads') {
    run(() => handlePartnerLeads(req, res, env, helpers))
    return true
  }

  const shareMatch = path.match(/^\/api\/admin\/university-leads\/([^/]+)\/share$/)
  if (shareMatch) {
    run(() => handleShareLead(req, res, env, helpers, shareMatch[1]))
    return true
  }
  const notesMatch = path.match(/^\/api\/admin\/university-leads\/([^/]+)\/notes$/)
  if (notesMatch) {
    if (req.method === 'GET') {
      run(() => handleListNotes(req, res, env, helpers, notesMatch[1]))
      return true
    }
    run(() => handleAddNote(req, res, env, helpers, notesMatch[1]))
    return true
  }
  const counsellorNotes = path.match(/^\/api\/counsellor\/university-leads\/([^/]+)\/notes$/)
  if (counsellorNotes) {
    if (req.method === 'GET') {
      run(() => handleListNotes(req, res, env, helpers, counsellorNotes[1]))
      return true
    }
    run(() => handleAddNote(req, res, env, helpers, counsellorNotes[1]))
    return true
  }
  const programsMatch = path.match(/^\/api\/admin\/university-partners\/([^/]+)\/programs$/)
  if (programsMatch) {
    run(() => handlePartnerPrograms(req, res, env, helpers, programsMatch[1]))
    return true
  }

  const adminLeadId = leadIdFrom(path, '/api/admin/university-leads/')
  if (adminLeadId) {
    run(() => handleStaffPatchLead(req, res, env, helpers, adminLeadId))
    return true
  }
  const counsellorLeadId = leadIdFrom(path, '/api/counsellor/university-leads/')
  if (counsellorLeadId) {
    run(() => handleStaffPatchLead(req, res, env, helpers, counsellorLeadId))
    return true
  }
  const partnerId = leadIdFrom(path, '/api/admin/university-partners/')
  if (partnerId) {
    run(() => handlePartnerPatch(req, res, env, helpers, partnerId))
    return true
  }

  return false
}
