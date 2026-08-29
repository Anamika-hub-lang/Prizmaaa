import type { IncomingMessage, ServerResponse } from 'node:http'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isActiveEnrollmentRow } from './lib/enrollmentPolicy'

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

const NOTIFICATION_TYPES = new Set(['assignment', 'schedule', 'syllabus', 'update'])
const MAX_PDF_BYTES = 4 * 1024 * 1024
const MATERIALS_BUCKET = 'class-materials'

const MISSING_SQL =
  'Notifications table missing. Run supabase/class-notifications.sql in the Supabase SQL Editor.'

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('does not exist') || msg.includes('could not find the table')
}

function isMissingColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return true
  const msg = (error.message ?? '').toLowerCase()
  return msg.includes('attachment_url') || msg.includes('attachment_name') || msg.includes('column')
}

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 80)
  return base.toLowerCase().endsWith('.pdf') ? base : `${base || 'syllabus'}.pdf`
}

async function uploadSyllabusPdf(
  supabase: SupabaseClient,
  classId: string,
  pdfBase64: string,
  pdfFileName: string,
): Promise<{ url: string; name: string } | { error: string }> {
  const raw = pdfBase64.includes(',') ? pdfBase64.split(',').pop()! : pdfBase64
  let buffer: Buffer
  try {
    buffer = Buffer.from(raw, 'base64')
  } catch {
    return { error: 'Invalid PDF data' }
  }
  if (buffer.length === 0) return { error: 'PDF file is empty' }
  if (buffer.length > MAX_PDF_BYTES) return { error: 'PDF must be 4 MB or smaller' }
  // PDF magic bytes
  if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') {
    return { error: 'Only PDF files are allowed' }
  }

  const safeName = sanitizeFileName(pdfFileName || 'syllabus.pdf')
  const path = `syllabus/${classId}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(MATERIALS_BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (upErr) {
    const msg = upErr.message || 'Upload failed'
    if (msg.toLowerCase().includes('bucket') || msg.toLowerCase().includes('not found')) {
      return {
        error:
          'Storage bucket missing. Re-run supabase/class-notifications.sql (creates class-materials bucket).',
      }
    }
    return { error: msg }
  }

  const { data } = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Could not resolve PDF URL' }
  return { url: data.publicUrl, name: safeName }
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

async function canMentorPostForClass(
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
  if (share) return { ok: true, title: String(cls.title ?? 'Class') }
  return { ok: false }
}

async function handleCreateNotification(
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

  const body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  const classId = String(body.classId ?? '').trim()
  const type = String(body.type ?? '').trim().toLowerCase()
  const title = String(body.title ?? '').trim()
  const noteBody = String(body.body ?? '').trim()
  const linkPath = body.linkPath != null ? String(body.linkPath).trim() : null
  const pdfBase64 = typeof body.pdfBase64 === 'string' ? body.pdfBase64.trim() : ''
  const pdfFileName = typeof body.pdfFileName === 'string' ? body.pdfFileName.trim() : 'syllabus.pdf'
  let attachmentUrl =
    typeof body.attachmentUrl === 'string' && body.attachmentUrl.trim().startsWith('http')
      ? body.attachmentUrl.trim()
      : null
  let attachmentName =
    typeof body.attachmentName === 'string' && body.attachmentName.trim()
      ? body.attachmentName.trim().slice(0, 120)
      : null

  if (!classId || !title) {
    helpers.json(res, 400, { error: 'classId and title are required' })
    return
  }
  if (!NOTIFICATION_TYPES.has(type)) {
    helpers.json(res, 400, { error: 'Invalid notification type' })
    return
  }

  const access = await canMentorPostForClass(supabase, classId, clerkId)
  if (!access.ok) {
    helpers.json(res, 403, { error: 'Only the class owner or a co-mentor can notify students' })
    return
  }

  if (pdfBase64) {
    const uploaded = await uploadSyllabusPdf(supabase, classId, pdfBase64, pdfFileName)
    if ('error' in uploaded) {
      helpers.json(res, 400, { error: uploaded.error })
      return
    }
    attachmentUrl = uploaded.url
    attachmentName = uploaded.name
  }

  const insertRow: Record<string, unknown> = {
    class_id: classId,
    type,
    title,
    body: noteBody,
    link_path: linkPath || null,
    created_by_clerk_id: clerkId,
    attachment_url: attachmentUrl,
    attachment_name: attachmentName,
  }

  let { data, error } = await supabase
    .from('class_notifications')
    .insert(insertRow)
    .select('id, class_id, type, title, body, link_path, attachment_url, attachment_name, created_at')
    .single()

  // Older DB without attachment columns: insert without them if mentor didn't attach a file.
  if (error && isMissingColumn(error) && !attachmentUrl) {
    const retry = await supabase
      .from('class_notifications')
      .insert({
        class_id: classId,
        type,
        title,
        body: noteBody,
        link_path: linkPath || null,
        created_by_clerk_id: clerkId,
      })
      .select('id, class_id, type, title, body, link_path, created_at')
      .single()
    data = retry.data as typeof data
    error = retry.error
  }

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    if (isMissingColumn(error) && attachmentUrl) {
      helpers.json(res, 503, {
        error:
          'PDF columns missing. Re-run supabase/class-notifications.sql in the Supabase SQL Editor.',
      })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not create notification' })
    return
  }

  helpers.json(res, 201, {
    notification: {
      id: data!.id,
      classId: data!.class_id,
      classTitle: access.title,
      type: data!.type,
      title: data!.title,
      body: data!.body ?? '',
      linkPath: data!.link_path,
      attachmentUrl: (data as { attachment_url?: string | null }).attachment_url ?? attachmentUrl,
      attachmentName: (data as { attachment_name?: string | null }).attachment_name ?? attachmentName,
      createdAt: data!.created_at,
      read: false,
    },
  })
}

async function handleStudentList(
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

  const { data: enrollments, error: enrErr } = await supabase
    .from('student_enrollments')
    .select('*')
    .eq('clerk_id', clerkId)

  if (enrErr) {
    helpers.json(res, 500, { error: enrErr.message || 'Could not load enrollments' })
    return
  }

  const classIds = [
    ...new Set(
      (enrollments ?? [])
        .filter((e) => isActiveEnrollmentRow(e))
        .map((e) => String(e.class_id ?? '').trim())
        .filter(Boolean),
    ),
  ]

  if (classIds.length === 0) {
    helpers.json(res, 200, { notifications: [], unreadCount: 0 })
    return
  }

  let { data: rows, error } = await supabase
    .from('class_notifications')
    .select('id, class_id, type, title, body, link_path, attachment_url, attachment_name, created_at')
    .in('class_id', classIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error && isMissingColumn(error)) {
    const fallback = await supabase
      .from('class_notifications')
      .select('id, class_id, type, title, body, link_path, created_at')
      .in('class_id', classIds)
      .order('created_at', { ascending: false })
      .limit(50)
    rows = fallback.data as typeof rows
    error = fallback.error
  }

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not load notifications' })
    return
  }

  const ids = (rows ?? []).map((r) => String(r.id))
  const readSet = new Set<string>()
  if (ids.length > 0) {
    const { data: reads } = await supabase
      .from('class_notification_reads')
      .select('notification_id')
      .eq('clerk_id', clerkId)
      .in('notification_id', ids)
    for (const r of reads ?? []) {
      readSet.add(String(r.notification_id))
    }
  }

  const titleByClass = new Map<string, string>()
  const { data: classes } = await supabase.from('classes').select('id, title').in('id', classIds)
  for (const c of classes ?? []) {
    titleByClass.set(String(c.id), String(c.title ?? 'Class'))
  }

  const notifications = (rows ?? []).map((r) => {
    const id = String(r.id)
    const row = r as {
      class_id: string
      type: string
      title: string
      body?: string | null
      link_path?: string | null
      attachment_url?: string | null
      attachment_name?: string | null
      created_at: string
    }
    return {
      id,
      classId: String(row.class_id),
      classTitle: titleByClass.get(String(row.class_id)) ?? 'Class',
      type: String(row.type),
      title: String(row.title),
      body: String(row.body ?? ''),
      linkPath: row.link_path ? String(row.link_path) : null,
      attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
      attachmentName: row.attachment_name ? String(row.attachment_name) : null,
      createdAt: String(row.created_at),
      read: readSet.has(id),
    }
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  helpers.json(res, 200, { notifications, unreadCount })
}

async function handleMarkRead(
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

  const body = (await helpers.readBodyJson(req)) as Record<string, unknown>
  const markAll = Boolean(body.all)
  let ids: string[] = []

  if (markAll) {
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('clerk_id', clerkId)
    const classIds = [
      ...new Set(
        (enrollments ?? [])
          .filter((e) => isActiveEnrollmentRow(e))
          .map((e) => String(e.class_id ?? '').trim())
          .filter(Boolean),
      ),
    ]
    if (classIds.length > 0) {
      const { data: notes } = await supabase
        .from('class_notifications')
        .select('id')
        .in('class_id', classIds)
        .limit(100)
      ids = (notes ?? []).map((n) => String(n.id))
    }
  } else if (Array.isArray(body.ids)) {
    ids = body.ids.map((id) => String(id).trim()).filter(Boolean)
  } else if (body.id) {
    ids = [String(body.id).trim()].filter(Boolean)
  }

  if (ids.length === 0) {
    helpers.json(res, 200, { ok: true, marked: 0 })
    return
  }

  const rows = ids.map((notification_id) => ({
    notification_id,
    clerk_id: clerkId,
  }))

  const { error } = await supabase.from('class_notification_reads').upsert(rows, {
    onConflict: 'notification_id,clerk_id',
  })

  if (error) {
    if (isMissingTable(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not mark notifications read' })
    return
  }

  helpers.json(res, 200, { ok: true, marked: ids.length })
}

export function tryHandleClassNotificationsApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/mentor/notifications') {
    void handleCreateNotification(req, res, env, helpers).catch((err) => {
      console.error('[class-notifications] create', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/student/notifications') {
    void handleStudentList(req, res, env, helpers).catch((err) => {
      console.error('[class-notifications] list', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/student/notifications/read') {
    void handleMarkRead(req, res, env, helpers).catch((err) => {
      console.error('[class-notifications] read', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  return false
}
