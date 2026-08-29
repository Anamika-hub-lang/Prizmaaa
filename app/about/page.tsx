import { AboutPage } from '@/views/AboutPage'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.about

export default function Page() {
  return <AboutPage />
}
