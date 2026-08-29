import { CounsellingPage } from '@/views/CounsellingPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { counsellingFaqs } from '@/data/seoFaqs'
import { counsellingServiceJsonLd, faqJsonLd } from '@/lib/jsonLd'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.counselling

export default function Page() {
  return (
    <>
      <JsonLd data={[counsellingServiceJsonLd(), faqJsonLd(counsellingFaqs)]} />
      <CounsellingPage />
    </>
  )
}
