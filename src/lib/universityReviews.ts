import { supabase } from './supabase'

export type UniversityReview = {
  id: string
  universityId: string
  authorName: string
  program: string | null
  graduationYear: number | null
  overallRating: number
  academicsRating: number | null
  campusRating: number | null
  placementRating: number | null
  reviewTitle: string | null
  pros: string | null
  cons: string | null
  advice: string | null
  verified: boolean
  createdAt: string
}

type ReviewRow = {
  id: string
  university_id: string
  author_name: string
  program: string | null
  graduation_year: number | null
  overall_rating: number
  academics_rating: number | null
  campus_rating: number | null
  placement_rating: number | null
  review_title: string | null
  pros: string | null
  cons: string | null
  advice: string | null
  verified: boolean
  created_at: string
}

function fromRow(row: ReviewRow): UniversityReview {
  return {
    id: row.id,
    universityId: row.university_id,
    authorName: row.author_name,
    program: row.program,
    graduationYear: row.graduation_year,
    overallRating: row.overall_rating,
    academicsRating: row.academics_rating,
    campusRating: row.campus_rating,
    placementRating: row.placement_rating,
    reviewTitle: row.review_title,
    pros: row.pros,
    cons: row.cons,
    advice: row.advice,
    verified: row.verified,
    createdAt: row.created_at,
  }
}

export async function fetchUniversityReviews(universityId?: string): Promise<UniversityReview[]> {
  if (!supabase) return []

  let query = supabase
    .from('university_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (universityId) {
    query = query.eq('university_id', universityId)
  }

  const { data, error } = await query
  if (error) {
    console.warn('[university-reviews] fetch', error.message)
    return []
  }
  return (data ?? []).map((r) => fromRow(r as ReviewRow))
}

export type InsertUniversityReviewInput = {
  universityId: string
  authorName: string
  program?: string
  graduationYear?: number
  overallRating: number
  academicsRating?: number
  campusRating?: number
  placementRating?: number
  reviewTitle?: string
  pros?: string
  cons?: string
  advice?: string
  clerkId?: string
}

export async function insertUniversityReview(input: InsertUniversityReviewInput): Promise<void> {
  if (!supabase) {
    throw new Error('Reviews are not available — add Supabase keys in .env')
  }

  const { error } = await supabase.from('university_reviews').insert({
    university_id: input.universityId,
    author_name: input.authorName.trim(),
    program: input.program?.trim() || null,
    graduation_year: input.graduationYear ?? null,
    overall_rating: input.overallRating,
    academics_rating: input.academicsRating ?? null,
    campus_rating: input.campusRating ?? null,
    placement_rating: input.placementRating ?? null,
    review_title: input.reviewTitle?.trim() || null,
    pros: input.pros?.trim() || null,
    cons: input.cons?.trim() || null,
    advice: input.advice?.trim() || null,
    clerk_id: input.clerkId ?? null,
    verified: Boolean(input.clerkId),
  })

  if (error) throw error
}

export function subscribeUniversityReviews(onChange: () => void) {
  if (!supabase) return () => {}
  const client = supabase
  const channel = client
    .channel('university-reviews')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'university_reviews' }, () =>
      onChange(),
    )
    .subscribe()
  return () => client.removeChannel(channel)
}

export function averageRating(reviews: UniversityReview[]): number | null {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function ratingBreakdown(reviews: UniversityReview[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of reviews) {
    counts[r.overallRating] = (counts[r.overallRating] ?? 0) + 1
  }
  return counts
}
