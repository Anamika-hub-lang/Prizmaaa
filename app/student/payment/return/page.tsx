import { StudentPaymentReturnPage } from '@/views/student/StudentPaymentReturnPage'
import { noIndexMetadata } from '@/lib/seo'

export const metadata = noIndexMetadata('Payment return')

export default function Page() {
  return <StudentPaymentReturnPage />
}
