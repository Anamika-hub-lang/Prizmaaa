import { AboutPage } from '@/views/AboutPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About PRIZMA',
  description:
    'PRIZMA is a student hub for career counselling, online classes, college guidance, and peer learning with seniors and mentors.',
  path: '/about',
})

export default function Page() {
  return <AboutPage />
}
