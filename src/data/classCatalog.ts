import {
  categoryPricing,
  formatBrowsePricingSummary,
  formatCategoryPlanPrices,
  getCategoryMonthlyInr,
} from './pricingPlans'

export type ClassCategoryId = 'skills' | 'academic' | 'professional'

export type OnlineClass = {
  id: string
  title: string
  categoryId: ClassCategoryId
  image: string
  mentor: string
  mentorImage: string
  duration: string
  sessions: string
  description: string
  price: number
}

export type FreeCourse = {
  id: string
  title: string
  image: string
  instructor: string
  lessons: number
  hours: number
  description: string
}

/** DB anchor price = category monthly plan (not “per class” one-time). */
export function getDefaultPriceForCategory(categoryId: ClassCategoryId): number {
  return getCategoryMonthlyInr(categoryId)
}

export function getCategoryPlanPriceLabel(categoryId: ClassCategoryId): string {
  return formatCategoryPlanPrices(categoryId)
}

export { formatBrowsePricingSummary, formatCategoryPlanPrices }

/** Category tiles for browse — counts come from live Supabase data in the app. */
export const classCategories: {
  id: ClassCategoryId
  title: string
  description: string
  image: string
}[] = [
  {
    id: 'skills',
    title: 'Skills Based Classes',
    description: 'UI/UX, coding, Figma, Canva, AI & more — live on Google Meet.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  },
  {
    id: 'academic',
    title: 'Academic Classes',
    description: 'Mathematics & Accounts for 11th and 12th — mentor-led live classes.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  },
  {
    id: 'professional',
    title: 'Professional Classes',
    description: 'Career-focused tracks with live mentors on Google Meet.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
]

export function getCategoryById(id: string) {
  return classCategories.find((c) => c.id === id)
}

export function categoryMonthlyInr(categoryId: ClassCategoryId): number {
  return categoryPricing[categoryId].monthlyInr
}
