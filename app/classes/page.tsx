import { LiveClassesPage } from '@/views/LiveClassesPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { fetchPublishedClasses } from '@/lib/publishedClasses'
import { classesItemListJsonLd, faqJsonLd } from '@/lib/jsonLd'
import { classesFaqs } from '@/data/seoFaqs'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.classes

export default async function Page() {
  const initialClasses = await fetchPublishedClasses()
  return (
    <>
      <JsonLd data={[classesItemListJsonLd(initialClasses), faqJsonLd(classesFaqs)]} />
      <LiveClassesPage initialClasses={initialClasses} />
    </>
  )
}
