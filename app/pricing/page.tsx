import { PricingPage } from '@/views/PricingPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Pricing for Online Classes & Counselling',
  description:
    'See PRIZMA pricing for live online classes, career counselling calls, mock interviews, and student plans.',
  path: '/pricing',
})

export default function Page() {
  return <PricingPage />
}
