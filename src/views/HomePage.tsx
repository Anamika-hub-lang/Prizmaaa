'use client'

import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { HeroSection } from '../components/marketing/HeroSection'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter, ContactSection } from '../components/marketing/MarketingSections'
import { useMentorContent } from '../context/MentorContentContext'
import { MentorEnrollSection } from '../components/marketing/MentorEnrollSection'
import { TestimonialsMarquee } from '../components/marketing/TestimonialsMarquee'
import { homeShowcaseClasses } from '../data/homeShowcaseClasses'
import { CounsellingSection } from '../components/marketing/CounsellingSection'
import { InterviewPrepSection } from '../components/marketing/InterviewPrepSection'
import { InternshipSection } from '../components/marketing/InternshipSection'
import { AiToolsSection } from '../components/marketing/AiToolsSection'
import { UniversityReviewsSection } from '../components/marketing/UniversityReviewsSection'
import { UniversityCounselingSection } from '../components/marketing/UniversityCounselingSection'
import { PrizmaEcosystemSection } from '../components/marketing/PrizmaEcosystemSection'
import { useLandingGsap } from '../hooks/useLandingGsap'
import { enabledAiFeatures } from '../data/aiFeatures'
import { FaqSection } from '../components/seo/FaqSection'
import { SeoCoverImage } from '../components/seo/SeoCoverImage'
import { counsellingFaqs } from '../data/seoFaqs'
import { attachClassSlugs, classPublicPath } from '../lib/classSlug'

const showAiHero = enabledAiFeatures.length > 0

const workPastels = ['bg-sky-50', 'bg-[#fff4eb]', 'bg-violet-50']

export function HomePage() {
  useLandingGsap()
  const { publishedClasses } = useMentorContent()
  const livePreview = attachClassSlugs(publishedClasses).slice(0, 3)
  const work =
    livePreview.length >= 3
      ? livePreview
      : [...livePreview, ...homeShowcaseClasses].slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <MainNavbar />

      <main className="flex-1 overflow-x-hidden w-full">
        <HeroSection />

        <CounsellingSection />

        <section id="work" className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 text-left lg:sticky lg:top-28 gsap-reveal">
              <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] leading-snug">
                Live online classes and courses
              </h2>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Online courses for students on Google Meet — skills, academics, and professional tracks.
                Need help choosing?{' '}
                <Link to="/counselling" className="text-educture-orange font-semibold hover:underline">
                  Book career counselling
                </Link>{' '}
                first.
              </p>
              <Link
                to="/classes"
                className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-full border-[3px] border-gray-300 text-sm font-semibold hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                See all online classes
              </Link>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-3 gap-4">
              {work.map((c, i) => {
                const href = c.id.startsWith('showcase-') ? '/classes' : classPublicPath(c)
                return (
                <article
                  key={c.id}
                  className={`gsap-card-in group rounded-3xl border-[3px] border-orange-100 overflow-hidden ${workPastels[i]} card-lift hover:border-educture-orange transition-colors`}
                >
                  <div className="p-3 pb-0">
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border-[3px] border-white shadow-sm">
                      <SeoCoverImage
                        src={c.image}
                        alt={`${c.title} online class`}
                        sizes="(max-width: 640px) 100vw, 240px"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <div className="p-4 pt-3 relative">
                    <p className="font-bold text-[#1a1a1a] text-sm leading-snug">
                      <Link to={href} className="hover:text-educture-orange">
                        {c.title}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{c.categoryId} circle</p>
                    <Link
                      to={href}
                      className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-educture-orange text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                      aria-label={`View ${c.title}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
                )
              })}
            </div>
          </div>
        </section>

        <MentorEnrollSection />

        <InterviewPrepSection />

        <InternshipSection />

        {showAiHero && <AiToolsSection />}

        <UniversityReviewsSection />

        <UniversityCounselingSection />

        <PrizmaEcosystemSection variant="home" />

        <TestimonialsMarquee />

        <FaqSection heading="Career counselling FAQs" items={counsellingFaqs} />

        <ContactSection />
      </main>

      <MarketingFooter />
    </div>
  )
}
