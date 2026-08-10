import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClerkClient } from '@clerk/backend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeRole, profileRowFromClerkUser } from './lib/profileRow'
import { upsertProfile } from './lib/supabaseAdmin'
import { parseClassCsv, CLASS_CSV_TEMPLATE_HINT, type ClassCsvRow } from './lib/csvClassUpload'

type AssignableRole = 'student' | 'teacher' | 'counsellor' | 'intern'

function isAssignableRole(value: unknown): value is AssignableRole {
  return (
    value === 'student' ||
    value === 'teacher' ||
    value === 'counsellor' ||
    value === 'intern'
  )
}

/** PostgREST / Postgres codes when a table/view has not been created yet. */
function isMissingRelationError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

type Env = {
  clerkSecretKey?: string
  supabaseUrl?: string
  supabaseServiceRoleKey?: string
  adminClerkUserIds?: string
}

type Helpers = {
  json: (res: ServerResponse, status: number, body: unknown) => void
  verifyClerkSession: (req: IncomingMessage, clerkSecretKey: string) => Promise<string | null>
  requireSupabaseAdmin: (env: Env) => SupabaseClient | null
  isAdminClerkUser: (clerkId: string, env: Env) => Promise<boolean>
  readBodyJson: (req: IncomingMessage) => Promise<unknown>
  syncClerkUserIdToSupabase: (clerkUserId: string, env: Env) => Promise<void>
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

async function requireRole(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  role: 'counsellor' | 'intern',
): Promise<string | null> {
  const clerkId = await requireAuth(req, res, env, helpers)
  if (!clerkId || !env.clerkSecretKey) return null
  const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
  const user = await clerk.users.getUser(clerkId)
  if (user.publicMetadata?.role !== role) {
    helpers.json(res, 403, { error: `${role} access required` })
    return null
  }
  return clerkId
}

async function handleAdminUsers(
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
    if (!env.clerkSecretKey) {
      helpers.json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, clerk_id, full_name, email, role, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      helpers.json(res, 500, { error: 'Could not load users' })
      return
    }

    // Clerk is source of truth for role; merge so UI stays correct even when
    // profiles.role check has not been widened yet.
    const roleByClerkId = new Map<string, string | null>()
    try {
      const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
      let offset = 0
      for (let page = 0; page < 5; page += 1) {
        const list = await clerk.users.getUserList({ limit: 100, offset })
        for (const user of list.data) {
          const role = normalizeRole(user.publicMetadata?.role)
          roleByClerkId.set(user.id, role)
        }
        if (list.data.length < 100) break
        offset += list.data.length
      }
    } catch (err) {
      console.warn('[dev-api] admin users clerk role merge failed', err)
    }

    helpers.json(res, 200, {
      users: (data ?? []).map((row) => {
        const clerkId = row.clerk_id as string
        const mergedRole =
          (roleByClerkId.has(clerkId) ? roleByClerkId.get(clerkId) : null) ??
          ((row.role as string | null) ?? null)
        return {
          id: row.id as string,
          clerkId,
          fullName: (row.full_name as string | null) ?? null,
          email: (row.email as string | null) ?? null,
          role: mergedRole,
          avatarUrl: (row.avatar_url as string | null) ?? null,
          createdAt: row.created_at as string,
        }
      }),
    })
    return
  }

  if (req.method === 'PATCH') {
    if (!env.clerkSecretKey) {
      helpers.json(res, 503, { error: 'Server missing CLERK_SECRET_KEY.' })
      return
    }

    let body: { clerkId?: string; role?: string | null }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const targetClerkId = body.clerkId?.trim()
    if (!targetClerkId) {
      helpers.json(res, 400, { error: 'clerkId required' })
      return
    }

    if (body.role !== null && body.role !== undefined && !isAssignableRole(body.role)) {
      helpers.json(res, 400, { error: 'Role must be student, teacher, counsellor, or intern' })
      return
    }

    const clerk = createClerkClient({ secretKey: env.clerkSecretKey })
    const target = await clerk.users.getUser(targetClerkId)
    const existingRole = normalizeRole(target.publicMetadata?.role)

    if (existingRole === 'admin') {
      helpers.json(res, 403, { error: 'Cannot change admin role via this API' })
      return
    }

    const nextRole = (body.role ?? null) as AssignableRole | null
    const nextMeta: Record<string, unknown> = {
      ...target.publicMetadata,
      onboardingComplete:
        nextRole === 'counsellor' || nextRole === 'intern'
          ? true
          : target.publicMetadata?.onboardingComplete === true,
    }
    if (nextRole === null) {
      delete nextMeta.role
    } else {
      nextMeta.role = nextRole
    }

    await clerk.users.updateUser(targetClerkId, { publicMetadata: nextMeta })

    const row = profileRowFromClerkUser(await clerk.users.getUser(targetClerkId))
    row.role = nextRole

    let profilesWarning: string | null = null
    try {
      await upsertProfile(supabase, row)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isRoleCheck =
        message.includes('profiles_role_check') ||
        message.includes('check constraint') ||
        (typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code?: string }).code === '23514')

      if (!isRoleCheck) {
        console.error('[dev-api] admin users profile upsert', err)
        helpers.json(res, 500, { error: message || 'Could not sync profile role' })
        return
      }

      // DB still has old student|teacher check — keep Clerk role, sync profile without blocked role.
      try {
        await upsertProfile(supabase, {
          ...row,
          role: nextRole === 'student' || nextRole === 'teacher' ? nextRole : null,
        })
      } catch (fallbackErr) {
        console.warn('[dev-api] admin users profile fallback upsert', fallbackErr)
      }

      profilesWarning =
        'Role saved in Clerk. Run supabase/fix-profiles-role-check.sql in Supabase so profiles.role can store counsellor/intern/admin.'
      console.warn('[dev-api] admin users', profilesWarning)
    }

    if (nextRole === 'counsellor') {
      const { error: counsellorErr } = await supabase.from('counsellor_profiles').upsert(
        {
          clerk_id: targetClerkId,
          availability: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_id' },
      )
      if (counsellorErr && !isMissingRelationError(counsellorErr)) {
        console.warn('[dev-api] counsellor_profiles upsert', counsellorErr)
      }
    }

    helpers.json(res, 200, {
      ok: true,
      clerkId: targetClerkId,
      role: nextRole,
      warning: profilesWarning,
    })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleAdminCounsellingTypes(
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
    const { data, error } = await supabase
      .from('counselling_types')
      .select('id, name, subdomain, slug, created_at')
      .order('name', { ascending: true })

    if (error) {
      if (isMissingRelationError(error)) {
        helpers.json(res, 200, {
          types: [],
          schemaMissing: true,
          hint: 'Run supabase/roles-counselling-uploads.sql in the Supabase SQL Editor.',
        })
        return
      }
      console.error('[dev-api] admin counselling-types', error)
      helpers.json(res, 500, { error: error.message || 'Could not load counselling types' })
      return
    }

    helpers.json(res, 200, {
      types: (data ?? []).map((row) => ({
        id: row.id as string,
        name: row.name as string,
        subdomain: row.subdomain as string,
        slug: row.slug as string,
        createdAt: row.created_at as string,
      })),
    })
    return
  }

  if (req.method === 'POST') {
    let body: { name?: string; subdomain?: string; slug?: string }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const name = body.name?.trim()
    const subdomain = body.subdomain?.trim()
    const slug =
      body.slug?.trim().toLowerCase() ||
      name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    if (!name || !subdomain || !slug) {
      helpers.json(res, 400, { error: 'name and subdomain are required' })
      return
    }

    const { data, error } = await supabase
      .from('counselling_types')
      .insert({ name, subdomain, slug })
      .select('id, name, subdomain, slug, created_at')
      .single()

    if (error) {
      helpers.json(res, 400, { error: error.message || 'Could not create type' })
      return
    }

    helpers.json(res, 201, {
      type: {
        id: data.id as string,
        name: data.name as string,
        subdomain: data.subdomain as string,
        slug: data.slug as string,
        createdAt: data.created_at as string,
      },
    })
    return
  }

  if (req.method === 'PATCH') {
    let body: { id?: string; name?: string; subdomain?: string }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }
    const id = body.id?.trim()
    if (!id) {
      helpers.json(res, 400, { error: 'id required' })
      return
    }
    const patch: Record<string, string> = {}
    if (body.name?.trim()) patch.name = body.name.trim()
    if (body.subdomain?.trim()) patch.subdomain = body.subdomain.trim()
    if (!Object.keys(patch).length) {
      helpers.json(res, 400, { error: 'Nothing to update' })
      return
    }

    const { data, error } = await supabase
      .from('counselling_types')
      .update(patch)
      .eq('id', id)
      .select('id, name, subdomain, slug, created_at')
      .single()

    if (error) {
      helpers.json(res, 400, { error: error.message || 'Could not update type' })
      return
    }

    helpers.json(res, 200, {
      type: {
        id: data.id as string,
        name: data.name as string,
        subdomain: data.subdomain as string,
        slug: data.slug as string,
        createdAt: data.created_at as string,
      },
    })
    return
  }

  if (req.method === 'DELETE') {
    let body: { id?: string }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }
    const id = body.id?.trim()
    if (!id) {
      helpers.json(res, 400, { error: 'id required' })
      return
    }
    const { error } = await supabase.from('counselling_types').delete().eq('id', id)
    if (error) {
      helpers.json(res, 400, { error: error.message || 'Could not delete type' })
      return
    }
    helpers.json(res, 200, { ok: true })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleAdminCounsellors(
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
    const { data: profiles } = await supabase
      .from('profiles')
      .select('clerk_id, full_name, email, avatar_url')
      .eq('role', 'counsellor')
      .order('full_name', { ascending: true })

    const clerkIds = (profiles ?? []).map((p) => p.clerk_id as string)
    const { data: counsellorRows } = clerkIds.length
      ? await supabase.from('counsellor_profiles').select('clerk_id, availability').in('clerk_id', clerkIds)
      : { data: [] as Array<{ clerk_id: string; availability: boolean }> }

    const { data: assignments } = clerkIds.length
      ? await supabase
          .from('counsellor_type_assignments')
          .select('clerk_id, type_id')
          .in('clerk_id', clerkIds)
      : { data: [] as Array<{ clerk_id: string; type_id: string }> }

    const { data: types } = await supabase.from('counselling_types').select('id, name, subdomain, slug')

    const { data: bookings } = clerkIds.length
      ? await supabase
          .from('counselling_requests')
          .select(
            'id, full_name, email, scheduled_date, scheduled_time, session_status, assignment_status, counsellor_clerk_id, created_at',
          )
          .in('counsellor_clerk_id', clerkIds)
          .order('created_at', { ascending: false })
          .limit(300)
      : { data: [] as Array<Record<string, unknown>> }

    const availMap = new Map(
      (counsellorRows ?? []).map((r) => [r.clerk_id as string, r.availability as boolean]),
    )
    const typeMap = new Map((types ?? []).map((t) => [t.id as string, t]))

    helpers.json(res, 200, {
      counsellors: (profiles ?? []).map((p) => {
        const clerkId = p.clerk_id as string
        const typeIds = (assignments ?? [])
          .filter((a) => a.clerk_id === clerkId)
          .map((a) => a.type_id as string)
        return {
          clerkId,
          fullName: (p.full_name as string | null) ?? null,
          email: (p.email as string | null) ?? null,
          avatarUrl: (p.avatar_url as string | null) ?? null,
          availability: availMap.get(clerkId) ?? true,
          typeIds,
          types: typeIds
            .map((id) => typeMap.get(id))
            .filter(Boolean)
            .map((t) => ({
              id: (t as { id: string }).id,
              name: (t as { name: string }).name,
              subdomain: (t as { subdomain: string }).subdomain,
              slug: (t as { slug: string }).slug,
            })),
          bookings: (bookings ?? [])
            .filter((b) => b.counsellor_clerk_id === clerkId)
            .map((b) => ({
              id: b.id as string,
              fullName: b.full_name as string,
              email: b.email as string,
              scheduledDate: (b.scheduled_date as string | null) ?? null,
              scheduledTime: (b.scheduled_time as string | null) ?? null,
              sessionStatus: (b.session_status as string | null) ?? 'upcoming',
              assignmentStatus: (b.assignment_status as string | null) ?? 'assigned',
              createdAt: b.created_at as string,
            })),
        }
      }),
      types: (types ?? []).map((t) => ({
        id: t.id as string,
        name: t.name as string,
        subdomain: t.subdomain as string,
        slug: t.slug as string,
      })),
    })
    return
  }

  if (req.method === 'PATCH') {
    let body: {
      clerkId?: string
      availability?: boolean
      typeIds?: string[]
    }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const clerkId = body.clerkId?.trim()
    if (!clerkId) {
      helpers.json(res, 400, { error: 'clerkId required' })
      return
    }

    await supabase.from('counsellor_profiles').upsert(
      {
        clerk_id: clerkId,
        availability: body.availability ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' },
    )

    if (Array.isArray(body.typeIds)) {
      await supabase.from('counsellor_type_assignments').delete().eq('clerk_id', clerkId)
      const unique = [...new Set(body.typeIds.filter(Boolean))]
      if (unique.length) {
        const { error } = await supabase.from('counsellor_type_assignments').insert(
          unique.map((typeId) => ({ clerk_id: clerkId, type_id: typeId })),
        )
        if (error) {
          helpers.json(res, 400, { error: error.message || 'Could not assign types' })
          return
        }
      }
    }

    helpers.json(res, 200, { ok: true })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleAdminUploadsList(
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

  const { data, error } = await supabase
    .from('csv_uploads')
    .select('id, clerk_id, file_name, file_url, status, row_count, error_message, reviewed_by, reviewed_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    if (isMissingRelationError(error)) {
      helpers.json(res, 200, {
        uploads: [],
        schemaMissing: true,
        hint: 'Run supabase/roles-counselling-uploads.sql in the Supabase SQL Editor to create csv_uploads.',
      })
      return
    }
    console.error('[dev-api] admin uploads list', error)
    helpers.json(res, 500, { error: error.message || 'Could not load uploads' })
    return
  }

  const uploaderIds = [...new Set((data ?? []).map((r) => r.clerk_id as string))]
  const { data: profiles } = uploaderIds.length
    ? await supabase.from('profiles').select('clerk_id, full_name, email').in('clerk_id', uploaderIds)
    : { data: [] as Array<{ clerk_id: string; full_name: string | null; email: string | null }> }

  const profileMap = new Map((profiles ?? []).map((p) => [p.clerk_id, p]))

  helpers.json(res, 200, {
    uploads: (data ?? []).map((row) => {
      const profile = profileMap.get(row.clerk_id as string)
      return {
        id: row.id as string,
        clerkId: row.clerk_id as string,
        fileName: row.file_name as string,
        fileUrl: row.file_url as string,
        status: row.status as string,
        rowCount: row.row_count as number,
        errorMessage: (row.error_message as string | null) ?? null,
        reviewedBy: (row.reviewed_by as string | null) ?? null,
        reviewedAt: (row.reviewed_at as string | null) ?? null,
        createdAt: row.created_at as string,
        uploadedBy: (profile?.full_name as string | null) || (profile?.email as string | null) || row.clerk_id,
      }
    }),
  })
}

async function applyClassRows(supabase: SupabaseClient, rows: ClassCsvRow[]): Promise<void> {
  const payload = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category_id: r.category_id,
    image: r.image,
    mentor: r.mentor,
    mentor_image: r.mentor_image,
    duration: r.duration,
    sessions: r.sessions,
    description: r.description,
    price: r.price,
    meet_link: r.meet_link,
    next_session_label: r.next_session_label,
    published: r.published,
  }))

  const { error } = await supabase.from('classes').upsert(payload, { onConflict: 'id' })
  if (error) throw error
}

async function handleAdminUploadAction(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
  uploadId: string,
  action: 'approve' | 'reject',
): Promise<void> {
  const adminId = await requireAdmin(req, res, env, helpers)
  if (!adminId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  const { data: upload, error } = await supabase
    .from('csv_uploads')
    .select('id, status, parsed_rows')
    .eq('id', uploadId)
    .maybeSingle()

  if (error || !upload) {
    helpers.json(res, 404, { error: 'Upload not found' })
    return
  }

  if (upload.status !== 'pending') {
    helpers.json(res, 400, { error: `Upload is already ${upload.status}` })
    return
  }

  if (action === 'approve') {
    const rows = (upload.parsed_rows as ClassCsvRow[] | null) ?? []
    if (!rows.length) {
      helpers.json(res, 400, { error: 'Upload has no parsed rows' })
      return
    }
    try {
      await applyClassRows(supabase, rows)
    } catch (err) {
      helpers.json(res, 500, {
        error: err instanceof Error ? err.message : 'Could not insert classes',
      })
      return
    }
  }

  const { error: updateErr } = await supabase
    .from('csv_uploads')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', uploadId)

  if (updateErr) {
    helpers.json(res, 500, { error: 'Could not update upload status' })
    return
  }

  helpers.json(res, 200, { ok: true, status: action === 'approve' ? 'approved' : 'rejected' })
}

async function handleCounsellorMe(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  const clerkId = await requireRole(req, res, env, helpers, 'counsellor')
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  await supabase.from('counsellor_profiles').upsert(
    { clerk_id: clerkId, updated_at: new Date().toISOString() },
    { onConflict: 'clerk_id' },
  )

  const { data: profile } = await supabase
    .from('counsellor_profiles')
    .select('availability')
    .eq('clerk_id', clerkId)
    .maybeSingle()

  const { data: assignments } = await supabase
    .from('counsellor_type_assignments')
    .select('type_id')
    .eq('clerk_id', clerkId)

  const typeIds = (assignments ?? []).map((a) => a.type_id as string)
  const { data: types } = typeIds.length
    ? await supabase.from('counselling_types').select('id, name, subdomain, slug').in('id', typeIds)
    : { data: [] as Array<{ id: string; name: string; subdomain: string; slug: string }> }

  helpers.json(res, 200, {
    availability: (profile?.availability as boolean | undefined) ?? true,
    types: (types ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      slug: t.slug,
    })),
  })
}

async function handleCounsellorAvailability(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  const clerkId = await requireRole(req, res, env, helpers, 'counsellor')
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method !== 'PATCH') {
    res.statusCode = 405
    res.end()
    return
  }

  let body: { availability?: boolean }
  try {
    body = (await helpers.readBodyJson(req)) as typeof body
  } catch {
    helpers.json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  if (typeof body.availability !== 'boolean') {
    helpers.json(res, 400, { error: 'availability boolean required' })
    return
  }

  await supabase.from('counsellor_profiles').upsert(
    {
      clerk_id: clerkId,
      availability: body.availability,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_id' },
  )

  helpers.json(res, 200, { ok: true, availability: body.availability })
}

async function handleCounsellorBookings(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  const clerkId = await requireRole(req, res, env, helpers, 'counsellor')
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('counselling_requests')
      .select(
        'id, full_name, email, phone, category_id, group_id, preferred_mode, note, scheduled_date, scheduled_time, session_status, assignment_status, created_at',
      )
      .eq('counsellor_clerk_id', clerkId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      helpers.json(res, 500, { error: 'Could not load bookings' })
      return
    }

    helpers.json(res, 200, {
      bookings: (data ?? []).map((row) => ({
        id: row.id as string,
        fullName: row.full_name as string,
        email: row.email as string,
        phone: row.phone as string,
        categoryId: row.category_id as string,
        groupId: (row.group_id as string | null) ?? null,
        preferredMode: row.preferred_mode as string,
        note: (row.note as string | null) ?? null,
        scheduledDate: (row.scheduled_date as string | null) ?? null,
        scheduledTime: (row.scheduled_time as string | null) ?? null,
        sessionStatus: ((row.session_status as string | null) ?? 'upcoming') as 'upcoming' | 'completed',
        assignmentStatus: (row.assignment_status as string | null) ?? 'assigned',
        createdAt: row.created_at as string,
      })),
    })
    return
  }

  if (req.method === 'PATCH') {
    let body: { id?: string; sessionStatus?: 'upcoming' | 'completed' }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }
    if (!body.id || (body.sessionStatus !== 'upcoming' && body.sessionStatus !== 'completed')) {
      helpers.json(res, 400, { error: 'id and sessionStatus required' })
      return
    }

    const { error } = await supabase
      .from('counselling_requests')
      .update({ session_status: body.sessionStatus })
      .eq('id', body.id)
      .eq('counsellor_clerk_id', clerkId)

    if (error) {
      helpers.json(res, 500, { error: 'Could not update booking' })
      return
    }

    helpers.json(res, 200, { ok: true })
    return
  }

  res.statusCode = 405
  res.end()
}

async function handleInternUploads(
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): Promise<void> {
  const clerkId = await requireRole(req, res, env, helpers, 'intern')
  if (!clerkId) return
  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Server missing Supabase service configuration.' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('csv_uploads')
      .select('id, file_name, file_url, status, row_count, error_message, created_at, reviewed_at')
      .eq('clerk_id', clerkId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      if (isMissingRelationError(error)) {
        helpers.json(res, 200, {
          uploads: [],
          templateHint: CLASS_CSV_TEMPLATE_HINT,
          schemaMissing: true,
          hint: 'Run supabase/roles-counselling-uploads.sql in the Supabase SQL Editor to create csv_uploads.',
        })
        return
      }
      console.error('[dev-api] intern uploads list', error)
      helpers.json(res, 500, { error: error.message || 'Could not load upload history' })
      return
    }

    helpers.json(res, 200, {
      uploads: (data ?? []).map((row) => ({
        id: row.id as string,
        fileName: row.file_name as string,
        fileUrl: row.file_url as string,
        status: row.status as string,
        rowCount: row.row_count as number,
        errorMessage: (row.error_message as string | null) ?? null,
        createdAt: row.created_at as string,
        reviewedAt: (row.reviewed_at as string | null) ?? null,
      })),
      templateHint: CLASS_CSV_TEMPLATE_HINT,
    })
    return
  }

  if (req.method === 'POST') {
    let body: { fileName?: string; csvText?: string }
    try {
      body = (await helpers.readBodyJson(req)) as typeof body
    } catch {
      helpers.json(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const fileName = body.fileName?.trim() || 'upload.csv'
    const csvText = body.csvText
    if (!csvText?.trim()) {
      helpers.json(res, 400, { error: 'csvText required' })
      return
    }

    const parsed = parseClassCsv(csvText)
    if (parsed.error) {
      helpers.json(res, 400, { error: parsed.error })
      return
    }

    const { data, error } = await supabase
      .from('csv_uploads')
      .insert({
        clerk_id: clerkId,
        file_name: fileName,
        file_url: '',
        status: 'pending',
        row_count: parsed.rows.length,
        parsed_rows: parsed.rows,
      })
      .select('id, file_name, status, row_count, created_at')
      .single()

    if (error) {
      if (isMissingRelationError(error)) {
        helpers.json(res, 503, {
          error:
            'csv_uploads table is missing. Run supabase/roles-counselling-uploads.sql in the Supabase SQL Editor.',
        })
        return
      }
      helpers.json(res, 500, { error: error.message || 'Could not save upload' })
      return
    }

    helpers.json(res, 201, {
      upload: {
        id: data.id as string,
        fileName: data.file_name as string,
        status: data.status as string,
        rowCount: data.row_count as number,
        createdAt: data.created_at as string,
      },
    })
    return
  }

  res.statusCode = 405
  res.end()
}

/** Returns true if the request path was handled. */
export function tryHandleRoleDashboardApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  const run = (fn: () => Promise<void>) => {
    void fn().catch((err) => {
      console.error('[dev-api] role-dashboard', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
  }

  if (path === '/api/admin/users') {
    run(() => handleAdminUsers(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/counselling-types') {
    run(() => handleAdminCounsellingTypes(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/counsellors') {
    run(() => handleAdminCounsellors(req, res, env, helpers))
    return true
  }
  if (path === '/api/admin/uploads') {
    if (req.method === 'GET') {
      run(() => handleAdminUploadsList(req, res, env, helpers))
      return true
    }
  }

  const approveMatch = path.match(/^\/api\/admin\/uploads\/([^/]+)\/approve$/)
  if (approveMatch) {
    run(() => handleAdminUploadAction(req, res, env, helpers, decodeURIComponent(approveMatch[1]!), 'approve'))
    return true
  }
  const rejectMatch = path.match(/^\/api\/admin\/uploads\/([^/]+)\/reject$/)
  if (rejectMatch) {
    run(() => handleAdminUploadAction(req, res, env, helpers, decodeURIComponent(rejectMatch[1]!), 'reject'))
    return true
  }

  if (path === '/api/counsellor/me') {
    run(() => handleCounsellorMe(req, res, env, helpers))
    return true
  }
  if (path === '/api/counsellor/availability') {
    run(() => handleCounsellorAvailability(req, res, env, helpers))
    return true
  }
  if (path === '/api/counsellor/bookings') {
    run(() => handleCounsellorBookings(req, res, env, helpers))
    return true
  }
  if (path === '/api/intern/uploads') {
    run(() => handleInternUploads(req, res, env, helpers))
    return true
  }

  return false
}
