import { supabase } from './supabase'

export type CommunityReview = {
  id: string
  authorName: string
  roleType: 'student' | 'mentor'
  quote: string
  avatarUrl: string | null
  createdAt: string
}

type ReviewRow = {
  id: string
  author_name: string
  role_type: 'student' | 'mentor'
  quote: string
  avatar_url: string | null
  created_at: string
}

function fromRow(row: ReviewRow): CommunityReview {
  return {
    id: row.id,
    authorName: row.author_name,
    roleType: row.role_type,
    quote: row.quote,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  }
}

export async function fetchCommunityReviews(): Promise<CommunityReview[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('community_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.warn('[reviews] fetch', error.message)
    return []
  }
  return (data ?? []).map((r) => fromRow(r as ReviewRow))
}

export async function insertCommunityReview(input: {
  authorName: string
  roleType: 'student' | 'mentor'
  quote: string
  avatarUrl?: string
}): Promise<void> {
  if (!supabase) {
    throw new Error('Reviews are not available — add Supabase keys in .env')
  }
  const { error } = await supabase.from('community_reviews').insert({
    author_name: input.authorName.trim(),
    role_type: input.roleType,
    quote: input.quote.trim(),
    avatar_url: input.avatarUrl?.trim() || null,
  })
  if (error) throw error
}

export function subscribeCommunityReviews(onChange: () => void) {
  if (!supabase) return () => {}
  const client = supabase
  const channel = client
    .channel('community-reviews')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reviews' }, () =>
      onChange(),
    )
    .subscribe()
  return () => client.removeChannel(channel)
}

export type MentorApplicationPayload = {
  fullName: string
  email: string
  phone?: string
  expertise: string
  experience?: string
  message?: string
}

export async function submitMentorApplication(payload: MentorApplicationPayload): Promise<void> {
  const res = await fetch('/api/mentor/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'Could not submit application'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
}
