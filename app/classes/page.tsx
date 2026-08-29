import { LiveClassesPage } from '@/views/LiveClassesPage'
import { fetchPublishedClasses } from '@/lib/publishedClasses'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.classes

export default async function Page() {
  const initialClasses = await fetchPublishedClasses()
  return <LiveClassesPage initialClasses={initialClasses} />
}

