import type { ClassCategoryId } from '../data/classCatalog'
import { pickClassCoverImage } from './classCoverImages'
import { supabase } from './supabase'

export type PublishedClass = {
  id: string
  title: string
  description: string
  categoryId: ClassCategoryId
  image: string
  mentor: string
  mentorImage: string
  duration: string
  sessions: string
  price: number
  createdAt: string | null
}

const CATEGORIES: ClassCategoryId[] = ['skills', 'academic', 'professional']

function asCategoryId(value: string): ClassCategoryId {
  return CATEGORIES.includes(value as ClassCategoryId) ? (value as ClassCategoryId) : 'skills'
}

function mapRow(row: {
  id: string
  title: string
  description: string | null
  category_id: string
  image: string | null
  mentor: string | null
  mentor_image: string | null
  duration: string | null
  sessions: string | null
  price: number | null
  created_at: string | null
}): PublishedClass {
  const categoryId = asCategoryId(row.category_id)
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    categoryId,
    image: pickClassCoverImage({
      id: row.id,
      categoryId,
      title: row.title,
      image: row.image,
    }),
    mentor: row.mentor ?? '',
    mentorImage: row.mentor_image ?? '',
    duration: row.duration ?? '',
    sessions: row.sessions ?? '',
    price: row.price ?? 0,
    createdAt: row.created_at,
  }
}

const SELECT_FIELDS =
  'id, title, description, category_id, image, mentor, mentor_image, duration, sessions, price, created_at'

export async function fetchPublishedClasses(): Promise<PublishedClass[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('classes')
    .select(SELECT_FIELDS)
    .eq('published', true)
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.warn('[SEO] Could not load published classes:', error?.message)
    return []
  }

  return data.map(mapRow)
}

export async function fetchPublishedClassById(id: string): Promise<PublishedClass | null> {
  if (!supabase || !id) return null
  const { data, error } = await supabase
    .from('classes')
    .select(SELECT_FIELDS)
    .eq('id', id)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.warn('[SEO] Could not load class:', error.message)
    return null
  }
  if (!data) return null
  return mapRow(data)
}
