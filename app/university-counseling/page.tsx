import { UniversityCounselingPage } from '@/views/UniversityCounselingPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Campus Counselling — Talk to Seniors',
  description:
    'Connect with seniors for campus counselling on PRIZMA. Get real perspectives on admissions, hostels, placements, and whether a university fits your goals.',
  path: '/university-counseling',
  keywords: ['campus counselling', 'college counselling', 'talk to seniors', 'PRIZMA'],
})

export default function Page() {
  return <UniversityCounselingPage />
}
