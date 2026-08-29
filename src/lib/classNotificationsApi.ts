export type ClassNotificationType = 'assignment' | 'schedule' | 'syllabus' | 'update'

export type ClassNotification = {
  id: string
  classId: string
  classTitle: string
  type: ClassNotificationType | string
  title: string
  body: string
  linkPath: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  createdAt: string
  read: boolean
}

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
    reader.onerror = () => reject(new Error('Could not read PDF file'))
    reader.readAsDataURL(file)
  })
}

export async function createClassNotification(
  getToken: () => Promise<string | null>,
  input: {
    classId: string
    type: ClassNotificationType
    title: string
    body?: string
    linkPath?: string | null
    pdfFile?: File | null
  },
) {
  let pdfBase64: string | undefined
  let pdfFileName: string | undefined
  if (input.pdfFile) {
    if (input.pdfFile.type && input.pdfFile.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed')
    }
    if (input.pdfFile.size > 4 * 1024 * 1024) {
      throw new Error('PDF must be 4 MB or smaller')
    }
    pdfBase64 = await fileToBase64(input.pdfFile)
    pdfFileName = input.pdfFile.name || 'syllabus.pdf'
  }

  const data = await authFetch('/api/mentor/notifications', getToken, {
    method: 'POST',
    body: JSON.stringify({
      classId: input.classId,
      type: input.type,
      title: input.title,
      body: input.body,
      linkPath: input.linkPath,
      pdfBase64,
      pdfFileName,
    }),
  })
  return data.notification as ClassNotification
}

export async function fetchStudentNotifications(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/student/notifications', getToken)
  return {
    notifications: (data.notifications as ClassNotification[]) ?? [],
    unreadCount: Number(data.unreadCount ?? 0),
  }
}

export async function markNotificationsRead(
  getToken: () => Promise<string | null>,
  input: { id?: string; ids?: string[]; all?: boolean },
) {
  await authFetch('/api/student/notifications/read', getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
