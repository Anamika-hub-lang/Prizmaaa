export type InternUploadRow = {
  id: string
  fileName: string
  fileUrl: string
  status: 'pending' | 'approved' | 'rejected' | string
  rowCount: number
  errorMessage: string | null
  createdAt: string
  reviewedAt: string | null
}

async function authFetch(
  path: string,
  getToken: () => Promise<string | null>,
  init?: RequestInit,
) {
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
  if (!res.ok) {
    throw new Error((data.error as string | undefined) ?? `API error (${res.status})`)
  }
  return data
}

export async function fetchInternUploads(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/intern/uploads', getToken)
  return {
    uploads: (data.uploads as InternUploadRow[]) ?? [],
    templateHint: (data.templateHint as string | undefined) ?? '',
  }
}

export async function postInternUpload(
  getToken: () => Promise<string | null>,
  input: { fileName: string; csvText: string },
) {
  const data = await authFetch('/api/intern/uploads', getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.upload as InternUploadRow
}
