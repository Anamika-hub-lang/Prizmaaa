import { MainNavbar } from '../components/layout/MainNavbar'
import { AppButton } from '../components/ui/AppButton'
import { CourseImageCard } from '../components/ui/CourseImageCard'
import { Reveal } from '../components/ui/Reveal'

const courses = [
  {
    image: 'https://images.unsplash.com/photo-1487958449943-27c9487ce95a?w=500&q=80',
    title: 'Neo-Brutalism for the Modern Web',
    instructor: 'Sarah Chen',
    students: '240+',
    date: '12 Lessons',
    location: '6 hrs',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
    title: 'Systems Programming Crash',
    instructor: 'Marcus Ray',
    students: '180+',
    date: '18 Lessons',
    location: '8 hrs',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1455390582260-044cdead277a?w=500&q=80',
    title: 'Writing That Sells',
    instructor: 'Elena Voss',
    students: '90+',
    date: '12 Lessons',
    location: '4 hrs',
    status: 'completed' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
    title: 'UX Research Essentials',
    instructor: 'Herman Wong',
    students: '120+',
    date: '10 Lessons',
    location: '5 hrs',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80',
    title: 'Growth Marketing 101',
    instructor: 'Marcus Ray',
    students: '200+',
    date: '14 Lessons',
    location: '7 hrs',
    status: 'ongoing' as const,
  },
]

export function FreeLibraryPage() {
  return (
    <div className="min-h-screen bg-educture-cream flex flex-col">
      <MainNavbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <Reveal className="text-left mb-10">
          <span className="text-educture-orange font-semibold text-sm uppercase">Free Library</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            High quality education for everyone
          </h1>
          <p className="text-gray-600 text-sm mt-3 max-w-xl">
            Full courses with rich visuals — no paywalls on the essentials.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-10">
          {courses.map((c) => (
            <CourseImageCard key={c.title} compact {...c} />
          ))}
        </div>

        <div className="text-center">
          <AppButton size="lg">Load More Courses</AppButton>
        </div>
      </main>
    </div>
  )
}
