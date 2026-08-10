import { Check, Clock, Users } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { AppButton } from '../components/ui/AppButton'
import { Reveal } from '../components/ui/Reveal'

const includes = [
  '24 weeks mentor-led cohort',
  '12+ portfolio projects',
  'Job readiness reviews',
  'Private community & office hours',
  'Verified certificate',
]

export function CourseDetailPage() {
  return (
    <PageShell>
      <section className="bg-[#fff9f3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-start">
          <div className="text-left">
            <span className="text-educture-orange font-bold text-xs uppercase tracking-widest">Featured cohort</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1d] mt-3 mb-4">
              Full Stack Web Development
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              From React and Node to deployment and system design — ship weekly with mentor code reviews and a hiring-focused portfolio.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-educture-orange" /> 24 weeks</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-educture-orange" /> Live cohort</span>
            </div>
            <ul className="space-y-3 mb-8">
              {includes.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-educture-orange flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 lg:sticky lg:top-24">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                alt=""
                className="w-full rounded-xl object-cover aspect-video mb-6"
              />
              <p className="text-3xl font-bold text-[#1d1d1d]">
                ₹999<span className="text-base font-normal text-gray-500">/month</span>
              </p>
              <p className="text-xs text-educture-orange font-semibold mt-1">No-cost EMI available</p>
              <AppButton to="/sign-in" className="w-full justify-center mt-6" size="lg">
                Enroll now
              </AppButton>
              <AppButton to="/mentors" variant="outline" className="w-full justify-center mt-3">
                Meet your mentor
              </AppButton>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 text-left">
        <h2 className="text-2xl font-bold mb-6">Curriculum highlights</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {['Frontend foundations', 'React ecosystem', 'Backend mastery'].map((m, i) => (
            <div key={m} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <span className="text-educture-orange font-bold text-sm">0{i + 1}</span>
              <p className="font-bold mt-2">{m}</p>
              <p className="text-xs text-gray-500 mt-2">Live labs + async projects each week.</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
