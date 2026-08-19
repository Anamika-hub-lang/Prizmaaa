import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { ComingSoonToast, useComingSoonToast } from '../components/marketing/university-counseling/ComingSoonToast'
import { Badge, CounselingButton } from '../components/marketing/university-counseling/ui'
import { UniversityImage } from '../components/universities/UniversityImage'
import {
  counselingUniversityById,
  counselorsForUniversity,
  howItWorksSteps,
} from '../components/marketing/university-counseling/data'

export function UniversityCounselingDetailPage() {
  const { universityId = '' } = useParams()
  const university = counselingUniversityById(universityId)
  const { visible, showToast, message } = useComingSoonToast()

  if (!university) {
    return <Navigate to="/university-counseling" replace />
  }

  const counselors = counselorsForUniversity(university.name)

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <MainNavbar />

        <main className="flex-1">
          <section className="relative overflow-hidden bg-[#0f0f12] text-white">
            <UniversityImage
              src={university.image}
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f12] via-[#0f0f12]/92 to-[#0f0f12]/75" />
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-left">
              <Link
                to="/university-counseling"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-educture-orange hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                All campuses
              </Link>
              <Badge variant="gray" className="mt-6 bg-white/10 border-white/20 text-orange-200">
                Coming Soon
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-4 leading-tight max-w-2xl">
                {university.name}
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-educture-orange" />
                {university.location}, {university.state}
              </p>
              <p className="text-sm sm:text-base text-gray-300 mt-4 max-w-xl leading-relaxed">
                {university.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {university.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full bg-violet-500/20 border border-violet-400/30 px-3 py-1 text-xs font-medium text-violet-100"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <CounselingButton onClick={showToast} className="mt-8 opacity-90">
                Connect at {university.shortName}
              </CounselingButton>
            </div>
          </section>

          <section className="py-10 sm:py-12 bg-violet-50/40 border-b border-violet-100/60">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                How it works
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {howItWorksSteps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-2xl border border-violet-100 bg-white p-5 text-left shadow-sm"
                  >
                    <span className="text-2xl font-bold text-violet-200">{step.step}</span>
                    <h2 className="font-display text-lg text-[#1a1a1a] mt-2">{step.title}</h2>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {counselors.length > 0 && (
            <section className="py-10 sm:py-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mentors for {university.shortName}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6 max-w-2xl">
                  {counselors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={showToast}
                      className="flex gap-4 rounded-2xl border-2 border-orange-100 bg-[#fff9f3] p-4 text-left hover:border-violet-200 transition-colors"
                    >
                      <UniversityImage
                        src={c.image}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#1a1a1a]">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.experience} experience</p>
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase text-emerald-700">
                          <BadgeCheck className="w-3 h-3" />
                          Verified · Soon
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="py-10 sm:py-12 bg-gradient-to-br from-violet-50 to-[#fff9f3]">
            <div className="max-w-xl mx-auto px-4 text-center">
              <GraduationCap className="w-10 h-10 text-violet-600 mx-auto" />
              <h2 className="font-display text-2xl text-[#1a1a1a] mt-4">
                Campus Connect for {university.shortName} launches soon
              </h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                We&apos;re onboarding verified seniors and mentors. You&apos;ll get real perspectives on
                course fit, campus life, and whether {university.shortName} is right for you.
              </p>
              <CounselingButton onClick={showToast} className="mt-6">
                Notify me
              </CounselingButton>
            </div>
          </section>
        </main>

        <MarketingFooter />
      </div>

      <ComingSoonToast visible={visible} message={message} />
    </>
  )
}
