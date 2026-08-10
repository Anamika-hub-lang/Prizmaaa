import { Calendar, Video } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { PageHero } from '../components/ui/PageHero'
import { AppButton } from '../components/ui/AppButton'
import { Reveal } from '../components/ui/Reveal'

const workshops = [
  {
    title: 'Mastering UI Systems in React',
    mentor: 'Sarah Chen',
    date: 'Oct 28, 7:00 PM IST',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    live: true,
  },
  {
    title: 'Portfolio reviews — UX cohort',
    mentor: 'Herman Wong',
    date: 'Nov 2, 6:00 PM IST',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    live: false,
  },
  {
    title: 'Cloud deploy clinic',
    mentor: 'Marcus Ray',
    date: 'Nov 5, 8:00 PM IST',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    live: false,
  },
]

export function LiveWorkshopPage() {
  return (
    <PageShell>
      <PageHero
        badge="Live"
        title="Workshops & virtual classrooms"
        description="Join live sessions with mentors — ask questions, share screens, and learn in real time."
        image="https://images.unsplash.com/photo-1571260899304-6eee352504a?w=900&q=80"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {workshops.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <article className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden card-lift text-left">
                <div className="relative">
                  <img src={w.img} alt="" className="w-full h-40 object-cover" />
                  {w.live && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE SOON
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#1d1d1d] leading-snug">{w.title}</h3>
                  <p className="text-sm text-educture-orange mt-1">{w.mentor}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {w.date}
                  </p>
                  <AppButton to="/sign-in" size="sm" className="w-full mt-4 justify-center">
                    <Video className="w-4 h-4" /> Join session
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
