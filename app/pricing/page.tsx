import { PricingPage } from '@/views/PricingPage'
import { staticPublicSeo } from '@/lib/seo'

export const metadata = staticPublicSeo.pricing

export default function Page() {
  return <PricingPage />
}
