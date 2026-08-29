import { HomePage } from '@/views/HomePage'
import { JsonLd } from '@/components/seo/JsonLd'
import { counsellingFaqs } from '@/data/seoFaqs'
import { counsellingServiceJsonLd, faqJsonLd } from '@/lib/jsonLd'
import { homeDescription, homeTitleAbsolute, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: homeTitleAbsolute,
  description: homeDescription,
  path: '/',
  keywords: [
    'career counselling',
    'career guidance',
    'online career counselling',
    'career counselling for students',
    'online classes',
    'online courses for students',
    'online learning platform',
    'course selection',
    'college guidance',
    'PRIZMA',
  ],
  absoluteTitle: true,
})

export default function Page() {
  return (
    <>
      <JsonLd data={[counsellingServiceJsonLd(), faqJsonLd(counsellingFaqs)]} />
      <HomePage />
    </>
  )
}
