import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, IndianRupee, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { INTERVIEW_PREP_TOPIC_ID, careerOfferings } from '../../data/counsellingServices'

const offering = careerOfferings.find((item) => item.id === INTERVIEW_PREP_TOPIC_ID)

export function InterviewPrepSection() {
  if (!offering) return null

  return (
    <section
      id="interview-prep"
      className="relative overflow-hidden bg-gradient-to-br from-[#fff9f3] via-white to-orange-50/50 py-12 sm:py-16 lg:py-20 gsap-reveal"
    >
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-educture-orange/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live on Meet
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] leading-[1.1] mt-4">
              Mock{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">interviews</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed max-w-md">
              {offering.description}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-educture-orange/40 bg-educture-orange/10 px-4 py-2.5">
                <IndianRupee className="h-5 w-5 text-educture-orange shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a] leading-none">
                    ₹{offering.priceInr}
                  </p>
                  <p className="text-[11px] text-orange-700/80 mt-0.5">{offering.durationLabel}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 border border-orange-100 text-xs text-gray-600">
                <Video className="h-3.5 w-3.5 text-educture-orange" /> Google Meet
              </span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {offering.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-educture-orange shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to={offering.link ?? '/counselling/interview-prep'}
              className="inline-flex items-center gap-2 mt-6 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_40px_rgba(243,112,33,0.35)] hover:bg-educture-orange-dark transition-colors"
            >
              Book mock interview
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-6"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-white shadow-xl min-h-[280px] sm:min-h-[340px]">
              <img
                src={offering.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="relative z-10 flex h-full min-h-[280px] sm:min-h-[340px] flex-col justify-end p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-200">
                  {offering.tagline}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl text-white mt-1 leading-tight">
                  {offering.title}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
