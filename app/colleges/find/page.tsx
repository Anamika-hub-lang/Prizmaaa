import { CollegeFindPage } from '@/views/CollegeFindPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Find Your College',
  description:
    'Answer a few questions about course, budget, and location. PRIZMA matches colleges and shows the admission path, plus career counselling if you want a second opinion.',
  path: '/colleges/find',
  keywords: ['college finder', 'college counselling', 'career counselling', 'PRIZMA'],
})

export default function Page() {
  return <CollegeFindPage />
}
