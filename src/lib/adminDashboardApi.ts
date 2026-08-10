import type { AssignableRole } from '../types/auth'

export type AdminUserRow = {
  id: string
  clerkId: string
  fullName: string | null
  email: string | null
  role: string | null
  avatarUrl: string | null
  createdAt: string
}

export type CounsellingTypeRow = {
  id: string
  name: string
  subdomain: string
  slug: string
  createdAt?: string
}

export type AdminCounsellorRow = {
  clerkId: string
  fullName: string | null
  email: string | null
  avatarUrl: string | null
  availability: boolean
  typeIds: string[]
  types: CounsellingTypeRow[]
  bookings: Array<{
    id: string
    fullName: string
    email: string
    scheduledDate: string | null
    scheduledTime: string | null
    sessionStatus: string
    assignmentStatus: string
    createdAt: string
  }>
}

export type AdminUploadRow = {
  id: string
  clerkId: string
  fileName: string
  fileUrl: string
  status: 'pending' | 'approved' | 'rejected' | string
  rowCount: number
  errorMessage: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  uploadedBy: string
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

export async function fetchAdminUsers(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/admin/users', getToken)
  return (data.users as AdminUserRow[]) ?? []
}

export async function patchAdminUserRole(
  getToken: () => Promise<string | null>,
  clerkId: string,
  role: AssignableRole | null,
) {
  const data = await authFetch('/api/admin/users', getToken, {
    method: 'PATCH',
    body: JSON.stringify({ clerkId, role }),
  })
  return {
    warning: (data.warning as string | undefined) ?? null,
  }
}

export async function fetchAdminCounsellingTypes(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/admin/counselling-types', getToken)
  return (data.types as CounsellingTypeRow[]) ?? []
}

export async function createAdminCounsellingType(
  getToken: () => Promise<string | null>,
  input: { name: string; subdomain: string; slug?: string },
) {
  await authFetch('/api/admin/counselling-types', getToken, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateAdminCounsellingType(
  getToken: () => Promise<string | null>,
  input: { id: string; name?: string; subdomain?: string },
) {
  await authFetch('/api/admin/counselling-types', getToken, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteAdminCounsellingType(
  getToken: () => Promise<string | null>,
  id: string,
) {
  await authFetch('/api/admin/counselling-types', getToken, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
}

export async function fetchAdminCounsellors(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/admin/counsellors', getToken)
  return {
    counsellors: (data.counsellors as AdminCounsellorRow[]) ?? [],
    types: (data.types as CounsellingTypeRow[]) ?? [],
  }
}

export async function patchAdminCounsellor(
  getToken: () => Promise<string | null>,
  input: { clerkId: string; availability?: boolean; typeIds?: string[] },
) {
  await authFetch('/api/admin/counsellors', getToken, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function fetchAdminUploads(getToken: () => Promise<string | null>) {
  const data = await authFetch('/api/admin/uploads', getToken)
  return {
    uploads: (data.uploads as AdminUploadRow[]) ?? [],
    schemaMissing: Boolean(data.schemaMissing),
    hint: (data.hint as string | undefined) ?? null,
  }
}

export async function reviewAdminUpload(
  getToken: () => Promise<string | null>,
  id: string,
  action: 'approve' | 'reject',
) {
  await authFetch(`/api/admin/uploads/${id}/${action}`, getToken, { method: 'POST' })
}
