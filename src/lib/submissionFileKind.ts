export type SubmissionFileKind = 'pdf' | 'image' | 'archive' | 'link' | 'other'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif'])
const ARCHIVE_EXTENSIONS = new Set(['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz'])

function extensionOf(value: string): string {
  // Strip query strings and fragments so Supabase public URLs classify correctly.
  const withoutQuery = value.split(/[?#]/)[0] ?? ''
  const idx = withoutQuery.lastIndexOf('.')
  return idx >= 0 ? withoutQuery.slice(idx).toLowerCase() : ''
}

export function submissionFileKind(input: {
  type: 'file' | 'link'
  fileName?: string | null
  fileUrl?: string | null
  link?: string | null
}): SubmissionFileKind {
  if (input.type === 'link' || (!input.fileUrl && input.link)) return 'link'

  const ext = extensionOf(input.fileName || '') || extensionOf(input.fileUrl || '')
  if (ext === '.pdf') return 'pdf'
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive'
  return 'other'
}
