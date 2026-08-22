import type { ClassCategoryId } from '../data/classCatalog'

export const DEFAULT_CLASS_COVER =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'

const SKILLS_COVERS = [
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
]

const ACADEMIC_COVERS = [
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
]

const PROFESSIONAL_COVERS = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
]

const COVERS_BY_CATEGORY: Record<ClassCategoryId, string[]> = {
  skills: SKILLS_COVERS,
  academic: ACADEMIC_COVERS,
  professional: PROFESSIONAL_COVERS,
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function isGenericClassCover(url: string | null | undefined): boolean {
  const trimmed = url?.trim() ?? ''
  if (!trimmed) return true
  return trimmed === DEFAULT_CLASS_COVER || trimmed.includes('photo-1498050108023')
}

export function pickClassCoverImage(input: {
  id: string
  categoryId: ClassCategoryId
  title: string
  image?: string | null
}): string {
  const custom = input.image?.trim()
  if (custom && !isGenericClassCover(custom)) return custom

  const pool = COVERS_BY_CATEGORY[input.categoryId]
  const key = `${input.id}:${input.title.trim().toLowerCase()}`
  return pool[hashString(key) % pool.length]!
}

export function pickDefaultClassCoverForNew(categoryId: ClassCategoryId, seed: string): string {
  return pickClassCoverImage({ id: seed, categoryId, title: seed, image: '' })
}
