import { CounsellingPage } from '@/views/CounsellingPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { COUNSELLING_PRICE_INR } from '@/data/counsellingServices'
import { pageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Career Counselling & Guidance',
  description: `Book career counselling and student guidance on PRIZMA from ₹${COUNSELLING_PRICE_INR} per call. Get a practical plan for jobs, skills, college, and what to do next.`,
  path: '/counselling',
  keywords: [
    'career counselling',
    'career guidance',
    'student counselling',
    'guidance call',
    'PRIZMA',
  ],
})

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Career counselling on PRIZMA',
          serviceType: 'Career counselling',
          provider: {
            '@type': 'EducationalOrganization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          areaServed: 'IN',
          offers: {
            '@type': 'Offer',
            price: String(COUNSELLING_PRICE_INR),
            priceCurrency: 'INR',
            url: `${SITE_URL}/counselling`,
          },
          description: `One-to-one career counselling and student guidance from ₹${COUNSELLING_PRICE_INR} per call.`,
        }}
      />
      <CounsellingPage />
    </>
  )
}
