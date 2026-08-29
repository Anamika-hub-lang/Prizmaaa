import { HomePage } from '@/views/HomePage'
import { homeDescription, homeTitleAbsolute, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: homeTitleAbsolute,
  description: homeDescription,
  path: '/',
  keywords: [
    'career counselling',
    'online classes',
    'online courses',
    'college guidance',
    'mock interview',
    'PRIZMA',
  ],
  absoluteTitle: true,
})

export default function Page() {
  return <HomePage />
}
