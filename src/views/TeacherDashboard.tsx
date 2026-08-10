import { Link } from 'react-router-dom'
import { BookOpen, Users, Video, ClipboardList, Plus } from 'lucide-react'
import { useMentorContent } from '../context/MentorContentContext'
import { MentorPageHeader } from '../components/layout/TeacherLayout'
import { AppButton } from '../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../components/ui/dashboardCardStyles'
import { getCategoryPlanPriceLabel } from '../data/classCatalog'

export function TeacherDashboard() {
  const { publishedClasses, freeCourses, assignments, classPrice } = useMentorContent()
  const pendingAsg = assignments.filter((a) => a.status === 'pending').length
  const submittedAsg = assignments.filter((a) => a.status === 'submitted').length

  const stats = [
    { label: 'Online classes', value: publishedClasses.length, icon: BookOpen },
    { label: 'Free courses', value: freeCourses.length, icon: Users },
    { label: 'Meet links set', value: publishedClasses.filter((c) => c.meetLink).length, icon: Video },
    { label: 'Assignments due', value: pendingAsg, icon: ClipboardList },
  ]

  const actions = [
    { to: '/teacher/classes', title: 'Add online class', sub: `${classPrice} · image + details`, icon: Plus, tint: 0 },
    { to: '/teacher/free-courses', title: 'Free courses', sub: 'Students browse for free', tint: 1 },
    { to: '/teacher/meet', title: 'Google Meet', sub: 'Live session links', tint: 2 },
    { to: '/teacher/assignments', title: 'Assignments', sub: `${submittedAsg} student submissions`, tint: 3 },
  ]

  return (
    <>
      <MentorPageHeader
        title="Mentor dashboard"
        subtitle="Manage what students see — courses, free lessons, Google Meet links, and assignments."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`${tintedSurface(i)} p-5 text-left`}>
              <s.icon className="w-5 h-5 text-educture-orange mb-3" />
              <p className="text-2xl font-bold text-[#1d1d1d]">{s.value}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`${tintedSurface(a.tint)} p-5 card-lift text-left`}
            >
              {a.icon && <a.icon className="w-8 h-8 mb-3 text-educture-orange" />}
              <p className="font-bold text-[#1d1d1d]">{a.title}</p>
              <p className="text-sm text-gray-600 mt-1">{a.sub}</p>
            </Link>
          ))}
        </div>

        {submittedAsg > 0 && (
          <section className="text-left">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Student submissions</h2>
            <div className={`${tintedSurface(2)} p-5 space-y-3`}>
              {assignments
                .filter((a) => a.status === 'submitted')
                .slice(0, 4)
                .map((a) => (
                  <div key={a.id} className="flex gap-3 items-center p-3 rounded-xl bg-white/70 border-2 border-emerald-200">
                    <img src={a.img} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{a.title}</p>
                      <p className="text-xs text-emerald-800 font-medium">
                        {a.submittedBy ?? 'Student'} · {a.submittedAt}
                      </p>
                    </div>
                  </div>
                ))}
              <AppButton to="/teacher/assignments" size="sm" variant="outline" className="w-full justify-center">
                View all submissions
              </AppButton>
            </div>
          </section>
        )}

        <section className="text-left">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Recent online classes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publishedClasses.slice(0, 3).map((c) => (
              <div key={c.id} className={`${tintedSurfaceKey(c.id)} overflow-hidden`}>
                  <img src={c.image} alt="" className="w-full h-32 object-cover border-b-2 border-white/80" />
                  <div className="p-4">
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{getCategoryPlanPriceLabel(c.categoryId)} · {c.sessions}</p>
                  </div>
                </div>
            ))}
          </div>
          <AppButton to="/teacher/classes" variant="outline" className="mt-4">Manage all classes</AppButton>
        </section>
      </main>
    </>
  )
}
