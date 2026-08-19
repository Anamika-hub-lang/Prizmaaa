import { ArrowRight, Bell, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ComingSoonToast, useComingSoonToast } from './university-counseling/ComingSoonToast'
import { careerOfferings } from '../../data/counsellingServices'

const offering = careerOfferings.find((item) => item.id === 'internship-opportunities')

export function InternshipSection() {
  const { visible, showToast, message } = useComingSoonToast()

  if (!offering) return null

  return (
    <section
      id="internships"
      className="relative overflow-hidden bg-[#0f0f12] text-white py-12 sm:py-16 lg:py-20 gsap-reveal"
    >
      <div
        className="pointer-events-none absolute -top-28 left-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-educture-orange/15 blur-3xl"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-white/10 min-h-[280px] sm:min-h-[340px]">
              <img
                src={offering.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <div className="relative z-10 flex h-full min-h-[280px] sm:min-h-[340px] flex-col justify-end p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
                  {offering.tagline}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl text-white mt-1 leading-tight">
                  {offering.title}
                </h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-6 text-left order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
              <Bell className="h-3 w-3" />
              Coming soon
            </span>
            <h2 className="font-display text-3xl sm:text-4xl leading-[1.1] mt-4">
              Internship{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">opportunities</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed max-w-md">
              {offering.description}
            </p>

            <ul className="mt-5 space-y-2.5">
              {offering.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={showToast}
              className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full border-2 border-violet-400/50 bg-violet-500/15 text-white font-semibold text-sm hover:border-violet-300 hover:bg-violet-500/25 transition-colors"
            >
              Notify me when live
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
      <ComingSoonToast visible={visible} message={message} />
    </section>
  )
}
