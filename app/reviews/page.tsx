import { ShareReviewPage } from '@/views/ShareReviewPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Student Stories & Reviews',
  description:
    'Read and share student and mentor stories about PRIZMA career counselling, online classes, and campus guidance.',
  path: '/reviews',
})

export default function Page() {
  return <ShareReviewPage />
}
