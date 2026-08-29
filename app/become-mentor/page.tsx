import { BecomeMentorPage } from '@/views/BecomeMentorPage'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Become a Mentor',
  description:
    'Teach live online classes on PRIZMA. Share your skills with students as a mentor and host peer learning sessions.',
  path: '/become-mentor',
})

export default function Page() {
  return <BecomeMentorPage />
}
