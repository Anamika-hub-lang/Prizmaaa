import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { HeroSection } from '../components/marketing/HeroSection'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter, ContactSection } from '../components/marketing/MarketingSections'
import { PricingCards } from '../components/marketing/PricingCards'
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
import { COUNSELLING_DURATION_LABEL, COUNSELLING_PRICE_INR } from '../data/counsellingServices'
import { pricingEcosystemIntro } from '../data/aboutStory'
import { enabledAiFeatures } from '../data/aiFeatures'

const showAiHero = enabledAiFeatures.length > 0

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
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <MainNavbar />

      <main className="flex-1 overflow-x-hidden w-full">
        <HeroSection />

        <CounsellingSection />

        <InterviewPrepSection />

        <InternshipSection />

        {showAiHero && <AiToolsSection />}

        <UniversityReviewsSection />

        <UniversityCounselingSection />

        <PrizmaEcosystemSection variant="home" />

        <section id="work" className="py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 text-left lg:sticky lg:top-28 gsap-reveal">
              <h2 className="font-display text-2xl sm:text-3xl text-[#1a1a1a] leading-snug">
                Sessions students are joining
              </h2>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Peer learning circles and collaborative projects — what you see once you are in.
              </p>
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-full border-[3px] border-gray-300 text-sm font-semibold hover:border-educture-orange hover:text-educture-orange transition-colors"
              >
                See all sessions
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
                    <p className="text-xs text-gray-500 mt-1 capitalize">{c.categoryId} circle</p>
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
              <p className="text-sky-600 text-[11px] font-bold uppercase tracking-[0.25em]">Inside PRIZMA</p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#1a1a1a] mt-2">
                Sessions, guidance &{' '}
                <span className="font-script text-educture-orange text-3xl sm:text-4xl">plans</span>
              </h2>
              <p className="text-sm text-gray-600 mt-3 max-w-2xl mx-auto leading-relaxed">
                {pricingEcosystemIntro}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <Link
                  to="/ai"
                  className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-800 hover:border-indigo-400"
                >
                  AI resume & matcher — free
                </Link>
                <Link
                  to="/counselling"
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-educture-orange"
                >
                  Guidance — ₹{COUNSELLING_PRICE_INR}/{COUNSELLING_DURATION_LABEL}
                </Link>
                <Link
                  to="/universities"
                  className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-sky-400"
                >
                  Campus stories — free
                </Link>
              </div>
            </div>
            <PricingCards />
            <p className="text-center mt-10">
              <Link to="/pricing" className="text-sm font-semibold text-educture-orange hover:underline">
                See all plans →
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
