import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, IndianRupee, Phone, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  COUNSELLING_DURATION_LABEL,
  COUNSELLING_PRICE_INR,
  counsellingGroups,
  counsellingIncludes,
} from '../../data/counsellingServices'
import { CounsellingGroupCard } from './CounsellingGroupCard'

type CounsellingSectionProps = {
  id?: string
}

export function CounsellingSection({ id = 'counselling' }: CounsellingSectionProps) {
  return (
    <section
      id={id}
      className="relative overflow-hidden bg-[#0f0f12] text-white py-12 sm:py-14 lg:py-16 gsap-reveal"
    >
      <div
        className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-educture-orange/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-5 sm:space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-educture-orange/40 bg-educture-orange/10 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-orange-200">
                <span className="h-1.5 w-1.5 rounded-full bg-educture-orange animate-pulse" />
                1-on-1 peer & mentor guidance
              </span>
              <h2 className="font-display text-3xl sm:text-4xl leading-[1.1] mt-4">
                Not sure what&apos;s{' '}
                <span className="font-script text-educture-orange text-4xl sm:text-5xl">next?</span>
              </h2>
              <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                Pick a topic, book a call on the next page. Talk live on Google Meet or phone with people who get it.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-educture-orange/50 bg-educture-orange/15 px-4 py-2.5">
                <IndianRupee className="h-5 w-5 text-educture-orange shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white leading-none">
                    ₹{COUNSELLING_PRICE_INR}
                  </p>
                  <p className="text-[11px] text-orange-200/90 mt-0.5">{COUNSELLING_DURATION_LABEL}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 text-xs text-gray-400">
                <Video className="h-3.5 w-3.5" /> Meet
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 text-xs text-gray-400">
                <Phone className="h-3.5 w-3.5" /> Call
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg sm:text-xl text-white">Every call includes</h3>
              <ul className="mt-3 space-y-2.5">
                {counsellingIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300 leading-snug">
                    <CheckCircle2 className="h-4 w-4 text-educture-orange shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/counselling"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_40px_rgba(243,112,33,0.45)] hover:bg-educture-orange-dark transition-colors"
            >
              Book a guidance call
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-7 flex flex-col"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
              Choose a topic
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 flex-1">
              {counsellingGroups.map((group) => (
                <CounsellingGroupCard key={group.id} group={group} variant="image" size="medium" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
