import { useState } from 'react'
import { useMentorContent } from '../../context/MentorContentContext'
import type { FreeCourse } from '../../data/classCatalog'
import { MentorPageHeader } from '../../components/layout/TeacherLayout'
import { AppButton } from '../../components/ui/AppButton'
import { tintedSurface, tintedSurfaceKey } from '../../components/ui/dashboardCardStyles'

type FreeCourseFormState = {
  title: string
  image: string
  instructor: string
  lessons: number
  hours: number
  description: string
}

const emptyForm = (): FreeCourseFormState => ({
  title: '',
  image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
  instructor: '',
  lessons: 8,
  hours: 3,
  description: '',
})

function courseToForm(c: FreeCourse): FreeCourseFormState {
  return {
    title: c.title,
    image: c.image,
    instructor: c.instructor,
    lessons: c.lessons,
    hours: c.hours,
    description: c.description,
  }
}

export function MentorFreeCoursesPage() {
  const { myFreeCourses, addFreeCourse, updateFreeCourse, removeFreeCourse } = useMentorContent()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FreeCourseFormState>(emptyForm)

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      image: form.image.trim(),
      instructor: form.instructor.trim(),
      lessons: form.lessons,
      hours: form.hours,
      description: form.description.trim(),
    }

    if (editingId) {
      updateFreeCourse(editingId, payload)
    } else {
      addFreeCourse(payload)
    }
    resetForm()
  }

  const openEdit = (c: FreeCourse) => {
    setForm(courseToForm(c))
    setEditingId(c.id)
  }

  const handleRemove = (c: FreeCourse) => {
    if (!window.confirm(`Remove "${c.title}"?`)) return
    removeFreeCourse(c.id)
    if (editingId === c.id) resetForm()
  }

  return (
    <>
      <MentorPageHeader
        backTo="/teacher"
        title="Free courses"
        subtitle="These appear on the student Free Courses tab — no payment required."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left">
        <form
          onSubmit={handleSubmit}
          className={`${tintedSurface(3)} p-6 mb-8 grid sm:grid-cols-2 gap-4`}
        >
          <p className="sm:col-span-2 font-bold text-[#1d1d1d]">
            {editingId ? 'Edit free course' : 'Add free course'}
          </p>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Instructor</label>
            <input
              value={form.instructor}
              onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Lessons</label>
            <input
              type="number"
              value={form.lessons}
              onChange={(e) => setForm((f) => ({ ...f, lessons: Number(e.target.value) }))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Hours</label>
            <input
              type="number"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: Number(e.target.value) }))}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <AppButton type="submit">{editingId ? 'Save changes' : 'Publish free course'}</AppButton>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myFreeCourses.map((c) => (
            <article key={c.id} className={`overflow-hidden ${tintedSurfaceKey(c.id)}`}>
              <img src={c.image} alt="" className="w-full h-36 object-cover" />
              <div className="p-4">
                <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                  FREE
                </span>
                <p className="font-bold mt-2">{c.title}</p>
                <p className="text-xs text-gray-500">
                  {c.lessons} lessons · {c.hours}h
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-xs text-educture-orange font-semibold hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(c)}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
