import { CollegeFindPage } from '@/views/CollegeFindPage'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.collegeFind

export default function Page() {
  return <CollegeFindPage />
}
