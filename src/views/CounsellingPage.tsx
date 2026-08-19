import { Link } from 'react-router-dom'

import { ArrowLeft, IndianRupee } from 'lucide-react'

import { MainNavbar } from '../components/layout/MainNavbar'

import { MarketingFooter } from '../components/marketing/MarketingSections'

import { CounsellingGroupCard } from '../components/marketing/CounsellingGroupCard'

import { CounsellingIncludesGrid } from '../components/marketing/CounsellingIncludesGrid'

import { CareerOfferingCard } from '../components/marketing/CareerOfferingCard'

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

                  Peer & mentor guidance

                </p>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mt-1 leading-tight">

                  Choose your{' '}

                  <span className="font-script text-educture-orange text-3xl sm:text-4xl">topic</span>

                </h1>

                <p className="text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">

                  Career, skills, or what comes next — pick a category, then book a guidance call with someone who gets it.

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

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">

              Guidance topics

            </p>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">

              {counsellingGroups.map((group) => (

                <CounsellingGroupCard key={group.id} group={group} />

              ))}

            </div>

            <p className="text-xs text-gray-500 text-center sm:text-left mt-4">

              Tap a topic to see call types and book on the next page.

            </p>

          </div>

        </section>



        {mockInterviewOffering && (

          <section className="py-8 sm:py-10 border-b border-white/10">

            <div className="max-w-6xl mx-auto px-4 sm:px-6">

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">

                Mock interviews

              </p>

              <CareerOfferingCard offering={mockInterviewOffering} />

            </div>

          </section>

        )}



        <section className="bg-white py-8 sm:py-10">

          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <CounsellingIncludesGrid variant="light" />

          </div>

        </section>

      </main>



      <MarketingFooter />

    </div>

  )

}


