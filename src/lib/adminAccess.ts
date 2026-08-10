/** Client-side admin gate — must match server `ADMIN_CLERK_USER_IDS`. */
export function getAdminClerkUserIds(): string[] {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_IDS as string | undefined) ?? ''
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export function isAdminUser(userId: string | null | undefined): boolean {
  if (!userId) return false
  return getAdminClerkUserIds().includes(userId)
}
