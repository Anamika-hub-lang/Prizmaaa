export const DEFAULT_MENTOR_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'

export function isGenericMentorImage(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? ''
  if (!trimmed) return true
  return trimmed === DEFAULT_MENTOR_IMAGE || trimmed.includes('photo-1507003211169')
}

export function resolveMentorImage(
  stored: string | null | undefined,
  profileUrl?: string | null,
): string {
  const profile = profileUrl?.trim()
  if (profile) return profile
  const storedTrim = stored?.trim()
  if (storedTrim && !isGenericMentorImage(storedTrim)) return storedTrim
  return DEFAULT_MENTOR_IMAGE
}
