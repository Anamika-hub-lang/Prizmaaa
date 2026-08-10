/** Client-side admin gate — must match server `ADMIN_CLERK_USER_IDS` + role=admin. */

type AdminCheckUser = {
  id?: string | null
  publicMetadata?: { role?: unknown }
} | null | undefined

export function getAdminClerkUserIds(): string[] {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_IDS as string | undefined) ?? ''
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

/**
 * Accepts a Clerk user id (allowlist only) or a user-like object
 * (allowlist OR `publicMetadata.role === 'admin'`).
 */
export function isAdminUser(userOrId: string | null | undefined | AdminCheckUser): boolean {
  if (userOrId == null) return false

  if (typeof userOrId === 'string') {
    return getAdminClerkUserIds().includes(userOrId)
  }

  const id = userOrId.id
  if (id && getAdminClerkUserIds().includes(id)) return true
  return userOrId.publicMetadata?.role === 'admin'
}
