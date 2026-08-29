import { CollegesPage } from '@/views/CollegesPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Colleges in India — Fees, Courses & Placements',
  description:
    'Explore colleges by course, budget, city, and placements. See admission paths and book career counselling on PRIZMA to choose with confidence.',
  path: '/colleges',
  keywords: ['colleges in India', 'college admissions', 'career counselling', 'PRIZMA'],
})

export default function Page() {
  return <CollegesPage />
}
