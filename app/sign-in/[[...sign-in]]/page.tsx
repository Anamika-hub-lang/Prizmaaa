import { SignInPage } from '@/views/SignInPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Sign in',
  description: 'Sign in to your PRIZMA account to access classes, bookings, and your dashboard.',
  path: '/sign-in',
  index: false,
})

export default function Page() {
  return <SignInPage />
}
