import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { MainNavbar } from '../components/layout/MainNavbar'
import { MarketingFooter } from '../components/marketing/MarketingSections'
import { useColleges } from '../hooks/useColleges'
import { collegeTypeLabel, formatFees, formatPackage } from '../lib/colleges/repository'
import { AdmissionPathTrail } from '../components/colleges/AdmissionPathTrail'
import { CollegeGuidanceFlow } from '../components/colleges/CollegeGuidanceFlow'

export function CollegeDetailPage() {
  const { slug = '' } = useParams()
  const { colleges, loading } = useColleges()
  const college = colleges.find((c) => c.slug === slug)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
        <MainNavbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-gray-500">Loading…</main>
        <MarketingFooter />
      </div>
    )
  }

  if (!college) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <MainNavbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">College not found.</p>
          <Link to="/colleges" className="text-educture-orange font-semibold mt-4 inline-block">
            ← Back to colleges
          </Link>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f0]">
      <MainNavbar />

      <main className="flex-1">
        <section className="bg-[#0f0f12] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <Link
              to="/colleges"
              className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              All colleges
            </Link>
            <p className="text-educture-orange font-bold text-xs uppercase tracking-wider mt-6">
              {collegeTypeLabel(college.type)} · {college.type}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 leading-tight">{college.name}</h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              {college.city}, {college.state}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="#guidance"
                className="px-5 py-2 rounded-full bg-educture-orange text-white text-sm font-semibold"
              >
                Get guided on next steps
              </Link>
              <Link
                to="/colleges/find"
                className="px-5 py-2 rounded-full border border-white/20 text-sm font-semibold hover:border-educture-orange"
              >
                Find similar
              </Link>
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 text-sm font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                Official website
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <StatCard label="Annual fees" value={formatFees(college.fees)} />
            <StatCard label="Average package" value={formatPackage(college.averagePackage)} />
            <StatCard label="Highest package" value={formatPackage(college.highestPackage)} />
            <StatCard
              label="Placement rate"
              value={college.placementRate != null ? `${college.placementRate}%` : 'N/A'}
            />
            <StatCard label="NIRF ranking" value={college.ranking != null ? `#${college.ranking}` : 'N/A'} />
            <StatCard label="Hostel" value={college.hostel ? 'Available' : 'Not available'} />
          </div>

          <DetailSection title="Courses offered">
            <div className="flex flex-wrap gap-2">
              {college.courses.map((course) => (
                <span
                  key={course}
                  className="text-sm font-medium px-3 py-1.5 rounded-full bg-orange-50 text-gray-800 border border-orange-100"
                >
                  {course}
                </span>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Path to this college" id="path">
            <AdmissionPathTrail college={college} />
          </DetailSection>

          <DetailSection title="Entrance exams">
            <p className="text-gray-700">{college.entrance.join(' · ')}</p>
          </DetailSection>

          <DetailSection title="Top recruiters">
            <p className="text-gray-700">{college.companies.join(' · ')}</p>
            <p className="text-xs text-gray-400 mt-2">
              Recruiter lists are indicative. Placement at any company is not guaranteed.
            </p>
          </DetailSection>

          <DetailSection title="Location">
            <p className="text-gray-700">
              {college.city}, {college.state}, India
            </p>
          </DetailSection>

          <div className="mb-10">
            <CollegeGuidanceFlow college={college} />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-orange-100 bg-white p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-lg text-[#1a1a1a] mt-1">{value}</p>
    </div>
  )
}

function DetailSection({
  title,
  children,
  id,
}: {
  title: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <div id={id} className="mb-8 rounded-2xl border-[3px] border-orange-100 bg-white p-6">
      <h2 className="font-display text-lg text-[#1a1a1a] mb-4">{title}</h2>
      {children}
    </div>
  )
}
