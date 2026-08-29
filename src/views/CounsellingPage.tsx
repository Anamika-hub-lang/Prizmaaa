'use client'

import { Link } from 'react-router-dom'
import { ArrowLeft, IndianRupee } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { CounsellingGroupCard } from '../components/marketing/CounsellingGroupCard'
import { CounsellingIncludesGrid } from '../components/marketing/CounsellingIncludesGrid'
import { CareerOfferingCard } from '../components/marketing/CareerOfferingCard'
import { FaqSection } from '../components/seo/FaqSection'
import { counsellingFaqs } from '../data/seoFaqs'
import {
  COUNSELLING_DURATION_LABEL,
  COUNSELLING_PRICE_INR,
  INTERVIEW_PREP_TOPIC_ID,
  careerOfferings,
  counsellingGroups,
} from '../data/counsellingServices'

const mockInterviewOffering = careerOfferings.find((item) => item.id === INTERVIEW_PREP_TOPIC_ID)

export function CounsellingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f12]">
      <MainNavbar />

      <main className="flex-1">
        <section className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-5">
              <div>
                <p className="text-educture-orange font-bold text-xs uppercase tracking-[0.2em]">
                  Online career counselling
                </p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mt-1 leading-tight">
                  Online career counselling{' '}
                  <span className="font-script text-educture-orange text-3xl sm:text-4xl">for students</span>
                </h1>
                <p className="text-sm text-gray-400 mt-3 max-w-xl leading-relaxed">
                  PRIZMA career counselling and career guidance is a live 1-on-1 call — not a chatbot.
                  Talk through jobs, course selection, college guidance, or what to do after 10th and 12th,
                  then leave with a practical plan. ₹{COUNSELLING_PRICE_INR} per call on Google Meet or phone.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-educture-orange/40 bg-educture-orange/10 px-4 py-2.5 shrink-0">
                <IndianRupee className="w-5 h-5 text-educture-orange" />
                <span className="text-xl font-bold text-white">₹{COUNSELLING_PRICE_INR}</span>
                <span className="text-xs text-gray-400">/ {COUNSELLING_DURATION_LABEL}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-xl sm:text-2xl text-white mb-2">
              Career counselling, skill counselling and after-12th guidance
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-2xl leading-relaxed">
              Pick a topic, then book online career counselling. Unsure which skill to learn first?{' '}
              <Link to="/classes" className="text-educture-orange font-semibold hover:underline">
                Browse live online classes
              </Link>{' '}
              on the same platform.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
              {counsellingGroups.map((group) => (
                <CounsellingGroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        </section>

        {mockInterviewOffering && (
          <section className="py-8 sm:py-10 border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <h2 className="font-display text-xl sm:text-2xl text-white mb-3">Mock interview practice</h2>
              <CareerOfferingCard offering={mockInterviewOffering} />
            </div>
          </section>
        )}

        <section className="bg-white py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <CounsellingIncludesGrid variant="light" />
          </div>
        </section>

        <div className="bg-[#0f0f12]">
          <FaqSection heading="Career counselling FAQs" items={counsellingFaqs} tone="dark" />
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
