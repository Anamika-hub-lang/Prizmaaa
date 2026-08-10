import { PageShell } from '../components/layout/PageShell'
import { PageHero } from '../components/ui/PageHero'
import { AppButton } from '../components/ui/AppButton'
import { CourseImageCard } from '../components/ui/CourseImageCard'

const courses = [
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
    title: 'The Modern Frontend Architect',
    instructor: 'Herman Wong',
    students: '8/12',
    date: 'Nov 1',
    location: 'Online',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
    title: 'Full Stack Fast Track',
    instructor: 'Vikram Singh',
    students: 'Open',
    date: 'Instant',
    location: 'Online',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',
    title: 'UX Design Masterclass',
    instructor: 'Sarah Chen',
    students: '6/10',
    date: 'Oct 20',
    location: 'HCMC',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80',
    title: 'DevOps for Builders',
    instructor: 'Marcus Ray',
    students: 'Open',
    date: 'Instant',
    location: 'Online',
    status: 'completed' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1487958449943-27c9487ce95a?w=500&q=80',
    title: 'Neo-Brutalism for Web',
    instructor: 'Sarah Chen',
    students: '240+',
    date: '24 Lessons',
    location: '6 hrs',
    status: 'ongoing' as const,
  },
  {
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80',
    title: 'Growth Marketing 101',
    instructor: 'Elena Voss',
    students: '200+',
    date: '14 Lessons',
    location: '7 hrs',
    status: 'ongoing' as const,
  },
]

export function CoursesPage() {
  return (
    <PageShell>
      <PageHero
        badge="Courses"
        title="Web Development & beyond"
        description="Cohort-based and self-paced tracks with mentors, projects, and certificates."
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'Development', 'Design', 'Business', 'Live'].map((f, i) => (
            <button
              key={f}
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0
                  ? 'bg-educture-orange text-white shadow-[0_4px_14px_rgba(243,112,33,0.35)]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-educture-orange hover:text-educture-orange'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {courses.map((c) => (
            <CourseImageCard key={c.title} compact {...c} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <AppButton to="/pricing" variant="outline">View pricing plans</AppButton>
        </div>
      </section>
    </PageShell>
  )
}
