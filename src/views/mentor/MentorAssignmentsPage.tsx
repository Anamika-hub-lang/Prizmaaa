import { useState } from 'react'
import { CheckCircle2, Clock, User } from 'lucide-react'
import { useMentorContent } from '../../context/MentorContentContext'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { dashboardCardBorder, dashboardTint } from '../../components/ui/dashboardCardStyles'

type MentorTab = 'all' | 'awaiting' | 'submitted'

export function MentorAssignmentsPage() {
  const { myAssignments, addAssignment, updateAssignment } = useMentorContent()
  const [tab, setTab] = useState<MentorTab>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCourse, setEditCourse] = useState('')
  const [editDue, setEditDue] = useState('')
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [due, setDue] = useState('')
  const [img, setImg] = useState('https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80')

  const awaiting = myAssignments.filter((a) => a.status === 'pending')
  const submitted = myAssignments.filter((a) => a.status === 'submitted')

  const visible =
    tab === 'all' ? myAssignments : tab === 'awaiting' ? awaiting : submitted

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addAssignment({ title, course, due, img })
    setTitle('')
    setCourse('')
    setDue('')
  }

  const tabs: { id: MentorTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: myAssignments.length },
    { id: 'awaiting', label: 'Awaiting submit', count: awaiting.length },
    { id: 'submitted', label: 'Student submitted', count: submitted.length },
  ]

  return (
    <>
      <MentorPageHeader
        backTo="/teacher"
        title="Assignments"
        subtitle="See which students have submitted work — status updates when they click Submit on their portal."
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left">
        {submitted.length > 0 && (
          <div className={`${dashboardCardBorder} ${dashboardTint(2).bg} ${dashboardTint(2).border} rounded-2xl p-5 mb-6`}>
            <p className="font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {submitted.length} assignment(s) submitted by students
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Open the <strong>Student submitted</strong> tab to read each submission, date, and student note.
            </p>
          </div>
        )}

        <form
          onSubmit={handleAdd}
          className={`${dashboardCardBorder} ${dashboardTint(0).bg} ${dashboardTint(0).border} rounded-2xl p-6 mb-8 space-y-4`}
        >
          <p className="font-bold">Create assignment</p>
          <input
            placeholder="Assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none focus:border-educture-orange"
          />
          <input
            placeholder="Course name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none"
          />
          <input
            placeholder="Due date text"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none"
          />
          <input
            placeholder="Thumbnail image URL"
            value={img}
            onChange={(e) => setImg(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/80 text-sm outline-none"
          />
          <AppButton type="submit">Publish to students</AppButton>
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => {
            const tint = dashboardTint(t.id === 'submitted' ? 2 : t.id === 'awaiting' ? 4 : 1)
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${dashboardCardBorder} ${
                  active ? `${tint.bg} ${tint.border} text-[#1d1d1d]` : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {t.label}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 border-2 border-white font-bold">
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        <ul className="space-y-3">
          {visible.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No assignments in this view.</p>
          ) : (
            visible.map((a, i) => {
              const tint = dashboardTint(i + 1)
              const isSubmitted = a.status === 'submitted'
              return (
                <li
                  key={a.id}
                  className={`flex gap-4 items-start ${dashboardCardBorder} ${tint.bg} ${tint.border} rounded-2xl p-4 sm:p-5`}
                >
                  <img src={a.img} alt="" className="w-16 h-16 rounded-xl object-cover hidden sm:block border-2 border-white" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{a.title}</p>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border-2 border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Student submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border-2 border-amber-200">
                          <Clock className="w-3 h-3" /> Not submitted yet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-educture-orange">{a.course}</p>
                    {!isSubmitted && editingId !== a.id && (
                      <p className="text-xs text-gray-600 mt-1">Due {a.due}</p>
                    )}
                    {editingId === a.id && (
                      <div className="mt-3 space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <input
                          value={editCourse}
                          onChange={(e) => setEditCourse(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <input
                          value={editDue}
                          onChange={(e) => setEditDue(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                        />
                        <button
                          type="button"
                          className="text-sm font-semibold text-educture-orange"
                          onClick={() => {
                            updateAssignment(a.id, {
                              title: editTitle,
                              course: editCourse,
                              due: editDue,
                            })
                            setEditingId(null)
                          }}
                        >
                          Save edits
                        </button>
                      </div>
                    )}
                    {!isSubmitted && editingId !== a.id && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-gray-600 mt-2 hover:text-educture-orange"
                        onClick={() => {
                          setEditingId(a.id)
                          setEditTitle(a.title)
                          setEditCourse(a.course)
                          setEditDue(a.due)
                        }}
                      >
                        Edit assignment
                      </button>
                    )}
                    {isSubmitted && (
                      <div className={`mt-3 p-4 rounded-xl ${dashboardCardBorder} border-emerald-200 bg-emerald-50/90`}>
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {a.submittedBy ?? 'Student'} ne submit kiya
                        </p>
                        <p className="text-sm text-gray-800 mt-2">
                          Submitted on <strong>{a.submittedAt ?? '—'}</strong>
                        </p>
                        {a.studentNote ? (
                          <p className="text-sm text-gray-700 mt-2 p-3 rounded-lg bg-white/80 border-2 border-white">
                            <span className="font-semibold">Submission note:</span> {a.studentNote}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-600 mt-2">No extra note — student marked assignment as submitted.</p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </main>
    </>
  )
}
