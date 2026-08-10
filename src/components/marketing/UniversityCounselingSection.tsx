import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Bell,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ComingSoonToast, useComingSoonToast } from './university-counseling/ComingSoonToast'
import { CounselingUniversityCard } from './CounselingUniversityCard'
import { Badge, Card, CounselingButton } from './university-counseling/ui'
import {
  demoCounselors,
  featuredUniversities,
  howItWorksSteps,
} from './university-counseling/data'

export function UniversityCounselingSection() {
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const { visible, showToast, message } = useComingSoonToast()

  const filteredUniversities = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return featuredUniversities
    return featuredUniversities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q),
    )
  }, [search])

  function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    showToast()
    setEmail('')
  }

  return (
    <>
      <section
        id="university-counseling"
        className="relative overflow-hidden bg-gradient-to-b from-white via-[#fffbf7] to-sky-50/40 py-16 sm:py-20 lg:py-24 gsap-reveal"
      >
        <div
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-educture-orange/8 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl"
          aria-hidden
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <Badge variant="sky" className="mb-4">
              <Sparkles className="w-3 h-3" />
              Personalized guidance
            </Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] text-[#1a1a1a] leading-tight">
              Confused about your{' '}
              <span className="font-script text-educture-orange text-4xl sm:text-5xl">University</span>{' '}
              choice?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed">
              Get 1:1 guidance from verified university counselors — is this college right for you,
              which course to pick, and what career path makes sense.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <CounselingButton onClick={showToast} className="opacity-80">
                Get Counseling
                <Badge variant="gray" className="ml-1 normal-case tracking-normal font-semibold">
                  Soon
                </Badge>
              </CounselingButton>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5 text-educture-orange" />
                1,000+ students helped
              </span>
            </div>
          </motion.div>

          {/* University search + cards */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="mt-14 sm:mt-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  Popular universities
                </p>
                <h3 className="font-display text-xl sm:text-2xl text-[#1a1a1a] mt-1">
                  Search your university
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your university..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-100 bg-white text-sm outline-none focus:border-educture-orange shadow-sm"
                  />
                </div>
                <Link
                  to="/university-counseling"
                  className="shrink-0 text-center text-sm font-semibold text-violet-700 hover:text-violet-900"
                >
                  View all →
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredUniversities.map((uni) => (
                <CounselingUniversityCard key={uni.id} university={uni} />
              ))}
            </div>

            {filteredUniversities.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">
                No match found — try another name.{' '}
                <button type="button" onClick={showToast} className="text-educture-orange font-semibold">
                  Request your university
                </button>
              </p>
            )}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-16 sm:mt-20"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 text-center">
              How it works
            </p>
            <h3 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] text-center mt-2">
              Three simple steps
            </h3>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mt-8">
              {howItWorksSteps.map((item, i) => (
                <Card
                  key={item.step}
                  onClick={showToast}
                  className="p-5 sm:p-6 text-left bg-white/80 backdrop-blur-sm"
                >
                  <span className="text-3xl font-bold text-educture-orange/20">{item.step}</span>
                  <h4 className="font-display text-lg text-[#1a1a1a] mt-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.description}</p>
                  {i < howItWorksSteps.length - 1 && (
                    <span className="hidden md:block absolute -right-2 top-1/2 text-orange-200 text-2xl" aria-hidden>
                      →
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Counselor preview */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="mt-16 sm:mt-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  Meet counselors
                </p>
                <h3 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] mt-1">
                  Verified experts, launching soon
                </h3>
              </div>
              <Badge variant="emerald">
                <BadgeCheck className="w-3 h-3" />
                Verified Counselor
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoCounselors.map((counselor) => (
                <Card
                  key={counselor.id}
                  as="button"
                  onClick={showToast}
                  className="relative overflow-hidden p-0 group"
                >
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge variant="orange">Coming Soon</Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-[5]">
                    <Badge variant="gray" className="bg-white/90 backdrop-blur-sm">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="p-5 flex gap-4 items-center">
                    <img
                      src={counselor.image}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-50 shrink-0"
                      loading="lazy"
                    />
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm text-[#1a1a1a] leading-snug">{counselor.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{counselor.university}</p>
                      <p className="text-xs text-educture-orange font-medium mt-1.5">
                        {counselor.experience} experience
                      </p>
                      <Badge variant="emerald" className="mt-2">
                        <GraduationCap className="w-3 h-3" />
                        Verified Counselor
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Coming soon banner */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="mt-16 sm:mt-20"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1a1a1a] via-[#1f1a18] to-[#2a1810] text-white p-8 sm:p-12 text-center shadow-xl">
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-educture-orange/25 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10 max-w-lg mx-auto">
                <Bell className="w-8 h-8 text-educture-orange mx-auto mb-4" />
                <h3 className="font-display text-2xl sm:text-3xl leading-tight">
                  We are onboarding top counselors.
                </h3>
                <p className="text-orange-100/80 text-sm sm:text-base mt-3 leading-relaxed">
                  Launching soon — get notified when personalized university counseling goes live on
                  PRIZMA.
                </p>
                <form
                  onSubmit={(e) => void handleNotify(e)}
                  className="flex flex-col sm:flex-row gap-2.5 mt-8 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-full border border-white/10 bg-white/10 text-sm text-white placeholder:text-gray-400 outline-none focus:border-educture-orange/50"
                  />
                  <CounselingButton type="submit" variant="primary" size="md">
                    Notify Me
                  </CounselingButton>
                </form>
                <p className="text-[11px] text-gray-500 mt-4">
                  No spam. UI preview only — we&apos;ll email you when we launch.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <ComingSoonToast visible={visible} message={message} />
    </>
  )
}
