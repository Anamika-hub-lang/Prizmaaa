import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'

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

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

const MISSING_SQL =
  'Co-mentor table missing. Run supabase/class-co-mentors.sql in the Supabase SQL Editor.'

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

async function loadOwnedClass(
  supabase: SupabaseClient,
  classId: string,
  ownerClerkId: string,
): Promise<{ id: string; title: string } | null> {
  const { data } = await supabase
    .from('classes')
    .select('id, title, mentor_clerk_id')
    .eq('id', classId)
    .maybeSingle()
  if (!data) return null
  if (String(data.mentor_clerk_id ?? '') !== ownerClerkId) return null
  return { id: String(data.id), title: String(data.title ?? '') }
}

async function findMentorByEmail(
  supabase: SupabaseClient,
  env: Env,
  email: string,
): Promise<{ clerkId: string; email: string; fullName: string | null } | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('clerk_id, email, full_name, role')
    .ilike('email', normalized)
    .maybeSingle()

  if (profile?.clerk_id) {
    const role = String(profile.role ?? '')
    if (role && role !== 'teacher' && role !== 'admin') {
      return null
    }
    return {
      clerkId: String(profile.clerk_id),
      email: String(profile.email ?? normalized),
      fullName: (profile.full_name as string | null) ?? null,
    }
  }

  if (!env.clerkSecretKey) return null
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const list = await clerk.users.getUserList({ emailAddress: [normalized], limit: 1 })
  const user = list.data[0]
  if (!user) return null
  const role = user.publicMetadata?.role
  if (role !== 'teacher' && role !== 'admin') return null
  const primary =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    normalized
  return {
    clerkId: user.id,
    email: primary,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
  }
}

async function handleMySharedClasses(
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
    .from('class_co_mentors')
    .select('class_id')
    .eq('mentor_clerk_id', clerkId)
  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 200, { classIds: [], setupRequired: true, hint: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not load shared classes' })
    return
  }
  helpers.json(res, 200, {
    classIds: [...new Set((data ?? []).map((row) => String(row.class_id)))],
  })
}

async function handleListCoMentors(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  classId: string,
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

  const { data: cls } = await supabase
    .from('classes')
    .select('id, mentor_clerk_id')
    .eq('id', classId)
    .maybeSingle()
  if (!cls) {
    helpers.json(res, 404, { error: 'Class not found' })
    return
  }
  const isOwner = String(cls.mentor_clerk_id ?? '') === clerkId
  const { data: asCo } = await supabase
    .from('class_co_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_clerk_id', clerkId)
    .maybeSingle()
  if (!isOwner && !asCo) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can view shares' })
    return
  }

  const { data, error } = await supabase
    .from('class_co_mentors')
    .select('id, mentor_clerk_id, mentor_email, invited_by_clerk_id, created_at')
    .eq('class_id', classId)
    .order('created_at', { ascending: true })
  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: 'Could not load co-mentors' })
    return
  }
  helpers.json(res, 200, {
    isOwner,
    coMentors: (data ?? []).map((row) => ({
      id: String(row.id),
      clerkId: String(row.mentor_clerk_id),
      email: String(row.mentor_email),
      invitedByClerkId: String(row.invited_by_clerk_id),
      createdAt: String(row.created_at),
    })),
  })
}

async function handleInviteCoMentor(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  classId: string,
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

  const owned = await loadOwnedClass(supabase, classId, clerkId)
  if (!owned) {
    helpers.json(res, 403, { error: 'Only the class owner can invite a co-mentor' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    helpers.json(res, 400, { error: 'Valid mentor email is required' })
    return
  }

  const mentor = await findMentorByEmail(supabase, env, email)
  if (!mentor) {
    helpers.json(res, 404, {
      error:
        'No mentor account found for that email. They must sign up as Mentor (teacher) first.',
    })
    return
  }
  if (mentor.clerkId === clerkId) {
    helpers.json(res, 400, { error: 'You already own this class' })
    return
  }

  const { data, error } = await supabase
    .from('class_co_mentors')
    .upsert(
      {
        class_id: classId,
        mentor_clerk_id: mentor.clerkId,
        mentor_email: mentor.email.toLowerCase(),
        invited_by_clerk_id: clerkId,
      },
      { onConflict: 'class_id,mentor_clerk_id' },
    )
    .select('id, mentor_clerk_id, mentor_email, invited_by_clerk_id, created_at')
    .maybeSingle()

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not invite co-mentor' })
    return
  }

  helpers.json(res, 201, {
    coMentor: {
      id: String(data?.id),
      clerkId: String(data?.mentor_clerk_id ?? mentor.clerkId),
      email: String(data?.mentor_email ?? mentor.email),
      fullName: mentor.fullName,
      invitedByClerkId: String(data?.invited_by_clerk_id ?? clerkId),
      createdAt: String(data?.created_at ?? new Date().toISOString()),
    },
    message: `${mentor.email} can now see this class on their mentor dashboard.`,
  })
}

async function handleRemoveCoMentor(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  classId: string,
): Promise<void> {
  if (req.method !== 'DELETE') {
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

  const owned = await loadOwnedClass(supabase, classId, clerkId)
  if (!owned) {
    helpers.json(res, 403, { error: 'Only the class owner can remove a co-mentor' })
    return
  }

  let body: Record<string, unknown>
  try {
    body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON' })
    return
  }
  const targetClerkId = String(body.clerkId ?? '').trim()
  const targetEmail = String(body.email ?? '').trim().toLowerCase()
  if (!targetClerkId && !targetEmail) {
    helpers.json(res, 400, { error: 'clerkId or email is required' })
    return
  }

  let query = supabase.from('class_co_mentors').delete().eq('class_id', classId)
  query = targetClerkId ? query.eq('mentor_clerk_id', targetClerkId) : query.ilike('mentor_email', targetEmail)
  const { error } = await query
  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not remove co-mentor' })
    return
  }
  helpers.json(res, 200, { ok: true })
}

/** Returns true if the request path was handled. */
export function tryHandleMentorClassShareApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  const run = (fn: () => Promise<void>) => {
    void fn().catch((err) => {
      console.error('[class-co-mentors]', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
  }

  if (path === '/api/mentor/shared-classes') {
    run(() => handleMySharedClasses(req, res, env, helpers))
    return true
  }

  const listMatch = path.match(/^\/api\/mentor\/classes\/([^/]+)\/co-mentors$/)
  if (listMatch) {
    const classId = decodeURIComponent(listMatch[1]!)
    if (req.method === 'GET') {
      run(() => handleListCoMentors(req, res, env, helpers, classId))
      return true
    }
    if (req.method === 'POST') {
      run(() => handleInviteCoMentor(req, res, env, helpers, classId))
      return true
    }
    if (req.method === 'DELETE') {
      run(() => handleRemoveCoMentor(req, res, env, helpers, classId))
      return true
    }
  }

  return false
}
