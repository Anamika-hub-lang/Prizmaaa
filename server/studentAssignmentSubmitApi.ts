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
const MISSING_SQL =
  'Assignment storage is not set up. Run supabase/assignments-storage.sql in the Supabase SQL Editor.'

type DetectedFile = {
  contentType: string
  ext: string
}

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
  return (
    msg.includes('submission_type') ||
    msg.includes('submission_file_url') ||
    msg.includes('submission_file_name') ||
    msg.includes('submission_link') ||
    msg.includes('column')
  )
}

function isBucketMissing(error: { message?: string } | null | undefined): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  return msg.includes('bucket') || msg.includes('not found')
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 80)
  if (base.toLowerCase().endsWith(fallbackExt)) return base
  return `${base || 'assignment'}${fallbackExt}`
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

function detectAssignmentFile(buffer: Buffer, fileName: string): DetectedFile | null {
  const lower = fileName.toLowerCase()
  if (buffer.subarray(0, 4).toString('utf8') === '%PDF') {
    return { contentType: 'application/pdf', ext: '.pdf' }
  }
  const image = detectImageType(buffer)
  if (image === 'image/png') return { contentType: image, ext: '.png' }
  if (image === 'image/jpeg') return { contentType: image, ext: '.jpg' }
  if (image === 'image/webp') return { contentType: image, ext: '.webp' }
  const ole =
    buffer.length >= 8 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0
  if (ole && lower.endsWith('.doc')) {
    return { contentType: 'application/msword', ext: '.doc' }
  }
  const zip =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)
  if (zip && lower.endsWith('.docx')) {
    return {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ext: '.docx',
    }
  }
  return null
}

function parseHttpUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
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

async function uploadAssignmentFile(
  supabase: SupabaseClient,
  assignmentId: string,
  fileBase64: string,
  fileName: string,
): Promise<{ url: string; name: string } | { error: string }> {
  const buffer = decodeBase64Payload(fileBase64)
  if (!buffer) return { error: 'Invalid file data' }
  if (buffer.length > MAX_FILE_BYTES) return { error: 'File must be 8 MB or smaller' }
  const detected = detectAssignmentFile(buffer, fileName)
  if (!detected) {
    return { error: 'Upload a PDF, PNG, JPEG, WebP, DOC, or DOCX file' }
  }

  const safeName = sanitizeFileName(fileName || `assignment${detected.ext}`, detected.ext)
  const path = `submissions/${assignmentId}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(ASSIGNMENTS_BUCKET).upload(path, buffer, {
    contentType: detected.contentType,
    upsert: false,
  })
  if (upErr) {
    if (isBucketMissing(upErr)) return { error: MISSING_SQL }
    return { error: upErr.message || 'Upload failed' }
  }

  const { data } = supabase.storage.from(ASSIGNMENTS_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: 'Could not resolve file URL' }
  return { url: data.publicUrl, name: safeName }
}

async function handleSubmitAssignment(
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

  const assignmentId = typeof body.assignmentId === 'string' ? body.assignmentId.trim() : ''
  if (!assignmentId) {
    helpers.json(res, 400, { error: 'Assignment id is required' })
    return
  }

  const studentNote = typeof body.studentNote === 'string' ? body.studentNote.trim() : ''
  const fileBase64 = typeof body.fileBase64 === 'string' ? body.fileBase64.trim() : ''
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : ''
  const submissionLinkRaw = typeof body.submissionLink === 'string' ? body.submissionLink.trim() : ''

  const hasFile = Boolean(fileBase64 && fileName)
  const hasLink = Boolean(submissionLinkRaw)
  if (!hasFile && !hasLink) {
    helpers.json(res, 400, { error: 'Upload a file or paste a link' })
    return
  }

  let submissionType: 'file' | 'link' = hasFile ? 'file' : 'link'
  let submissionFileUrl: string | null = null
  let submissionFileName: string | null = null
  let submissionLink: string | null = null

  if (hasFile) {
    const uploaded = await uploadAssignmentFile(supabase, assignmentId, fileBase64, fileName)
    if ('error' in uploaded) {
      helpers.json(res, 400, { error: uploaded.error })
      return
    }
    submissionFileUrl = uploaded.url
    submissionFileName = uploaded.name
  } else {
    const parsed = parseHttpUrl(submissionLinkRaw)
    if (!parsed) {
      helpers.json(res, 400, { error: 'Enter a valid http or https link' })
      return
    }
    submissionLink = parsed
  }

  const { data: existing, error: existingErr } = await supabase
    .from('assignments')
    .select('id')
    .eq('id', assignmentId)
    .maybeSingle()

  if (existingErr) {
    if (isMissingTable(existingErr)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: existingErr.message || 'Could not load assignment' })
    return
  }
  if (!existing) {
    helpers.json(res, 404, { error: 'Assignment not found' })
    return
  }

  const submittedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const { error } = await supabase
    .from('assignments')
    .update({
      status: 'submitted',
      submitted_at: submittedAt,
      student_note: studentNote || null,
      submitted_by: 'Student',
      submission_type: submissionType,
      submission_file_url: submissionFileUrl,
      submission_file_name: submissionFileName,
      submission_link: submissionLink,
    })
    .eq('id', assignmentId)

  if (error) {
    if (isMissingTable(error) || isMissingColumn(error)) {
      helpers.json(res, 503, { error: MISSING_SQL })
      return
    }
    helpers.json(res, 500, { error: error.message || 'Could not submit assignment' })
    return
  }

  helpers.json(res, 200, {
    ok: true,
    assignmentId,
    submittedAt,
    submissionType,
    submissionFileUrl,
    submissionFileName,
    submissionLink,
    studentNote: studentNote || null,
  })
}

export function tryHandleStudentAssignmentSubmitApi(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
  env: Env,
  helpers: Helpers,
): boolean {
  if (path === '/api/student/assignments/submit') {
    void handleSubmitAssignment(req, res, env, helpers).catch((err) => {
      console.error('[assignment-submit]', err)
      helpers.json(res, 500, { error: 'Internal server error' })
    })
    return true
  }
  return false
}
