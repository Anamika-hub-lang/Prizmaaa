import { Link } from 'react-router-dom'
import { ArrowRight, IndianRupee, Sparkles, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const mentorBenefits = [
  {
    icon: Users,
    iconBg: 'bg-educture-orange/10',
    iconColor: 'text-educture-orange',
    title: 'Build your own student base',
    description:
      'Every class you teach adds learners to your circle. Grow a community that knows you, trusts you, and keeps coming back.',
  },
  {
    icon: IndianRupee,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Get paid for teaching',
    description:
      'Earn from the students you mentor. Your live sessions and guidance turn into real income on PRIZMA.',
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    title: 'Grow as an educator',
    description:
      'Your own mentor dashboard — classes, Google Meet links, resources, and student progress in one place.',
  },
] as const

export function MentorEnrollSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#fff4eb] via-white to-sky-50 gsap-reveal overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.25em] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Guide on PRIZMA
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] mt-3 leading-tight">
              Become a{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">mentor</span>
            </h2>
            <p className="text-sm text-gray-600 mt-4 max-w-md leading-relaxed">
              Teach what you know, build your audience, and get paid — all on one platform built for
              student growth. Apply once admin has approved your email.
            </p>
            <ul className="mt-6 space-y-4">
              {mentorBenefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <li key={benefit.title} className="flex items-start gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl ${benefit.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon className={`w-4 h-4 ${benefit.iconColor}`} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{benefit.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{benefit.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/become-mentor"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.4)] hover:bg-educture-orange-dark transition-colors"
              >
                Apply as mentor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-[3px] border-orange-100 text-sm font-semibold text-gray-800 hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                Already have access? Join
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-[0_24px_60px_rgba(243,112,33,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt=""
                className="w-full rounded-2xl object-cover aspect-[4/3] mb-6"
              />
              <p className="text-xs font-bold uppercase tracking-widest text-educture-orange">Why mentors join</p>
              <p className="font-bold text-lg text-[#1a1a1a] mt-2">Your students. Your sessions. Your earnings.</p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Host live classes, share free resources, and watch your learner base grow — while PRIZMA
                handles the platform side.
              </p>
            </div>
            <div
              className="absolute -z-10 -top-8 -right-8 w-40 h-40 rounded-full bg-educture-orange/20 blur-3xl"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
