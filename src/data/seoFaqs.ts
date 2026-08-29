import type { CounsellingGroupId } from './counsellingServices'

export type SeoFaqItem = { question: string; answer: string }

export const counsellingFaqs: SeoFaqItem[] = [
  {
    question: 'What is online career counselling on PRIZMA?',
    answer:
      'PRIZMA offers 1-on-1 online career counselling for students in India. You book a paid guidance call, then talk on Google Meet or phone about jobs, courses, colleges, and what to do next.',
  },
  {
    question: 'How much does career counselling for students cost?',
    answer:
      'A career counselling or career guidance call is ₹199. Mock interview practice is ₹99 per session. You pay once per call; browsing topics on the site is free.',
  },
  {
    question: 'Who is career guidance for?',
    answer:
      'School and college students who need career counselling after 10th or 12th, undergraduates choosing a domain, and anyone who wants a practical plan for skills, internships, or job interviews.',
  },
  {
    question: 'Is this live online counselling or a chatbot?',
    answer:
      'Calls are live with a mentor or senior. You choose Google Meet or a phone call, pick a slot, and get written takeaways after the session.',
  },
  {
    question: 'Can I get college guidance and course selection help too?',
    answer:
      'Yes. Career counselling covers course selection and college guidance, and you can also browse colleges or use the college matcher on PRIZMA before or after the call.',
  },
]

export const domainFaqs: SeoFaqItem[] = [
  {
    question: 'What is domain or skill counselling on PRIZMA?',
    answer:
      'Domain counselling is a ₹199 live call about a specific field — UI/UX, coding, data, marketing, and similar tracks. You leave with a learning order, not a generic pep talk.',
  },
  {
    question: 'Should I take an online class or a counselling call first?',
    answer:
      'If you already know the skill, browse online classes and enrol. If you are choosing between tracks, book this call first so you do not start the wrong online course.',
  },
  {
    question: 'Is this the same as career counselling?',
    answer:
      'Career counselling is broader (roles, interviews, long-term direction). Domain counselling is narrower: which skill to learn, in what order, and which online classes fit that path.',
  },
]

export const futureFaqs: SeoFaqItem[] = [
  {
    question: 'Do you help with career counselling after 10th and 12th?',
    answer:
      'Yes. This call is for stream choice, exams, college vs skill paths, and what to do next. It is a live conversation, then written takeaways.',
  },
  {
    question: 'Can this call include college guidance and course selection?',
    answer:
      'Yes. Mentors can talk through course selection and college guidance, and you can also use the PRIZMA college list or matcher before or after the call.',
  },
  {
    question: 'How is this different from a campus counselling page?',
    answer:
      'Campus pages are about a specific university. This call is about your next step as a student — exams, streams, freelancing, or balancing school with skills.',
  },
]

export const classesFaqs: SeoFaqItem[] = [
  {
    question: 'What online classes does PRIZMA offer?',
    answer:
      'PRIZMA is an online learning platform for students with live peer classes on Google Meet — skills, academics, and professional tracks such as UI/UX, coding, and frontend development.',
  },
  {
    question: 'Are these online courses for students or recorded videos?',
    answer:
      'Classes are live online courses with a mentor. You enrol, get the session schedule and Meet link, and learn with other students — not a self-paced video dump.',
  },
  {
    question: 'Do I need career counselling before joining an online class?',
    answer:
      'No, but many students book a ₹199 career counselling call first if they are unsure which skill or course to pick. You can browse classes freely, then enrol when ready.',
  },
]

export function faqsForGroup(id: CounsellingGroupId): { heading: string; items: SeoFaqItem[] } {
  switch (id) {
    case 'career':
      return { heading: 'Career counselling FAQs', items: counsellingFaqs }
    case 'domain':
      return { heading: 'Skill counselling FAQs', items: domainFaqs }
    case 'future':
      return { heading: 'After 10th and 12th FAQs', items: futureFaqs }
    default: {
      const _never: never = id
      return _never
    }
  }
}
