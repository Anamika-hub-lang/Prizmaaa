import { SignUpPage } from '@/views/SignUpPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Sign up',
  description: 'Create a PRIZMA account to enroll in online classes and book career counselling.',
  path: '/sign-up',
  index: false,
})

export default function Page() {
  return <SignUpPage />
}
