import { Link } from 'react-router-dom'
import { BookOpen, Users, Video, ClipboardList, Plus, ArrowRight } from 'lucide-react'
import { useMentorContent } from '../context/MentorContentContext'
import { MentorPageHeader } from '../components/layout/TeacherLayout'
import { AppButton } from '../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../components/ui/dashboardCardStyles'
import { getCategoryById } from '../data/classCatalog'

export function TeacherDashboard() {
  const { myPublishedClasses, myFreeCourses, myAssignments } = useMentorContent()
  const pendingAsg = myAssignments.filter((a) => a.status === 'pending').length
  const submittedAsg = myAssignments.filter((a) => a.status === 'submitted').length

  const stats = [
    { label: 'My online classes', value: myPublishedClasses.length, icon: BookOpen, to: '/teacher/classes' },
    { label: 'My free courses', value: myFreeCourses.length, icon: Users, to: '/teacher/free-courses' },
    {
      label: 'Meet links set',
      value: myPublishedClasses.filter((c) => c.meetLink).length,
      icon: Video,
      to: '/teacher/meet',
    },
    { label: 'Assignments', value: pendingAsg, icon: ClipboardList, to: '/teacher/assignments' },
  ]

  const actions = [
    {
      to: '/teacher/classes',
      title: 'Manage classes',
      sub: 'Upload and publish live classes',
      icon: Plus,
      tint: 0,
    },
    { to: '/teacher/free-courses', title: 'Free courses', sub: 'Students browse for free', tint: 1 },
    { to: '/teacher/meet', title: 'Google Meet', sub: 'Live session links', tint: 2 },
    { to: '/teacher/assignments', title: 'Assignments', sub: `${submittedAsg} student submissions`, tint: 3 },
  ]

  return (
    <>
      <MentorPageHeader
        title="Mentor dashboard"
        subtitle="Your classes, courses, Meet links, and assignments — all in one place."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Link key={s.label} to={s.to} className={`${tintedSurface(i)} p-5 text-left card-lift block`}>
              <s.icon className="w-5 h-5 text-educture-orange mb-3" />
              <p className="text-2xl font-bold text-[#1d1d1d]">{s.value}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`${tintedSurface(a.tint)} p-5 card-lift text-left group`}
            >
              {a.icon && <a.icon className="w-8 h-8 mb-3 text-educture-orange" />}
              <p className="font-bold text-[#1d1d1d] flex items-center gap-1">
                {a.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-educture-orange" />
              </p>
              <p className="text-sm text-gray-600 mt-1">{a.sub}</p>
            </Link>
          ))}
        </div>

        {submittedAsg > 0 && (
          <section className="text-left">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Student submissions</h2>
            <div className={`${tintedSurface(2)} p-5 space-y-3`}>
              {myAssignments
                .filter((a) => a.status === 'submitted')
                .slice(0, 4)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 items-center p-3 rounded-xl bg-white/70 border-2 border-emerald-200"
                  >
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">My online classes</h2>
            <AppButton to="/teacher/classes" size="sm" variant="outline">
              + Add class
            </AppButton>
          </div>
          {myPublishedClasses.length === 0 ? (
            <div className={`${tintedSurface(0)} p-8 text-center`}>
              <p className="text-sm text-gray-600">No classes yet.</p>
              <AppButton to="/teacher/classes" className="mt-4">
                Upload your first class
              </AppButton>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPublishedClasses.slice(0, 6).map((c) => (
                  <div key={c.id} className={`${tintedSurfaceKey(c.id)} overflow-hidden`}>
                    <img src={c.image} alt="" className="w-full h-32 object-cover border-b-2 border-white/80" />
                    <div className="p-4">
                      <p className="font-bold text-sm">{c.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {getCategoryById(c.categoryId)?.title ?? c.categoryId} · {c.sessions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <AppButton to="/teacher/classes" variant="outline" className="mt-4">
                Manage all classes
              </AppButton>
            </>
          )}
        </section>
      </main>
    </>
  )
}
