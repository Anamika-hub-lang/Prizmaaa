import { UniversitiesPage } from '@/views/UniversitiesPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Campus Stories & University Reviews',
  description:
    'Read campus stories and university reviews from students. Explore colleges across India and get counselling on whether a campus is the right fit.',
  path: '/universities',
})

export default function Page() {
  return <UniversitiesPage />
}
