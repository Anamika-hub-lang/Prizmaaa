import { AiToolsPage } from '@/views/AiToolsPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'AI Resume Review & Opportunity Matcher',
  description:
    'Free AI tools for students on PRIZMA: resume review, profile feedback, and an opportunity matcher for internships, scholarships, and courses.',
  path: '/ai',
  keywords: ['AI resume review', 'opportunity matcher', 'internships', 'PRIZMA'],
})

export default function Page() {
  return <AiToolsPage />
}
