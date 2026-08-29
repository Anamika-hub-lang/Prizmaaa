import { InterviewPrepPage } from '@/views/InterviewPrepPage'
import {
  INTERVIEW_PREP_PRICE_INR,
  careerOfferings,
  INTERVIEW_PREP_TOPIC_ID,
} from '@/data/counsellingServices'
import { pageMetadata } from '@/lib/seo'

const offering = careerOfferings.find((item) => item.id === INTERVIEW_PREP_TOPIC_ID)

export const metadata = pageMetadata({
  title: 'Mock Interview & Interview Preparation',
  description:
    offering?.description ??
    `Live mock interview on Google Meet for ₹${INTERVIEW_PREP_PRICE_INR}. Practise technical and HR rounds with feedback on PRIZMA.`,
  path: '/counselling/interview-prep',
  image: offering?.image,
  keywords: ['mock interview', 'interview preparation', 'career counselling', 'PRIZMA'],
})

export default function Page() {
  return <InterviewPrepPage />
}
