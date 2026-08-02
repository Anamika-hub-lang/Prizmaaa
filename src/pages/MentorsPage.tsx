import { BadgeCheck, Star } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { PageHero } from '../components/ui/PageHero'
import { AppButton } from '../components/ui/AppButton'
import { Reveal } from '../components/ui/Reveal'

const mentors = [
  {
    name: 'Herman Wong',
    title: 'Senior UX Lead',
    company: 'Previously at Airbnb',
    rating: 4.9,
    students: '2.4k',
    courses: 8,
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80',
    tags: ['UX Design', 'Figma', 'Research'],
  },
  {
    name: 'Sarah Chen',
    title: 'Staff Frontend Engineer',
    company: 'Ex-Stripe',
    rating: 4.8,
    students: '3.1k',
    courses: 6,
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
    tags: ['React', 'Design Systems', 'A11y'],
  },
  {
    name: 'Vikram Singh',
    title: 'Solutions Architect',
    company: '15+ yrs in SaaS',
    rating: 5.0,
    students: '1.8k',
    courses: 5,
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
    tags: ['Architecture', 'Node.js', 'Cloud'],
  },
  {
    name: 'Elena Voss',
    title: 'Brand & Marketing',
    company: 'Growth advisor',
    rating: 4.7,
    students: '2.0k',
    courses: 4,
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80',
    tags: ['Marketing', 'Copy', 'SEO'],
  },
  {
    name: 'Marcus Ray',
    title: 'DevOps Engineer',
    company: 'Kubernetes CNCF',
    rating: 4.9,
    students: '1.2k',
    courses: 3,
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80',
    tags: ['DevOps', 'CI/CD', 'AWS'],
  },
  {
    name: 'Dr. Priya N.',
    title: 'Data Science',
    company: 'PhD, ML research',
    rating: 4.8,
    students: '980',
    courses: 4,
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80',
    tags: ['Python', 'ML', 'Analytics'],
  },
]

export function MentorsPage() {
  return (
    <PageShell>
      <PageHero
        badge="Mentors"
        title="Learn from people who've done the work"
        description="Every Educture mentor is vetted for industry experience and teaching quality. Browse profiles and find your guide."
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.05}>
              <article className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden card-lift text-left">
                <div className="relative">
                  <img src={m.img} alt="" className="w-full h-44 object-cover" />
                  <span className="absolute top-3 right-3 bg-white/95 rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-educture-orange fill-educture-orange" />
                    {m.rating}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#1d1d1d]">{m.name}</h3>
                    <BadgeCheck className="w-4 h-4 text-educture-orange" />
                  </div>
                  <p className="text-sm text-educture-orange font-medium">{m.title}</p>
                  <p className="text-xs text-gray-400 mb-3">{m.company}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {m.students} students · {m.courses} courses
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-educture-cream px-2 py-0.5 rounded-full text-gray-600">
                        {t}
                      </span>
                    ))}
                  </div>
                  <AppButton to="/courses" size="sm" className="w-full mt-4">
                    View classes
                  </AppButton>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
