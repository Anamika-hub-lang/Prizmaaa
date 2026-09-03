export const DEFAULT_MENTOR_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'

/** Clerk serves letter avatars (e.g. purple “A”) on img.clerk.com when no photo is uploaded. */
export function isClerkHostedImage(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? ''
  if (!trimmed) return false
  try {
    const host = new URL(trimmed).hostname.toLowerCase()
    return host === 'img.clerk.com' || host.endsWith('.clerk.com')
  } catch {
    return /img\.clerk\.com/i.test(trimmed)
  }
}

export function isGenericMentorImage(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? ''
  if (!trimmed) return true
  if (trimmed === DEFAULT_MENTOR_IMAGE || trimmed.includes('photo-1507003211169')) return true
  // Never show Clerk letter/email initials as a mentor face on class cards.
  if (isClerkHostedImage(trimmed)) return true
  return false
}

/**
 * Prefer a real non-Clerk photo URL. Clerk letter avatars (purple “A”, etc.) are never used.
 * Pass profileUrl only for non-Clerk hosts, or leave null and store a custom image URL.
 */
export function resolveMentorImage(
  stored: string | null | undefined,
  profileUrl?: string | null,
): string {
  const profile = profileUrl?.trim()
  if (profile && !isGenericMentorImage(profile)) return profile
  const storedTrim = stored?.trim()
  if (storedTrim && !isGenericMentorImage(storedTrim)) return storedTrim
  return ''
}
