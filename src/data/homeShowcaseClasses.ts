import type { ClassCategoryId } from './classCatalog'

/** Marketing-only cards on the home page (not synced to mentor data). */
export const homeShowcaseClasses: {
  id: string
  title: string
  categoryId: ClassCategoryId
  image: string
}[] = [
  {
    id: 'showcase-ux',
    title: 'UI/UX — Live cohort',
    categoryId: 'skills',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
  },
  {
    id: 'showcase-fullstack',
    title: 'Full Stack — Professional track',
    categoryId: 'professional',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  },
  {
    id: 'showcase-figma',
    title: 'Advanced Figma Systems',
    categoryId: 'skills',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
  },
]
