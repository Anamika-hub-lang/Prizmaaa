import type { IncomingMessage, ServerResponse } from 'node:http'
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

const ASSIGNMENTS_BUCKET = 'assignments'
const MAX_FILE_BYTES = 8 * 1024 * 1024

function isBucketMissing(error: { message?: string; statusCode?: string | number } | null | undefined): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  const status = String(error?.statusCode ?? '')
  return (
    status === '404' ||
    msg.includes('bucket not found') ||
    (msg.includes('bucket') && (msg.includes('not found') || msg.includes('does not exist')))
  )
}

async function ensureAssignmentsBucket(supabase: SupabaseClient): Promise<{ error?: string }> {
  const existing = await supabase.storage.getBucket(ASSIGNMENTS_BUCKET)
  if (existing.data) return {}

  const created = await supabase.storage.createBucket(ASSIGNMENTS_BUCKET, { public: true })
  if (created.error) {
    const msg = created.error.message.toLowerCase()
    if (msg.includes('already exists') || msg.includes('duplicate')) return {}
    return { error: created.error.message || 'Could not create the assignments storage bucket' }
  }
  return {}
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 80)
  if (base.toLowerCase().endsWith(fallbackExt)) return base
  return `${base || 'reference'}${fallbackExt}`
}

function sanitizeAssignmentId(id: string): string {
  return id.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 80)
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

async function uploadReferenceImage(
  supabase: SupabaseClient,
  assignmentId: string,
  imageBase64: string,
  fileName: string,
): Promise<{ url: string } | { error: string }> {
  const buffer = decodeBase64Payload(imageBase64)
  if (!buffer) return { error: 'Invalid image data' }
  if (buffer.length > MAX_FILE_BYTES) return { error: 'Each image must be 8 MB or smaller' }
  const contentType = detectImageType(buffer)
  if (!contentType) return { error: 'Reference images must be PNG, JPEG, or WebP' }

  const ext = contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg'
  const safeName = sanitizeFileName(fileName || `reference${ext}`, ext)
  const path = `references/${assignmentId}/${Date.now()}-${safeName}`

  const ensured = await ensureAssignmentsBucket(supabase)
  if (ensured.error) return { error: ensured.error }

  const uploadOnce = () =>
    supabase.storage.from(ASSIGNMENTS_BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    })

  let { error: upErr } = await uploadOnce()
  if (upErr && isBucketMissing(upErr)) {
    const retryEnsure = await ensureAssignmentsBucket(supabase)
    if (retryEnsure.error) return { error: retryEnsure.error }
    const retried = await uploadOnce()
    upErr = retried.error
  }
  if (upErr) {
    console.error('[assignment-reference-images] upload', upErr.message)
    return { error: upErr.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(ASSIGNMENTS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Could not resolve image URL' }
  return { url: data.publicUrl }
}

async function handleReferenceImagesPost(
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

  if (!(await requireAuth(req, res, env, helpers))) return

  const supabase = helpers.requireSupabaseAdmin(env)
  if (!supabase) {
    helpers.json(res, 503, { error: 'Database not configured' })
    return
  }

  const body = (await helpers.readBodyJson(req)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') {
    helpers.json(res, 400, { error: 'Invalid JSON body' })
    return
  }

  const assignmentId = sanitizeAssignmentId(
    typeof body.assignmentId === 'string' ? body.assignmentId.trim() : '',
  )
  if (!assignmentId) {
    helpers.json(res, 400, { error: 'Assignment id is required' })
    return
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : ''
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : 'reference.png'
  if (!imageBase64) {
    helpers.json(res, 400, { error: 'imageBase64 is required' })
    return
  }

  const uploaded = await uploadReferenceImage(supabase, assignmentId, imageBase64, fileName)
  if ('error' in uploaded) {
    helpers.json(res, 400, { error: uploaded.error })
    return
  }

  helpers.json(res, 200, { ok: true, url: uploaded.url })
}

type StoredSubmission = {
  clerkId: string
  studentName: string
  submittedAt: string
  note?: string
  type: 'file' | 'link'
  fileUrl?: string | null
  fileName?: string | null
  link?: string | null
}

async function readJsonObject(
  supabase: SupabaseClient,
  path: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.storage.from(ASSIGNMENTS_BUCKET).download(path)
  if (error || !data) return null
  const text = await data.text()
  try {
    const parsed = JSON.parse(text) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

async function handleListSubmissions(
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
    helpers.json(res, 503, { error: 'Database not configured' })
    return
  }

  const url = new URL(req.url ?? '', 'http://localhost')
  const assignmentId = sanitizeAssignmentId(url.searchParams.get('assignmentId') ?? '')
  if (!assignmentId) {
    helpers.json(res, 400, { error: 'Assignment id is required' })
    return
  }

  const { data: assignment, error: asgErr } = await supabase
    .from('assignments')
    .select('id, mentor_clerk_id, class_id, submitted_by, submitted_at, student_note, status')
    .eq('id', assignmentId)
    .maybeSingle()
  if (asgErr || !assignment) {
    helpers.json(res, 404, { error: 'Assignment not found' })
    return
  }

  const ownerId = typeof assignment.mentor_clerk_id === 'string' ? assignment.mentor_clerk_id : ''
  const classId = typeof assignment.class_id === 'string' ? assignment.class_id : ''
  let allowed = ownerId === clerkId || !ownerId
  if (!allowed && classId) {
    const { data: cls } = await supabase
      .from('classes')
      .select('id, mentor_clerk_id')
      .eq('id', classId)
      .maybeSingle()
    allowed = Boolean(cls && cls.mentor_clerk_id === clerkId)
  }
  if (!allowed) {
    helpers.json(res, 403, { error: 'You cannot view submissions for this assignment' })
    return
  }

  const submissions: StoredSubmission[] = []
  const listed = await supabase.storage.from(ASSIGNMENTS_BUCKET).list(`submissions/${assignmentId}`, {
    limit: 100,
  })
  for (const item of listed.data ?? []) {
    const meta = await readJsonObject(supabase, `submissions/${assignmentId}/${item.name}/meta.json`)
    if (!meta) continue
    const type = meta.type === 'link' ? 'link' : 'file'
    submissions.push({
      clerkId: String(meta.clerkId ?? item.name),
      studentName: String(meta.studentName ?? 'Student'),
      submittedAt: String(meta.submittedAt ?? ''),
      note: typeof meta.note === 'string' ? meta.note : '',
      type,
      fileUrl: typeof meta.fileUrl === 'string' ? meta.fileUrl : null,
      fileName: typeof meta.fileName === 'string' ? meta.fileName : null,
      link: typeof meta.link === 'string' ? meta.link : null,
    })
  }

  if (submissions.length === 0 && assignment.status === 'submitted') {
    submissions.push({
      clerkId: 'legacy',
      studentName: String(assignment.submitted_by ?? 'Student'),
      submittedAt: String(assignment.submitted_at ?? ''),
      note: typeof assignment.student_note === 'string' ? assignment.student_note : '',
      type: 'file',
    })
  }

  helpers.json(res, 200, { ok: true, assignmentId, submissions })
}

export function tryHandleMentorAssignmentAssetsApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/mentor/assignments/reference-images') {
    void handleReferenceImagesPost(req, res, env, helpers).catch((err) => {
      console.error('[assignment-reference-images]', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  if (path === '/api/mentor/assignments/submissions') {
    void handleListSubmissions(req, res, env, helpers).catch((err) => {
      console.error('[assignment-submissions]', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  return false
}
