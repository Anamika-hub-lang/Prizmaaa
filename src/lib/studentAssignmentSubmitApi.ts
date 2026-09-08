const MAX_FILE_BYTES = 20 * 1024 * 1024

const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.pif',
  '.msi',
  '.dll',
  '.js',
  '.mjs',
  '.cjs',
  '.html',
  '.htm',
  '.php',
  '.sh',
  '.bash',
  '.ps1',
  '.vbs',
  '.jar',
  '.apk',
  '.app',
  '.dmg',
  '.iso',
  '.svg',
])

async function authFetch(path: string, getToken: () => Promise<string | null>, init?: RequestInit) {
  const token = await getToken()
  if (!token) throw new Error('Sign in required')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    if (!res.ok) throw new Error(text.slice(0, 120) || `API error (${res.status})`)
  }
  if (!res.ok) throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  return data
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
}

function fileExtension(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx).toLowerCase() : ''
}

export function isAllowedAssignmentFile(file: File): boolean {
  const ext = fileExtension(file.name)
  if (!ext) return true
  return !BLOCKED_EXTENSIONS.has(ext)
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function submitStudentAssignment(
  getToken: () => Promise<string | null>,
  input: {
    assignmentId: string
    studentNote?: string
    file?: File | null
    submissionLink?: string
  },
) {
  let fileBase64: string | undefined
  let fileName: string | undefined
  if (input.file) {
    if (!isAllowedAssignmentFile(input.file)) {
      throw new Error('That file type is not allowed. Use a zip, PDF, image, Office file, or similar.')
    }
    if (input.file.size > MAX_FILE_BYTES) {
      throw new Error('File must be 20 MB or smaller')
    }
    fileBase64 = await fileToBase64(input.file)
    fileName = input.file.name
  }

  return authFetch('/api/student/assignments/submit', getToken, {
    method: 'POST',
    body: JSON.stringify({
      assignmentId: input.assignmentId,
      studentNote: input.studentNote,
      fileBase64,
      fileName,
      submissionLink: input.submissionLink,
    }),
  })
}

export const ASSIGNMENT_FILE_MAX_MB = 20
export const ASSIGNMENT_FILE_ACCEPT =
  '.zip,.rar,.7z,.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.odt,.odp,.ods,.mp4,.mov,application/zip,application/pdf,image/*'
