import { Link } from 'react-router-dom'
import { Play, ArrowUpRight, Laptop } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter, ContactSection } from '../components/marketing/MarketingSections'
import { PricingCards } from '../components/marketing/PricingCards'
import { useMentorContent } from '../context/MentorContentContext'
import { MentorEnrollSection } from '../components/marketing/MentorEnrollSection'
import { TestimonialsMarquee } from '../components/marketing/TestimonialsMarquee'
import {
  aboutPlatformBullets,
  whyWeStartedBullets,
  homeStoryPreviewCount,
} from '../data/aboutStory'
import { homeShowcaseClasses } from '../data/homeShowcaseClasses'
import { useLandingGsap } from '../hooks/useLandingGsap'

const workPastels = ['bg-sky-50', 'bg-[#fff4eb]', 'bg-violet-50']

export function HomePage() {
  useLandingGsap()
  const { publishedClasses } = useMentorContent()
  const livePreview = publishedClasses.slice(0, 3).map((c) => ({
    id: c.id,
    title: c.title,
    categoryId: c.categoryId,
    image: c.image,
  }))
  const work =
    livePreview.length >= 3
      ? livePreview
      : [...livePreview, ...homeShowcaseClasses].slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="text-left order-2 lg:order-1">
                <p className="gsap-hero-in text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
                  Online learning platform
                </p>
                <h1 className="gsap-hero-in font-display text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] text-[#1a1a1a] leading-[1.08]">
                  Designing learning
                  <br />
                  <span className="font-script text-educture-orange text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-none block mt-1">
                    That Shine
                  </span>
                </h1>
                <p className="gsap-hero-in text-gray-600 text-sm sm:text-[15px] leading-relaxed mt-5 max-w-md">
                  Mentor classes on Google Meet, free courses, and assignments — built for careers, not just
                  certificates.
                </p>
                <div className="gsap-hero-in flex flex-wrap items-center gap-4 mt-8">
                  <Link
                    to="/#work"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-educture-orange text-white font-semibold text-sm shadow-[0_12px_32px_rgba(243,112,33,0.45)]"
                  >
                    View my work
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-[3px] border-gray-300 text-sm font-semibold text-gray-800 bg-white hover:border-educture-orange hover:text-educture-orange transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch intro
                  </Link>
                </div>
                <div className="gsap-hero-in mt-10 flex items-start gap-3 max-w-xs">
                  <svg className="w-10 h-10 text-educture-orange shrink-0 -rotate-12" viewBox="0 0 40 40" fill="none">
                    <path d="M8 32 C 20 8, 28 8, 36 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="font-script text-xl text-educture-orange leading-snug">
                    Let&apos;s build something amazing together!
                  </p>
                </div>
              </div>

              <div className="gsap-hero-img relative order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[480px] lg:max-w-[520px]">
                  <div
                    className="absolute -z-10 inset-3 sm:inset-4 rounded-[2.5rem] border-[3px] border-dashed border-educture-orange/35 rotate-2"
                    aria-hidden
                  />

                  <div className="grid grid-cols-12 gap-3 sm:gap-4">
                    <div className="col-span-7 row-span-2 relative">
                      <img
                        src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                        alt="Laptop with code — online learning"
                        className="w-full h-full min-h-[260px] sm:min-h-[320px] rounded-[1.75rem] object-cover border-[3px] border-white shadow-xl aspect-[4/5]"
                      />
                      <div
                        className="absolute -bottom-2 left-2 sm:left-4 z-10 bg-educture-orange text-white rounded-2xl px-3.5 py-2.5 border-[3px] border-white shadow-lg max-w-[10.5rem]"
                      >
                        <p className="font-script text-base sm:text-lg leading-tight">
                          Code, design & learn live
                        </p>
                      </div>
                    </div>

                    <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"
                        alt="Developer working on laptop"
                        className="w-full rounded-[1.5rem] object-cover aspect-[4/3] border-[3px] border-white shadow-lg min-h-[100px]"
                      />
                      <div className="relative rounded-[1.5rem] overflow-hidden border-[3px] border-white shadow-lg min-h-[100px] flex-1">
                        <img
                          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"
                          alt="Laptop on desk"
                          className="w-full h-full object-cover aspect-[4/3] min-h-[88px]"
                        />
                        <div className="absolute inset-0 bg-educture-orange/20" aria-hidden />
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute -bottom-2 -left-1 sm:left-0 z-20 bg-white rounded-2xl border-[3px] border-orange-100 px-4 py-3 shadow-lg flex items-center gap-2"
                  >
                    <Laptop className="w-5 h-5 text-educture-orange" />
                    <p className="text-xs font-bold text-gray-800 leading-snug">
                      Laptop + Google Meet
                      <br />
                      <span className="text-gray-500 font-medium">from anywhere</span>
                    </p>
                  </div>

                  <div
                    className="hidden sm:flex absolute -top-3 right-0 items-center gap-2 bg-white rounded-full border-[3px] border-orange-100 px-3.5 py-2 shadow-md"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
                    <span className="text-[11px] font-semibold text-gray-700">Free courses · Live classes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-[#fdf8f0] gsap-reveal">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <article className="rounded-3xl border-[3px] border-orange-100 bg-white p-5 sm:p-6 shadow-sm card-lift text-left">
                <div className="flex gap-4 items-start">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80"
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl object-cover border-[3px] border-orange-50"
                  />
                  <div className="min-w-0">
                    <p className="text-sky-600 text-[10px] font-bold uppercase tracking-[0.2em]">About Educture</p>
                    <h2 className="font-display text-lg sm:text-xl text-[#1a1a1a] mt-1 leading-snug">
                      Mentors, students & live classes
                    </h2>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                  {aboutPlatformBullets.slice(0, homeStoryPreviewCount).map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-educture-orange" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-educture-orange hover:underline"
                >
                  Full story on About <ArrowUpRight className="w-4 h-4" />
                </Link>
              </article>

              <article
                className="rounded-3xl border-[3px] border-orange-100 bg-gradient-to-br from-[#fff9f3] to-orange-50/80 p-5 sm:p-6 shadow-sm card-lift text-left"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80"
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl object-cover border-[3px] border-white shadow-sm"
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-lg sm:text-xl text-[#1a1a1a] leading-tight">
                      Why we started
                      <span className="font-script text-educture-orange text-xl sm:text-2xl block">this platform</span>
                    </h2>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                  {whyWeStartedBullets.slice(0, homeStoryPreviewCount).map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-educture-orange hover:underline"
                >
                  Read all points on About <ArrowUpRight className="w-4 h-4" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section id="work" className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 text-left lg:sticky lg:top-28 gsap-reveal">
              <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] leading-snug">
                A few recent favorites
              </h2>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Image-based class cards — what students see after signup.
              </p>
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-full border-[3px] border-gray-300 text-sm font-semibold hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                See all projects
              </Link>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
              {work.map((c, i) => (
                <article
                  key={c.id}
                  className={`gsap-card-in group rounded-3xl border-[3px] border-orange-100 overflow-hidden ${workPastels[i]} card-lift hover:border-educture-orange transition-colors`}
                >
                  <div className="p-3 pb-0">
                    <img
                      src={c.image}
                      alt=""
                      className="w-full h-36 object-cover rounded-2xl border-[3px] border-white shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 pt-3 relative">
                    <p className="font-bold text-[#1a1a1a] text-sm leading-snug">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{c.categoryId} class</p>
                    <Link
                      to="/sign-in"
                      className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-educture-orange text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-sky-100/80 gsap-reveal">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Services</p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#1a1a1a] mt-2">
                Services &{' '}
                <span className="font-script text-educture-orange text-3xl sm:text-4xl">pricing</span>
              </h2>
              <p className="text-sm text-gray-600 mt-3">Skills · Professional · Academic — trial, monthly & 3-month</p>
            </div>
            <PricingCards />
            <p className="text-center mt-10">
              <Link to="/pricing" className="text-sm font-semibold text-educture-orange hover:underline">
                Full pricing page →
              </Link>
            </p>
          </div>
        </section>

        <MentorEnrollSection />

        <TestimonialsMarquee />

        <ContactSection />
      </main>

      <MarketingFooter />
    </div>
  )
}
