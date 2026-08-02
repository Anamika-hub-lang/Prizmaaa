import { Target, Users, Award, ArrowUpRight, Video, IndianRupee, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { ContactSection } from '../components/marketing/MarketingSections'
import { useLandingGsap } from '../hooks/useLandingGsap'
import {
  aboutPlatformBullets,
  whyWeStartedBullets,
} from '../data/aboutStory'

const heroStats = [
  { icon: Video, label: 'Live on Google Meet' },
  { icon: IndianRupee, label: 'Monthly & 3-month plans' },
  { icon: GraduationCap, label: 'Student & mentor portals' },
]

const values = [
  {
    icon: Target,
    title: 'Career-first curriculum',
    text: 'Modules map to skills employers ask for — portfolios, not just certificates.',
  },
  {
    icon: Users,
    title: 'Human mentors',
    text: 'Live Google Meet feedback from practitioners who ship products daily.',
  },
  {
    icon: Award,
    title: 'Verified outcomes',
    text: 'Assignments, certificates, and mentor references you can show proudly.',
  },
]

const team = [
  {
    name: 'Vikram Singh',
    role: 'Lead mentor · Engineering',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Elena Voss',
    role: 'Head of design education',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  },
  {
    name: 'Marcus Ray',
    role: 'Student success',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
]

export function AboutPage() {
  useLandingGsap()

  return (
    <PageShell className="bg-white">
      <section className="relative overflow-hidden maya-hero-bg geo-pattern">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-educture-orange/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-[-10%] h-64 w-64 rounded-full bg-sky-300/25 blur-3xl"
          aria-hidden
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-8 lg:pt-10 lg:pb-20 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-5 text-left">
              <p className="gsap-hero-in inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border-[3px] border-orange-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700 mb-5">
                About Educture
              </p>
              <h1 className="gsap-hero-in font-display text-[2rem] sm:text-[2.65rem] lg:text-[3rem] text-[#1a1a1a] leading-[1.1]">
                We built a bridge between{' '}
                <span className="font-script text-educture-orange text-[2.5rem] sm:text-[3.25rem] lg:text-[3.5rem] leading-none">
                  mentors
                </span>
                <span className="block mt-1">and ambitious students.</span>
              </h1>
              <p className="gsap-hero-in text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-5 max-w-md">
                One platform for live classes, mentors, and students — full story in the sections below.
              </p>

              <ul className="gsap-hero-in mt-7 flex flex-col gap-2.5">
                {heroStats.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm rounded-2xl border-[3px] border-orange-50 px-4 py-2.5 shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4eb] border-2 border-orange-100">
                      <Icon className="w-4 h-4 text-educture-orange" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <div className="gsap-hero-in flex flex-wrap items-center gap-3 mt-8">
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.45)] btn-lift"
                >
                  Join Educture
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[3px] border-gray-300/80 bg-white text-sm font-semibold text-gray-800 hover:border-educture-orange hover:text-educture-orange transition-colors"
                >
                  See pricing
                </Link>
              </div>

              <p className="gsap-hero-in mt-8 font-script text-xl sm:text-2xl text-educture-orange max-w-xs leading-snug">
                Real humans. Real classes. No passive video dumps.
              </p>
            </div>

            <div className="lg:col-span-7 gsap-hero-img">
              <div className="relative max-w-xl mx-auto lg:max-w-none lg:ml-auto">
                <div
                  className="absolute -z-10 inset-4 rounded-[2.5rem] border-[3px] border-dashed border-educture-orange/35 rotate-2"
                  aria-hidden
                />

                <div className="grid grid-cols-12 gap-3 sm:gap-4">
                  <div className="col-span-7 row-span-2 relative">
                    <img
                      src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
                      alt="Students learning together"
                      className="w-full h-full min-h-[280px] sm:min-h-[340px] rounded-[1.75rem] object-cover border-[3px] border-white shadow-xl aspect-[4/5]"
                    />
                    <div
                      className="absolute -bottom-3 -left-2 sm:left-4 z-10 bg-educture-orange text-white rounded-2xl px-4 py-3 border-[3px] border-white shadow-lg max-w-[11rem]"
                    >
                      <p className="font-script text-lg leading-tight">Let&apos;s create something amazing!</p>
                    </div>
                  </div>

                  <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=500&q=80"
                      alt="Mentor teaching"
                      className="w-full rounded-[1.5rem] object-cover aspect-[4/3] border-[3px] border-white shadow-lg h-full min-h-[120px]"
                    />
                    <div className="maya-card p-4 sm:p-5 flex flex-col gap-2 card-lift border-sky-200/80">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-sky-100 border-2 border-sky-200 flex items-center justify-center">
                          <Users className="w-5 h-5 text-sky-600" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Community</p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a] leading-snug">
                        Students learn live; mentors ship content students actually see.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="hidden sm:flex absolute -top-4 right-2 lg:right-6 items-center gap-2 bg-white rounded-full border-[3px] border-orange-100 px-4 py-2 shadow-md"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-educture-orange animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">Live classes · Assignments · Free library</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 sm:h-14 bg-white" style={{ clipPath: 'ellipse(120% 100% at 50% 100%)' }} aria-hidden />
      </section>

      <section className="py-16 lg:py-20 bg-[#fdf8f0] gsap-reveal">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
            <article className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 shadow-sm card-lift">
              <div className="grid sm:grid-cols-5 gap-6 items-start">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                  alt="Students collaborating"
                  className="sm:col-span-2 w-full rounded-2xl border-[3px] border-orange-50 object-cover aspect-[4/3]"
                />
                <div className="sm:col-span-3 text-left">
                  <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.2em]">About Educture</p>
                  <h2 className="font-display text-xl sm:text-2xl text-[#1a1a1a] mt-2 leading-snug">
                    Mentors, students & live classes in one place
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm text-gray-600 leading-relaxed">
                    {aboutPlatformBullets.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-educture-orange"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article
              className="rounded-3xl border-[3px] border-orange-100 bg-gradient-to-br from-[#fff9f3] to-orange-50 p-6 sm:p-8 shadow-sm card-lift overflow-hidden"
            >
              <div className="grid sm:grid-cols-5 gap-6 items-start">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80"
                  alt="Library learning"
                  className="sm:col-span-2 w-full rounded-2xl border-[3px] border-white object-cover aspect-video shadow-md"
                />
                <div className="sm:col-span-3 text-left">
                  <h2 className="font-display text-xl sm:text-2xl text-[#1a1a1a] leading-tight">
                    Why we started
                    <span className="font-script text-educture-orange text-2xl sm:text-3xl block mt-1">
                      this platform
                    </span>
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm text-gray-600 leading-relaxed">
                    {whyWeStartedBullets.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl text-center text-[#1a1a1a] mb-10">Our process</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-3xl border-[3px] border-orange-100 bg-white p-6 sm:p-8 text-left h-full card-lift shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border-[3px] border-sky-200 flex items-center justify-center mb-5">
                <v.icon className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-[#fdf8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-left">
          <h2 className="font-display text-2xl text-[#1a1a1a] mb-10">Meet the mentors</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((person) => (
              <div
                key={person.name}
                className="bg-white rounded-3xl border-[3px] border-orange-100 overflow-hidden card-lift shadow-sm"
              >
                <img src={person.img} alt="" className="w-full h-52 object-cover border-b-[3px] border-orange-50" />
                <div className="p-5">
                  <p className="font-bold text-[#1a1a1a]">{person.name}</p>
                  <p className="text-sm text-educture-orange font-medium mt-1">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection id="contact" />
    </PageShell>
  )
}
