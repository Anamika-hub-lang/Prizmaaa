import { CashfreeHostPage } from '@/views/CashfreeHostPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Secure payment',
  description: 'Complete your PRIZMA payment securely.',
  path: '/pay/cashfree',
  index: false,
})

export default function Page() {
  return <CashfreeHostPage />
}
