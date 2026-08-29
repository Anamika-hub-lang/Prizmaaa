import { CollegesPage } from '@/views/CollegesPage'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.colleges

export default function Page() {
  return <CollegesPage />
}
